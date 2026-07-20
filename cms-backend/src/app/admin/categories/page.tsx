"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/admin/common/DataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ConfirmDeleteModal } from '@/components/admin/ui/ConfirmDeleteModal';
import { apiCall } from '@/utils/apiUtils';
import { CategoryDTO } from '@/types/category.types';
import { PaginatedResponse } from '@/types/page.types'; // Reusing this generic type
import { useToast } from '@/components/admin/ui/Toast';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';
import { PermissionWrapper } from '@/components/admin/common/PermissionWrapper';

export default function CategoriesList() {
  const { showToast } = useToast();
  
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiCall<PaginatedResponse<CategoryDTO>>('/api/blogs/categories?limit=1000');
      if (res.success) {
        setCategories(res.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      await apiCall(`/api/blogs/categories/${categoryToDelete}`, { method: 'DELETE' });
      showToast('Category deleted successfully', 'success');
      fetchCategories();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete category', 'error');
    } finally {
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const columns = useMemo(() => [
    { 
      key: 'name', 
      label: 'Name', 
      sortable: true,
      render: (item: CategoryDTO) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">/{item.slug}</div>
        </div>
      )
    },
    { 
      key: 'isActive', 
      label: 'Status', 
      sortable: true,
      render: (item: CategoryDTO) => (
        <StatusBadge status={item.isActive ? 'success' : 'error'}>
          {item.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Created Date', 
      sortable: true,
      render: (item: CategoryDTO) => new Date(item.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: CategoryDTO) => (
        <div className="flex items-center space-x-3">
          <Link href={`/admin/categories/${item._id}/edit`} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" title="Edit">
            <Edit className="w-4 h-4" />
          </Link>
          <PermissionWrapper allowedRoles={['SUPER_ADMIN', 'EDITOR']}>
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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Blog Categories</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage categories for your blog posts.</p>
          </div>
          <Link 
            href="/admin/categories/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Category
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <DataTable
            data={categories}
            columns={columns}
            searchable={true}
            searchKeys={['name', 'slug']}
            selectable={true}
            exportable={true}
            exportFileName="categories-export"
            isLoading={loading}
          />
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? Blogs associated with this category might be affected."
      />
    </div>
  );
}
