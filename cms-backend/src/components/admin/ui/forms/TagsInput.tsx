import React, { forwardRef, useState, KeyboardEvent } from 'react';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';

export interface TagsInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const TagsInput = forwardRef<HTMLInputElement, TagsInputProps>(
  ({ label, error, helperText, value: tags = [], onChange, placeholder = 'Type and click Add', className }, ref) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const newTag = inputValue.trim().replace(/^,+|,+$/g, '');
        if (newTag && !tags.includes(newTag)) {
          onChange([...tags, newTag]);
          setInputValue('');
        }
      } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
        onChange(tags.slice(0, -1));
      }
    };

    const removeTag = (indexToRemove: number) => {
      onChange(tags.filter((_, index) => index !== indexToRemove));
    };

    return (
      <div className="w-full">
        {label && (
          <label className="mb-1 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div
          className={cn(
            'flex min-h-[40px] w-full flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            error && 'border-red-500 focus-within:ring-red-500',
            className
          )}
        >
          {tags.map((tag, index) => (
            <span
              key={index}
              className="flex items-center gap-1 rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="hover:text-indigo-900 dark:hover:text-indigo-100 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            ref={ref}
            type="text"
            className="flex-1 bg-transparent py-0.5 outline-none placeholder:text-muted-foreground min-w-[120px]"
            placeholder={tags.length === 0 ? placeholder : ''}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={() => {
              const newTag = inputValue.trim().replace(/^,+|,+$/g, '');
              if (newTag && !tags.includes(newTag)) {
                onChange([...tags, newTag]);
                setInputValue('');
              }
            }}
            className="ml-auto text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-800/50 px-2 py-1 rounded font-medium transition-colors"
          >
            Add
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

TagsInput.displayName = 'TagsInput';
