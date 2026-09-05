import React, { useState, useRef, useEffect } from 'react';
import type { CompareResponse } from '../types';

interface ExportDropdownProps {
  comparisonResult: CompareResponse | null;
  onDownloadReport: () => void;
  fileAName?: string;
  fileBName?: string;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({
  comparisonResult,
  onDownloadReport,
  fileAName = 'File A',
  fileBName = 'File B'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopySummary = () => {
    if (!comparisonResult?.summary) return;

    const summary = {
      [`${fileAName}_rows`]: comparisonResult.summary.total_a,
      [`${fileBName}_rows`]: comparisonResult.summary.total_b,
      matching: comparisonResult.summary.matching,
      mismatching: comparisonResult.summary.mismatching,
      [`only_in_${fileAName}`]: comparisonResult.summary.only_in_a,
      [`only_in_${fileBName}`]: comparisonResult.summary.only_in_b,
      columns_compared: comparisonResult.columns_compared
    };

    navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
    setIsOpen(false);
  };

  const handleExportJSON = () => {
    if (!comparisonResult) return;

    const data = JSON.stringify(comparisonResult, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comparison_export_${comparisonResult.job_id || 'data'}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handlePrintView = () => {
    window.print();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center space-x-2 transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Export Results</span>
        <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-theme-elevated border border-theme-border rounded-xl shadow-2xl p-1.5 z-50 animate-slide-up">
          <button
            type="button"
            onClick={onDownloadReport}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-theme-text hover:bg-blue-600/20 hover:text-blue-300 flex items-center space-x-2 transition-colors"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download CSV Report</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-theme-text hover:bg-blue-600/20 hover:text-blue-300 flex items-center space-x-2 transition-colors"
          >
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy JSON Summary</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-theme-text hover:bg-blue-600/20 hover:text-blue-300 flex items-center space-x-2 transition-colors"
          >
            <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>Export Full JSON Dump</span>
          </button>

          <button
            type="button"
            onClick={handlePrintView}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-theme-text hover:bg-blue-600/20 hover:text-blue-300 flex items-center space-x-2 transition-colors"
          >
            <svg className="w-4 h-4 text-theme-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print View</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;