import { useState, useEffect } from 'react';
import './pixel-styles.css';
import AnimalSelect, { type AnimalType } from './components/AnimalSelect';
import TimeSelectPixel from './components/TimeSelectPixel';
import TimerActive from './components/TimerActive';

type Screen = 'animal' | 'time' | 'active';

interface PetState {
  isActive: boolean;
  animal: AnimalType;
  intervalMinutes: number;
  nextTriggerTime: number;
}

function App() {
  const [screen, setScreen] = useState<Screen>('animal');
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType>('cat');
  // We track "next trigger time" instead of simple seconds
  const [nextTriggerTime, setNextTriggerTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Load state on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const data = await chrome.storage.local.get(['petState']);
        const state = data.petState as PetState | undefined;

        if (state) {
          if (state.animal) setSelectedAnimal(state.animal);
          if (state.isActive && state.nextTriggerTime > Date.now()) {
            setNextTriggerTime(state.nextTriggerTime);
            setScreen('active');
          }
        }
      } catch (err) {
        console.error("Failed to load state", err);
      } finally {
        setLoading(false);
      }
    };

    loadState();
  }, []);

  const handleAnimalSelect = (animal: AnimalType) => {
    setSelectedAnimal(animal);
  };

  const handleContinueToTime = () => {
    setScreen('time');
  };

  const handleBackToAnimal = () => {
    setScreen('animal');
  };

  const handleTimeSet = async (seconds: number) => {
    try {
      // Send message to background script to set alarm
      const response = await chrome.runtime.sendMessage({
        type: 'SET_REMINDER',
        seconds: seconds,
        animal: selectedAnimal
      });

      if (response && response.success) {
        // Calculate expected trigger time for immediate UI feedback
        // (Background will update the real storage, but we can optimistically set it)
        setNextTriggerTime(Date.now() + seconds * 1000);
        setScreen('active');
      } else {
        throw new Error('Invalid response from background script');
      }
    } catch (error) {
      console.error('Failed to set reminder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to set reminder: ${errorMessage}\nPlease make sure the extension is properly loaded.`);
    }
  };

  const handleDeactivate = async () => {
    await chrome.runtime.sendMessage({ type: 'CANCEL_TIMER' });
    setScreen('animal');
    setNextTriggerTime(0);
  };

  if (loading) {
    return <div className="pixel-app flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="pixel-app">
      {/* Logo Header */}
      <div className="pixel-logo">
        <h1 className="pixel-logo-text">PIXEL PETS</h1>
        <p className="pixel-logo-subtitle">Your Digital Companion Timer</p>
      </div>

      {/* Navigation Breadcrumb */}
      {screen !== 'active' && (
        <div className="pixel-nav">
          <button
            className={`pixel-nav-button ${screen === 'animal' ? 'pixel-nav-button-active' : ''}`}
            onClick={handleBackToAnimal}
          >
            1. Choose Pet
          </button>
          <button
            className={`pixel-nav-button ${screen === 'time' ? 'pixel-nav-button-active' : ''}`}
            disabled={screen === 'animal'}
          >
            2. Set Timer
          </button>
        </div>
      )}

      {/* Screens */}
      {screen === 'animal' && (
        <>
          <AnimalSelect
            selectedAnimal={selectedAnimal}
            onSelect={handleAnimalSelect}
          />
          <button
            onClick={handleContinueToTime}
            className="pixel-button-primary w-full"
          >
            Continue →
          </button>
        </>
      )}

      {screen === 'time' && (
        <>
          <TimeSelectPixel onTimeSet={handleTimeSet} />
          <button
            onClick={handleBackToAnimal}
            className="pixel-button-secondary w-full"
          >
            ← Back
          </button>
        </>
      )}

      {screen === 'active' && (
        <TimerActive
          animal={selectedAnimal}
          nextTriggerTime={nextTriggerTime}
          onCancel={handleDeactivate}
        />
      )}
    </div>
  );
}

export default App;
