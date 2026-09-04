import React from 'react';

interface EmptyStateProps {
  icon?: 'upload' | 'search' | 'database' | 'filter';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon = 'upload', title, description, action }) => {
  const getIcon = () => {
    switch (icon) {
      case 'upload':
        return (
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" style={{fontSize: '4rem'}}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        );
      case 'search':
        return (
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" style={{fontSize: '4rem'}}>
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        );
      case 'database':
        return (
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" style={{fontSize: '4rem'}}>
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
        );
      case 'filter':
        return (
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" style={{fontSize: '4rem'}}>
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-4">
        {getIcon()}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-[#F1F5F9] mb-2 text-center" style={{fontSize: '1.25rem'}}>
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md" style={{fontSize: '0.875rem'}}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors font-medium"
          style={{minWidth: '120px', fontSize: '0.875rem'}}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
