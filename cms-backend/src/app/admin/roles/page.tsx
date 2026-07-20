"use client";

import React, { useEffect, useState } from 'react';
import { apiCall } from '@/utils/apiUtils';
import { RoleDTO } from '@/types/role.types';
import { useToast } from '@/components/admin/ui/Toast';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';
import { Loader2, Save } from 'lucide-react';
import { PermissionWrapper } from '@/components/admin/common/PermissionWrapper';

const AVAILABLE_PERMISSIONS = [
  { id: 'MANAGE_PAGES', label: 'Manage Pages' },
  { id: 'MANAGE_BLOGS', label: 'Manage Blogs' },
  { id: 'MANAGE_SERVICES', label: 'Manage Services' },
  { id: 'MANAGE_LEADS', label: 'Manage Leads' },
  { id: 'MANAGE_MEDIA', label: 'Manage Media' },
  { id: 'MANAGE_SEO', label: 'Manage SEO' },
  { id: 'MANAGE_USERS', label: 'Manage Users & Roles' },
  { id: 'MANAGE_SETTINGS', label: 'Manage Settings' }
];

export default function RolesPage() {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await apiCall<{success: boolean; data: RoleDTO[]}>('/api/roles');
      if (res.success) {
        setRoles(res.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch roles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleTogglePermission = (roleId: string, permissionId: string) => {
    setRoles(prevRoles => prevRoles.map(role => {
      if (role._id === roleId) {
        const hasPerm = role.permissions.includes(permissionId);
        const newPerms = hasPerm 
          ? role.permissions.filter(p => p !== permissionId)
          : [...role.permissions, permissionId];
        return { ...role, permissions: newPerms };
      }
      return role;
    }));
  };

  const saveRole = async (role: RoleDTO) => {
    try {
      setSaving(role._id);
      const res = await apiCall(`/api/roles/${role._id}`, {
        method: 'PUT',
        body: JSON.stringify({ permissions: role.permissions })
      });
      if (res.success) {
        showToast(`${role.name} updated successfully`, 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update role', 'error');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pb-12">
      <Breadcrumb />
      
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Role & Permissions</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage system roles and their assigned access permissions using the matrix below.
          </p>
        </div>

        <PermissionWrapper allowedRoles={['SUPER_ADMIN']} fallback={<div className="p-4 bg-red-50 text-red-700 rounded-md">You do not have permission to manage roles.</div>}>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                <p className="mt-2">Loading roles...</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Permissions
                    </th>
                    {roles.map(role => (
                      <th key={role._id} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {role.name.replace('_', ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {AVAILABLE_PERMISSIONS.map(permission => (
                    <tr key={permission.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {permission.label}
                      </td>
                      {roles.map(role => {
                        const hasPermission = role.permissions.includes(permission.id);
                        const isSuperAdmin = role.name === 'SUPER_ADMIN'; // Optional: lock super admin

                        return (
                          <td key={`${role._id}-${permission.id}`} className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              checked={hasPermission}
                              disabled={isSuperAdmin} // Prevent editing SUPER_ADMIN permissions if desired
                              onChange={() => handleTogglePermission(role._id, permission.id)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  
                  {/* Action Row */}
                  <tr className="bg-gray-50 dark:bg-gray-900/50">
                    <td className="px-6 py-4"></td>
                    {roles.map(role => (
                      <td key={`action-${role._id}`} className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => saveRole(role)}
                          disabled={saving === role._id || role.name === 'SUPER_ADMIN'}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                        >
                          {saving === role._id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                          Save {role.name === 'SUPER_ADMIN' ? '(Locked)' : ''}
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </PermissionWrapper>
      </div>
    </div>
  );
}
