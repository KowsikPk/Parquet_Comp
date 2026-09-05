import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <main className="flex-1 min-w-0 bg-theme-base overflow-y-auto overflow-x-hidden transition-colors duration-200">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
        {children}
      </div>
    </main>
  );
};

export default MainContent;