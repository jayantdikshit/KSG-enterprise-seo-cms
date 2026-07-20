import React, { useCallback, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ImageUploadProps {
  onUpload: (files: File[]) => void;
  multiple?: boolean;
  maxSizeMB?: number;
  className?: string;
  altTextRequired?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  multiple = false,
  maxSizeMB = 5,
  className,
  altTextRequired = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<{ file: File; url: string; alt: string }[]>([]);
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

  const processFiles = (newFiles: File[]) => {
    setError(null);
    const validFiles: File[] = [];
    
    for (const file of newFiles) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.');
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File ${file.name} exceeds ${maxSizeMB}MB limit.`);
        continue;
      }
      validFiles.push(file);
    }
    
    const filesToProcess = multiple ? validFiles : validFiles.slice(0, 1);
    
    const newPreviews = filesToProcess.map(file => ({
      file,
      url: URL.createObjectURL(file),
      alt: ''
    }));

    setPreviews(prev => multiple ? [...prev, ...newPreviews] : newPreviews);
    onUpload(filesToProcess);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, [multiple, maxSizeMB, onUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(Array.from(e.target.files));
    }
  };

  const removePreview = (index: number) => {
    setPreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].url);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const updateAltText = (index: number, alt: string) => {
    setPreviews(prev => {
      const newPreviews = [...prev];
      newPreviews[index].alt = alt;
      return newPreviews;
    });
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
          accept="image/png, image/jpeg, image/webp, image/gif"
          multiple={multiple}
          onChange={handleChange}
          className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
        />
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <ImageIcon className="h-10 w-10 text-gray-400" />
          <p className="text-sm font-medium text-foreground">
            <span className="text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP, GIF up to {maxSizeMB}MB
          </p>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {previews.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {previews.map((preview, idx) => (
            <div key={idx} className="relative flex flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm">
              <div className="group relative aspect-video bg-gray-100 dark:bg-gray-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview.url} alt="Preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePreview(idx)}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-black group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {altTextRequired && (
                <div className="p-3 border-t border-border">
                  <input
                    type="text"
                    placeholder="Alt text (describe image)"
                    value={preview.alt}
                    onChange={(e) => updateAltText(idx, e.target.value)}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
