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

  const [animatedValues, setAnimatedValues] = useState({
    total_a: summary.total_a,
    total_b: summary.total_b,
    matching: summary.matching,
    mismatching: summary.mismatching,
    only_in_a: summary.only_in_a,
    only_in_b: summary.only_in_b
  });
  const animationRef = useRef<number[]>([]);

  useEffect(() => {
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
  }, [summary]);

  return (
    <div className="bg-theme-surface border border-theme-border rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-theme-border pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-theme-text tracking-tight">Executive Summary</h2>
          <p className="text-xs text-theme-text-secondary">High-level match stats and row-level breakdown</p>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Comparison Complete</span>
        </div>
      </div>

      {/* Main Grid: Metric Cards + Chart */}
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        {/* Metric Cards Grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
          <MetricCard
            label={`${fileAName} Rows`}
            value={animatedValues.total_a}
            borderColor="#1D4ED8"
            textColor="text-blue-400"
            icon={
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            }
          />
          <MetricCard
            label={`${fileBName} Rows`}
            value={animatedValues.total_b}
            borderColor="#38BDF8"
            textColor="text-sky-400"
            icon={
              <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            }
          />
          <MetricCard
            label="Matching Rows"
            value={animatedValues.matching}
            borderColor="#10B981"
            textColor="text-emerald-400"
            icon={
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            }
          />
          <MetricCard
            label="Mismatching"
            value={animatedValues.mismatching}
            borderColor="#EF4444"
            textColor="text-red-400"
            icon={
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
          />
          <MetricCard
            label={`Only in ${fileAName}`}
            value={animatedValues.only_in_a}
            borderColor="#F59E0B"
            textColor="text-amber-400"
            icon={
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
          <MetricCard
            label={`Only in ${fileBName}`}
            value={animatedValues.only_in_b}
            borderColor="#38BDF8"
            textColor="text-sky-400"
            icon={
              <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Donut Chart */}
        <div className="bg-theme-elevated border border-theme-border rounded-2xl p-4 flex items-center justify-center flex-shrink-0">
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

      {/* Columns Compared Tags */}
      <div className="pt-4 border-t border-theme-border flex items-center justify-between text-xs">
        <span className="font-semibold text-theme-text-secondary">Evaluated Schema Columns ({columnsCompared.length}):</span>
        <div className="flex flex-wrap gap-1.5 max-w-xl justify-end">
          {columnsCompared.slice(0, 6).map(col => (
            <span key={col} className="px-2 py-0.5 bg-theme-elevated border border-theme-border text-blue-300 font-mono text-[11px] rounded-lg">
              {col}
            </span>
          ))}
          {columnsCompared.length > 6 && (
            <span className="px-2 py-0.5 bg-theme-elevated border border-theme-border text-theme-text-secondary font-mono text-[11px] rounded-lg">
              +{columnsCompared.length - 6} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonSummary;
