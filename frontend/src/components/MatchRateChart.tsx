import React, { useEffect, useRef, useState } from 'react';

interface MatchRateChartProps {
  matching: number;
  partial_match: number;
  mismatching: number;
  onlyInA: number;
  onlyInB: number;
  fileAName?: string;
  fileBName?: string;
}

const MatchRateChart: React.FC<MatchRateChartProps> = ({
  matching,
  partial_match,
  mismatching,
  onlyInA,
  onlyInB,
  fileAName = 'A',
  fileBName = 'B'
}) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [progress, setProgress] = useState(0);
  const chartRef = useRef<SVGSVGElement>(null);

  const total = matching + partial_match + mismatching + onlyInA + onlyInB;
  const matchingPercent = total > 0 ? (matching / total) * 100 : 0;
  const partialPercent = total > 0 ? (partial_match / total) * 100 : 0;
  const mismatchingPercent = total > 0 ? (mismatching / total) * 100 : 0;
  const onlyInAPercent = total > 0 ? (onlyInA / total) * 100 : 0;

  useEffect(() => {
    if (!hasAnimated && chartRef.current) {
      setHasAnimated(true);

      const duration = 1000;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const p = Math.min(elapsed / duration, 1);
        const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

        setProgress(easeOutCubic(p));

        if (p < 1) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    }
  }, [hasAnimated]);

  const createDonutSegment = (startPercent: number, endPercent: number, color: string) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;

    const startOffset = circumference * (startPercent / 100);
    const strokeDasharray = `${circumference * ((endPercent - startPercent) / 100)} ${circumference}`;

    return { strokeDasharray, strokeDashoffset: -startOffset, color };
  };

  const segments = [
    { start: 0, end: matchingPercent, color: '#10B981' },
    { start: matchingPercent, end: matchingPercent + partialPercent, color: '#F59E0B' },
    { start: matchingPercent + partialPercent, end: matchingPercent + partialPercent + mismatchingPercent, color: '#EF4444' },
    { start: matchingPercent + partialPercent + mismatchingPercent, end: matchingPercent + partialPercent + mismatchingPercent + onlyInAPercent, color: '#F97316' },
    { start: matchingPercent + partialPercent + mismatchingPercent + onlyInAPercent, end: 100, color: '#38BDF8' }
  ];

  return (
    <div className="flex flex-col items-center">
      <svg ref={chartRef} width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r="50" fill="none" stroke="#171B2E" strokeWidth="18" />
        {segments.map((segment, index) => {
          const { strokeDasharray, strokeDashoffset, color } = createDonutSegment(
            segment.start,
            segment.end,
            segment.color
          );

          return (
            <circle
              key={index}
              cx="75"
              cy="75"
              r="50"
              fill="none"
              stroke={color}
              strokeWidth="18"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              style={{
                transform: `rotate(-90deg)`,
                transformOrigin: 'center',
                opacity: progress
              }}
            />
          );
        })}
        <text
          x="75"
          y="70"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-lg font-extrabold font-mono fill-theme-text"
        >
          {Math.round(matchingPercent)}%
        </text>
        <text
          x="75"
          y="88"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[10px] font-bold tracking-widest uppercase fill-theme-text-secondary"
        >
          MATCH RATE
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-medium text-theme-text-secondary">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Matching</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Partial</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span>Mismatching</span>
        </div>
        <div className="flex items-center space-x-1.5" title={`Only in ${fileAName}`}>
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span className="truncate max-w-[70px]">Only {fileAName}</span>
        </div>
        <div className="flex items-center space-x-1.5" title={`Only in ${fileBName}`}>
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
          <span className="truncate max-w-[70px]">Only {fileBName}</span>
        </div>
      </div>
    </div>
  );
};

export default MatchRateChart;