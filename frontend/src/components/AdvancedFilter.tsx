import React, { useState, useEffect } from 'react';
import type { ColumnFilter, DistinctValuesResponse } from '../types';
import { getDistinctValues } from '../services/api';

interface AdvancedFilterProps {
  columns: string[];
  filters: ColumnFilter[];
  onFiltersChange: (filters: ColumnFilter[]) => void;
  label: string;
  disabled?: boolean;
  fileId?: string;  // File ID to fetch distinct values
  copyFromFilters?: ColumnFilter[];  // Filters from other file to copy from
  onCopyFromFilters?: (filters: ColumnFilter[]) => void;  // Callback to copy filters
  fileColor?: 'blue' | 'purple';  // UI IMPROVEMENT #10: Color for file header
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  columns,
  filters,
  onFiltersChange,
  label,
  disabled = false,
  fileId,
  copyFromFilters,
  onCopyFromFilters,
  fileColor = 'blue'
}) => {
  const [isAddingFilter, setIsAddingFilter] = useState(false);
  const [newFilter, setNewFilter] = useState<{
    column: string;
    operator: ColumnFilter['operator'] | 'select_from_list';
    value: string;
  }>({
    column: '',
    operator: 'equals',
    value: ''
  });
  const [distinctValues, setDistinctValues] = useState<string[]>([]);
  const [isLoadingValues, setIsLoadingValues] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [isSample, setIsSample] = useState(false);
  const [totalDistinctCount, setTotalDistinctCount] = useState(0);

  const operators = [
    { value: 'equals', label: '=' },
    { value: 'not_equals', label: '!=' },
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'not contains' },
    { value: 'greater_than', label: '>' },
    { value: 'less_than', label: '<' },
    { value: 'greater_equal', label: '>=' },
    { value: 'less_equal', label: '<=' },
    { value: 'select_from_list', label: 'Select distinct values' }
  ];

  // Fetch distinct values when column changes AND operator is select_from_list
  useEffect(() => {
    const fetchDistinctValues = async () => {
      if (!fileId || !newFilter.column || newFilter.operator !== 'select_from_list') {
        setDistinctValues([]);
        setSelectedValues([]);
        setIsSample(false);
        setTotalDistinctCount(0);
        return;
      }

      setIsLoadingValues(true);
      try {
        const response: DistinctValuesResponse = await getDistinctValues(fileId, newFilter.column, 100, 10);
        setDistinctValues(response.values);
        setIsSample(response.is_sample || false);
        setTotalDistinctCount(response.total_count);
        
        // Pre-select values if they exist in copyFromFilters for the same column
        if (copyFromFilters && newFilter.column) {
          const matchingFilters = copyFromFilters.filter(f => f.column === newFilter.column);
          const matchingValues = matchingFilters.map(f => f.value);
          // Only select values that exist in the current file's distinct values
          const availableValues = matchingValues.filter(v => response.values.includes(v));
          setSelectedValues(availableValues);
        } else {
          setSelectedValues([]);
        }
      } catch (error) {
        console.error('Failed to fetch distinct values:', error);
        setDistinctValues([]);
        setSelectedValues([]);
        setIsSample(false);
        setTotalDistinctCount(0);
      } finally {
        setIsLoadingValues(false);
      }
    };

    fetchDistinctValues();
    setNewFilter(prev => ({ ...prev, value: '' }));
  }, [fileId, newFilter.column, newFilter.operator, copyFromFilters]);

  const handleAddFilter = () => {
    if (!newFilter.column) return;

    // If select_from_list operator, convert to equals when adding filter
    if (newFilter.operator === 'select_from_list') {
      if (selectedValues.length > 0) {
        const newFilters = selectedValues.map(value => ({
          column: newFilter.column,
          operator: 'equals' as ColumnFilter['operator'],
          value
        }));
        onFiltersChange([...filters, ...newFilters]);
        resetForm();
      }
    } else {
      // For all other operators, use the single value from input
      if (newFilter.value) {
        onFiltersChange([...filters, { 
          column: newFilter.column, 
          operator: newFilter.operator as ColumnFilter['operator'], 
          value: newFilter.value 
        }]);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setNewFilter({ column: '', operator: 'equals' as ColumnFilter['operator'], value: '' });
    setDistinctValues([]);
    setSelectedValues([]);
    setIsAddingFilter(false);
    setIsSample(false);
    setTotalDistinctCount(0);
  };

  const handleToggleValue = (value: string) => {
    setSelectedValues(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const handleSelectAll = () => {
    setSelectedValues([...distinctValues]);
  };

  const handleClearAll = () => {
    setSelectedValues([]);
  };

  // Group filters by column for better display
  const groupedFilters = filters.reduce((acc, filter) => {
    if (!acc[filter.column]) {
      acc[filter.column] = [];
    }
    acc[filter.column].push(filter);
    return acc;
  }, {} as Record<string, ColumnFilter[]>);

  return (
    <div className="bg-white dark:bg-[#1A1D27] rounded-lg shadow border-l-4 border-green-500 p-6">
      {/* UI IMPROVEMENT #10: Section header with FILTER icon */}
      <div className="flex items-center mb-4">
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mr-2 ${fileColor === 'blue' ? 'text-blue-500' : 'text-purple-500'}`} style={{fontSize: '1.25rem'}}>
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F1F5F9]" style={{fontSize: '1.125rem'}}>{label}</h3>
      </div>
      
      {/* Active filter pills - grouped by column */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(groupedFilters).map(([column, columnFilters]) => {
          const operator = columnFilters[0].operator;
          const values = columnFilters.map(f => f.value);
          const operatorLabel = operators.find(op => op.value === operator)?.label || operator;
          
          let displayValue: string;
          if (values.length === 1) {
            displayValue = values[0];
          } else if (values.length <= 3) {
            displayValue = values.join(', ');
          } else {
            displayValue = `${values.length} values`;
          }

          return (
            <div
              key={column}
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
            >
              <span className="text-sm font-medium">
                {column} {operatorLabel} {displayValue}
              </span>
              <button
                onClick={() => {
                  // Remove all filters for this column
                  const remainingFilters = filters.filter(f => f.column !== column);
                  onFiltersChange(remainingFilters);
                }}
                disabled={disabled}
                className="ml-2 text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* UI IMPROVEMENT #10: Add filter button with PLUS icon */}
      {!isAddingFilter && (
        <button
          onClick={() => setIsAddingFilter(true)}
          disabled={disabled}
          className="px-3 py-1.5 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm flex items-center"
          style={{fontSize: '0.875rem', minWidth: '80px'}}
        >
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Filter
        </button>
      )}

      {/* UI IMPROVEMENT #10: Inline filter form with icons */}
      {isAddingFilter && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-[#0F1117] rounded-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="relative">
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" style={{fontSize: '1rem'}}>
                <rect x="3" y="3" width="8" height="18"/>
                <rect x="13" y="3" width="8" height="18"/>
              </svg>
              <select
                value={newFilter.column}
                onChange={(e) => setNewFilter({ ...newFilter, column: e.target.value })}
                className="pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1A1D27] text-gray-900 dark:text-[#F1F5F9] text-sm"
                style={{fontSize: '0.875rem', minWidth: '120px'}}
              >
                <option value="">Select column...</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={newFilter.operator}
              onChange={(e) => setNewFilter({ ...newFilter, operator: e.target.value as ColumnFilter['operator'] | 'select_from_list' })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1A1D27] text-gray-900 dark:text-[#F1F5F9] text-sm"
              style={{fontSize: '0.875rem', minWidth: '120px'}}
            >
              {operators.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>

            {/* Value input - dropdown or text input */}
            <div className="relative">
              {isLoadingValues ? (
                <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 text-sm flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading values...
                </div>
              ) : newFilter.operator === 'select_from_list' ? (
                <div className="flex gap-1">
                  <div className="flex-1 text-xs text-gray-500 dark:text-gray-400 py-2">
                    {selectedValues.length > 0 
                      ? `${selectedValues.length} selected` 
                      : 'Select values below'}
                  </div>
                </div>
              ) : (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newFilter.value}
                    onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                    placeholder="Enter value..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1A1D27] text-gray-900 dark:text-[#F1F5F9] text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Multi-select checklist - only show when operator is select_from_list */}
          {newFilter.operator === 'select_from_list' && distinctValues.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isSample 
                    ? `Showing ${distinctValues.length} sample values (of ${totalDistinctCount} total)`
                    : `${distinctValues.length} distinct value${distinctValues.length !== 1 ? 's' : ''} found`
                  }
                </p>
                <div className="flex gap-2">
                  {copyFromFilters && copyFromFilters.length > 0 && (
                    <button
                      onClick={() => {
                        // Copy filters from the other file
                        if (onCopyFromFilters) {
                          onCopyFromFilters(copyFromFilters);
                        }
                      }}
                      disabled={disabled}
                      className="text-xs text-green-600 dark:text-green-400 hover:underline disabled:opacity-50"
                      title="Copy filters from other file"
                    >
                      Copy from {label.includes('File A') ? 'File B' : 'File A'}
                    </button>
                  )}
                  <button
                    onClick={handleSelectAll}
                    disabled={disabled}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleClearAll}
                    disabled={disabled}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              
              {/* Warning for large unique content */}
              {isSample && (
                <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium">Large number of unique values</p>
                      <p className="mt-1">
                        This column has {totalDistinctCount} unique values. Showing a random sample of {distinctValues.length} values.
                        Consider using operators like "contains" with custom input for better filtering.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-2 bg-white dark:bg-[#1A1D27]">
                {distinctValues.map((val) => (
                  <label
                    key={val}
                    className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-[#1E2130] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(val)}
                      onChange={() => handleToggleValue(val)}
                      disabled={disabled}
                      className="form-checkbox h-4 w-4 text-blue-600 mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{val}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* UI IMPROVEMENT #10: Apply and Cancel buttons with icons */}
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleAddFilter}
              disabled={!newFilter.column || (newFilter.operator === 'select_from_list' ? selectedValues.length === 0 : !newFilter.value)}
              className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-sm flex items-center"
              style={{fontSize: '0.875rem', minWidth: '80px'}}
            >
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Apply
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1E2130] text-sm flex items-center"
              style={{fontSize: '0.875rem', minWidth: '80px'}}
            >
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilter;
