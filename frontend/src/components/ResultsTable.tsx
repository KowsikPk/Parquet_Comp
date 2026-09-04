import React, { useState } from 'react';
import type { ComparisonResult } from '../types';
import InlineDiffView from './InlineDiffView';

interface ResultsTableProps {
  results: ComparisonResult[];
  filter: 'all' | 'match' | 'mismatch' | 'only_in_a' | 'only_in_b';
  onFilterChange: (filter: 'all' | 'match' | 'mismatch' | 'only_in_a' | 'only_in_b') => void;
  columnsCompared: string[];
  displayColumns?: string[];  // UI IMPROVEMENT: Display-only columns
  fileAName?: string;
  fileBName?: string;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  filter,
  onFilterChange,
  columnsCompared,
  displayColumns = [],
  fileAName = 'File A',
  fileBName = 'File B'
}) => {
  void columnsCompared; // Required by interface but not directly used in render
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const rowsPerPage = 50;

  const filteredResults = results.filter(result => {
    if (filter === 'all') return true;
    return result.status === filter;
  });

  // Search filter
  const searchedResults = filteredResults.filter(result => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // Search in row key
    if (result.row_key.toLowerCase().includes(query)) return true;
    
    // Search in row data
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

  // Truncate filename if too long
  const truncateFilename = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    const ext = name.includes('.') ? '.' + name.split('.').pop() : '';
    const baseName = name.replace(ext, '');
    return baseName.substring(0, maxLength - ext.length - 3) + '...' + ext;
  };

  // UI IMPROVEMENT: Status badges with soft tint backgrounds
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'match':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#16a34a'}}>
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1" style={{fontSize: '0.75rem'}}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            match
          </span>
        );
      case 'mismatch':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{fontSize: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626'}}>
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1" style={{fontSize: '0.75rem'}}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            mismatch
          </span>
        );
      case 'only_in_a':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" title={`Only in ${fileAName}`} style={{fontSize: '0.75rem', backgroundColor: '#ffedd5', color: '#ea580c'}}>
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1" style={{fontSize: '0.75rem'}}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Only in {truncateFilename(fileAName, 15)}
          </span>
        );
      case 'only_in_b':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" title={`Only in ${fileBName}`} style={{fontSize: '0.75rem', backgroundColor: '#f3e8ff', color: '#9333ea'}}>
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1" style={{fontSize: '0.75rem'}}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Only in {truncateFilename(fileBName, 15)}
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

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600">$1</mark>');
  };

  return (
    <div className="bg-white dark:bg-[#1A1D27] rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F1F5F9]">Detailed Results</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {searchedResults.length} of {results.length} rows
          </div>
        </div>

        {/* UI IMPROVEMENT: Search input with SEARCH icon - redesigned */}
        <div className="mb-4 relative">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" style={{fontSize: '1rem'}}>
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search by row key or value..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-[#0F1117] text-gray-900 dark:text-[#F1F5F9] placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:border-blue-500 focus:box-shadow focus:ring-opacity-10"
            style={{fontSize: '0.875rem', borderRadius: '24px', borderColor: '#e5e7eb'}}
          />
        </div>

        {/* UI IMPROVEMENT: Filter tabs with counts and colored dots */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'match', 'mismatch', 'only_in_a', 'only_in_b'] as const).map((status) => {
            const count = status === 'all' ? results.length : results.filter(r => r.status === status).length;
            const hasCount = count > 0;
            const dotColor = status === 'match' ? '#22c55e' : status === 'mismatch' ? '#ef4444' : status === 'only_in_a' ? '#f97316' : status === 'only_in_b' ? '#a855f7' : '#6b7280';
            return (
              <button
                key={status}
                onClick={() => {
                  onFilterChange(status);
                  setCurrentPage(1);
                  setExpandedRows(new Set());
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-500 dark:bg-blue-600 text-white'
                    : 'bg-white dark:bg-[#1A1D27] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                style={{borderRadius: '20px', gap: '8px'}}
                title={status === 'only_in_a' ? `Only in ${fileAName}` : status === 'only_in_b' ? `Only in ${fileBName}` : undefined}
              >
                <span className="flex items-center gap-2">
                  {hasCount && status !== 'all' && (
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: dotColor}}></span>
                  )}
                  {status === 'all' && 'All'}
                  {status === 'match' && 'Matching'}
                  {status === 'mismatch' && 'Mismatching'}
                  {status === 'only_in_a' && `Only in ${truncateFilename(fileAName, 15)}`}
                  {status === 'only_in_b' && `Only in ${truncateFilename(fileBName, 15)}`}
                  <span className="text-xs opacity-75">({count})</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          {/* UI IMPROVEMENT: Table headers with new styling */}
          <thead className="bg-gray-50 dark:bg-[#0F1117] sticky top-0 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: '#9ca3af'}}>
                ROW KEY
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: '#9ca3af'}}>
                STATUS
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: '#9ca3af'}}>
                OBJECTCLASS
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: '#9ca3af'}}>
                PROPERTIES
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: '#9ca3af'}}>
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#1A1D27] divide-y divide-gray-200 dark:divide-gray-700">
            {currentResults.map((result) => (
              <React.Fragment key={result.row_key}>
                {/* UI IMPROVEMENT: Table row with new styling */}
                <tr
                  className="hover:bg-gray-50 dark:hover:bg-[#1E2130] transition-colors duration-150"
                  style={{padding: '16px 0', borderBottom: '1px solid #f9fafb'}}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-[#F1F5F9]" style={{fontSize: '0.9rem', fontWeight: 700, color: '#111827'}}>
                    <span dangerouslySetInnerHTML={{ __html: highlightText(result.row_key, searchQuery) }} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(result.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col space-y-1">
                      {result.row_data_a && 'ObjectClass' in result.row_data_a && (
                        <div className="text-xs" title={fileAName}>
                          <span className="text-gray-500 dark:text-gray-400">{truncateFilename(fileAName, 10)}:</span> {result.row_data_a['ObjectClass']?.substring(0, 30)}{result.row_data_a['ObjectClass']?.length > 30 ? '...' : ''}
                        </div>
                      )}
                      {result.row_data_b && 'ObjectClass' in result.row_data_b && (
                        <div className="text-xs" title={fileBName}>
                          <span className="text-gray-500 dark:text-gray-400">{truncateFilename(fileBName, 10)}:</span> {result.row_data_b['ObjectClass']?.substring(0, 30)}{result.row_data_b['ObjectClass']?.length > 30 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col space-y-1">
                      {result.row_data_a && 'properties' in result.row_data_a && (
                        <div className="text-xs" title={fileAName}>
                          <span className="text-gray-500 dark:text-gray-400">{truncateFilename(fileAName, 10)}:</span> {result.row_data_a['properties']?.substring(0, 30)}{result.row_data_a['properties']?.length > 30 ? '...' : ''}
                        </div>
                      )}
                      {result.row_data_b && 'properties' in result.row_data_b && (
                        <div className="text-xs" title={fileBName}>
                          <span className="text-gray-500 dark:text-gray-400">{truncateFilename(fileBName, 10)}:</span> {result.row_data_b['properties']?.substring(0, 30)}{result.row_data_b['properties']?.length > 30 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  </td>
                  {/* UI IMPROVEMENT: Actions cell with View Details button */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => toggleRowExpand(result.row_key)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center space-x-1 transition-colors"
                      style={{fontSize: '0.875rem', color: '#3b82f6', fontWeight: 500}}
                    >
                      <span>View Details</span>
                      <svg
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-200 ${expandedRows.has(result.row_key) ? 'rotate-90' : ''}`}
                        style={{fontSize: '1rem'}}
                      >
                        <polyline points="9 18 15 12 15 9 6"/>
                      </svg>
                    </button>
                  </td>
                </tr>
                
                {/* Expanded row */}
                {expandedRows.has(result.row_key) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-0">
                      <div className="animate-fade-in">
                        <InlineDiffView result={result} fileAName={fileAName} fileBName={fileBName} displayColumns={displayColumns} />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#1E2130] transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#1E2130] transition-colors"
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
