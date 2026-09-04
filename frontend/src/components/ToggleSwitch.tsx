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
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => !disabled && onToggle(false)}
        disabled={disabled}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          !isRight
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-[#F1F5F9] shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {leftLabel}
      </button>
      <button
        onClick={() => !disabled && onToggle(true)}
        disabled={disabled}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          isRight
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-[#F1F5F9] shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {rightLabel}
      </button>
    </div>
  );
};

export default ToggleSwitch;
