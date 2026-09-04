import React from 'react';

interface TopNavProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ onThemeToggle, isDarkMode }) => {
  return (
    <nav className="h-16 bg-white dark:bg-[#0F1117] border-b border-gray-200 dark:border-[#2D3148] flex items-center justify-between px-6 sticky top-0 z-50">
      {/* UI IMPROVEMENT #25: Logo with DATABASE icon */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white" style={{fontSize: '1.25rem'}}>
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-[#F1F5F9]" style={{fontSize: '1.25rem'}}>Parquet Compare</h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-4">
        {/* UI IMPROVEMENT #28: Keyboard shortcuts tooltip with KEYBOARD icon */}
        <div className="relative group">
          <button className="p-2 text-gray-500 dark:text-[#94A3B8] hover:text-gray-700 dark:hover:text-[#F1F5F9] transition-colors">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{fontSize: '1.25rem'}}>
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
          </button>
          {/* Tooltip */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-[#2D3148] rounded-lg shadow-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <h3 className="font-semibold text-gray-900 dark:text-[#F1F5F9] mb-2" style={{fontSize: '0.875rem'}}>Keyboard Shortcuts</h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-[#94A3B8]" style={{fontSize: '0.875rem'}}>
              <div className="flex justify-between"><span>Ctrl+1</span><span>Upload</span></div>
              <div className="flex justify-between"><span>Ctrl+2</span><span>Configure</span></div>
              <div className="flex justify-between"><span>Ctrl+3</span><span>Results</span></div>
              <div className="flex justify-between"><span>Ctrl+F</span><span>Search</span></div>
              <div className="flex justify-between"><span>↑/↓</span><span>Navigate</span></div>
              <div className="flex justify-between"><span>Space</span><span>Expand row</span></div>
            </div>
          </div>
        </div>

        {/* UI IMPROVEMENT #28: Dark mode toggle with SUN/MOON icons */}
        <button
          onClick={onThemeToggle}
          className="p-2 text-gray-500 dark:text-[#94A3B8] hover:text-gray-700 dark:hover:text-[#F1F5F9] transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{fontSize: '1.25rem'}}>
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{fontSize: '1.25rem'}}>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
};

export default TopNav;