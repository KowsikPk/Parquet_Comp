import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="space-y-4">
        {/* Metric cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-24"></div>
          ))}
        </div>

        {/* Match rate bar skeleton */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-6"></div>

        {/* Table skeleton */}
        <div className="space-y-3">
          {/* Header */}
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          
          {/* Rows */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;