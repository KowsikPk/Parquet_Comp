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
    const savedHistory = localStorage.getItem('comparisonHistory') || sessionStorage.getItem('comparisonHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
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
    <div className="space-y-2">
      <div className="flex items-center space-x-1.5 px-2 mb-2">
        <svg className="w-3.5 h-3.5 text-theme-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="text-[11px] font-bold text-theme-text-secondary uppercase tracking-wider">Recent Sessions</span>
      </div>

      {history.length === 0 ? (
        <div className="px-3 py-3 text-[11px] text-theme-text-muted italic bg-theme-elevated/50 rounded-xl border border-theme-border text-center">
          No previous sessions
        </div>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {history.map((item, index) => (
            <div
              key={index}
              onClick={() => onRestore(item)}
              className="p-2.5 bg-theme-elevated hover:bg-theme-muted rounded-xl border border-theme-border hover:border-blue-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-theme-text truncate">
                    {item.fileA} ↔ {item.fileB}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-theme-text-secondary mt-1">
                    <span>{formatTimestamp(item.timestamp)}</span>
                    <span className="text-emerald-400 font-mono font-bold">{item.matchRate}% match</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;