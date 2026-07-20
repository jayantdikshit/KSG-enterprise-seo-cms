import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/forms/Input';
import { Select } from '../ui/forms/Select';
import { Checkbox } from '../ui/forms/Checkbox';
import { Loader2 } from 'lucide-react';
import { apiCall } from '@/utils/apiUtils';
import { RedirectDTO } from '@/types/redirect.types';
import { useToast } from '../ui/Toast';

interface RedirectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  redirect?: RedirectDTO | null;
}

export const RedirectFormModal: React.FC<RedirectFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  redirect
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sourcePath: '',
    targetPath: '',
    statusCode: 301,
    active: true
  });

  useEffect(() => {
    if (redirect) {
      setFormData({
        sourcePath: redirect.sourcePath,
        targetPath: redirect.targetPath,
        statusCode: redirect.statusCode,
        active: redirect.active
      });
    } else {
      setFormData({
        sourcePath: '',
        targetPath: '',
        statusCode: 301,
        active: true
      });
    }
  }, [redirect, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isEdit = !!redirect;
      const url = isEdit ? `/api/redirects/${redirect._id}` : '/api/redirects';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiCall(url, {
        method,
        body: JSON.stringify(formData)
      });

      if (res.success) {
        showToast(`Redirect ${isEdit ? 'updated' : 'created'} successfully`, 'success');
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to save redirect', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={redirect ? 'Edit Redirect' : 'Create Redirect'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Source Path"
          value={formData.sourcePath}
          onChange={(e) => setFormData({ ...formData, sourcePath: e.target.value })}
          placeholder="/old-url-path"
          required
        />
        
        <Input
          label="Target Path"
          value={formData.targetPath}
          onChange={(e) => setFormData({ ...formData, targetPath: e.target.value })}
          placeholder="/new-url-path"
          required
        />
        
        <Select
          label="Redirect Type (Status Code)"
          value={formData.statusCode.toString()}
          onChange={(e) => setFormData({ ...formData, statusCode: parseInt(e.target.value, 10) })}
          options={[
            { label: '301 Permanent', value: '301' },
            { label: '302 Temporary', value: '302' }
          ]}
        />
        
        <Checkbox
          label="Active"
          checked={formData.active}
          onChange={(checked) => setFormData({ ...formData, active: checked })}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {redirect ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
