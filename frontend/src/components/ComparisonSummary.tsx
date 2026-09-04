import React, { useState, useEffect, useRef } from 'react';
import MetricCard from './MetricCard';
import MatchRateBar from './MatchRateBar';
import MatchRateChart from './MatchRateChart';
import type { ComparisonSummary } from '../types';

interface ComparisonSummaryProps {
  summary: ComparisonSummary;
  columnsCompared: string[];
  fileAName?: string;
  fileBName?: string;
}

const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({
  summary,
  columnsCompared,
  fileAName = 'File A',
  fileBName = 'File B'
}) => {
  const total = summary.total_a + summary.total_b;
  const matchRate = total > 0 
    ? Math.round((summary.matching / Math.max(summary.total_a, summary.total_b)) * 100)
    : 0;

  // UI IMPROVEMENT #12: Count-up animation with prefers-reduced-motion check
  const [animatedValues, setAnimatedValues] = useState({
    total_a: summary.total_a,
    total_b: summary.total_b,
    matching: summary.matching,
    mismatching: summary.mismatching,
    only_in_a: summary.only_in_a,
    only_in_b: summary.only_in_b
  });
  const animationRef = useRef<number[]>([]);
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimatedValues({
        total_a: summary.total_a,
        total_b: summary.total_b,
        matching: summary.matching,
        mismatching: summary.mismatching,
        only_in_a: summary.only_in_a,
        only_in_b: summary.only_in_b
      });
      return;
    }

    const duration = 600;
    const startTime = performance.now();
    const targetValues = {
      total_a: summary.total_a,
      total_b: summary.total_b,
      matching: summary.matching,
      mismatching: summary.mismatching,
      only_in_a: summary.only_in_a,
      only_in_b: summary.only_in_b
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedValues({
        total_a: Math.round(targetValues.total_a * easeOutQuart),
        total_b: Math.round(targetValues.total_b * easeOutQuart),
        matching: Math.round(targetValues.matching * easeOutQuart),
        mismatching: Math.round(targetValues.mismatching * easeOutQuart),
        only_in_a: Math.round(targetValues.only_in_a * easeOutQuart),
        only_in_b: Math.round(targetValues.only_in_b * easeOutQuart)
      });

      if (progress < 1) {
        animationRef.current[0] = requestAnimationFrame(animate);
      }
    };

    animationRef.current[0] = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current[0]) {
        cancelAnimationFrame(animationRef.current[0]);
      }
    };
  }, [summary, prefersReducedMotion]);

  return (
    <div className="bg-white dark:bg-[#1A1D27] rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F1F5F9] mb-4" style={{fontSize: '1.125rem'}}>Comparison Summary</h3>
      
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* UI IMPROVEMENT #12: Metric Cards Row with auto-fit grid */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'}}>
          {/* UI IMPROVEMENT #12: DATABASE icon for File A */}
          <MetricCard
            label={`${fileAName} Rows`}
            value={animatedValues.total_a}
            borderColor="#3B82F6"
            textColor="text-blue-600 dark:text-blue-400"
            icon={
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{fontSize: '1.25rem'}}>
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            }
          />
          {/* UI IMPROVEMENT #12: DATABASE icon for File B */}
          <MetricCard
            label={`${fileBName} Rows`}
            value={animatedValues.total_b}
            borderColor="#8B5CF6"
            textColor="text-purple-600 dark:text-purple-400"
            icon={
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{fontSize: '1.25rem'}}>
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            }
          />
          {/* UI IMPROVEMENT #12: CHECK CIRCLE icon for Matching */}
          <MetricCard
            label="Matching"
            value={animatedValues.matching}
            borderColor="#10B981"
            textColor="text-green-600 dark:text-green-400"
            icon={
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{fontSize: '1.25rem'}}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            }
          />
          {/* UI IMPROVEMENT #12: X CIRCLE icon for Mismatching */}
          <MetricCard
            label="Mismatching"
            value={animatedValues.mismatching}
            borderColor="#EF4444"
            textColor="text-red-600 dark:text-red-400"
            icon={
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{fontSize: '1.25rem'}}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            }
          />
          {/* UI IMPROVEMENT #12: WARNING TRIANGLE icon for Only in A */}
          <MetricCard
            label={`Only in ${fileAName}`}
            value={animatedValues.only_in_a}
            borderColor="#F59E0B"
            textColor="text-orange-600 dark:text-orange-400"
            icon={
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{fontSize: '1.25rem'}}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            }
          />
          {/* UI IMPROVEMENT #12: ALERT CIRCLE icon for Only in B */}
          <MetricCard
            label={`Only in ${fileBName}`}
            value={animatedValues.only_in_b}
            borderColor="#8B5CF6"
            textColor="text-purple-600 dark:text-purple-400"
            icon={
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{fontSize: '1.25rem'}}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            }
          />
        </div>

        {/* Donut Chart */}
        <div className="flex items-center justify-center">
          <MatchRateChart
            matching={summary.matching}
            mismatching={summary.mismatching}
            onlyInA={summary.only_in_a}
            onlyInB={summary.only_in_b}
            fileAName={fileAName}
            fileBName={fileBName}
          />
        </div>
      </div>

      {/* Match Rate Bar */}
      <MatchRateBar matchRate={matchRate} totalRows={Math.max(summary.total_a, summary.total_b)} />

      {/* Columns compared */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-900 dark:text-[#F1F5F9]">Columns compared:</span>{' '}
          {columnsCompared.length > 0 ? (
            <span className="text-gray-800 dark:text-gray-300">
              {columnsCompared.slice(0, 5).join(', ')}
              {columnsCompared.length > 5 && `... and ${columnsCompared.length - 5} more`}
            </span>
          ) : (
            <span className="text-gray-500 dark:text-gray-500">None</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonSummary;
