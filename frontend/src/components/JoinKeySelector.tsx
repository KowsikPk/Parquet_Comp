import React, { useState, useMemo } from 'react';

type MatchingStrategy = 'join_keys' | 'content_based';

interface JoinKeySelectorProps {
  commonColumns: string[];
  selectedJoinKeys: string[];
  onJoinKeyToggle: (key: string) => void;
  matchingStrategy: MatchingStrategy;
  onMatchingStrategyChange: (strategy: MatchingStrategy) => void;
}

const JoinKeySelector: React.FC<JoinKeySelectorProps> = ({
  commonColumns,
  selectedJoinKeys,
  onJoinKeyToggle,
  matchingStrategy,
  onMatchingStrategyChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInfo, setShowInfo] = useState(true);

  const handleStrategyChange = (strategy: MatchingStrategy) => {
    onMatchingStrategyChange(strategy);
  };

  const filteredColumns = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return commonColumns;
    return commonColumns.filter(col => col.toLowerCase().includes(query));
  }, [commonColumns, searchQuery]);

  return (
    <div className="bg-theme-surface border border-theme-border rounded-2xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-theme-text">Row Matching Strategy</h3>
            <p className="text-[11px] text-theme-text-secondary">Determine how corresponding rows are linked for deep comparison</p>
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
        <div className="space-y-3">
          {/* Strategy Option 1: Content Match */}
          <div
            className={`w-full rounded-xl border text-left transition-all duration-200 relative ${
              matchingStrategy === 'content_based'
                ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/50 text-theme-text shadow-md shadow-emerald-500/10'
                : 'bg-theme-elevated border-theme-border text-theme-text-secondary hover:border-slate-700'
            }`}
          >
            {matchingStrategy === 'content_based' && (
              <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold bg-emerald-500 text-white rounded-full flex items-center space-x-1 shadow-sm pointer-events-none">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Recommended</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => handleStrategyChange('content_based')}
              className="w-full p-4 text-left focus:outline-none"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  matchingStrategy === 'content_based' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-theme-muted text-theme-text-secondary'
                }`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-theme-text">Content-Based Matching</div>
                  <p className="text-xs text-theme-text-secondary mt-0.5">Automatically aligns rows with matching values regardless of original file row ordering.</p>
                </div>
              </div>
            </button>

            {matchingStrategy === 'content_based' && (
              <div className="px-4 pb-4 border-t border-emerald-500/20 text-xs">
                <button
                  type="button"
                  onClick={() => setShowInfo(!showInfo)}
                  className="text-emerald-400 font-semibold hover:underline flex items-center space-x-1 pt-3"
                >
                  <span>{showInfo ? 'Hide details' : 'How does Content-Based Matching work?'}</span>
                </button>
                {showInfo && (
                  <p className="mt-1 text-theme-text-secondary leading-relaxed text-[11px]">
                    Rows are matched when ALL selected comparison columns have equal values. Perfect when row ordering differs across datasets.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Strategy Option 2: Join Keys */}
          <button
            type="button"
            onClick={() => handleStrategyChange('join_keys')}
            className={`w-full p-4 rounded-xl border text-left transition-all duration-200 relative ${
              matchingStrategy === 'join_keys'
                ? 'bg-gradient-to-r from-blue-500/10 to-sky-500/10 border-blue-500/50 text-theme-text shadow-md shadow-blue-500/10'
                : 'bg-theme-elevated border-theme-border text-theme-text-secondary hover:border-slate-700'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                matchingStrategy === 'join_keys' ? 'bg-blue-600 text-white shadow-sm' : 'bg-theme-muted text-theme-text-secondary'
              }`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-theme-text">Join Key Column(s)</div>
                <p className="text-xs text-theme-text-secondary mt-0.5">Select specific primary/foreign key column(s) to match exact records between datasets.</p>
              </div>
            </div>
          </button>

          {/* Join Key Column Picker */}
          {matchingStrategy === 'join_keys' && (
            <div className="mt-3 p-4 bg-theme-elevated rounded-xl border border-theme-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-theme-text-secondary">Select Join Key Column(s):</span>
                <span className="text-[10px] text-blue-400 font-mono">{selectedJoinKeys.length} selected</span>
              </div>

              <div className="relative">
                <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter key columns..."
                  className="w-full pl-9 pr-3 py-1.5 bg-theme-base border border-theme-border rounded-lg text-xs text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {filteredColumns.map((col) => {
                  const isSelected = selectedJoinKeys.includes(col);
                  return (
                    <label
                      key={col}
                      className={`flex items-center space-x-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500/50 text-theme-text'
                          : 'bg-theme-base border-theme-border text-theme-text-secondary hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onJoinKeyToggle(col)}
                        className="w-4 h-4 rounded border-theme-border bg-theme-base text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-mono font-medium truncate">{col}</span>
                    </label>
                  );
                })}
              </div>

              {selectedJoinKeys.length === 0 && (
                <div className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 flex items-center space-x-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Select at least one join key column to proceed with Key-Based matching.</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JoinKeySelector;
