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
  displayColumns: string[];
  onDisplayColumnChange: (columns: string[]) => void;
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
  const [showDisplayOnly, setShowDisplayOnly] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const truncateFilename = (name: string, maxLength: number = 14) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  };

  const columnGroups = useMemo(() => {
    const allColumns = Array.from(new Set([...columnsA, ...columnsB])).sort();
    const commonColumns = allColumns.filter(col => columnsA.includes(col) && columnsB.includes(col));
    const onlyInA = allColumns.filter(col => columnsA.includes(col) && !columnsB.includes(col));
    const onlyInB = allColumns.filter(col => columnsB.includes(col) && !columnsA.includes(col));

    return { common: commonColumns, onlyInA, onlyInB };
  }, [columnsA, columnsB]);

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
    const badgeColor = type === 'common' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      type === 'onlyInA' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-sky-500/10 text-sky-400 border border-sky-500/20';
    const badgeText = type === 'common' ? 'Common' :
                      type === 'onlyInA' ? `In ${truncateFilename(fileAName)}` :
                      `In ${truncateFilename(fileBName)}`;

    const highlightMatch = (text: string, query: string) => {
      if (!query) return text;
      const parts = text.split(new RegExp(`(${query})`, 'gi'));
      return parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <mark key={i} className="bg-blue-500/30 text-white rounded px-0.5">{part}</mark>
          : part
      );
    };

    const isMatch = !searchQuery || column.toLowerCase().includes(searchQuery.toLowerCase());
    const opacity = isMatch ? 1 : 0.4;

    return (
      <label
        key={column}
        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
          isSelected
            ? 'bg-blue-600/15 border-blue-500/50 text-theme-text shadow-sm'
            : 'bg-theme-elevated border-theme-border hover:border-slate-700 text-theme-text-secondary'
        }`}
        style={{ opacity }}
      >
        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onColumnToggle(column)}
            className="w-4 h-4 rounded border-theme-border bg-theme-base text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
          />
          <span className="text-xs font-mono font-medium truncate">
            {highlightMatch(column, searchQuery)}
          </span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badgeColor}`}>
          {badgeText}
        </span>
      </label>
    );
  };

  return (
    <div className="bg-theme-surface border border-theme-border rounded-2xl p-5 shadow-lg space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-theme-text">Column Selection</h3>
            <p className="text-[11px] text-theme-text-secondary">Choose schema columns to evaluate during comparison</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg text-theme-text-secondary hover:text-theme-text hover:bg-theme-elevated transition-all"
        >
          <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <ToggleSwitch
            leftLabel="Select Specific Columns"
            rightLabel="Compare All Columns"
            isRight={compareAll}
            onToggle={(isRight) => onCompareAllChange(isRight)}
          />

          {!compareAll && (
            <div className="space-y-4">
              {/* Search & Actions Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search columns..."
                    className="w-full pl-9 pr-20 py-2 bg-theme-elevated border border-theme-border rounded-xl text-xs text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-theme-text-secondary">
                    {filteredCount} found
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onSelectAll}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition-all"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={onClearAll}
                    className="px-3 py-1.5 bg-theme-elevated hover:bg-theme-muted text-theme-text-secondary hover:text-theme-text border border-theme-border rounded-xl text-xs font-semibold transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Column Groups */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Common Columns */}
                {filteredGroups.common.length > 0 && (
                  <div className="bg-theme-elevated/50 border border-theme-border rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-theme-border">
                      <button type="button" onClick={() => toggleSection('common')} className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Common ({columnGroups.common.length})</span>
                      </button>
                      <div className="flex space-x-2">
                        <button type="button" onClick={() => selectSection(filteredGroups.common)} className="px-2.5 py-1 text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg transition-all">All</button>
                        <button type="button" onClick={() => clearSection(filteredGroups.common)} className="px-2.5 py-1 text-xs font-semibold bg-theme-elevated hover:bg-theme-muted text-theme-text-secondary border border-theme-border rounded-lg transition-all">None</button>
                      </div>
                    </div>
                    {expandedSections.common && (
                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {filteredGroups.common.map((col) => renderColumnItem(col, 'common'))}
                      </div>
                    )}
                  </div>
                )}

                {/* Only in A */}
                {filteredGroups.onlyInA.length > 0 && (
                  <div className="bg-theme-elevated/50 border border-theme-border rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-theme-border">
                      <button type="button" onClick={() => toggleSection('onlyInA')} className="text-xs font-bold text-blue-400 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>Only in A ({columnGroups.onlyInA.length})</span>
                      </button>
                      <div className="flex space-x-2">
                        <button type="button" onClick={() => selectSection(filteredGroups.onlyInA)} className="px-2.5 py-1 text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg transition-all">All</button>
                        <button type="button" onClick={() => clearSection(filteredGroups.onlyInA)} className="px-2.5 py-1 text-xs font-semibold bg-theme-elevated hover:bg-theme-muted text-theme-text-secondary border border-theme-border rounded-lg transition-all">None</button>
                      </div>
                    </div>
                    {expandedSections.onlyInA && (
                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {filteredGroups.onlyInA.map((col) => renderColumnItem(col, 'onlyInA'))}
                      </div>
                    )}
                  </div>
                )}

                {/* Only in B */}
                {filteredGroups.onlyInB.length > 0 && (
                  <div className="bg-theme-elevated/50 border border-theme-border rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-theme-border">
                      <button type="button" onClick={() => toggleSection('onlyInB')} className="text-xs font-bold text-sky-400 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        <span>Only in B ({columnGroups.onlyInB.length})</span>
                      </button>
                      <div className="flex space-x-2">
                        <button type="button" onClick={() => selectSection(filteredGroups.onlyInB)} className="px-2.5 py-1 text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg transition-all">All</button>
                        <button type="button" onClick={() => clearSection(filteredGroups.onlyInB)} className="px-2.5 py-1 text-xs font-semibold bg-theme-elevated hover:bg-theme-muted text-theme-text-secondary border border-theme-border rounded-lg transition-all">None</button>
                      </div>
                    </div>
                    {expandedSections.onlyInB && (
                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {filteredGroups.onlyInB.map((col) => renderColumnItem(col, 'onlyInB'))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Display-Only Columns Section Toggle */}
              <div className="bg-theme-elevated border border-theme-border rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-theme-text">Display-Only Metadata Columns</span>
                    <span className="text-[10px] text-theme-text-secondary">(shown in row details, excluded from diff computation)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDisplayOnly(!showDisplayOnly)}
                    className="px-2.5 py-1 bg-theme-base border border-theme-border text-blue-400 hover:text-blue-300 text-xs rounded-lg font-medium"
                  >
                    {showDisplayOnly ? 'Hide' : `Configure (${displayColumns.length})`}
                  </button>
                </div>

                {showDisplayOnly && (
                  <div className="pt-2 border-t border-theme-border space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {columnGroups.common.map((col) => (
                      <label key={col} className="flex items-center space-x-2 text-xs font-mono text-theme-text-secondary cursor-pointer p-1 rounded hover:bg-theme-base">
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
                          className="w-3.5 h-3.5 rounded border-theme-border bg-theme-base text-sky-600 focus:ring-sky-500"
                        />
                        <span>{col}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress Footer Bar */}
              <div className="bg-theme-elevated p-3 rounded-xl border border-theme-border flex items-center justify-between">
                <span className="text-xs font-medium text-theme-text-secondary">
                  <span className="font-bold text-blue-400">{selectedColumns.length}</span> of {totalColumns} columns selected for diffing
                </span>
                <div className="w-36 bg-theme-base h-2 rounded-full overflow-hidden border border-theme-border">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-sky-500 h-full transition-all duration-300"
                    style={{ width: `${totalColumns ? (selectedColumns.length / totalColumns) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ColumnSelector;
