import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LoaderProps {
  type?: 'spinner' | 'skeleton' | 'table' | 'card' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ type = 'spinner', size = 'md', className }) => {
  if (type === 'skeleton') {
    return (
      <div className={cn('w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-800', className)} />
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="w-full space-y-4 rounded-xl border p-4 shadow-sm dark:border-gray-800">
        <div className="h-40 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  if (type === 'button') {
    return <Loader2 className={cn('animate-spin', className)} />;
  }

  // default spinner
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex w-full items-center justify-center p-4">
      <Loader2 className={cn('animate-spin text-indigo-600 dark:text-indigo-400', sizeClasses[size], className)} />
    </div>
  );
};
