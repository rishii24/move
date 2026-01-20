import { useState, useEffect } from 'react';
import type { AnimalType } from './AnimalSelect';

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
      {/* Speech Bubble Status */}
      <div className="pixel-speech-bubble">
        <p className="pixel-speech-text">
          {secondsRemaining <= 0 ? (
            <span>Interval Active! 🎉</span>
          ) : (
            `Next ${animal} in: ${formatTime(secondsRemaining)}`
          )}
        </p>
      </div>

      {/* Status Info */}
      <div className="pixel-info-box mb-4">
        <p className="pixel-text-sm text-center">
          Your {animal} will appear on all tabs every interval.
        </p>
      </div>

      {/* Cancel Button */}
      <button onClick={onCancel} className="pixel-button-beige w-full">
        Stop Recurring Timer
      </button>
    </div>
  );
};

export default TimerActive;