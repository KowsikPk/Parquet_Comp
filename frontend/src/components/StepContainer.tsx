import React from 'react';

interface StepContainerProps {
  step: number;
  currentStep: number;
  children: React.ReactNode;
}

const StepContainer: React.FC<StepContainerProps> = ({ step, currentStep, children }) => {
  const getTransform = () => {
    if (step === currentStep) return 'translateX(0)';
    if (step < currentStep) return 'translateX(-100%)';
    return 'translateX(100%)';
  };

  const getOpacity = () => {
    return step === currentStep ? '1' : '0';
  };

  return (
    <div
      className="transition-all duration-300 ease-in-out"
      style={{
        transform: getTransform(),
        opacity: getOpacity(),
        position: step === currentStep ? 'relative' : 'absolute',
        width: '100%',
        pointerEvents: step === currentStep ? 'auto' : 'none'
      }}
    >
      {children}
    </div>
  );
};

export default StepContainer;