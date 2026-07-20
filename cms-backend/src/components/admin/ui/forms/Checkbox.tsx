import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, description, id, ...props }, ref) => {
    const checkboxId = id || React.useId();

    return (
      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            id={checkboxId}
            type="checkbox"
            ref={ref}
            className={cn(
              'h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:ring-offset-gray-900',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        <div className="ml-3 text-sm leading-5">
          <label htmlFor={checkboxId} className="font-medium text-foreground">
            {label}
          </label>
          {description && <p className="text-muted-foreground">{description}</p>}
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
