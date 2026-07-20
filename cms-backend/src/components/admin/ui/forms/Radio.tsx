import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, error, description, id, ...props }, ref) => {
    const radioId = id || React.useId();

    return (
      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            id={radioId}
            type="radio"
            ref={ref}
            className={cn(
              'h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:ring-offset-gray-900',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        <div className="ml-3 text-sm leading-5">
          <label htmlFor={radioId} className="font-medium text-foreground">
            {label}
          </label>
          {description && <p className="text-muted-foreground">{description}</p>}
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    );
  }
);

Radio.displayName = 'Radio';
