import { useState, useEffect } from 'react';
import type { AnimalType } from './AnimalSelect';
import CatDisplay from './CatDisplay';
import FoxDisplay from './FoxDisplay';
import grassSvg from '../../assets/grass.svg';

interface TimerActiveProps {
  animal: AnimalType;
  initialSeconds: number;
  onReset: () => void;
}

const TimerActive = ({ animal, initialSeconds, onReset }: TimerActiveProps) => {
  const [countdown, setCountdown] = useState(initialSeconds);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      setIsComplete(true);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) {
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hours}h ${remainMins}m`;
  };

  const getProgressPercentage = () => {
    return ((initialSeconds - countdown) / initialSeconds) * 100;
  };

  if (isComplete) {
    return (
      <div className="pixel-container">
        <div className="pixel-success-box mb-4 text-center">
          <h2 className="pixel-heading mb-2">Time's Up!</h2>
          <p className="pixel-text">Your {animal} companion has arrived!</p>
        </div>
        
        {/* Animal with Grass Background */}
        <div className="pixel-animal-scene mb-4">
          <div className="pixel-animal-container">
            {animal === 'cat' ? <CatDisplay /> : <FoxDisplay />}
          </div>
          <img src={grassSvg} alt="grass" className="pixel-grass" />
        </div>
        
        <button onClick={onReset} className="pixel-button-primary w-full">
          Set New Timer
        </button>
      </div>
    );
  }

  return (
    <div className="pixel-container">
      <div className="text-center mb-4">
        <h2 className="pixel-heading mb-2">Timer Active</h2>
        <p className="pixel-text-sm opacity-80">Your {animal} is on the way...</p>
      </div>

      {/* Progress Bar */}
      <div className="pixel-progress-container mb-4">
        <div 
          className="pixel-progress-bar"
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* Countdown Display */}
      <div className="pixel-timer-display mb-4">
        <div className="pixel-text-sm mb-1">Time Remaining</div>
        <div className="pixel-timer-number">{formatTime(countdown)}</div>
      </div>

      {/* Animal with Grass Background */}
      <div className="pixel-animal-scene mb-4">
        <div className="pixel-animal-container" style={{ transform: 'scale(0.7)', opacity: 0.5 }}>
          {animal === 'cat' ? <CatDisplay /> : <FoxDisplay />}
        </div>
        <img src={grassSvg} alt="grass" className="pixel-grass" style={{ opacity: 0.5 }} />
      </div>

      {/* Cancel Button */}
      <button onClick={onReset} className="pixel-button-secondary w-full">
        Cancel Timer
      </button>
    </div>
  );
};

export default TimerActive;
