import React from 'react';
import { Select, SelectOption } from './forms/Select';

interface FilterProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const Filter: React.FC<FilterProps> = ({ label, options, value, onChange, className }) => {
  return (
    <div className={className}>
      <Select
        label={label}
        options={options}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
