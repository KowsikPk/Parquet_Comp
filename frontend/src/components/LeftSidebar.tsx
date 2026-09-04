import React from 'react';
import HistoryPanel from './HistoryPanel';

interface LeftSidebarProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  hasFiles: boolean;
  hasResults: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ currentStep, onStepChange, hasFiles, hasResults }) => {
  return (
    <aside className="w-[300px] flex-shrink-0 bg-[#0F1117] text-white min-h-screen sticky top-0 h-screen overflow-y-auto overflow-x-hidden">
      <div className="p-6">
        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          <button
            onClick={() => onStepChange(1)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              currentStep === 1
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-[#1A1D27] hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="font-medium">Upload Files</span>
            </div>
          </button>

          <button
            onClick={() => onStepChange(2)}
            disabled={!hasFiles}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              currentStep === 2
                ? 'bg-blue-600 text-white'
                : !hasFiles
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 hover:bg-[#1A1D27] hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">Configure</span>
            </div>
          </button>

          <button
            onClick={() => onStepChange(3)}
            disabled={!hasResults}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              currentStep === 3
                ? 'bg-blue-600 text-white'
                : !hasResults
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 hover:bg-[#1A1D27] hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-medium">Results</span>
            </div>
          </button>
        </nav>

        {/* Divider */}
        <div className="border-t border-[#2D3148] my-6"></div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Quick Actions</h3>
          
          <button className="w-full text-left px-4 py-2 rounded-lg text-gray-400 hover:bg-[#1A1D27] hover:text-white transition-colors flex items-center space-x-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span className="text-sm">Load Sample Data</span>
          </button>
        </div>

        {/* History Panel */}
        <HistoryPanel onRestore={(item) => console.log('Restore:', item)} />
      </div>
    </aside>
  );
};

export default LeftSidebar;