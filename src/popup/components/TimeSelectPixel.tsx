import { useState } from 'react';

export type TimePreset = {
  label: string;
  value: number; // in seconds
};

interface TimeSelectPixelProps {
  onTimeSet: (seconds: number) => void;
}

const presets: TimePreset[] = [
  { label: '5 sec', value: 5 },
  { label: '10 sec', value: 10 },
  { label: '30 sec', value: 30 },
  { label: '1 min', value: 60 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
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
    return `${mins} min`;
  };

  return (
    <div className="pixel-container">
      <h2 className="pixel-heading mb-6">Set Timer</h2>
      
      {/* Preset Options */}
      <div className="mb-6">
        <h3 className="pixel-subheading mb-3">Quick Select</h3>
        <div className="grid grid-cols-3 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetClick(preset.value)}
              className={`pixel-button ${
                selectedPreset === preset.value && !isCustom
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
      <div className="mb-6">
        <h3 className="pixel-subheading mb-3">Custom Time</h3>
        <div className="flex gap-3">
          <input
            type="number"
            min="1"
            value={customValue}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="Enter time"
            className="pixel-input flex-1"
          />
          <select
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value as 'seconds' | 'minutes')}
            className="pixel-select"
          >
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
          </select>
        </div>
      </div>

      {/* Set Button */}
      <button
        onClick={handleSetTimer}
        disabled={!getSelectedTime()}
        className={`pixel-button-primary w-full ${
          !getSelectedTime() ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {getSelectedTime() 
          ? `Set Timer: ${formatTime(getSelectedTime()!)}` 
          : 'Select Time First'}
      </button>

      {/* Preview */}
      {getSelectedTime() && (
        <div className="mt-4 pixel-info-box">
          <p className="pixel-text-sm text-center">
            ⏰ Timer will trigger in <span className="font-bold">{formatTime(getSelectedTime()!)}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeSelectPixel;
