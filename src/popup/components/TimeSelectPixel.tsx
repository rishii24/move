import { useState } from 'react';

export type TimePreset = {
  label: string;
  value: number; // in seconds
};

interface TimeSelectPixelProps {
  onTimeSet: (seconds: number) => void;
}

const presets: TimePreset[] = [
  { label: '5 sec', value: 5 }, // For testing
  { label: '1 min', value: 60 },
  { label: '5 min', value: 300 },
  { label: '15 min', value: 900 },
  { label: '30 min', value: 1800 },
  { label: '1 hr', value: 3600 },
];

const TimeSelectPixel = ({ onTimeSet }: TimeSelectPixelProps) => {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [customUnit, setCustomUnit] = useState<'seconds' | 'minutes'>('minutes');

  const handlePresetClick = (value: number) => {
    setSelectedPreset(value);
    setIsCustom(false);
    setCustomValue('');
  };

  const handleCustomChange = (value: string) => {
    setCustomValue(value);
    setIsCustom(true);
    setSelectedPreset(null);
  };

  const getSelectedTime = (): number | null => {
    if (isCustom) {
      const num = parseInt(customValue);
      if (isNaN(num) || num <= 0) return null;
      return customUnit === 'minutes' ? num * 60 : num;
    }
    return selectedPreset;
  };

  const handleSetTimer = () => {
    const seconds = getSelectedTime();
    if (seconds) {
      onTimeSet(seconds);
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} sec`;
    const mins = Math.floor(seconds / 60);
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      return `${hrs} hr ${mins % 60 > 0 ? (mins % 60) + ' min' : ''}`;
    }
    return `${mins} min`;
  };

  return (
    <div className="pixel-container">
      <h2 className="pixel-heading mb-4">Set Interval</h2>
      <p className="pixel-text-sm mb-4 text-center opacity-70">
        Choose how often your pet visits
      </p>

      {/* Preset Options */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetClick(preset.value)}
              className={`pixel-button text-xs ${selectedPreset === preset.value && !isCustom
                  ? 'pixel-button-selected'
                  : ''
                }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Time */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            value={customValue}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="Custom"
            className="pixel-input flex-1"
          />
          <select
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value as 'seconds' | 'minutes')}
            className="pixel-select"
          >
            <option value="minutes">Min</option>
            <option value="seconds">Sec</option>
          </select>
        </div>
      </div>

      {/* Set Button */}
      <button
        onClick={handleSetTimer}
        disabled={!getSelectedTime()}
        className={`pixel-button-primary w-full text-xs ${!getSelectedTime() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
      >
        {getSelectedTime()
          ? `Start Every ${formatTime(getSelectedTime()!)}`
          : 'Start Timer'}
      </button>
    </div>
  );
};

export default TimeSelectPixel;
