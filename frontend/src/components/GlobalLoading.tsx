import React from 'react';

interface GlobalLoadingProps {
  message?: string;
  progress?: number;
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({ message = 'Loading...', progress }) => {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-[#0F1117]/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-[#1A1D27] rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-gray-200 dark:border-gray-700">
        {/* UI IMPROVEMENT #27: SPINNER icon */}
        <div className="flex justify-center mb-4">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-blue-500" style={{fontSize: '3rem'}}>
            <line x1="12" y1="2" x2="12" y2="6"/>
            <line x1="12" y1="18" x2="12" y2="22"/>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
            <line x1="2" y1="12" x2="6" y2="12"/>
            <line x1="18" y1="12" x2="22" y2="12"/>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F1F5F9] text-center mb-2" style={{fontSize: '1.125rem'}}>
          {message}
        </h3>
        {progress !== undefined && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2" style={{fontSize: '0.875rem'}}>
              {progress}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalLoading;
