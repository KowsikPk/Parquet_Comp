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

      const duration = 1000;
      const startTime = performance.now();
      const startValue = 0;
      const endValue = value;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeOutExpo = (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

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
      className="bg-theme-surface border border-theme-border rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
      style={{ borderLeftWidth: '4px', borderLeftColor: borderColor }}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-theme-text-secondary uppercase tracking-wider block mb-1">{label}</span>
          <div className={`text-2xl font-extrabold font-mono tracking-tight ${textColor}`}>
            {displayValue.toLocaleString()}
          </div>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-theme-elevated border border-theme-border flex items-center justify-center text-theme-text">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;