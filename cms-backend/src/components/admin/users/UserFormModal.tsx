import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/forms/Input';
import { Select } from '../ui/forms/Select';
import { Checkbox } from '../ui/forms/Checkbox';
import { Loader2 } from 'lucide-react';
import { apiCall } from '@/utils/apiUtils';
import { UserDTO } from '@/types/user.types';
import { RoleDTO } from '@/types/role.types';
import { useToast } from '../ui/Toast';
import { Password } from '../ui/forms/Password';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: UserDTO | null;
  roles: RoleDTO[];
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user,
  roles
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleId: '',
    isActive: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Leave blank for edit unless changing
        roleId: typeof user.role === 'string' ? user.role : (user.role as RoleDTO)._id,
        isActive: user.isActive ?? true
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        roleId: roles.length > 0 ? roles[0]._id : '',
        isActive: true
      });
    }
  }, [user, isOpen, roles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isEdit = !!user;
      const url = isEdit ? `/api/users/${user._id}` : '/api/users';
      const method = isEdit ? 'PUT' : 'POST';

      const payload: any = { ...formData };
      if (isEdit && !payload.password) {
        delete payload.password;
      }

      const res = await apiCall(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (res.success) {
        showToast(`User ${isEdit ? 'updated' : 'created'} successfully`, 'success');
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to save user', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Edit User' : 'Create User'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="John Doe"
          required
        />
        
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="john@example.com"
          required
        />
        
        <Password
          label={user ? "New Password (leave blank to keep current)" : "Password"}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required={!user}
        />
        
        <Select
          label="Role"
          value={formData.roleId}
          onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
          options={roles.map(r => ({ label: r.name.replace('_', ' '), value: r._id }))}
          required
        />
        
        <Checkbox
          label="Active Account"
          checked={formData.isActive}
          onChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {user ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
