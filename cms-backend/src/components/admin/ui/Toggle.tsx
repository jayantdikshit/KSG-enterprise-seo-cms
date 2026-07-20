import React from 'react';
import { cn } from '@/utils/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, description, disabled }) => {
  return (
    <div className="flex items-center justify-between">
      {(label || description) && (
        <span className="flex flex-grow flex-col pr-4">
          {label && (
            <span className="text-sm font-medium text-foreground" id="toggle-label">
              {label}
            </span>
          )}
          {description && (
            <span className="text-sm text-muted-foreground" id="toggle-description">
              {description}
            </span>
          )}
        </span>
      )}
      <button
        type="button"
        disabled={disabled}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
          checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
};
