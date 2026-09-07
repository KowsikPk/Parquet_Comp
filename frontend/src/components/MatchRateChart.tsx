import React, { useEffect, useRef, useState } from 'react';

interface MatchRateChartProps {
  matching: number;
  partial_match: number;
  mismatching: number;
  onlyInA: number;
  onlyInB: number;
  totalRows: number;
  fileAName?: string;
  fileBName?: string;
}

const MatchRateChart: React.FC<MatchRateChartProps> = ({
  matching,
  partial_match,
  mismatching,
  onlyInA,
  onlyInB,
  totalRows,
  fileAName = 'A',
  fileBName = 'B'
}) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [progress, setProgress] = useState(0);
  const chartRef = useRef<SVGSVGElement>(null);

  const total = totalRows > 0 ? totalRows : 1;
  const matchingPercent = (matching / total) * 100;
  const partialPercent = (partial_match / total) * 100;
  const mismatchingPercent = (mismatching / total) * 100;
  const onlyInAPercent = (onlyInA / total) * 100;
  const onlyInBPercent = (onlyInB / total) * 100;

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

  const seg0End = matchingPercent;
  const seg1End = seg0End + partialPercent;
  const seg2End = seg1End + mismatchingPercent;
  const seg3End = seg2End + onlyInAPercent;
  const seg4End = seg3End + onlyInBPercent;

  const segments = [
    { start: 0, end: seg0End, color: '#10B981' },
    { start: seg0End, end: seg1End, color: '#F59E0B' },
    { start: seg1End, end: seg2End, color: '#EF4444' },
    { start: seg2End, end: seg3End, color: '#F97316' },
    { start: seg3End, end: seg4End, color: '#38BDF8' }
  ];

  return (
    <div className="flex flex-col items-center">
      <svg ref={chartRef} width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r="50" fill="none" className="stroke-theme-border" strokeWidth="18" />
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