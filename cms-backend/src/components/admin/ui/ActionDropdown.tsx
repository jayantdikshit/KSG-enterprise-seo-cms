import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface ActionDropdownProps {
  actions: ActionItem[];
  className?: string;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({ actions, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center rounded-full p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:hover:text-gray-300"
        >
          <span className="sr-only">Open options</span>
          <MoreVertical className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-white/10">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                  action.danger ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-200"
                )}
                role="menuitem"
              >
                {action.icon && <span className="mr-2 h-4 w-4">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
