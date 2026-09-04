import React, { useState, useRef } from 'react';
import type { CompareResponse } from '../types';

interface ExportDropdownProps {
  comparisonResult: CompareResponse | null;
  onDownloadReport: () => void;
  fileAName?: string;
  fileBName?: string;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ comparisonResult, onDownloadReport, fileAName = 'File A', fileBName = 'File B' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      {/* UI IMPROVEMENT #20: Export button with DOWNLOAD icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-500 flex items-center space-x-2"
        style={{minWidth: '80px', fontSize: '0.875rem'}}
      >
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{fontSize: '1rem'}}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>Export</span>
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{fontSize: '1rem'}}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
          <div className="py-1">
            {/* UI IMPROVEMENT #20: CSV Report with FILE icon */}
            <button
              onClick={onDownloadReport}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1E2130] flex items-center space-x-2"
              style={{fontSize: '0.875rem'}}
            >
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{fontSize: '1rem'}}>
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span>CSV Report</span>
            </button>
            
            {/* UI IMPROVEMENT #20: Copy Summary with CLIPBOARD icon */}
            <button
              onClick={handleCopySummary}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1E2130] flex items-center space-x-2"
              style={{fontSize: '0.875rem'}}
            >
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{fontSize: '1rem'}}>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <span>Copy Summary to Clipboard</span>
            </button>
            
            {/* UI IMPROVEMENT #20: JSON Export with CODE icon */}
            <button
              onClick={handleExportJSON}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1E2130] flex items-center space-x-2"
              style={{fontSize: '0.875rem'}}
            >
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{fontSize: '1rem'}}>
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
              <span>JSON Export</span>
            </button>
            
            {/* UI IMPROVEMENT #20: Print View with PRINTER icon */}
            <button
              onClick={handlePrintView}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1E2130] flex items-center space-x-2"
              style={{fontSize: '0.875rem'}}
            >
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{fontSize: '1rem'}}>
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              <span>Print View</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;