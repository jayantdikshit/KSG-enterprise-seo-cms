import React, { forwardRef } from 'react';
import { Input, InputProps } from './Input';

export const Phone = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => {
    return <Input type="tel" ref={ref} {...props} />;
  }
);

Phone.displayName = 'Phone';
