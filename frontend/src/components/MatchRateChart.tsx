import React, { useEffect, useRef, useState } from 'react';

interface MatchRateChartProps {
  matching: number;
  mismatching: number;
  onlyInA: number;
  onlyInB: number;
  fileAName?: string;
  fileBName?: string;
}

const MatchRateChart: React.FC<MatchRateChartProps> = ({
  matching,
  mismatching,
  onlyInA,
  onlyInB,
  fileAName = 'A',
  fileBName = 'B'
}) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [progress, setProgress] = useState(0);
  const chartRef = useRef<SVGSVGElement>(null);

  const total = matching + mismatching + onlyInA + onlyInB;
  const matchingPercent = total > 0 ? (matching / total) * 100 : 0;
  const mismatchingPercent = total > 0 ? (mismatching / total) * 100 : 0;
  const onlyInAPercent = total > 0 ? (onlyInA / total) * 100 : 0;
  const onlyInBPercent = total > 0 ? (onlyInB / total) * 100 : 0;

  useEffect(() => {
    if (!hasAnimated && chartRef.current) {
      setHasAnimated(true);
      
      const duration = 1000;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const easeOutCubic = (x: number) => {
          return 1 - Math.pow(1 - x, 3);
        };

        setProgress(easeOutCubic(progress));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [hasAnimated]);

  // Calculate SVG paths for donut chart
  const createDonutSegment = (startPercent: number, endPercent: number, color: string) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    
    const startOffset = circumference * (startPercent / 100);
    const strokeDasharray = `${circumference * ((endPercent - startPercent) / 100)} ${circumference}`;
    
    return {
      strokeDasharray,
      strokeDashoffset: -startOffset,
      color
    };
  };

  const segments = [
    { start: 0, end: matchingPercent, color: '#10B981' }, // Green - matching
    { start: matchingPercent, end: matchingPercent + mismatchingPercent, color: '#EF4444' }, // Red - mismatching
    { start: matchingPercent + mismatchingPercent, end: matchingPercent + mismatchingPercent + onlyInAPercent, color: '#F59E0B' }, // Orange - only in A
    { start: matchingPercent + mismatchingPercent + onlyInAPercent, end: matchingPercent + mismatchingPercent + onlyInAPercent + onlyInBPercent, color: '#8B5CF6' } // Purple - only in B
  ];

  return (
    <div className="flex flex-col items-center">
      <svg ref={chartRef} width="140" height="140" viewBox="0 0 140 140">
        {/* Background circle */}
        <circle
          cx="70"
          cy="70"
          r="50"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="20"
        />
        
        {/* Donut segments */}
        {segments.map((segment, index) => {
          const { strokeDasharray, strokeDashoffset, color } = createDonutSegment(
            segment.start,
            segment.end,
            segment.color
          );
          
          return (
            <circle
              key={index}
              cx="70"
              cy="70"
              r="50"
              fill="none"
              stroke={color}
              strokeWidth="20"
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
        
        {/* Center text */}
        <text
          x="70"
          y="70"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-bold fill-gray-900 dark:fill-[#F1F5F9]"
        >
          {Math.round(matchingPercent)}%
        </text>
        <text
          x="70"
          y="85"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-gray-500 dark:fill-gray-400"
        >
          Match
        </text>
      </svg>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Match</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Mismatch</span>
        </div>
        <div className="flex items-center space-x-1" title={`Only in ${fileAName}`}>
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-gray-600 dark:text-gray-400 truncate max-w-[60px]">Only {fileAName.length > 8 ? fileAName.substring(0, 8) + '...' : fileAName}</span>
        </div>
        <div className="flex items-center space-x-1" title={`Only in ${fileBName}`}>
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-gray-600 dark:text-gray-400 truncate max-w-[60px]">Only {fileBName.length > 8 ? fileBName.substring(0, 8) + '...' : fileBName}</span>
        </div>
      </div>
    </div>
  );
};

export default MatchRateChart;