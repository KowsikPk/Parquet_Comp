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
    // Note: row_index is not a valid MatchingStrategy, so we don't call onUseRowIndexChange here
  };

  // Filter join keys based on search
  const filteredColumns = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return commonColumns;
    return commonColumns.filter(col => col.toLowerCase().includes(query));
  }, [commonColumns, searchQuery]);

  return (
    <div className="bg-white dark:bg-[#1A1D27] rounded-lg shadow border-l-4 border-purple-500 p-6">
      {/* UI IMPROVEMENT #8: Section header with SETTINGS icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{fontSize: '1.25rem'}}>
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F1F5F9]" style={{fontSize: '1.125rem'}}>Row Matching Strategy</h3>
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
      
      <div className={`overflow-visible transition-all duration-250 ${isExpanded ? '' : 'max-h-0 overflow-hidden'}`}>
        <div className="space-y-4">
          {/* UI IMPROVEMENT #8: Content Match Card with CLIPBOARD CHECK icon */}
          <button
            onClick={() => handleStrategyChange('content_based')}
            className={`w-full p-5 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
              matchingStrategy === 'content_based'
                ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-[#1A1D27] hover:shadow-md'
            } ${matchingStrategy !== 'content_based' ? 'hover:shadow-[0_0_0_2px_currentColor] hover:shadow-opacity-30' : ''}`}
          >
            {matchingStrategy === 'content_based' && (
              <div className="absolute top-2 right-2">
                {/* UI IMPROVEMENT #8: Recommended badge with sparkles */}
                <span className="px-2 py-1 text-xs font-semibold bg-green-500 text-white rounded-full flex items-center" style={{fontSize: '0.75rem'}}>
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1" style={{fontSize: '0.75rem'}}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Recommended
                </span>
              </div>
            )}
            <div className="flex items-start space-x-4">
              {/* UI IMPROVEMENT #8: CLIPBOARD CHECK icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                matchingStrategy === 'content_based' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white" style={{fontSize: '1.5rem'}}>
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-[#F1F5F9]" style={{fontSize: '1.125rem'}}>
                    Content Match
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2" style={{fontSize: '0.875rem'}}>
                  Match rows with same values (any order)
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-500" style={{fontSize: '0.75rem'}}>
                  Best for: Files with different row orders
                </div>
              </div>
            </div>
            
            {/* Inline Info */}
            {matchingStrategy === 'content_based' && showInfo && (
              <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="flex items-center space-x-2 text-xs text-green-700 dark:text-green-300 mb-2 hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>What is Content-Based Matching?</span>
                  <svg className={`w-4 h-4 transition-transform ${showInfo ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showInfo && (
                  <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                    Rows are matched when ALL selected comparison columns have equal values, regardless of row order. This is useful when files have different row orders but contain the same data.
                  </p>
                )}
              </div>
            )}
          </button>

          {/* UI IMPROVEMENT #8: Key Column(s) Card with KEY icon */}
          <button
            onClick={() => handleStrategyChange('join_keys')}
            className={`w-full p-5 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
              matchingStrategy === 'join_keys'
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-[#1A1D27] hover:shadow-md'
            } ${matchingStrategy !== 'join_keys' ? 'hover:shadow-[0_0_0_2px_currentColor] hover:shadow-opacity-30' : ''}`}
          >
            <div className="flex items-start space-x-4">
              {/* UI IMPROVEMENT #8: KEY icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                matchingStrategy === 'join_keys' ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white" style={{fontSize: '1.5rem'}}>
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-[#F1F5F9]" style={{fontSize: '1.125rem'}}>
                    Key Column(s)
                  </span>
                  {/* UI IMPROVEMENT #9: INFO icon with CSS tooltip */}
                  <div className="relative group">
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" style={{fontSize: '0.875rem'}}>
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="8"/>
                      <line x1="12" y1="12" x2="12" y2="16"/>
                    </svg>
                    <div className="absolute left-0 top-full mt-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10" style={{fontSize: '0.75rem'}}>
                      Select columns whose combined values uniquely identify each row (e.g. ID + timestamp). Rows with matching key values will be compared side by side.
                    </div>
                  </div>
                  {matchingStrategy === 'join_keys' && (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Match rows by unique ID column
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Best for: Files with unique identifiers
                </div>
              </div>
            </div>
          </button>

          {/* Column picker - only for join_keys strategy */}
          {matchingStrategy === 'join_keys' && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-[#0F1117] rounded-xl border border-gray-200 dark:border-gray-700 transition-all">
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select the column(s) to use as the join key:
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍 Search join keys..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1A1D27] text-gray-900 dark:text-[#F1F5F9] text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    {filteredColumns.length} found
                  </span>
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-1">
                {filteredColumns.map((column) => (
                  <label
                    key={column}
                    className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer hover:scale-[1.01] ${
                      selectedJoinKeys.includes(column)
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-sm'
                        : 'bg-white dark:bg-[#0F1117] border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedJoinKeys.includes(column)}
                      onChange={() => onJoinKeyToggle(column)}
                      className="form-checkbox h-4 w-4 text-blue-600 mr-3"
                    />
                    <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{column}</span>
                  </label>
                ))}
              </div>

              {selectedJoinKeys.includes('ObjectClass') && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-medium">Warning</p>
                      <p className="mt-1">
                        'ObjectClass' may not be a good unique identifier since many rows may have the same value. Consider using ObjectId or SystemId for better matching.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedJoinKeys.length === 0 && (
                <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200 rounded-lg text-sm">
                  Please select at least one join key column
                </div>
              )}

              {selectedJoinKeys.length > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedJoinKeys.length} of {commonColumns.length} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        filteredColumns.forEach(col => {
                          if (!selectedJoinKeys.includes(col)) {
                            onJoinKeyToggle(col);
                          }
                        });
                      }}
                      className="px-3 py-1 text-xs bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => {
                        filteredColumns.forEach(col => {
                          if (selectedJoinKeys.includes(col)) {
                            onJoinKeyToggle(col);
                          }
                        });
                      }}
                      className="px-3 py-1 text-xs bg-gray-500 dark:bg-gray-600 text-white rounded hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinKeySelector;
