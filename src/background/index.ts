console.log('Background service worker running');

// Types
interface PetState {
  isActive: boolean;
  animal: 'cat' | 'fox';
  intervalMinutes: number;
  nextTriggerTime: number;
}

// Initialize state from storage
const initialState: PetState = {
  isActive: false,
  animal: 'cat',
  intervalMinutes: 0,
  nextTriggerTime: 0
};

const getState = async (): Promise<PetState> => {
  const data = await chrome.storage.local.get(['petState']);
  return (data.petState as PetState) || initialState;
};

// Helper: Save state
const saveState = async (state: Partial<PetState>) => {
  const current = await getState();
  await chrome.storage.local.set({
    petState: { ...current, ...state }
  });
};

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Listener for messages
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Message received:', message);

  handleMessage(message).then(sendResponse);
  return true; // Keep channel open
});

async function handleMessage(message: any) {
  if (message.type === 'SET_REMINDER') {
    const seconds = message.seconds || (message.minutes ? message.minutes * 60 : 0);
    const minutes = Math.max(seconds / 60, 0.016); // Allow small values for testing (e.g. 5s = 0.083m)
    const animal = message.animal || 'cat';

    // Clear old alarm
    await chrome.alarms.clear('petReminder');
    await chrome.alarms.clear('petSnooze');

    // Set new recurring alarm
    chrome.alarms.create('petReminder', {
      delayInMinutes: minutes,
      periodInMinutes: minutes
    });

    // Update global state
    await saveState({
      isActive: true,
      animal: animal,
      intervalMinutes: minutes,
      nextTriggerTime: Date.now() + (minutes * 60 * 1000)
    });

    console.log(`⏰ Recurring alarm set every ${minutes} minutes`);
    return { success: true };
  }

  if (message.type === 'GET_STATUS') {
    const state = await getState();
    return { state };
  }

  if (message.type === 'ACKNOWLEDGE_REMINDER') {
    // Acknowledge: Just dismiss the current pet, recurring alarm continues
    await broadcastMessage({ type: 'DISMISS_PET' });
    console.log('Pet acknowledged - recurring alarm continues normally');
    return { success: true };
  }

  if (message.type === 'SNOOZE_REMINDER') {
    // Snooze: Temporarily pause recurring alarm, create snooze alarm
    // Dismiss current pet
    await broadcastMessage({ type: 'DISMISS_PET' });

    // Clear the recurring alarm temporarily
    await chrome.alarms.clear('petReminder');

    // Create a one-off snooze alarm (5 minutes)
    const snoozeMinutes = 5;
    chrome.alarms.create('petSnooze', {
      delayInMinutes: snoozeMinutes
    });

    // Update next trigger time
    await saveState({
      nextTriggerTime: Date.now() + (snoozeMinutes * 60 * 1000)
    });

    console.log(`Pet snoozed for ${snoozeMinutes} minutes - will restore recurring alarm after`);
    return { success: true };
  }

  if (message.type === 'CANCEL_TIMER') {
    // Cancel: Stop EVERYTHING
    await chrome.alarms.clear('petReminder');
    await chrome.alarms.clear('petSnooze');
    await saveState({ isActive: false, nextTriggerTime: 0 });
    await broadcastMessage({ type: 'DISMISS_PET' });
    console.log('All alarms cancelled');
    return { success: true };
  }

  if (message.type === 'STOP_REMINDER') {
    // Stop: Dismiss current pet (for backward compatibility)
    await broadcastMessage({ type: 'DISMISS_PET' });
    return { success: true };
  }
}

// Alarm Trigger
chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('⏰ Alarm triggered:', alarm.name);
  const state = await getState();

  if (alarm.name === 'petReminder') {
    // Regular recurring alarm
    if (state.intervalMinutes) {
      await saveState({
        nextTriggerTime: Date.now() + (state.intervalMinutes * 60 * 1000)
      });
    }
    triggerPet(state.animal);
  }

  if (alarm.name === 'petSnooze') {
    // Snooze alarm fired - restore the recurring alarm
    console.log('Snooze ended - restoring recurring alarm');

    if (state.intervalMinutes) {
      // Recreate the recurring alarm
      chrome.alarms.create('petReminder', {
        delayInMinutes: state.intervalMinutes,
        periodInMinutes: state.intervalMinutes
      });

      // Update next trigger time
      await saveState({
        nextTriggerTime: Date.now() + (state.intervalMinutes * 60 * 1000)
      });
    }

    // Trigger the pet now (after snooze)
    triggerPet(state.animal);
  }
});

async function triggerPet(animal: string) {
  const messageType = animal === 'fox' ? 'TRIGGER_FOX_REMINDER' : 'TRIGGER_CAT_REMINDER';
  console.log(`🚀 Sending ${messageType} to all tabs...`);
  await broadcastMessage({ type: messageType, animal });
}

async function broadcastMessage(msg: any) {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
      chrome.tabs.sendMessage(tab.id, msg).catch(() => {
        // Tab might be inactive or not loaded content script
      });
    }
  }
}