import React, { useState, useMemo, useRef } from 'react';
import ToggleSwitch from './ToggleSwitch';

interface ColumnSelectorProps {
  columnsA: string[];
  columnsB: string[];
  selectedColumns: string[];
  onColumnToggle: (column: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  compareAll: boolean;
  onCompareAllChange: (compareAll: boolean) => void;
  displayColumns: string[];  // UI IMPROVEMENT: Display-only columns
  onDisplayColumnChange: (columns: string[]) => void;  // UI IMPROVEMENT: Display column change handler
  fileAName?: string;
  fileBName?: string;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columnsA,
  columnsB,
  selectedColumns,
  onColumnToggle,
  onSelectAll,
  onClearAll,
  compareAll,
  onCompareAllChange,
  displayColumns,
  onDisplayColumnChange,
  fileAName = 'File A',
  fileBName = 'File B'
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    common: true,
    onlyInA: true,
    onlyInB: true
  });
  const [showDisplayOnly, setShowDisplayOnly] = useState(false);  // UI IMPROVEMENT: Toggle for display-only section
  const searchInputRef = useRef<HTMLInputElement>(null);

  const truncateFilename = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    const ext = name.includes('.') ? '.' + name.split('.').pop() : '';
    const baseName = name.replace(ext, '');
    return baseName.substring(0, maxLength - ext.length - 3) + '...' + ext;
  };

  // Group columns
  const columnGroups = useMemo(() => {
    const allColumns = Array.from(new Set([...columnsA, ...columnsB])).sort();
    const commonColumns = allColumns.filter(col => columnsA.includes(col) && columnsB.includes(col));
    const onlyInA = allColumns.filter(col => columnsA.includes(col) && !columnsB.includes(col));
    const onlyInB = allColumns.filter(col => columnsB.includes(col) && !columnsA.includes(col));

    return {
      common: commonColumns,
      onlyInA,
      onlyInB
    };
  }, [columnsA, columnsB]);

  // Filter columns based on search
  const filteredGroups = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return columnGroups;

    return {
      common: columnGroups.common.filter(col => col.toLowerCase().includes(query)),
      onlyInA: columnGroups.onlyInA.filter(col => col.toLowerCase().includes(query)),
      onlyInB: columnGroups.onlyInB.filter(col => col.toLowerCase().includes(query))
    };
  }, [columnGroups, searchQuery]);

  const totalColumns = columnGroups.common.length + columnGroups.onlyInA.length + columnGroups.onlyInB.length;
  const filteredCount = filteredGroups.common.length + filteredGroups.onlyInA.length + filteredGroups.onlyInB.length;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const selectSection = (columns: string[]) => {
    columns.forEach(col => {
      if (!selectedColumns.includes(col)) {
        onColumnToggle(col);
      }
    });
  };

  const clearSection = (columns: string[]) => {
    columns.forEach(col => {
      if (selectedColumns.includes(col)) {
        onColumnToggle(col);
      }
    });
  };

  const renderColumnItem = (column: string, type: 'common' | 'onlyInA' | 'onlyInB') => {
    const isSelected = selectedColumns.includes(column);
    const badgeColor = type === 'common' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      type === 'onlyInA' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    const badgeText = type === 'common' ? 'Common' :
                      type === 'onlyInA' ? `Only in ${truncateFilename(fileAName, 10)}` :
                      `Only in ${truncateFilename(fileBName, 10)}`;

    // UI IMPROVEMENT #5: Highlight matching text
    const highlightMatch = (text: string, query: string) => {
      if (!query) return text;
      const parts = text.split(new RegExp(`(${query})`, 'gi'));
      return parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-700">{part}</mark>
          : part
      );
    };

    // UI IMPROVEMENT #5: Fade non-matching columns
    const isMatch = !searchQuery || column.toLowerCase().includes(searchQuery.toLowerCase());
    const opacity = isMatch ? 1 : 0.4;

    // UI IMPROVEMENT #4: Icon for column type
    const ColumnIcon = () => {
      if (type === 'common') {
        return (
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400 mr-2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        );
      } else if (type === 'onlyInA') {
        return (
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400 mr-2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        );
      } else {
        return (
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400 mr-2" style={{transform: 'scaleX(-1)'}}>
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        );
      }
    };

    return (
      <label
        key={column}
        className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer hover:scale-[1.02] ${
          isSelected
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-sm'
            : 'bg-white dark:bg-[#0F1117] border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
        style={{ opacity, borderLeftWidth: '3px', borderLeftColor: type === 'common' ? '#22c55e' : type === 'onlyInA' ? '#3b82f6' : '#a855f7' }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onColumnToggle(column)}
          className="form-checkbox h-4 w-4 text-blue-600 mr-3 flex-shrink-0"
        />
        <ColumnIcon />
        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 truncate" style={{fontSize: '0.875rem'}}>
          {highlightMatch(column, searchQuery)}
        </span>
        <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${badgeColor}`} style={{fontSize: '0.75rem'}}>
          {badgeText}
        </span>
      </label>
    );
  };

  return (
    <div className="bg-white dark:bg-[#1A1D27] rounded-lg shadow border-l-4 border-blue-500 p-6">
      {/* UI IMPROVEMENT #4: Section header with COLUMNS icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{fontSize: '1.25rem'}}>
            <rect x="3" y="3" width="8" height="18"/>
            <rect x="13" y="3" width="8" height="18"/>
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F1F5F9]" style={{fontSize: '1.125rem'}}>Column Selection</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      <div className={`overflow-hidden transition-all duration-250 ${isExpanded ? 'max-h-[800px]' : 'max-h-0'}`}>
        <div className="mb-4">
          <ToggleSwitch
            leftLabel="Select Specific"
            rightLabel="Compare All"
            isRight={compareAll}
            onToggle={(isRight) => onCompareAllChange(isRight)}
          />
        </div>

        {!compareAll && (
          <div className="space-y-4">
            {/* UI IMPROVEMENT #5: Search Input with SEARCH icon */}
            <div className="relative">
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                width="1em"
                height="1em"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{fontSize: '1rem'}}
              >
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search columns..."
                className="w-full pl-10 pr-16 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1A1D27] text-gray-900 dark:text-[#F1F5F9] text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{fontSize: '0.875rem', minWidth: '120px'}}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" style={{fontSize: '0.875rem'}}>
                {filteredCount} found
              </span>
            </div>

            {/* UI IMPROVEMENT #7: Keyboard hint (hidden on touch devices) */}
            <div className="text-gray-400 text-xs" style={{fontSize: '0.7rem', display: window.matchMedia('(pointer: coarse)').matches ? 'none' : 'block'}}>
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M6 8h.01"/>
                <path d="M10 8h.01"/>
                <path d="M14 8h.01"/>
                <path d="M18 8h.01"/>
                <path d="M6 12h.01"/>
                <path d="M10 12h.01"/>
                <path d="M14 12h.01"/>
                <path d="M18 12h.01"/>
                <path d="M7 16h10"/>
              </svg>
              ↑↓ navigate · Space select · Ctrl+A all · Esc clear
            </div>

            {/* Column Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Common Columns Section */}
              {filteredGroups.common.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
                  <button
                    onClick={() => toggleSection('common')}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0F1117] flex items-center justify-between hover:bg-gray-100 dark:hover:bg-[#1E2130] transition-colors flex-shrink-0"
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${expandedSections.common ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Common ({columnGroups.common.length})
                      </span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectSection(filteredGroups.common);
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                      >
                        Select
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSection(filteredGroups.common);
                        }}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline whitespace-nowrap"
                      >
                        Clear
                      </button>
                    </div>
                  </button>
                  {expandedSections.common && (
                    <div className="p-3 space-y-2 max-h-64 overflow-y-auto flex-1">
                      {filteredGroups.common.map((col) => renderColumnItem(col, 'common'))}
                    </div>
                  )}
                </div>
              )}

              {/* Only in File A Section */}
              {filteredGroups.onlyInA.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
                  <button
                    onClick={() => toggleSection('onlyInA')}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0F1117] flex items-center justify-between hover:bg-gray-100 dark:hover:bg-[#1E2130] transition-colors flex-shrink-0"
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${expandedSections.onlyInA ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Only in A ({columnGroups.onlyInA.length})
                      </span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectSection(filteredGroups.onlyInA);
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                      >
                        Select
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSection(filteredGroups.onlyInA);
                        }}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline whitespace-nowrap"
                      >
                        Clear
                      </button>
                    </div>
                  </button>
                  {expandedSections.onlyInA && (
                    <div className="p-3 space-y-2 max-h-64 overflow-y-auto flex-1">
                      {filteredGroups.onlyInA.map((col) => renderColumnItem(col, 'onlyInA'))}
                    </div>
                  )}
                </div>
              )}

              {/* Only in File B Section */}
              {filteredGroups.onlyInB.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
                  <button
                    onClick={() => toggleSection('onlyInB')}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0F1117] flex items-center justify-between hover:bg-gray-100 dark:hover:bg-[#1E2130] transition-colors flex-shrink-0"
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${expandedSections.onlyInB ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Only in B ({columnGroups.onlyInB.length})
                      </span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectSection(filteredGroups.onlyInB);
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                      >
                        Select
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSection(filteredGroups.onlyInB);
                        }}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline whitespace-nowrap"
                      >
                        Clear
                      </button>
                    </div>
                  </button>
                  {expandedSections.onlyInB && (
                    <div className="p-3 space-y-2 max-h-64 overflow-y-auto flex-1">
                      {filteredGroups.onlyInB.map((col) => renderColumnItem(col, 'onlyInB'))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* UI IMPROVEMENT: Display-Only Column Selection */}
            <div className="mt-6 bg-gray-50 dark:bg-[#0F1117] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-purple-500" style={{fontSize: '1rem'}}>
                    <path d="M1 12s4-8 11-8 11 8 11 8 11-8 11-8 11-8-4 4-4 4"/>
                    <path d="M2.5 7c0 0 2.5 2.5 2.5 2.5"/>
                    <path d="M2.5 17c0 0 2.5 2.5 2.5 2.5"/>
                  </svg>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-[#F1F5F9]" style={{fontSize: '0.875rem'}}>
                    Display-Only Columns
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400" style={{fontSize: '0.75rem'}}>
                    (shown in view details, not used for comparison)
                  </span>
                  <button
                    onClick={() => setShowDisplayOnly(!showDisplayOnly)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      showDisplayOnly ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        showDisplayOnly ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {showDisplayOnly && (
                <div className="mt-3">
                  <div className="flex items-center mb-2">
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-gray-400" style={{fontSize: '0.75rem'}}>
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search columns..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0F1117] text-gray-900 dark:text-[#F1F5F9] placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{fontSize: '0.875rem'}}
                    />
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {columnGroups.common.map((col) => (
                      <label
                        key={col}
                        className={`flex items-center p-2 rounded border transition-all cursor-pointer ${
                          displayColumns.includes(col)
                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500'
                            : 'bg-white dark:bg-[#1A1D27] border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={displayColumns.includes(col)}
                          onChange={() => {
                            if (displayColumns.includes(col)) {
                              onDisplayColumnChange(displayColumns.filter(c => c !== col));
                            } else {
                              onDisplayColumnChange([...displayColumns, col]);
                            }
                          }}
                          className="form-checkbox h-4 w-4 text-purple-600 mr-3 flex-shrink-0"
                        />
                        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-purple-500" style={{fontSize: '0.75rem'}}>
                          <path d="M1 12s4-8 11-8 11 8 11 8 11-8 11-8 11-8-4 4-4 4"/>
                          <path d="M2.5 7c0 0 2.5 2.5 2.5 2.5"/>
                          <path d="M2.5 17c0 0 2.5 2.5 2.5 2.5"/>
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1" style={{fontSize: '0.875rem'}}>
                          {col}
                        </span>
                      </label>
                    ))}
                  </div>
                  {displayColumns.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400" style={{fontSize: '0.75rem'}}>
                      {displayColumns.length} display-only column(s) selected
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* UI IMPROVEMENT #6: Progress Bar and Quick Actions with icons */}
            <div className="bg-gray-50 dark:bg-[#0F1117] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                {/* UI IMPROVEMENT #6: Selection counter badge with COLUMNS icon */}
                <div className="flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full" style={{fontSize: '0.875rem'}}>
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1" style={{fontSize: '0.75rem'}}>
                    <rect x="3" y="3" width="8" height="18"/>
                    <rect x="13" y="3" width="8" height="18"/>
                  </svg>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {selectedColumns.length} / {totalColumns} columns
                  </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {/* UI IMPROVEMENT #4: Action buttons with icons */}
                  <button
                    onClick={onSelectAll}
                    className="px-3 py-1 text-xs bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors whitespace-nowrap flex items-center"
                    style={{minWidth: '80px', fontSize: '0.75rem'}}
                  >
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Select All
                  </button>
                  <button
                    onClick={onClearAll}
                    className="px-3 py-1 text-xs bg-gray-500 dark:bg-gray-600 text-white rounded hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors whitespace-nowrap flex items-center"
                    style={{minWidth: '80px', fontSize: '0.75rem'}}
                  >
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Clear All
                  </button>
                  <button
                    onClick={() => selectSection(columnGroups.common)}
                    className="px-3 py-1 text-xs bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-500 transition-colors whitespace-nowrap flex items-center"
                    style={{minWidth: '80px', fontSize: '0.75rem'}}
                  >
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <rect x="3" y="3" width="8" height="18"/>
                      <rect x="13" y="3" width="8" height="18"/>
                    </svg>
                    Select Common
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 dark:bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(selectedColumns.length / totalColumns) * 100}%` }}
                />
              </div>
            </div>

            {/* Empty State */}
            {selectedColumns.length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                No columns selected. Select columns above to compare specific fields.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ColumnSelector;
