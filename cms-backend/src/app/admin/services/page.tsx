"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Edit, Eye, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/admin/common/DataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ConfirmDeleteModal } from '@/components/admin/ui/ConfirmDeleteModal';
import { apiCall } from '@/utils/apiUtils';
import { ServiceDTO } from '@/types/service.types';
import { PaginatedResponse } from '@/types/page.types';
import { useToast } from '@/components/admin/ui/Toast';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';
import { PermissionWrapper } from '@/components/admin/common/PermissionWrapper';

export default function ServicesList() {
  const { showToast } = useToast();
  
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await apiCall<PaginatedResponse<ServiceDTO>>('/api/services?limit=1000');
      if (res.success) {
        setServices(res.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch services', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDeleteClick = (id: string) => {
    setServiceToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    
    try {
      await apiCall(`/api/services/${serviceToDelete}`, { method: 'DELETE' });
      showToast('Service deleted successfully', 'success');
      fetchServices();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete service', 'error');
    } finally {
      setDeleteModalOpen(false);
      setServiceToDelete(null);
    }
  };

  const columns = useMemo(() => [
    { 
      key: 'name', 
      label: 'Service Name', 
      sortable: true,
      render: (item: ServiceDTO) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">/{item.slug}</div>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (item: ServiceDTO) => (
        <StatusBadge status={item.status === 'PUBLISHED' ? 'success' : 'warning'}>
          {item.status}
        </StatusBadge>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Created Date', 
      sortable: true,
      render: (item: ServiceDTO) => new Date(item.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: ServiceDTO) => (
        <div className="flex items-center space-x-3">
          <Link href={`/admin/services/${item._id}/preview`} target="_blank" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400" title="Preview">
            <Eye className="w-4 h-4" />
          </Link>
          <Link href={`/admin/services/${item._id}/edit`} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" title="Edit">
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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Services</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage the services offered on your website.</p>
          </div>
          <Link 
            href="/admin/services/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Service
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <DataTable
            data={services}
            columns={columns}
            searchable={true}
            searchKeys={['name', 'slug']}
            selectable={true}
            exportable={true}
            exportFileName="services-export"
            isLoading={loading}
          />
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone."
      />
    </div>
  );
}
