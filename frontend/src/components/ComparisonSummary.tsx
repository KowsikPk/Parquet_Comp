import React, { useState, useEffect, useRef } from 'react';
import MetricCard from './MetricCard';
import MatchRateBar from './MatchRateBar';
import MatchRateChart from './MatchRateChart';
import type { ComparisonSummary } from '../types';

interface ComparisonSummaryProps {
  summary: ComparisonSummary;
  results?: any[];
  columnsCompared: string[];
  fileAName?: string;
  fileBName?: string;
}

const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({
  summary,
  results,
  columnsCompared,
  fileAName = 'File A',
  fileBName = 'File B'
}) => {
  const reconciledSummary = React.useMemo(() => {
    if (!summary) return summary;
    if (results && results.length > 0) {
      const partialFromResults = results.filter(r => r.status === 'partial_match').length;
      const matchFromResults = results.filter(r => r.status === 'match').length;
      const mismatchFromResults = results.filter(r => r.status === 'mismatch').length;
      const onlyAFromResults = results.filter(r => r.status === 'only_in_a').length;
      const onlyBFromResults = results.filter(r => r.status === 'only_in_b').length;

      return {
        ...summary,
        matching: summary.matching ?? matchFromResults,
        partial_match: (summary.partial_match !== undefined && summary.partial_match > 0) ? summary.partial_match : partialFromResults,
        mismatching: summary.mismatching ?? mismatchFromResults,
        only_in_a: (summary.only_in_a !== undefined && summary.only_in_a > 0) ? summary.only_in_a : onlyAFromResults,
        only_in_b: (summary.only_in_b !== undefined && summary.only_in_b > 0) ? summary.only_in_b : onlyBFromResults,
      };
    }
    return summary;
  }, [summary, results]);

  const maxRows = Math.max(reconciledSummary?.total_a ?? 0, reconciledSummary?.total_b ?? 0);
  const matchRate = maxRows > 0 
    ? Math.round(((reconciledSummary?.matching ?? 0) / maxRows) * 100)
    : 0;

  const [animatedValues, setAnimatedValues] = useState({
    total_a: reconciledSummary?.total_a ?? 0,
    total_b: reconciledSummary?.total_b ?? 0,
    matching: reconciledSummary?.matching ?? 0,
    mismatching: reconciledSummary?.mismatching ?? 0,
    partial_match: reconciledSummary?.partial_match ?? 0,
    only_in_a: reconciledSummary?.only_in_a ?? 0,
    only_in_b: reconciledSummary?.only_in_b ?? 0
  });
  const animationRef = useRef<number[]>([]);

  useEffect(() => {
    if (!reconciledSummary) return;
    const duration = 600;
    const startTime = performance.now();
    const targetValues = {
      total_a: reconciledSummary.total_a,
      total_b: reconciledSummary.total_b,
      matching: reconciledSummary.matching,
      mismatching: reconciledSummary.mismatching,
      partial_match: reconciledSummary.partial_match,
      only_in_a: reconciledSummary.only_in_a,
      only_in_b: reconciledSummary.only_in_b
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
        partial_match: Math.round(targetValues.partial_match * easeOutQuart),
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
  }, [reconciledSummary]);

  return (
    <div className="bg-theme-surface border border-theme-border rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-theme-border pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-theme-text tracking-tight">Executive Summary</h2>
          <p className="text-xs text-theme-text-secondary">High-level match stats and row-level breakdown</p>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Comparison Complete</span>
        </div>
      </div>

      {/* Main Grid: Metric Cards + Chart */}
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        {/* Metric Cards Grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
          <MetricCard
            label={`${fileAName} Rows`}
            value={animatedValues.total_a}
            borderColor="#1D4ED8"
            textColor="text-blue-600 dark:text-blue-400"
            icon={
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
            textColor="text-sky-600 dark:text-sky-400"
            icon={
              <svg className="w-5 h-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
            textColor="text-emerald-600 dark:text-emerald-400"
            icon={
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            }
          />
          <MetricCard
            label="Partial Matches"
            value={animatedValues.partial_match}
            borderColor="#F59E0B"
            textColor="text-amber-600 dark:text-amber-400"
            icon={
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
          <MetricCard
            label="Mismatching"
            value={animatedValues.mismatching}
            borderColor="#EF4444"
            textColor="text-red-600 dark:text-red-400"
            icon={
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
          />
          <MetricCard
            label={`Only in ${fileAName}`}
            value={animatedValues.only_in_a}
            borderColor="#F59E0B"
            textColor="text-amber-600 dark:text-amber-400"
            icon={
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
          <MetricCard
            label={`Only in ${fileBName}`}
            value={animatedValues.only_in_b}
            borderColor="#38BDF8"
            textColor="text-sky-600 dark:text-sky-400"
            icon={
              <svg className="w-5 h-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Donut Chart */}
        <div className="bg-theme-elevated border border-theme-border rounded-2xl p-4 flex items-center justify-center flex-shrink-0">
          <MatchRateChart
            matching={reconciledSummary?.matching ?? 0}
            mismatching={reconciledSummary?.mismatching ?? 0}
            partial_match={reconciledSummary?.partial_match ?? 0}
            onlyInA={reconciledSummary?.only_in_a ?? 0}
            onlyInB={reconciledSummary?.only_in_b ?? 0}
            totalRows={maxRows}
            fileAName={fileAName}
            fileBName={fileBName}
          />
        </div>
      </div>

      {/* Match Rate Bar */}
      <MatchRateBar matchRate={matchRate} totalRows={maxRows} />

      {/* Columns Compared Tags */}
      <div className="pt-4 border-t border-theme-border flex items-center justify-between text-xs">
        <span className="font-semibold text-theme-text-secondary">Evaluated Schema Columns ({columnsCompared.length}):</span>
        <div className="flex flex-wrap gap-1.5 max-w-xl justify-end">
          {columnsCompared.slice(0, 6).map(col => (
            <span key={col} className="px-2 py-0.5 bg-theme-elevated border border-theme-border text-blue-700 dark:text-blue-300 font-mono text-[11px] rounded-lg">
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
