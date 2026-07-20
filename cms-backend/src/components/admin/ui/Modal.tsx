import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div 
        className={cn(
          "relative z-50 w-full max-w-lg rounded-xl bg-background p-6 shadow-xl ring-1 ring-black/5 dark:ring-white/10",
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800 transition-colors focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
