import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full' | string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className, size = 'lg' }) => {
  const sizeClass = size === 'sm' ? 'max-w-sm' : 
                    size === 'md' ? 'max-w-md' :
                    size === 'lg' ? 'max-w-lg' :
                    size === 'xl' ? 'max-w-xl' :
                    size === '2xl' ? 'max-w-2xl' :
                    size === '3xl' ? 'max-w-3xl' :
                    size === '4xl' ? 'max-w-4xl' :
                    size === '5xl' ? 'max-w-5xl' :
                    size === 'full' ? 'max-w-[90vw]' : 'max-w-lg';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

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
          "relative z-50 w-full rounded-xl bg-background p-6 shadow-xl ring-1 ring-black/5 dark:ring-white/10",
          sizeClass,
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
