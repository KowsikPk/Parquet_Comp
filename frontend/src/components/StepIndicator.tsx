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
  const defaultSteps: Step[] = [
    { id: 'upload', label: '1. Select Parquet Files', status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending' },
    { id: 'configure', label: '2. Configure Diff Parameters', status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending' },
    { id: 'results', label: '3. Compare & Analyze Diffs', status: currentStep === 3 ? 'active' : 'pending' }
  ];

  const stepsToRender = steps || defaultSteps;

  return (
    <div className="w-full bg-theme-surface border border-theme-border rounded-2xl p-4 shadow-lg mb-6">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {stepsToRender.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';

          return (
            <React.Fragment key={step.id}>
              {/* Step item */}
              <div className="flex items-center space-x-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                      : isActive
                      ? 'bg-blue-600 text-white border border-blue-400 shadow-lg shadow-blue-500/30 scale-105'
                      : 'bg-theme-elevated text-theme-text-muted border border-theme-border'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                <div className="hidden sm:block">
                  <div className={`text-xs font-bold tracking-wide transition-colors ${
                    isCompleted
                      ? 'text-emerald-400'
                      : isActive
                      ? 'text-theme-text'
                      : 'text-theme-text-muted'
                  }`}>
                    {step.label}
                  </div>
                  <div className="text-[10px] text-theme-text-muted font-medium">
                    {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
                  </div>
                </div>
              </div>

              {/* Connector line */}
              {index < stepsToRender.length - 1 && (
                <div className="flex-1 mx-4 h-[2px] bg-theme-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ease-out ${
                      isCompleted ? 'bg-emerald-500 w-full' : isActive ? 'bg-gradient-to-r from-blue-600 to-theme-muted w-1/2' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
