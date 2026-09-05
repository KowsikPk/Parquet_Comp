import React from 'react';

interface ToggleSwitchProps {
  leftLabel: string;
  rightLabel: string;
  isRight: boolean;
  onToggle: (isRight: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  leftLabel,
  rightLabel,
  isRight,
  onToggle,
  disabled = false
}) => {
  return (
    <div className="flex items-center bg-theme-elevated border border-theme-border rounded-xl p-1 shadow-inner">
      <button
        type="button"
        onClick={() => !disabled && onToggle(false)}
        disabled={disabled}
        className={`flex-1 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
          !isRight
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
            : 'text-theme-text-secondary hover:text-theme-text hover:bg-theme-muted/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        onClick={() => !disabled && onToggle(true)}
        disabled={disabled}
        className={`flex-1 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
          isRight
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
            : 'text-theme-text-secondary hover:text-theme-text hover:bg-theme-muted/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {rightLabel}
      </button>
    </div>
  );
};

export default ToggleSwitch;
