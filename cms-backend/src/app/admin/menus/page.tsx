"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/admin/common/DataTable';
import { ConfirmDeleteModal } from '@/components/admin/ui/ConfirmDeleteModal';
import { apiCall } from '@/utils/apiUtils';
import { MenuDTO } from '@/types/menu.types';
import { PaginatedResponse } from '@/types/page.types';
import { useToast } from '@/components/admin/ui/Toast';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';
import { PermissionWrapper } from '@/components/admin/common/PermissionWrapper';

export default function MenusList() {
  const { showToast } = useToast();
  
  const [menus, setMenus] = useState<MenuDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<string | null>(null);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await apiCall<PaginatedResponse<MenuDTO>>('/api/menus?limit=100');
      if (res.success) {
        setMenus(res.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch menus', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleDeleteClick = (id: string) => {
    setMenuToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!menuToDelete) return;
    
    try {
      await apiCall(`/api/menus/${menuToDelete}`, { method: 'DELETE' });
      showToast('Menu deleted successfully', 'success');
      fetchMenus();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete menu', 'error');
    } finally {
      setDeleteModalOpen(false);
      setMenuToDelete(null);
    }
  };

  const columns = useMemo(() => [
    { 
      key: 'name', 
      label: 'Menu Name', 
      sortable: true,
      render: (item: MenuDTO) => (
        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
      )
    },
    { 
      key: 'location', 
      label: 'Location', 
      sortable: true,
      render: (item: MenuDTO) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
          {item.location || 'Unassigned'}
        </span>
      )
    },
    { 
      key: 'itemsCount', 
      label: 'Items', 
      sortable: false,
      render: (item: MenuDTO) => (
        <span className="text-gray-500">{item.items?.length || 0} links</span>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Created Date', 
      sortable: true,
      render: (item: MenuDTO) => new Date(item.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: MenuDTO) => (
        <div className="flex items-center space-x-3">
          <Link href={`/admin/menus/${item._id}/edit`} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" title="Edit">
            <Edit className="w-4 h-4" />
          </Link>
          <PermissionWrapper allowedRoles={['SUPER_ADMIN']}>
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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Navigation Menus</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage headers, footers, and other navigation menus.</p>
          </div>
          <Link 
            href="/admin/menus/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Menu
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <DataTable
            data={menus}
            columns={columns}
            searchable={true}
            searchKeys={['name', 'location']}
            selectable={true}
            isLoading={loading}
          />
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Menu"
        description="Are you sure you want to delete this menu? Website navigation might break if this menu is currently in use."
      />
    </div>
  );
}
