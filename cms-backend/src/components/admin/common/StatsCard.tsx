import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  percentage?: number;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'indigo';
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  percentage,
  color = 'indigo',
  className,
}) => {
  const colorStyles = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  };

  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-900/50', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', colorStyles[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {(trend || percentage !== undefined) && (
        <div className="mt-4 flex items-center text-sm">
          {trend === 'up' && <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />}
          {trend === 'down' && <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />}
          
          <span
            className={cn(
              'font-medium',
              trend === 'up' && 'text-green-500',
              trend === 'down' && 'text-red-500',
              trend === 'neutral' && 'text-gray-500'
            )}
          >
            {percentage !== undefined ? `${percentage}%` : ''}
          </span>
          <span className="ml-2 text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  );
};
