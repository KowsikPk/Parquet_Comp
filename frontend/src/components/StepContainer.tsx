import React from 'react';

interface StepContainerProps {
  step: number;
  currentStep: number;
  children: React.ReactNode;
}

const StepContainer: React.FC<StepContainerProps> = ({ step, currentStep, children }) => {
  if (step !== currentStep) return null;

  return (
    <div className="w-full animate-slide-up">
      {children}
    </div>
  );
};

export default StepContainer;