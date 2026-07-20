import React, { forwardRef, useState } from 'react';
import { cn } from '@/utils/cn';

export interface ColorPickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ className, label, error, id, defaultValue, value, onChange, ...props }, ref) => {
    const inputId = id || React.useId();
    const [color, setColor] = useState(value || defaultValue || '#000000');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setColor(e.target.value);
      onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="flex items-center space-x-3">
          <input
            id={inputId}
            type="color"
            ref={ref}
            value={color}
            onChange={handleChange}
            className={cn(
              'h-10 w-14 cursor-pointer rounded border border-input bg-background p-1',
              error && 'border-red-500',
              className
            )}
            {...props}
          />
          <span className="text-sm text-muted-foreground">{String(color).toUpperCase()}</span>
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

ColorPicker.displayName = 'ColorPicker';
