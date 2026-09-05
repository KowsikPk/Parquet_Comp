import React from 'react';
import HistoryPanel from './HistoryPanel';

interface LeftSidebarProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  hasFiles: boolean;
  hasResults: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ currentStep, onStepChange, hasFiles, hasResults }) => {
  const steps = [
    {
      num: 1,
      label: 'Upload Files',
      desc: 'Select Parquet files',
      disabled: false,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )
    },
    {
      num: 2,
      label: 'Configure',
      desc: 'Keys & filters',
      disabled: !hasFiles,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    },
    {
      num: 3,
      label: 'Results',
      desc: 'Metrics & diffs',
      disabled: !hasResults,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <aside className="w-[260px] flex-shrink-0 bg-theme-surface border-r border-theme-border text-theme-text sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col justify-between p-4">
      <div>
        {/* Navigation Section */}
        <div className="mb-6">
          <h2 className="text-[11px] font-bold text-theme-text-secondary uppercase tracking-wider mb-3 px-3">Workflow</h2>
          <nav className="space-y-1.5">
            {steps.map((s) => {
              const isActive = currentStep === s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => !s.disabled && onStepChange(s.num)}
                  disabled={s.disabled}
                  className={`w-full text-left px-3.5 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#1D4ED8] to-[#1E40AF] text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                      : s.disabled
                      ? 'text-theme-text-muted cursor-not-allowed opacity-60'
                      : 'text-theme-text-secondary hover:bg-theme-elevated hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold ${
                      isActive ? 'bg-white/20 text-white' : s.disabled ? 'bg-theme-elevated text-theme-text-muted' : 'bg-theme-muted text-theme-text-secondary'
                    }`}>
                      {s.num}
                    </span>
                    <div className="truncate">
                      <div className="text-sm font-semibold leading-none mb-1">{s.label}</div>
                      <div className={`text-[11px] ${isActive ? 'text-blue-100' : 'text-theme-text-secondary'}`}>{s.desc}</div>
                    </div>
                  </div>

                  <div>
                    {s.disabled ? (
                      <svg className="w-4 h-4 text-theme-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ) : (
                      <span className={isActive ? 'text-white' : 'text-theme-text-muted group-hover:text-theme-text'}>
                        {s.icon}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* History Panel Integration */}
        <div className="border-t border-theme-border pt-4">
          <HistoryPanel onRestore={(item) => console.log('Restored history item:', item)} />
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-theme-border pt-3 px-2 flex items-center justify-between text-[11px] text-theme-text-muted font-medium">
        <span>Parquet Compare</span>
        <span className="flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Ready</span>
        </span>
      </div>
    </aside>
  );
};

export default LeftSidebar;