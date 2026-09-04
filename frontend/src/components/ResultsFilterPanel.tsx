import React, { useState } from 'react';
import AdvancedFilter from './AdvancedFilter';
import type { ColumnFilter } from '../types';

interface ResultsFilterPanelProps {
  columnsA: string[];
  columnsB: string[];
  fileAFilters: ColumnFilter[];
  fileBFilters: ColumnFilter[];
  onFileAFiltersChange: (filters: ColumnFilter[]) => void;
  onFileBFiltersChange: (filters: ColumnFilter[]) => void;
  onRerunComparison: () => void;
  isComparing: boolean;
  fileAName?: string;
  fileBName?: string;
  fileAId?: string;
  fileBId?: string;
  copyFromAFilters?: ColumnFilter[];
  copyFromBFilters?: ColumnFilter[];
}

const ResultsFilterPanel: React.FC<ResultsFilterPanelProps> = ({
  columnsA,
  columnsB,
  fileAFilters,
  fileBFilters,
  onFileAFiltersChange,
  onFileBFiltersChange,
  onRerunComparison,
  isComparing,
  fileAName = 'File A',
  fileBName = 'File B',
  fileAId,
  fileBId,
  copyFromAFilters,
  copyFromBFilters
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Truncate filename for display
  const truncateFilename = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    const ext = name.includes('.') ? '.' + name.split('.').pop() : '';
    const baseName = name.replace(ext, '');
    return baseName.substring(0, maxLength - ext.length - 3) + '...' + ext;
  };

  // Generate filter summary
  const getFilterSummary = () => {
    const totalFilters = fileAFilters.length + fileBFilters.length;
    if (totalFilters === 0) return 'No filters applied';
    
    const parts = [];
    if (fileAFilters.length > 0) {
      parts.push(`${truncateFilename(fileAName, 15)}: ${fileAFilters.length}`);
    }
    if (fileBFilters.length > 0) {
      parts.push(`${truncateFilename(fileBName, 15)}: ${fileBFilters.length}`);
    }
    return parts.join(' | ');
  };

  return (
    <div className="bg-white dark:bg-[#1A1D27] rounded-lg shadow border-l-4 border-indigo-500 mb-6">
      {/* UI IMPROVEMENT #15: Header with SETTINGS icon and CHEVRON RIGHT */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E2130] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          {/* UI IMPROVEMENT #15: CHEVRON RIGHT that rotates */}
          <svg
            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 15 9 6"/>
          </svg>
          {/* UI IMPROVEMENT #15: SETTINGS icon before "Edit Filters" */}
          <div className="flex items-center">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{fontSize: '1rem'}}>
              <line x1="4" y1="21" x2="4" y2="14"/>
              <line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/>
              <line x1="20" y1="12" x2="20" y2="3"/>
              <line x1="1" y1="14" x2="7" y2="14"/>
              <line x1="9" y1="8" x2="15" y2="8"/>
              <line x1="17" y1="16" x2="23" y2="16"/>
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F1F5F9]" style={{fontSize: '1.125rem'}}>
                Edit Filters
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400" style={{fontSize: '0.875rem'}}>
                {getFilterSummary()}
              </p>
            </div>
          </div>
        </div>
        
        {/* UI IMPROVEMENT #14: REFRESH icon for Re-run Compare button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRerunComparison();
          }}
          disabled={isComparing}
          className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-500 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-medium flex items-center space-x-2 transition-colors"
          style={{minWidth: '80px', fontSize: '0.875rem'}}
        >
          {isComparing ? (
            <>
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" style={{fontSize: '1rem'}}>
                <line x1="12" y1="2" x2="12" y2="6"/>
                <line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                <line x1="2" y1="12" x2="6" y2="12"/>
                <line x1="18" y1="12" x2="22" y2="12"/>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
              </svg>
              <span>Comparing...</span>
            </>
          ) : (
            <>
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{fontSize: '1rem'}}>
                <polyline points="1 4 1 10 7 10"/>
                <polyline points="23 20 23 14 17 14"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              <span>Re-run Compare</span>
            </>
          )}
        </button>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 animate-fade-in space-y-4">
          {/* UI IMPROVEMENT #16: Individual File Filters with color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdvancedFilter
              columns={columnsA}
              filters={fileAFilters}
              onFiltersChange={onFileAFiltersChange}
              label={`${truncateFilename(fileAName, 25)} Filters`}
              disabled={isComparing}
              fileId={fileAId}
              copyFromFilters={copyFromBFilters}
              onCopyFromFilters={onFileAFiltersChange}
              fileColor="blue"
            />
            <AdvancedFilter
              columns={columnsB}
              filters={fileBFilters}
              onFiltersChange={onFileBFiltersChange}
              label={`${truncateFilename(fileBName, 25)} Filters`}
              disabled={isComparing}
              fileId={fileBId}
              copyFromFilters={copyFromAFilters}
              onCopyFromFilters={onFileBFiltersChange}
              fileColor="purple"
            />
          </div>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Tip:</strong> Modify filters above and click "Re-run Compare" to update results without re-uploading files.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsFilterPanel;
