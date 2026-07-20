import React from 'react';
import { cn } from '@/utils/cn';

export type StatusType = 'Published' | 'Draft' | 'Active' | 'Inactive' | 'Pending' | 'Completed' | 'Deleted';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getBadgeColors = (s: string) => {
    switch (s.toLowerCase()) {
      case 'published':
      case 'active':
      case 'completed':
      case 'qualified':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'draft':
      case 'pending':
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'inactive':
      case 'deleted':
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        getBadgeColors(status),
        className
      )}
    >
      {status}
    </span>
  );
};
