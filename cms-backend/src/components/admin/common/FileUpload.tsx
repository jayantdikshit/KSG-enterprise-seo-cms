import React, { useCallback, useState } from 'react';
import { UploadCloud, X, File as FileIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  accept,
  multiple = false,
  maxSizeMB = 10,
  className,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFiles = (newFiles: File[]) => {
    setError(null);
    const validFiles: File[] = [];
    
    for (const file of newFiles) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File ${file.name} exceeds ${maxSizeMB}MB limit.`);
        continue;
      }
      validFiles.push(file);
    }
    
    return multiple ? validFiles : validFiles.slice(0, 1);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const validFiles = validateFiles(Array.from(e.dataTransfer.files));
      if (validFiles.length) {
        setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles);
        onUpload(validFiles);
      }
    }
  }, [multiple, maxSizeMB, onUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const validFiles = validateFiles(Array.from(e.target.files));
      if (validFiles.length) {
        setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles);
        onUpload(validFiles);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          dragActive ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800",
          error && "border-red-500 bg-red-50 dark:bg-red-900/20"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
        />
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <UploadCloud className="h-10 w-10 text-gray-400" />
          <p className="text-sm font-medium text-foreground">
            <span className="text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            {accept ? accept.replace(/,/g, ', ') : 'Any file'} up to {maxSizeMB}MB
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-2 flex items-center text-sm text-red-500">
          <AlertCircle className="mr-1 h-4 w-4" />
          {error}
        </div>
      )}

      {files.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {files.map((file, idx) => (
            <li key={idx} className="flex items-center justify-between rounded-md border border-border bg-background p-3 shadow-sm">
              <div className="flex items-center space-x-3 overflow-hidden">
                <FileIcon className="h-6 w-6 flex-shrink-0 text-indigo-500" />
                <div className="flex flex-col truncate">
                  <span className="truncate text-sm font-medium text-foreground">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 focus:outline-none dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
