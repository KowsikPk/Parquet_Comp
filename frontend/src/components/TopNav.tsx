import React from 'react';

interface TopNavProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ onThemeToggle, isDarkMode }) => {
  return (
    <nav className="h-16 bg-theme-surface/80 backdrop-blur-md border-b border-theme-border flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1D4ED8] to-[#38BDF8] flex items-center justify-center shadow-lg shadow-blue-500/20">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-tight text-theme-text">Parquet Compare</h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">v2.0</span>
          </div>
          <p className="text-[11px] text-theme-text-secondary font-medium">Deep Column & Row Diff Engine</p>
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center space-x-3">
        {/* Keyboard Shortcuts Tooltip Button */}
        <div className="relative group">
          <button 
            className="p-2.5 rounded-lg text-theme-text-secondary hover:text-theme-text hover:bg-theme-elevated border border-transparent hover:border-theme-border transition-all"
            title="Keyboard shortcuts"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          
          {/* Shortcuts Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-72 bg-theme-elevated/95 backdrop-blur-md border border-theme-border rounded-xl shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform group-hover:translate-y-0 translate-y-1">
            <h3 className="text-xs font-semibold text-theme-text-secondary uppercase tracking-wider mb-3">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-xs text-theme-text-secondary">
              <div className="flex justify-between items-center"><span className="font-mono bg-theme-muted px-2 py-0.5 rounded text-theme-text-secondary">Ctrl + 1</span><span>Step 1: Upload</span></div>
              <div className="flex justify-between items-center"><span className="font-mono bg-theme-muted px-2 py-0.5 rounded text-theme-text-secondary">Ctrl + 2</span><span>Step 2: Configure</span></div>
              <div className="flex justify-between items-center"><span className="font-mono bg-theme-muted px-2 py-0.5 rounded text-theme-text-secondary">Ctrl + 3</span><span>Step 3: Results</span></div>
              <div className="flex justify-between items-center"><span className="font-mono bg-theme-muted px-2 py-0.5 rounded text-theme-text-secondary">Ctrl + F</span><span>Search Results</span></div>
            </div>
          </div>
        </div>

        {/* Theme Switcher Button */}
        <button
          onClick={onThemeToggle}
          className="p-2.5 rounded-lg text-theme-text-secondary hover:text-theme-text hover:bg-theme-elevated border border-transparent hover:border-theme-border transition-all"
          aria-label="Toggle theme"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
};

export default TopNav;