"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Edit, Eye, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/admin/common/DataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ConfirmDeleteModal } from '@/components/admin/ui/ConfirmDeleteModal';
import { apiCall } from '@/utils/apiUtils';
import { BlogDTO } from '@/types/blog.types';
import { PaginatedResponse } from '@/types/page.types';
import { useToast } from '@/components/admin/ui/Toast';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';
import { PermissionWrapper } from '@/components/admin/common/PermissionWrapper';

export default function BlogsList() {
  const { showToast } = useToast();
  
  const [blogs, setBlogs] = useState<BlogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await apiCall<PaginatedResponse<BlogDTO>>('/api/blogs?limit=1000');
      if (res.success) {
        setBlogs(res.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch blogs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDeleteClick = (id: string) => {
    setBlogToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;
    
    try {
      await apiCall(`/api/blogs/${blogToDelete}`, { method: 'DELETE' });
      showToast('Blog deleted successfully', 'success');
      fetchBlogs();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete blog', 'error');
    } finally {
      setDeleteModalOpen(false);
      setBlogToDelete(null);
    }
  };

  const columns = useMemo(() => [
    { 
      key: 'title', 
      label: 'Blog Title', 
      sortable: true,
      render: (item: BlogDTO) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">/{item.slug}</div>
        </div>
      )
    },
    { 
      key: 'category', 
      label: 'Category', 
      sortable: true,
      render: (item: BlogDTO) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {item.category?.name || 'Uncategorized'}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (item: BlogDTO) => (
        <StatusBadge status={item.status === 'PUBLISHED' ? 'success' : 'warning'}>
          {item.status}
        </StatusBadge>
      )
    },
    { 
      key: 'publishDate', 
      label: 'Publish Date', 
      sortable: true,
      render: (item: BlogDTO) => new Date(item.publishDate).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: BlogDTO) => (
        <div className="flex items-center space-x-3">
          <Link href={`/admin/blogs/${item._id}/preview`} target="_blank" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400" title="Preview">
            <Eye className="w-4 h-4" />
          </Link>
          <Link href={`/admin/blogs/${item._id}/edit`} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" title="Edit">
            <Edit className="w-4 h-4" />
          </Link>
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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Blogs</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your blog posts and articles.</p>
          </div>
          <Link 
            href="/admin/blogs/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Blog
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <DataTable
            data={blogs}
            columns={columns}
            searchable={true}
            searchKeys={['title', 'slug', 'authorName']}
            selectable={true}
            exportable={true}
            exportFileName="blogs-export"
            isLoading={loading}
          />
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Blog"
        description="Are you sure you want to delete this blog? This action cannot be undone."
      />
    </div>
  );
}
