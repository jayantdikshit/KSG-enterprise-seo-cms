import React, { useEffect, useState } from 'react';
import { Loader2, Search, Check } from 'lucide-react';
import { Modal } from '@/components/admin/ui/Modal';
import { apiCall } from '@/utils/apiUtils';
import { MediaDTO } from '@/types/media.types';
import { PaginatedResponse } from '@/types/page.types';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = "Select from Media Library"
}) => {
  const [mediaItems, setMediaItems] = useState<MediaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const fetchMedia = async (searchQuery: string = '') => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({ limit: '1000' });
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      const res = await apiCall<PaginatedResponse<MediaDTO>>(`/api/media?${queryParams.toString()}`);
      if (res.success) {
        setMediaItems(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedUrl(null);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    
    const timeoutId = setTimeout(() => {
      fetchMedia(search);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [search, isOpen]);

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  // Filter out non-images
  const imageItems = mediaItems.filter(item => item.fileType === 'IMAGE');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="3xl">
      <div className="flex flex-col h-[60vh]">
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Search media by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : imageItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <p>No images found in your Media Library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {imageItems.map((item) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <div
                    key={item._id}
                    onClick={() => setSelectedUrl(item.url)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all aspect-square bg-white dark:bg-gray-800 ${
                      isSelected 
                        ? 'border-indigo-600 ring-2 ring-indigo-600 ring-opacity-50' 
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={item.url} 
                      alt={item.alt || item.fileName} 
                      className="w-full h-full object-cover" 
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-indigo-600 rounded-full p-1 shadow-sm">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-black bg-opacity-50 text-white text-xs truncate p-1">
                      {item.originalName || item.fileName}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedUrl}
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </Modal>
  );
};
