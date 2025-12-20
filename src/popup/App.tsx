import { useState } from 'react';
import './pixel-styles.css';
import AnimalSelect, { type AnimalType } from './components/AnimalSelect';
import TimeSelectPixel from './components/TimeSelectPixel';
import TimerActive from './components/TimerActive';

type Screen = 'animal' | 'time' | 'active';

function App() {
  const [screen, setScreen] = useState<Screen>('animal');
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType>('cat');
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

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
    setTimerSeconds(seconds);
    console.log("heheheheh");
    
    try {
      // Send message to background script to set alarm
      const response = await chrome.runtime.sendMessage({
        type: 'SET_REMINDER',
        seconds: seconds,
        animal: selectedAnimal
      });
      console.log(response);
      
      if (response && response.success) {
        console.log(`✅ Reminder set for ${seconds} seconds with ${selectedAnimal}`);
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

  const handleReset = () => {
    setScreen('animal');
    setTimerSeconds(0);
  };

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
          initialSeconds={timerSeconds}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;
