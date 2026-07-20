import React, { forwardRef } from 'react';
import { Input, InputProps } from './Input';

export const Number = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => {
    return <Input type="number" ref={ref} {...props} />;
  }
);

Number.displayName = 'Number';
