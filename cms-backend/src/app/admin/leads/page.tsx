"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Eye, Trash2, Mail, Phone, Calendar } from 'lucide-react';
import { DataTable, Column } from '@/components/admin/common/DataTable';
import { ConfirmDeleteModal } from '@/components/admin/ui/ConfirmDeleteModal';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { apiCall } from '@/utils/apiUtils';
import { LeadDTO } from '@/types/lead.types';
import { PaginatedResponse } from '@/types/page.types';
import { useToast } from '@/components/admin/ui/Toast';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';
import { PermissionWrapper } from '@/components/admin/common/PermissionWrapper';

export default function LeadsList() {
  const { showToast } = useToast();
  const [leads, setLeads] = useState<LeadDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await apiCall<PaginatedResponse<LeadDTO>>('/api/leads?limit=1000');
      if (res.success) {
        setLeads(res.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDeleteClick = (id: string) => {
    setLeadToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;
    
    try {
      const res = await apiCall(`/api/leads/${leadToDelete}`, { method: 'DELETE' });
      if (res.success) {
        showToast('Lead deleted successfully', 'success');
        fetchLeads();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to delete lead', 'error');
    } finally {
      setDeleteModalOpen(false);
      setLeadToDelete(null);
    }
  };

  const columns: Column<LeadDTO>[] = useMemo(() => [
    { 
      title: 'Name', 
      key: 'name',
      sortable: true,
      render: (item: LeadDTO) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
          {item.companyName && <div className="text-xs text-gray-500">{item.companyName}</div>}
        </div>
      )
    },
    { 
      title: 'Contact Info', 
      key: 'email',
      sortable: false,
      render: (item: LeadDTO) => (
        <div className="flex flex-col space-y-1">
          <a href={`mailto:${item.email}`} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
            <Mail className="w-3 h-3 mr-1" /> {item.email}
          </a>
          <a href={`tel:${item.phone}`} className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 flex items-center">
            <Phone className="w-3 h-3 mr-1" /> {item.phone}
          </a>
        </div>
      )
    },
    { 
      title: 'Status', 
      key: 'status',
      sortable: true,
      render: (item: LeadDTO) => (
        <StatusBadge status={item.status} />
      )
    },
    { 
      title: 'Submitted Date', 
      key: 'createdAt',
      sortable: true,
      render: (item: LeadDTO) => (
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4 mr-2" />
          {new Date(item.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (item: LeadDTO) => (
        <div className="flex items-center space-x-3">
          <Link href={`/admin/leads/${item._id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
            <Eye className="w-4 h-4" />
          </Link>
          <PermissionWrapper allowedRoles={['SUPER_ADMIN', 'MARKETING_MANAGER']}>
            <button onClick={() => handleDeleteClick(item._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Lead Management</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View and manage form submissions and leads.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <DataTable
            data={leads}
            columns={columns}
            searchable={true}
            searchKeys={['name', 'email', 'phone', 'companyName']}
            filterOptions={[
              { label: 'New', value: 'NEW' },
              { label: 'Contacted', value: 'CONTACTED' },
              { label: 'Qualified', value: 'QUALIFIED' },
              { label: 'Closed', value: 'CLOSED' }
            ]}
            filterKey="status"
            selectable={true}
            exportable={true}
            exportFileName="leads-export"
            isLoading={loading}
          />
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
      />
    </div>
  );
}
