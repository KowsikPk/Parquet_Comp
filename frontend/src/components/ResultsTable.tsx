import React, { useState } from 'react';
import type { ComparisonResult } from '../types';
import InlineDiffView from './InlineDiffView';

interface ResultsTableProps {
  results: ComparisonResult[];
  filter: 'all' | 'match' | 'mismatch' | 'partial_match' | 'only_in_a' | 'only_in_b';
  onFilterChange: (filter: 'all' | 'match' | 'mismatch' | 'partial_match' | 'only_in_a' | 'only_in_b') => void;
  columnsCompared: string[];
  fileAName?: string;
  fileBName?: string;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  filter,
  onFilterChange,
  columnsCompared,
  fileAName = 'File A',
  fileBName = 'File B'
}) => {
  void columnsCompared;
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const rowsPerPage = 50;

  const filteredResults = results.filter(result => {
    if (filter === 'all') return true;
    return result.status === filter;
  });

  const searchedResults = filteredResults.filter(result => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    if (result.row_key.toLowerCase().includes(query)) return true;
    
    if (result.row_data_a) {
      const aValues = Object.values(result.row_data_a).join(' ').toLowerCase();
      if (aValues.includes(query)) return true;
    }
    
    if (result.row_data_b) {
      const bValues = Object.values(result.row_data_b).join(' ').toLowerCase();
      if (bValues.includes(query)) return true;
    }
    
    return false;
  });

  const totalPages = Math.ceil(searchedResults.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentResults = searchedResults.slice(startIndex, endIndex);

  const truncateFilename = (name: string, maxLength: number = 14) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  };

  const getStatusBadge = (result: ComparisonResult) => {
    switch (result.status) {
      case 'match':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            Match
          </span>
        );
      case 'mismatch':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
            Mismatch
          </span>
        );
      case 'partial_match':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            Partial ({result.match_percentage || 0}%)
          </span>
        );
      case 'only_in_a':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>
            Only A
          </span>
        );
      case 'only_in_b':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-1.5"></span>
            Only B
          </span>
        );
      default:
        return null;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedRows(new Set());
  };

  const toggleRowExpand = (rowKey: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowKey)) {
        newSet.delete(rowKey);
      } else {
        newSet.add(rowKey);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-theme-surface border border-theme-border rounded-2xl shadow-xl space-y-4 p-5">
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-theme-border">
        <div>
          <h3 className="text-base font-extrabold text-theme-text">Detailed Row Comparison</h3>
          <p className="text-xs text-theme-text-secondary">Showing {searchedResults.length} matching rows of {results.length} total</p>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[280px]">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by row key or value..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-theme-elevated border border-theme-border rounded-xl text-xs text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'match', 'mismatch', 'partial_match', 'only_in_a', 'only_in_b'] as const).map((status) => {
          const count = status === 'all' ? results.length : results.filter(r => r.status === status).length;
          const isActive = filter === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => {
                onFilterChange(status);
                setCurrentPage(1);
                setExpandedRows(new Set());
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-theme-elevated text-theme-text-secondary hover:text-theme-text border border-theme-border'
              }`}
            >
              <span>
                {status === 'all' && 'All'}
                {status === 'match' && 'Matches'}
                {status === 'partial_match' && 'Partial'}
                {status === 'mismatch' && 'Mismatches'}
                {status === 'only_in_a' && `Only ${truncateFilename(fileAName)}`}
                {status === 'only_in_b' && `Only ${truncateFilename(fileBName)}`}
              </span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-theme-base text-theme-text-secondary'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-theme-border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-theme-elevated text-[11px] font-bold text-theme-text-secondary uppercase tracking-wider border-b border-theme-border">
              <th className="px-4 py-3">Row Key</th>
              <th className="px-4 py-3">Status</th>
              {columnsCompared.slice(0, 4).map(col => (
                <th key={col} className="px-4 py-3">{col}</th>
              ))}
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border text-xs">
            {currentResults.map((result) => (
              <React.Fragment key={result.row_key}>
                <tr className="hover:bg-theme-elevated/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-theme-text">{result.row_key}</td>
                  <td className="px-4 py-3">{getStatusBadge(result)}</td>
                  {columnsCompared.slice(0, 4).map(col => {
                    const val = result.row_data_a?.[col] ?? result.row_data_b?.[col];
                    const displayVal = typeof val === 'object' && val !== null 
                      ? JSON.stringify(val).substring(0, 50) + (JSON.stringify(val).length > 50 ? '...' : '') 
                      : String(val ?? '—');
                    return (
                      <td key={col} className="px-4 py-3 text-theme-text-secondary truncate max-w-xs font-mono" title={displayVal}>
                        {displayVal}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleRowExpand(result.row_key)}
                      className="px-2.5 py-1 bg-theme-elevated hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-theme-border hover:border-blue-500/40 rounded-lg text-xs font-medium transition-all inline-flex items-center space-x-1"
                    >
                      <span>{expandedRows.has(result.row_key) ? 'Hide' : 'View Diff'}</span>
                      <svg className={`w-3.5 h-3.5 transition-transform ${expandedRows.has(result.row_key) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </td>
                </tr>

                {/* Inline Diff view drawer row */}
                {expandedRows.has(result.row_key) && (
                  <tr>
                    <td colSpan={5} className="p-0 bg-theme-base">
                      <div className="p-4 border-b border-theme-border animate-slide-up">
                        <InlineDiffView result={result} fileAName={fileAName} fileBName={fileBName} />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-theme-text-secondary">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-theme-elevated hover:bg-theme-muted disabled:opacity-50 disabled:cursor-not-allowed border border-theme-border rounded-lg text-theme-text font-medium transition-all"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-theme-elevated hover:bg-theme-muted disabled:opacity-50 disabled:cursor-not-allowed border border-theme-border rounded-lg text-theme-text font-medium transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsTable;
