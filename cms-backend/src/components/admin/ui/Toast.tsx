"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  onClose: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({ type, title, message, onClose, className }) => {
  const styles = {
    success: { icon: CheckCircle, colors: 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400', iconColor: 'text-green-500 dark:text-green-400' },
    error: { icon: XCircle, colors: 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400', iconColor: 'text-red-500 dark:text-red-400' },
    warning: { icon: AlertCircle, colors: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', iconColor: 'text-yellow-500 dark:text-yellow-400' },
    info: { icon: Info, colors: 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', iconColor: 'text-blue-500 dark:text-blue-400' },
  };

  const { icon: Icon, colors, iconColor } = styles[type];

  return (
    <div className={cn('pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5', colors, className)}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn('h-5 w-5', iconColor)} aria-hidden="true" />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">{title}</p>
            {message && <p className="mt-1 text-sm opacity-90">{message}</p>}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToastState {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title: title || (type.charAt(0).toUpperCase() + type.slice(1)) }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    // Return a dummy implementation if not wrapped in provider to prevent crashes
    return {
      showToast: (message: string, type?: ToastType) => console.log(`[Toast] ${type}: ${message}`)
    };
  }
  return context;
}
