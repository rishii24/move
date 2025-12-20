import { useState, useEffect } from 'react';

type TimeOption = {
  label: string;
  value: number; // in minutes (can be fractional for seconds)
};

const presetOptions: TimeOption[] = [
  { label: '10 sec', value: 10 / 60 }, // 10 seconds as fraction of minute
  { label: '1 min', value: 1 },
  { label: '5 min', value: 5 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '4 hours', value: 240 },
  { label: '8 hours', value: 480 },
];

const TimeSelect = () => {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customTime, setCustomTime] = useState<string>('');
  const [customUnit, setCustomUnit] = useState<'minutes' | 'hours'>('minutes');
  const [isCustom, setIsCustom] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null); // seconds remaining
  const [isActive, setIsActive] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (!isActive || countdown === null || countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          setIsActive(false);
          // Trigger cat lick animation
          window.dispatchEvent(new Event('trigger-cat-lick'));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, countdown]);

  const handlePresetClick = (value: number) => {
    setSelectedPreset(value);
    setIsCustom(false);
    setCustomTime('');
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    setSelectedPreset(null);
  };

  const calculateCustomMinutes = (): number | null => {
    const num = parseInt(customTime);
    if (isNaN(num) || num <= 0) return null;
    return customUnit === 'hours' ? num * 60 : num;
  };

  const handleSetReminder = async () => {
    const minutes = isCustom ? calculateCustomMinutes() : selectedPreset;
    if (minutes) {
      try {
        const seconds = Math.round(minutes * 60);
        
        // Send message to background script to set alarm
        await chrome.runtime.sendMessage({
          type: 'SET_REMINDER',
          minutes: minutes
        });
        
        console.log(`✅ Reminder set for ${minutes} minutes (${seconds} seconds)`);
        
        // Start countdown timer
        setCountdown(seconds);
        setIsActive(true);
      } catch (error) {
        console.error('Failed to set reminder:', error);
        alert('Failed to set reminder. Please try again.');
      }
    }
  };

  const formatCountdown = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      let result = `${hours}h`;
      if (mins > 0) result += ` ${mins}m`;
      if (secs > 0 && hours === 0) result += ` ${secs}s`;
      return result;
    }
  };

  const getSelectedMinutes = (): number | null => {
    return isCustom ? calculateCustomMinutes() : selectedPreset;
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Set Reminder
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Choose when you'd like to be reminded
        </p>
      </div>

      {/* Preset Time Options */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Quick Select
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {presetOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePresetClick(option.value)}
              disabled={isActive}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedPreset === option.value && !isCustom
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 scale-105'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-600 hover:scale-105 shadow-sm'
              } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Time Section */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Custom Time
        </h3>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            value={customTime}
            onChange={(e) => {
              setCustomTime(e.target.value);
              handleCustomClick();
            }}
            onFocus={handleCustomClick}
            placeholder="Enter time"
            className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <select
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value as 'minutes' | 'hours')}
            className="px-4 py-2.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
          </select>
        </div>
      </div>

      {/* Set Reminder Button */}
      <button
        onClick={handleSetReminder}
        disabled={!getSelectedMinutes() || isActive}
        className={`w-full py-3.5 rounded-lg font-semibold text-white transition-all duration-200 ${
          getSelectedMinutes() && !isActive
            ? 'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
            : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-50'
        }`}
      >
        {isActive
          ? 'Reminder Active'
          : getSelectedMinutes()
          ? `Set Reminder for ${getSelectedMinutes()! >= 1 ? `${getSelectedMinutes()!} min` : '10 sec'}`
          : 'Select a time'}
      </button>

      {/* Countdown Timer */}
      {isActive && countdown !== null && countdown > 0 && (
        <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
          <div className="text-center">
            <p className="text-sm font-medium mb-1">Time Remaining</p>
            <p className="text-3xl font-bold tabular-nums">{formatCountdown(countdown)}</p>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {isActive && countdown === 0 && (
        <div className="mt-4 p-4 rounded-lg bg-green-600 text-white shadow-lg animate-pulse">
          <p className="text-center font-semibold">🐱 Cat is here to remind you!</p>
        </div>
      )}

      {/* Preview */}
      {getSelectedMinutes() && !isActive && (
        <div className="mt-4 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
          <p className="text-sm text-indigo-700 dark:text-indigo-300 text-center">
            You'll be reminded in{' '}
            <span className="font-semibold">
              {getSelectedMinutes()! >= 60
                ? `${(getSelectedMinutes()! / 60).toFixed(getSelectedMinutes()! % 60 === 0 ? 0 : 1)} hour${getSelectedMinutes()! >= 120 ? 's' : ''}`
                : `${getSelectedMinutes()} minute${getSelectedMinutes()! > 1 ? 's' : ''}`}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeSelect;