import React, { useEffect, useRef, useState } from 'react';

interface MatchRateBarProps {
  matchRate: number;
  totalRows: number;
}

const MatchRateBar: React.FC<MatchRateBarProps> = ({ matchRate, totalRows }) => {
  const [displayRate, setDisplayRate] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasAnimated && barRef.current) {
      setHasAnimated(true);

      const duration = 1200;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutExpo = (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

        setDisplayRate(matchRate * easeOutExpo(progress));

        if (progress < 1) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    }
  }, [matchRate, hasAnimated]);

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-theme-text-secondary">Overall Match Fidelity</span>
        <span className="font-extrabold font-mono text-emerald-400">{displayRate.toFixed(1)}%</span>
      </div>

      <div className="w-full bg-theme-elevated border border-theme-border rounded-full h-3 p-0.5 overflow-hidden shadow-inner">
        <div
          ref={barRef}
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 transition-all duration-300 shadow-md shadow-emerald-500/20"
          style={{ width: `${displayRate}%` }}
        />
      </div>

      <div className="text-[11px] text-theme-text-secondary font-mono text-right">
        {totalRows.toLocaleString()} total dataset rows evaluated
      </div>
    </div>
  );
};

export default MatchRateBar;