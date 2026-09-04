import React, { useEffect, useRef, useState } from 'react';

interface MatchRateBarProps {
  matchRate: number;
  totalRows: number;
}

const MatchRateBar: React.FC<MatchRateBarProps> = ({ matchRate, totalRows }) => {
  const [displayRate, setDisplayRate] = useState(0);
  const [displayWidth, setDisplayWidth] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // UI IMPROVEMENT #13: Color coding based on match rate
  const getBarColor = (rate: number) => {
    if (rate >= 95) return '#22c55e'; // green
    if (rate >= 70) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  const getTextColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600 dark:text-green-400';
    if (rate >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  useEffect(() => {
    if (!hasAnimated && barRef.current) {
      setHasAnimated(true);
      
      const duration = 1500;
      const startTime = performance.now();
      const startRate = 0;
      const endRate = matchRate;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out expo function
        const easeOutExpo = (x: number) => {
          return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
        };

        const easedProgress = easeOutExpo(progress);
        const currentRate = startRate + (endRate - startRate) * easedProgress;
        
        setDisplayRate(currentRate);
        setDisplayWidth(currentRate);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [matchRate, hasAnimated]);

  return (
    <div className="mt-6">
      {/* UI IMPROVEMENT #13: FILTER icon before label */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{fontSize: '1rem'}}>
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300" style={{fontSize: '0.875rem'}}>Match Rate</span>
        </div>
        <span className={`text-sm font-bold ${getTextColor(displayRate)}`} style={{fontSize: '0.875rem'}}>
          {displayRate.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          ref={barRef}
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${displayWidth}%`,
            backgroundColor: getBarColor(displayRate)
          }}
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1" style={{fontSize: '0.75rem'}}>
        {totalRows.toLocaleString()} total rows compared
      </div>
    </div>
  );
};

export default MatchRateBar;