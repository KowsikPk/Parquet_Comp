import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-theme-surface border border-theme-border rounded-2xl h-24 p-4 flex flex-col justify-between">
            <div className="w-16 h-3 bg-theme-elevated rounded"></div>
            <div className="w-20 h-6 bg-theme-elevated rounded"></div>
          </div>
        ))}
      </div>

      {/* Progress Skeleton */}
      <div className="bg-theme-surface border border-theme-border rounded-2xl h-16 p-4 flex items-center">
        <div className="w-full h-3 bg-theme-elevated rounded-full"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-theme-surface border border-theme-border rounded-2xl p-4 space-y-3">
        <div className="h-10 bg-theme-elevated rounded-xl w-full"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-theme-elevated/60 rounded-xl w-full"></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;