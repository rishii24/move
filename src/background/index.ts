console.log('Background service worker running');

// Store the selected animal type
let selectedAnimal: 'cat' | 'fox' = 'cat';

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Listen for reminder requests from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Message received:', message);

  if (message.type === 'SET_REMINDER') {
    const seconds = message.seconds || (message.minutes ? message.minutes * 60 : 0);
    const animal = message.animal || 'cat';
    selectedAnimal = animal;
    
    const alarmName = 'petReminder';

    // Clear any existing alarm
    chrome.alarms.clear(alarmName, (wasCleared) => {
      console.log(`Previous alarm cleared: ${wasCleared}`);
    });

    // Convert seconds to minutes for Chrome alarms API
    const minutes = seconds / 60;
    
    chrome.alarms.create(alarmName, {
      delayInMinutes: Math.max(minutes, 0.016) // Minimum ~1 second
    });

    console.log(`⏰ Alarm set for ${seconds} seconds with ${animal}`);
    sendResponse({ success: true });
  }

  return true; // Keep message channel open for async response
});

// Listen for alarm triggers
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('⏰ Alarm triggered:', alarm.name);

  if (alarm.name === 'petReminder') {
    const messageType = selectedAnimal === 'fox' ? 'TRIGGER_FOX_REMINDER' : 'TRIGGER_CAT_REMINDER';
    
    console.log(`🚀 Attempting to send ${messageType} to all tabs...`);
    
    // Query all tabs to trigger the appropriate pet
    chrome.tabs.query({}, (tabs) => {
      console.log(`📊 Found ${tabs.length} tabs`);
      
      let sentCount = 0;
      let errorCount = 0;
      
      tabs.forEach((tab) => {
        console.log(`📄 Tab ${tab.id}: ${tab.url?.substring(0, 50)}...`);
        
        if (tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
          // Try to send message
          chrome.tabs.sendMessage(tab.id, {
            type: messageType,
            animal: selectedAnimal
          }).then(() => {
            sentCount++;
            console.log(`✅ Message sent to tab ${tab.id} (${tab.url?.substring(0, 30)}...)`);
          }).catch((error) => {
            errorCount++;
            console.log(`⚠️ Could not send to tab ${tab.id}:`, error.message);
            console.log(`   URL: ${tab.url}`);
            console.log(`   💡 Tip: Refresh this tab or open a new one`);
          });
        } else {
          console.log(`⏭️ Skipping tab ${tab.id} (chrome:// or extension page)`);
        }
      });
      
      setTimeout(() => {
        console.log(`\n📈 Summary: Sent to ${sentCount} tabs, ${errorCount} errors`);
      }, 500);
    });

    console.log(`✅ ${selectedAnimal === 'fox' ? 'Fox' : 'Cat'} reminder triggered`);
  }
});
