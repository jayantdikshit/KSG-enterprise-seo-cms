"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DataTable, Column } from '@/components/admin/common/DataTable';
import { ConfirmDeleteModal } from '@/components/admin/ui/ConfirmDeleteModal';
import { RedirectFormModal } from '@/components/admin/redirects/RedirectFormModal';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { apiCall } from '@/utils/apiUtils';
import { RedirectDTO } from '@/types/redirect.types';
import { useToast } from '@/components/admin/ui/Toast';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';
import { PermissionWrapper } from '@/components/admin/common/PermissionWrapper';

export default function RedirectsPage() {
  const { showToast } = useToast();
  const [redirects, setRedirects] = useState<RedirectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<RedirectDTO | null>(null);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [redirectToDelete, setRedirectToDelete] = useState<string | null>(null);

  const fetchRedirects = async () => {
    try {
      setLoading(true);
      const res = await apiCall<{success: boolean; data: RedirectDTO[]}>('/api/redirects');
      if (res.success) {
        setRedirects(res.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch redirects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedirects();
  }, []);

  const handleCreateNew = () => {
    setEditingRedirect(null);
    setFormModalOpen(true);
  };

  const handleEdit = (redirect: RedirectDTO) => {
    setEditingRedirect(redirect);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setRedirectToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!redirectToDelete) return;
    
    try {
      const res = await apiCall(`/api/redirects/${redirectToDelete}`, { method: 'DELETE' });
      if (res.success) {
        showToast('Redirect deleted successfully', 'success');
        fetchRedirects();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to delete redirect', 'error');
    } finally {
      setDeleteModalOpen(false);
      setRedirectToDelete(null);
    }
  };

  const handleToggleActive = async (redirect: RedirectDTO) => {
    try {
      const res = await apiCall(`/api/redirects/${redirect._id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !redirect.active })
      });
      if (res.success) {
        showToast(`Redirect ${!redirect.active ? 'activated' : 'deactivated'} successfully`, 'success');
        fetchRedirects();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to toggle redirect status', 'error');
    }
  };

  const columns: Column<RedirectDTO>[] = useMemo(() => [
    { 
      title: 'Source Path', 
      key: 'sourcePath',
      sortable: true,
      render: (item: RedirectDTO) => (
        <span className="font-mono text-sm text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {item.sourcePath}
        </span>
      )
    },
    { 
      title: 'Target Path', 
      key: 'targetPath',
      sortable: true,
      render: (item: RedirectDTO) => (
        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
          {item.targetPath}
        </span>
      )
    },
    { 
      title: 'Type', 
      key: 'statusCode',
      sortable: true,
      render: (item: RedirectDTO) => (
        <StatusBadge status={item.statusCode === 301 ? '301 Permanent' : '302 Temporary'} className={item.statusCode === 301 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'} />
      )
    },
    { 
      title: 'Status', 
      key: 'active',
      sortable: true,
      render: (item: RedirectDTO) => (
        <button 
          onClick={() => handleToggleActive(item)}
          className="focus:outline-none transition-transform hover:scale-105"
        >
          <StatusBadge status={item.active ? 'Active' : 'Inactive'} />
        </button>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (item: RedirectDTO) => (
        <PermissionWrapper allowedRoles={['SUPER_ADMIN', 'SEO_MANAGER']}>
          <div className="flex items-center space-x-3">
            <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
              <Edit className="w-4 h-4" />
            </button>
            <button onClick={() => handleDeleteClick(item._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </PermissionWrapper>
      )
    }
  ], []);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pb-12">
      <Breadcrumb />
      
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Redirect Manager</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage 301/302 redirects for your website.</p>
          </div>
          <PermissionWrapper allowedRoles={['SUPER_ADMIN', 'SEO_MANAGER']}>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Redirect
            </button>
          </PermissionWrapper>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <DataTable
            data={redirects}
            columns={columns}
            searchable={true}
            searchKeys={['sourcePath', 'targetPath']}
            isLoading={loading}
          />
        </div>
      </div>

      <RedirectFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={fetchRedirects}
        redirect={editingRedirect}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Redirect"
        message="Are you sure you want to delete this redirect? Links pointing to the source path will no longer be forwarded."
      />
    </div>
  );
}
