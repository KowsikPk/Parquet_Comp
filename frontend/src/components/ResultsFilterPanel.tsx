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

  const truncateFilename = (name: string, maxLength: number = 14) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  };

  const getFilterSummary = () => {
    const totalFilters = fileAFilters.length + fileBFilters.length;
    if (totalFilters === 0) return 'No active filters';
    return `${fileAFilters.length} rule(s) for ${truncateFilename(fileAName)} • ${fileBFilters.length} rule(s) for ${truncateFilename(fileBName)}`;
  };

  return (
    <div className="bg-theme-surface border border-theme-border rounded-2xl shadow-lg mb-6 overflow-hidden">
      {/* Header bar */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-theme-elevated transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="p-1 rounded-lg text-theme-text-secondary hover:text-theme-text transition-transform duration-200"
          >
            <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-theme-text">Adjust Row Filters</h3>
              {(fileAFilters.length + fileBFilters.length) > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {fileAFilters.length + fileBFilters.length} active
                </span>
              )}
            </div>
            <p className="text-xs text-theme-text-secondary mt-0.5">{getFilterSummary()}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRerunComparison();
          }}
          disabled={isComparing}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-theme-muted disabled:text-theme-text-muted text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center space-x-2 transition-all"
        >
          {isComparing ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Re-evaluating...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Re-run Diff</span>
            </>
          )}
        </button>
      </div>

      {/* Expandable filters section */}
      {isExpanded && (
        <div className="p-4 border-t border-theme-border space-y-4 animate-slide-up bg-theme-base">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdvancedFilter
              columns={columnsA}
              filters={fileAFilters}
              onFiltersChange={onFileAFiltersChange}
              label={`${truncateFilename(fileAName)} Filters`}
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
              label={`${truncateFilename(fileBName)} Filters`}
              disabled={isComparing}
              fileId={fileBId}
              copyFromFilters={copyFromAFilters}
              onCopyFromFilters={onFileBFiltersChange}
              fileColor="purple"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsFilterPanel;
