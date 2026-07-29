import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, ChevronDown, Download, Trash2, Search, Filter as FilterIcon 
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Checkbox } from '../ui/forms/Checkbox';
import { Pagination } from '../ui/Pagination';
import { TableSkeleton } from '../ui/TableSkeleton';
import { EmptyState } from '../ui/EmptyState';

export interface Column<T> {
  key: string;
  title?: string;
  label?: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T) => string;
  isLoading?: boolean;
  
  // Pagination
  serverSidePagination?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  
  // Search & Filter
  searchable?: boolean;
  searchKeys?: string[];
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  filterOptions?: { label: string; value: string }[];
  filterKey?: string;
  onFilterChange?: (value: string) => void;
  
  // Sorting
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  
  // Selection
  selectable?: boolean;
  onSelectionChange?: (selectedKeys: string[]) => void;
  
  // Bulk Actions
  bulkActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedKeys: string[]) => void;
    danger?: boolean;
  }[];
  
  // Export
  exportable?: boolean;
  exportFileName?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor = (item: any) => String(item._id || item.id || Math.random()),
  isLoading = false,
  serverSidePagination = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  searchable = true,
  searchKeys = [],
  onSearch,
  searchPlaceholder = 'Search...',
  filterOptions = [],
  filterKey,
  onFilterChange,
  onSort,
  selectable = false,
  onSelectionChange,
  bulkActions = [],
  exportable = false,
  exportFileName = 'export.csv',
}: DataTableProps<T>) {
  
  // Internal State for Client-side operations
  const [internalSearch, setInternalSearch] = useState('');
  const [internalFilter, setInternalFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(pageSize);

  // Handle Search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalSearch(val);
    if (onSearch) onSearch(val);
    if (!serverSidePagination) setInternalPage(1);
  };

  // Handle Filter
  const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setInternalFilter(val);
    if (onFilterChange) onFilterChange(val);
    if (!serverSidePagination) setInternalPage(1);
  };

  // Handle Sort
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    if (onSort) onSort(key, direction);
  };

  // Handle Selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = data.map(keyExtractor);
      const newSet = new Set(allKeys);
      setSelectedKeys(newSet);
      if (onSelectionChange) onSelectionChange(Array.from(newSet));
    } else {
      setSelectedKeys(new Set());
      if (onSelectionChange) onSelectionChange([]);
    }
  };

  const handleSelectRow = (key: string, checked: boolean) => {
    const newSet = new Set(selectedKeys);
    if (checked) newSet.add(key);
    else newSet.delete(key);
    setSelectedKeys(newSet);
    if (onSelectionChange) onSelectionChange(Array.from(newSet));
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = columns.filter(c => c.key !== 'actions').map(c => c.title || c.label).join(',');
    const rows = data.map(item => {
      return columns
        .filter(c => c.key !== 'actions')
        .map(c => {
          const val = item[c.key as keyof T];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',');
    });
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Client-side processing (Search, Sort, Pagination)
  const processedData = useMemo(() => {
    if (serverSidePagination) return data;

    let result = [...data];

    // Client Search
    if (internalSearch && !onSearch) {
      const lowerQuery = internalSearch.toLowerCase();
      result = result.filter(item => {
        if (searchKeys && searchKeys.length > 0) {
          return searchKeys.some(key => {
            const val = (item as any)[key];
            return val != null && String(val).toLowerCase().includes(lowerQuery);
          });
        }
        return Object.values(item as any).some(val => 
          val != null && String(val).toLowerCase().includes(lowerQuery)
        );
      });
    }

    // Client Filter
    if (internalFilter && filterKey && !onFilterChange) {
      result = result.filter(item => String(item[filterKey as keyof T]) === internalFilter);
    }

    // Client Sort
    if (sortConfig && !onSort) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof T];
        const bVal = b[sortConfig.key as keyof T];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Client Pagination
    const startIndex = (internalPage - 1) * internalPageSize;
    return result.slice(startIndex, startIndex + internalPageSize);
  }, [data, serverSidePagination, internalSearch, internalFilter, sortConfig, internalPage, internalPageSize, onSearch, onFilterChange, filterKey, onSort]);

  const displayTotal = serverSidePagination ? totalItems : data.length;
  const displayPage = serverSidePagination ? currentPage : internalPage;
  const displayPageSize = serverSidePagination ? pageSize : internalPageSize;
  const totalPages = Math.ceil(displayTotal / displayPageSize);

  return (
    <div className="w-full bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      
      {/* Toolbar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-900/50">
        
        <div className="flex gap-2 w-full sm:max-w-md">
          {/* Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={internalSearch}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          {/* Filter Options */}
          {filterOptions && filterOptions.length > 0 && (
            <div className="w-1/3 min-w-[120px]">
              <select
                value={internalFilter}
                onChange={handleFilter}
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All</option>
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedKeys.size > 0 && bulkActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => action.onClick(Array.from(selectedKeys))}
              className={cn(
                "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border",
                action.danger 
                  ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              )}
            >
              {action.icon && <span className="mr-2 h-4 w-4">{action.icon}</span>}
              {action.label} ({selectedKeys.size})
            </button>
          ))}

          {exportable && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-3 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-muted-foreground">
          <thead className="bg-gray-50 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300 border-b border-border">
            <tr>
              {selectable && (
                <th scope="col" className="px-6 py-3 w-12">
                  <Checkbox 
                    label="" 
                    checked={data.length > 0 && selectedKeys.size === data.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  scope="col" 
                  className={cn("px-6 py-3 font-semibold", col.sortable && "cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800")}
                  onClick={() => col.sortable && handleSort(col.key as string)}
                >
                  <div className="flex items-center gap-1">
                    {col.title || col.label}
                    {col.sortable && sortConfig?.key === col.key && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-border bg-background">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-0">
                  <TableSkeleton columns={columns.length + (selectable ? 1 : 0)} rows={5} />
                </td>
              </tr>
            ) : processedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-10">
                  <EmptyState 
                    icon={FilterIcon}
                    title="No results found"
                    description="No data available for the current filters or search query."
                  />
                </td>
              </tr>
            ) : (
              processedData.map((item, rowIndex) => {
                const key = keyExtractor(item);
                const isSelected = selectedKeys.has(key);
                return (
                  <tr 
                    key={key} 
                    className={cn("hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors", isSelected && "bg-indigo-50/50 dark:bg-indigo-900/10")}
                  >
                    {selectable && (
                      <td className="px-6 py-4 w-12">
                        <Checkbox 
                          label="" 
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(key, e.target.checked)}
                        />
                      </td>
                    )}
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 text-foreground whitespace-nowrap">
                        {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && displayTotal > 0 && (
        <div className="px-6 py-4 border-t border-border bg-gray-50/30 dark:bg-gray-900/30">
          <Pagination
            currentPage={displayPage}
            totalPages={totalPages}
            pageSize={displayPageSize}
            onPageChange={(p) => serverSidePagination && onPageChange ? onPageChange(p) : setInternalPage(p)}
            onPageSizeChange={(s) => serverSidePagination && onPageSizeChange ? onPageSizeChange(s) : setInternalPageSize(s)}
          />
        </div>
      )}
    </div>
  );
}
