import React from 'react';

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

interface StepIndicatorProps {
  steps?: Step[];
  currentStep?: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep = 1 }) => {
  // If steps array is not provided, generate default steps based on currentStep
  const defaultSteps: Step[] = [
    { id: 'upload', label: 'Upload Files', status: currentStep >= 1 ? 'completed' : 'pending' },
    { id: 'configure', label: 'Configure', status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending' },
    { id: 'results', label: 'View Results', status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending' }
  ];

  const stepsToRender = steps || defaultSteps;

  return (
    <div className="flex items-center justify-between w-full mb-8">
      {stepsToRender.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* Step */}
          <div className="flex flex-col items-center flex-1">
            {/* Circle */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                step.status === 'completed'
                  ? 'bg-green-500 border-green-500 text-white'
                  : step.status === 'active'
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-white dark:bg-[#1A1D27] border-gray-300 dark:border-gray-600 text-gray-400'
              }`}
              style={{fontSize: '1rem'}}
            >
              {step.status === 'completed' ? (
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{fontSize: '1.25rem'}}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              ) : step.status === 'active' ? (
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" style={{fontSize: '1.25rem'}}>
                  <line x1="12" y1="2" x2="12" y2="6"/>
                  <line x1="12" y1="18" x2="12" y2="22"/>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                  <line x1="2" y1="12" x2="6" y2="12"/>
                  <line x1="18" y1="12" x2="22" y2="12"/>
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                </svg>
              ) : (
                <span className="text-sm font-medium" style={{fontSize: '0.875rem'}}>{index + 1}</span>
              )}
            </div>
            {/* Label */}
            <span
              className={`mt-2 text-sm font-medium ${
                step.status === 'completed'
                  ? 'text-green-600 dark:text-green-400'
                  : step.status === 'active'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400'
              }`}
              style={{fontSize: '0.875rem'}}
            >
              {step.label}
            </span>
          </div>

          {/* Connector Line */}
          {index < stepsToRender.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-4 transition-all ${
                step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;
