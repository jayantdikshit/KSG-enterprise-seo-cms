"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Upload, Trash2, Eye, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/admin/common/DataTable';
import { ConfirmDeleteModal } from '@/components/admin/ui/ConfirmDeleteModal';
import { Modal } from '@/components/admin/ui/Modal';
import { ImageUpload } from '@/components/admin/common/ImageUpload';
import { apiCall } from '@/utils/apiUtils';
import { MediaDTO } from '@/types/media.types';
import { PaginatedResponse } from '@/types/page.types';
import { useToast } from '@/components/admin/ui/Toast';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';
import { PermissionWrapper } from '@/components/admin/common/PermissionWrapper';
import { FolderPlus, Folder as FolderIcon } from 'lucide-react';
import { Input } from '@/components/admin/ui/forms/Input';

export default function MediaLibrary() {
  const { showToast } = useToast();
  
  const [mediaItems, setMediaItems] = useState<MediaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);
  
  // Folder states
  const [folders, setFolders] = useState<{ _id: string; name: string; }[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('uncategorized');
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await apiCall<PaginatedResponse<MediaDTO>>(`/api/media?limit=1000&folder=${currentFolder}`);
      if (res.success) {
        setMediaItems(res.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch media', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await apiCall<{success: boolean; data: any[]}>('/api/media/folders');
      if (res.success) {
        setFolders(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch folders', error);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    fetchMedia();
    
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('upload') === 'true') {
        setUploadModalOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [currentFolder]);

  const handleDeleteClick = (id: string) => {
    setMediaToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!mediaToDelete) return;
    
    try {
      await apiCall(`/api/media/${mediaToDelete}`, { method: 'DELETE' });
      showToast('Media deleted successfully', 'success');
      fetchMedia();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete media', 'error');
    } finally {
      setDeleteModalOpen(false);
      setMediaToDelete(null);
    }
  };

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', currentFolder);
        
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `Failed to upload ${file.name}`);
        }
        return data;
      });

      await Promise.all(uploadPromises);

      showToast(`${files.length} file(s) uploaded successfully`, 'success');
      setUploadModalOpen(false);
      fetchMedia();
    } catch (error: any) {
      showToast(error.message || 'Failed to upload files', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    try {
      const res = await apiCall('/api/media/folders', {
        method: 'POST',
        body: JSON.stringify({ name: newFolderName.trim() })
      });
      if (res.success) {
        showToast('Folder created successfully', 'success');
        setCreateFolderModalOpen(false);
        setNewFolderName('');
        fetchFolders();
        setCurrentFolder(newFolderName.trim());
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to create folder', 'error');
    } finally {
      setCreatingFolder(false);
    }
  };

  const columns = useMemo(() => [
    { 
      key: 'url', 
      label: 'Preview', 
      sortable: false,
      render: (item: MediaDTO) => (
        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
          {item.fileType === 'IMAGE' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.url} alt={item.alt || item.fileName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-gray-500 uppercase">{item.extension}</span>
          )}
        </div>
      )
    },
    { 
      key: 'fileName', 
      label: 'File Name', 
      sortable: true,
      render: (item: MediaDTO) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{item.originalName || item.fileName}</div>
          <div className="text-xs text-gray-500">{item.mimeType} • {(item.size / 1024).toFixed(1)} KB</div>
        </div>
      )
    },
    { 
      key: 'url', 
      label: 'URL', 
      sortable: false,
      render: (item: MediaDTO) => (
        <div className="text-sm font-mono text-gray-500 truncate max-w-[200px]" title={item.url}>
          {item.url}
        </div>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Uploaded On', 
      sortable: true,
      render: (item: MediaDTO) => new Date(item.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: MediaDTO) => (
        <div className="flex items-center space-x-3">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400" title="View">
            <Eye className="w-4 h-4" />
          </a>
          <PermissionWrapper allowedRoles={['SUPER_ADMIN', 'EDITOR', 'MARKETING_MANAGER']}>
            <button onClick={() => handleDeleteClick(item._id)} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </PermissionWrapper>
        </div>
      )
    }
  ], []);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <Breadcrumb />
      
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Media Library</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage all your uploaded images and files.</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setCreateFolderModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </button>
            <button 
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </button>
          </div>
        </div>

        {/* Folders Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setCurrentFolder('uncategorized')}
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              currentFolder === 'uncategorized'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <FolderIcon className="w-4 h-4 mr-2" />
            Uncategorized
          </button>
          {folders.map(folder => (
            <button
              key={folder._id}
              onClick={() => setCurrentFolder(folder.name)}
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                currentFolder === folder.name
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <FolderIcon className="w-4 h-4 mr-2" />
              {folder.name}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <DataTable
            data={mediaItems}
            columns={columns}
            searchable={true}
            searchKeys={['fileName', 'originalName']}
            selectable={true}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Media File"
        description="Are you sure you want to delete this file? Any content using this file may break."
      />

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Media"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select a file to upload to the media library.
          </p>
          
          <div className="relative">
            <ImageUpload 
              onUpload={handleUpload}
              multiple={true}
              maxSizeMB={5}
            />
            {uploading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-50">
                <div className="flex flex-col items-center">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Uploading...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Create Folder Modal */}
      <Modal
        isOpen={createFolderModalOpen}
        onClose={() => setCreateFolderModalOpen(false)}
        title="Create New Folder"
        size="sm"
      >
        <div className="space-y-4">
          <Input 
            label="Folder Name"
            placeholder="e.g. blog-images"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
            <button
              onClick={() => setCreateFolderModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFolder}
              disabled={creatingFolder || !newFolderName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors inline-flex items-center"
            >
              {creatingFolder && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Folder
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
