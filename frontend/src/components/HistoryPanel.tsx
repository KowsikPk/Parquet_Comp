import React, { useEffect, useState } from 'react';

interface HistoryItem {
  fileA: string;
  fileB: string;
  matchRate: number;
  timestamp: string;
  jobId?: string;
}

interface HistoryPanelProps {
  onRestore: (historyItem: HistoryItem) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ onRestore }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Load history from sessionStorage
    const savedHistory = sessionStorage.getItem('comparisonHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="mt-6">
      {/* UI IMPROVEMENT #23: History header with CLOCK icon */}
      <div className="flex items-center mb-3">
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-400" style={{fontSize: '1rem'}}>
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider" style={{fontSize: '0.875rem'}}>History</h3>
      </div>
      {history.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic" style={{fontSize: '0.875rem'}}>No comparison history</p>
      ) : (
        <div className="space-y-2">
          {history.map((item, index) => (
            <div
              key={index}
              className="bg-[#1A1D27] rounded-lg p-3 border border-[#2D3148] hover:border-[#3B82F6] transition-colors cursor-pointer group animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onRestore(item)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {/* UI IMPROVEMENT #24: CLOCK icon for timestamp */}
                  <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mb-1" style={{fontSize: '0.75rem'}}>
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1" style={{fontSize: '0.75rem'}}>
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {formatTimestamp(item.timestamp)}
                  </div>
                  <div className="text-sm text-gray-300 dark:text-gray-300 truncate" style={{fontSize: '0.875rem'}}>
                    {item.fileA} ↔ {item.fileB}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1" style={{fontSize: '0.75rem'}}>
                    Match rate: <span className="text-green-400">{item.matchRate}%</span>
                  </div>
                </div>
                {/* UI IMPROVEMENT #26: REFRESH icon for restore button */}
                <button className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#2D3148] rounded">
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" style={{fontSize: '1rem'}}>
                    <polyline points="1 4 1 10 7 10"/>
                    <polyline points="23 20 23 14 17 14"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;