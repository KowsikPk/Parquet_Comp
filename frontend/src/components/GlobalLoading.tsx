import React from 'react';

interface GlobalLoadingProps {
  message?: string;
  progress?: number;
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({ message = 'Processing...', progress }) => {
  return (
    <div className="fixed inset-0 bg-theme-base/80 backdrop-blur-md flex items-center justify-center z-[9999] animate-fade-in">
      <div className="bg-theme-surface border border-theme-border rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <div>
          <h3 className="text-base font-bold text-theme-text">{message}</h3>
          <p className="text-xs text-theme-text-secondary mt-1">Please wait while the comparison engine runs</p>
        </div>

        {progress !== undefined && (
          <div className="space-y-2">
            <div className="w-full bg-theme-elevated border border-theme-border rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-sky-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs font-mono text-blue-400 font-bold">{progress}%</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalLoading;
