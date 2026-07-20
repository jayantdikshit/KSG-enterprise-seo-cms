import React, { forwardRef } from 'react';
import { Input, InputProps } from './Input';

export const Email = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => {
    return <Input type="email" ref={ref} {...props} />;
  }
);

Email.displayName = 'Email';
