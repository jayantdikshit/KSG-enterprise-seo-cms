import React, { forwardRef } from 'react';
import { Input, InputProps } from './Input';

interface SlugProps extends Omit<InputProps, 'type'> {
  sourceText?: string;
}

export const Slug = forwardRef<HTMLInputElement, SlugProps>(
  ({ sourceText, ...props }, ref) => {
    // Optionally, logic to auto-generate slug from sourceText could be implemented here
    // or passed down from a parent form controller.
    
    return (
      <Input
        type="text"
        ref={ref}
        placeholder="e.g. my-awesome-post"
        pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
        title="Lowercase letters, numbers, and hyphens only."
        {...props}
      />
    );
  }
);

Slug.displayName = 'Slug';
