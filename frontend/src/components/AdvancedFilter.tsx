import React, { useState, useEffect } from 'react';
import type { ColumnFilter, DistinctValuesResponse } from '../types';
import { getDistinctValues } from '../services/api';

interface AdvancedFilterProps {
  columns: string[];
  filters: ColumnFilter[];
  onFiltersChange: (filters: ColumnFilter[]) => void;
  label: string;
  disabled?: boolean;
  fileId?: string;
  copyFromFilters?: ColumnFilter[];
  onCopyFromFilters?: (filters: ColumnFilter[]) => void;
  fileColor?: 'blue' | 'purple';
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

  const isBlue = fileColor === 'blue';
  const headerBadgeBg = isBlue ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-sky-500/10 text-sky-400 border-sky-500/20';

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

        if (copyFromFilters && newFilter.column) {
          const matchingFilters = copyFromFilters.filter(f => f.column === newFilter.column);
          const matchingValues = matchingFilters.map(f => f.value);
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

  const handleSelectAll = () => setSelectedValues([...distinctValues]);
  const handleClearAll = () => setSelectedValues([]);

  const groupedFilters = filters.reduce((acc, filter) => {
    if (!acc[filter.column]) acc[filter.column] = [];
    acc[filter.column].push(filter);
    return acc;
  }, {} as Record<string, ColumnFilter[]>);

  return (
    <div className="bg-theme-surface border border-theme-border rounded-2xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${headerBadgeBg}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-theme-text">{label}</h3>
            <p className="text-[11px] text-theme-text-secondary">Apply row-level filtering rules before comparison</p>
          </div>
        </div>

        {copyFromFilters && copyFromFilters.length > 0 && onCopyFromFilters && (
          <button
            type="button"
            onClick={() => onCopyFromFilters(copyFromFilters)}
            className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 rounded-lg text-[10px] font-bold transition-all"
          >
            Copy Rules
          </button>
        )}
      </div>

      {/* Active Filters Pills */}
      {Object.keys(groupedFilters).length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {Object.entries(groupedFilters).map(([column, columnFilters]) => {
            const operator = columnFilters[0].operator;
            const values = columnFilters.map(f => f.value);
            const operatorLabel = operators.find(op => op.value === operator)?.label || operator;

            let displayValue = values.length === 1 ? values[0] : values.length <= 3 ? values.join(', ') : `${values.length} values`;

            return (
               <div
                key={column}
                className="inline-flex items-center px-3 py-1 rounded-xl bg-theme-elevated border border-blue-500/30 text-blue-300 text-xs font-mono shadow-sm"
              >
                <span><strong className="text-theme-text">{column}</strong> {operatorLabel} "{displayValue}"</span>
                <button
                  type="button"
                  onClick={() => onFiltersChange(filters.filter(f => f.column !== column))}
                  disabled={disabled}
                  className="ml-2 text-theme-text-secondary hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Filter Button */}
      {!isAddingFilter && (
        <button
          type="button"
          onClick={() => setIsAddingFilter(true)}
          disabled={disabled}
          className="w-full py-2.5 border-2 border-dashed border-theme-border hover:border-blue-500/50 rounded-xl text-xs font-semibold text-theme-text-secondary hover:text-theme-text transition-all flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Row Filter</span>
        </button>
      )}

      {/* Filter Form Drawer */}
      {isAddingFilter && (
        <div className="p-4 bg-theme-elevated rounded-xl border border-theme-border space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Column select */}
            <select
              value={newFilter.column}
              onChange={(e) => setNewFilter({ ...newFilter, column: e.target.value })}
              className="px-3 py-2 bg-theme-base border border-theme-border rounded-lg text-xs text-theme-text focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="">Select column...</option>
              {columns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>

            {/* Operator select */}
            <select
              value={newFilter.operator}
              onChange={(e) => setNewFilter({ ...newFilter, operator: e.target.value as ColumnFilter['operator'] | 'select_from_list' })}
              className="px-3 py-2 bg-theme-base border border-theme-border rounded-lg text-xs text-theme-text focus:outline-none focus:border-blue-500 font-mono"
            >
              {operators.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>

            {/* Value input */}
            <div>
              {isLoadingValues ? (
                <div className="px-3 py-2 bg-theme-base border border-theme-border rounded-lg text-xs text-theme-text-secondary flex items-center space-x-2">
                  <svg className="animate-spin h-3.5 w-3.5 text-blue-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Loading...</span>
                </div>
              ) : newFilter.operator === 'select_from_list' ? (
                <div className="px-3 py-2 bg-theme-base border border-theme-border rounded-lg text-xs text-theme-text-secondary truncate">
                  {selectedValues.length ? `${selectedValues.length} selected` : 'Choose below'}
                </div>
              ) : (
                <input
                  type="text"
                  value={newFilter.value}
                  onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                  placeholder="Enter comparison value..."
                  className="w-full px-3 py-2 bg-theme-base border border-theme-border rounded-lg text-xs text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-blue-500 font-mono"
                />
              )}
            </div>
          </div>

          {/* Distinct Value Picker */}
          {newFilter.operator === 'select_from_list' && distinctValues.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-theme-border">
              <div className="flex items-center justify-between text-[11px] text-theme-text-secondary">
                <span>{isSample ? `Sample of ${distinctValues.length} (${totalDistinctCount} total)` : `${distinctValues.length} distinct values`}</span>
                <div className="flex space-x-2">
                  <button type="button" onClick={handleSelectAll} className="text-blue-400 hover:underline">Select All</button>
                  <button type="button" onClick={handleClearAll} className="text-theme-text-muted hover:underline">Clear</button>
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1 bg-theme-base p-2 rounded-lg border border-theme-border">
                {distinctValues.map((val) => (
                  <label key={val} className="flex items-center space-x-2 p-1.5 rounded hover:bg-theme-elevated cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(val)}
                      onChange={() => handleToggleValue(val)}
                      className="w-3.5 h-3.5 rounded border-theme-border bg-theme-base text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-mono text-theme-text-secondary truncate">{val}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 bg-theme-base hover:bg-theme-muted text-theme-text-secondary hover:text-theme-text border border-theme-border rounded-lg text-xs font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddFilter}
              disabled={!newFilter.column || (newFilter.operator === 'select_from_list' ? selectedValues.length === 0 : !newFilter.value)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-theme-muted disabled:text-theme-text-muted text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              Add Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilter;
