"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DataTable, Column } from '@/components/admin/common/DataTable';
import { ConfirmDeleteModal } from '@/components/admin/ui/ConfirmDeleteModal';
import { UserFormModal } from '@/components/admin/users/UserFormModal';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { apiCall } from '@/utils/apiUtils';
import { UserDTO } from '@/types/user.types';
import { RoleDTO } from '@/types/role.types';
import { useToast } from '@/components/admin/ui/Toast';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';
import { PermissionWrapper } from '@/components/admin/common/PermissionWrapper';
import { useAuth } from '@/hooks/useAuth';

export default function UsersPage() {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        apiCall<{success: boolean; data: UserDTO[]}>('/api/users'),
        apiCall<{success: boolean; data: RoleDTO[]}>('/api/roles')
      ]);
      
      if (usersRes.success) setUsers(usersRes.data);
      if (rolesRes.success) setRoles(rolesRes.data);
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateNew = () => {
    setEditingUser(null);
    setFormModalOpen(true);
  };

  const handleEdit = (user: UserDTO) => {
    setEditingUser(user);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      const res = await apiCall(`/api/users/${userToDelete}`, { method: 'DELETE' });
      if (res.success) {
        showToast('User deleted successfully', 'success');
        fetchData();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to delete user', 'error');
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    try {
      setLoading(true);
      const res = await apiCall(`/api/users/${userId}`, {
        method: 'PUT',
        body: { roleId: newRoleId }
      });
      if (res.success) {
        showToast('Role updated successfully', 'success');
        fetchData();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update role', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<UserDTO>[] = useMemo(() => [
    { 
      title: 'Name', 
      key: 'name',
      sortable: true,
      render: (item: UserDTO) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {item.name}
        </span>
      )
    },
    { 
      title: 'Email', 
      key: 'email',
      sortable: true
    },
    { 
      title: 'Role', 
      key: 'role',
      render: (item: UserDTO) => {
        const roleObj = item.role;
        const roleName = typeof roleObj === 'object' && roleObj !== null ? roleObj.name : (typeof roleObj === 'string' ? roleObj : 'No Role');
        const displayRole = roleName ? roleName.replace('_', ' ') : 'No Role';
        
        const isSuperAdmin = currentUser?.role?.name === 'SUPER_ADMIN' || currentUser?.role === 'SUPER_ADMIN';

        if (isSuperAdmin) {
          const currentRoleId = typeof roleObj === 'object' && roleObj !== null ? roleObj._id : '';
          return (
            <select
              value={currentRoleId}
              onChange={(e) => handleRoleChange(item._id, e.target.value)}
              className="block w-full max-w-[150px] px-2 py-1 text-xs text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
            >
              <option value="">Select Role</option>
              {roles.map(r => (
                <option key={r._id} value={r._id}>{r.name.replace('_', ' ')}</option>
              ))}
            </select>
          );
        }

        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {displayRole}
          </span>
        );
      }
    },
    { 
      title: 'Status', 
      key: 'isActive',
      render: (item: UserDTO) => (
        <StatusBadge status={item.isActive ? 'Active' : 'Inactive'} />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (item: UserDTO) => (
        <div className="flex items-center space-x-3">
          <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => handleDeleteClick(item._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ], [currentUser, roles]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pb-12">
      <Breadcrumb />
      
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage admin users and their access.</p>
          </div>
          <PermissionWrapper allowedRoles={['SUPER_ADMIN', 'MANAGE_USERS']}>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </button>
          </PermissionWrapper>
        </div>

        <PermissionWrapper allowedRoles={['SUPER_ADMIN', 'MANAGE_USERS']} fallback={<div className="p-4 bg-red-50 text-red-700 rounded-md">You do not have permission to view users.</div>}>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <DataTable
              data={users}
              columns={columns}
              searchable={true}
              searchKeys={['name', 'email']}
              isLoading={loading}
            />
          </div>
        </PermissionWrapper>
      </div>

      <UserFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={fetchData}
        user={editingUser}
        roles={roles}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
}
