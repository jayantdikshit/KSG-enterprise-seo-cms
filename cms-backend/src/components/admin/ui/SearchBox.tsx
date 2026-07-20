import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  initialValue?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
  initialValue = '',
}) => {
  const [query, setQuery] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [query, onSearch, debounceMs]);

  return (
    <div className={cn('relative w-full max-w-sm', className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <input
        type="text"
        className="flex h-10 w-full rounded-md border border-input bg-background py-2 pl-9 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
