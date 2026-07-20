import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="w-full animate-pulse border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
      <div className="h-12 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex px-6 items-center space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`th-${i}`} className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
        ))}
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={`tr-${i}`} className="flex px-6 py-4 items-center space-x-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={`td-${i}-${j}`} className="h-4 bg-gray-200 dark:bg-gray-700/50 rounded w-1/4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
