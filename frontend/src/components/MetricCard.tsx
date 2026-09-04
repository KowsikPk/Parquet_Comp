import React, { useEffect, useRef, useState } from 'react';

interface MetricCardProps {
  label: string;
  value: number;
  borderColor: string;
  textColor: string;
  icon?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, borderColor, textColor, icon }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasAnimated && cardRef.current) {
      setHasAnimated(true);
      
      const duration = 1200;
      const startTime = performance.now();
      const startValue = 0;
      const endValue = value;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out expo function
        const easeOutExpo = (x: number) => {
          return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
        };

        const easedProgress = easeOutExpo(progress);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easedProgress);
        
        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value, hasAnimated]);

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-[#1A1D27] rounded-lg shadow p-4 border-l-4"
      style={{ borderColor }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</div>
          <div className={`text-2xl font-bold ${textColor}`}>{displayValue.toLocaleString()}</div>
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${textColor} bg-opacity-10`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;