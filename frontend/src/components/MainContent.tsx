import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <main className="flex-1 min-w-0 bg-gray-50 dark:bg-[#0F1117] overflow-y-auto overflow-x-hidden">
      <div className="p-8 max-w-full">
        {children}
      </div>
    </main>
  );
};

export default MainContent;