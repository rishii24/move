import { useState, useEffect } from 'react';
import type { AnimalType } from './AnimalSelect';
import CatDisplay from './CatDisplay';
import FoxDisplay from './FoxDisplay';
import grassSvg from '../../assets/grass.svg';

interface TimerActiveProps {
  animal: AnimalType;
  nextTriggerTime: number;
  onCancel: () => void;
}

const TimerActive = ({ animal, nextTriggerTime, onCancel }: TimerActiveProps) => {
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((nextTriggerTime - now) / 1000));
      setSecondsRemaining(remaining);
    };

    updateTime(); // Initial Update

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [nextTriggerTime]);

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

  return (
    <div className="pixel-container">
      <div className="text-center mb-4">
        <h2 className="pixel-heading mb-2">Active Monitor</h2>
        <p className="pixel-text-sm opacity-80">
          {secondsRemaining <= 0 ? (
            <span className="text-green-600 font-bold">INTERVAL ACTIVE</span>
          ) : (
            `Next ${animal} in:`
          )}
        </p>
      </div>

      {/* Countdown Display */}
      <div className="pixel-timer-display mb-4">
        {secondsRemaining > 0 ? (
          <div className="pixel-timer-number">{formatTime(secondsRemaining)}</div>
        ) : (
          <div className="pixel-text text-xs">Pet should be visiting!</div>
        )}
      </div>

      {/* Animal with Grass Background */}
      <div className="pixel-animal-scene mb-4">
        <div className="pixel-animal-container" style={{ transform: 'scale(0.8)' }}>
          {animal === 'cat' ? <CatDisplay /> : <FoxDisplay />}
        </div>
        <img src={grassSvg} alt="grass" className="pixel-grass" />
      </div>

      {/* Cancel Button */}
      <div className="flex flex-col gap-2 w-full">
        <button onClick={onCancel} className="pixel-button-secondary w-full">
          Stop Recurring Timer
        </button>
      </div>

      <p className="text-[10px] text-center mt-2 opacity-60">
        Pet will appear on all tabs every interval.
      </p>
    </div>
  );
};

export default TimerActive;