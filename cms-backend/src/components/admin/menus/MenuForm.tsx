"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Save, ArrowLeft, Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import Link from 'next/link';

import { Input } from '@/components/admin/ui/forms/Input';
import { Select } from '@/components/admin/ui/forms/Select';
import { useToast } from '@/components/admin/ui/Toast';
import { apiCall } from '@/utils/apiUtils';
import { MenuDTO, CreateMenuDTO } from '@/types/menu.types';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';

interface MenuFormProps {
  initialData?: MenuDTO;
  isEdit?: boolean;
}

export default function MenuForm({ initialData, isEdit = false }: MenuFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pagesList, setPagesList] = useState<{label: string, value: string}[]>([]);
  const [servicesList, setServicesList] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [pagesRes, servicesRes] = await Promise.all([
          apiCall('/api/pages'),
          apiCall('/api/services')
        ]);
        
        if (pagesRes.success && pagesRes.data) {
          setPagesList([
            { label: 'Select Page...', value: '' },
            ...pagesRes.data.map((p: any) => ({ label: p.title, value: p._id }))
          ]);
        }
        
        if (servicesRes.success && servicesRes.data) {
          setServicesList([
            { label: 'Select Service...', value: '' },
            ...servicesRes.data.map((s: any) => ({ label: s.name, value: s._id }))
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
      }
    };
    fetchDropdownData();
  }, []);

  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateMenuDTO>({
    defaultValues: {
      name: initialData?.name || '',
      location: initialData?.location || '',
      items: initialData?.items?.length ? initialData.items.map((item: any) => ({
        ...item,
        pageId: item.pageId?._id || item.pageId || '',
        serviceId: item.serviceId?._id || item.serviceId || ''
      })) : [],
    }
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "items"
  });

  const watchedItems = useWatch({
    control,
    name: "items"
  });

  const onSubmit = async (data: CreateMenuDTO) => {
    try {
      setLoading(true);
      
      // Basic formatting cleanup before sending
      if (data.items) {
        data.items = data.items.map((item: any, index) => {
          let cleanItem = { ...item, order: index };
          
          // Cleanup unused reference fields based on type
          if (cleanItem.type === 'PAGE') {
            cleanItem.url = '';
            cleanItem.serviceId = null;
          } else if (cleanItem.type === 'SERVICE') {
            cleanItem.url = '';
            cleanItem.pageId = null;
          } else {
            cleanItem.pageId = null;
            cleanItem.serviceId = null;
          }
          return cleanItem;
        });
      }

      const url = isEdit ? `/api/menus/${initialData?._id}` : '/api/menus';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiCall(url, {
        method,
        body: JSON.stringify(data)
      });

      if (res.success) {
        showToast(`Menu ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        router.push('/admin/menus');
      }
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pb-12">
      <Breadcrumb />
      
      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/admin/menus" className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {isEdit ? 'Edit Menu' : 'Create New Menu'}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Organize your website navigation structure.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Menu
          </button>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {/* Main Info */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Menu Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Menu Name"
                placeholder="e.g. Header Main Menu"
                {...register('name', { required: 'Name is required' })}
                error={errors.name?.message}
                required
              />
              
              <Select
                label="Display Location"
                {...register('location')}
                options={[
                  { label: 'Unassigned', value: '' },
                  { label: 'Header Navigation', value: 'HEADER' },
                  { label: 'Footer Column 1', value: 'FOOTER_1' },
                  { label: 'Footer Column 2', value: 'FOOTER_2' },
                  { label: 'Mobile Menu', value: 'MOBILE' }
                ]}
              />
            </div>
          </div>

          {/* Menu Items Builder */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Menu Items
              </h2>
              <button
                type="button"
                onClick={() => append({ label: '', type: 'EXTERNAL', url: '', target: '_self' })}
                className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md font-medium flex items-center transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {fields.map((item, index) => {
                const currentType = watchedItems?.[index]?.type || 'EXTERNAL';
                
                return (
                  <div key={item.id} className="flex gap-4 items-start p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col gap-2 mt-2">
                      <button type="button" onClick={() => index > 0 && move(index, index - 1)} disabled={index === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">
                        ↑
                      </button>
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <button type="button" onClick={() => index < fields.length - 1 && move(index, index + 1)} disabled={index === fields.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">
                        ↓
                      </button>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-4">
                        <Input
                          label="Label"
                          placeholder="Link text"
                          {...register(`items.${index}.label` as const, { required: 'Required' })}
                          error={errors.items?.[index]?.label?.message}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Select
                          label="Type"
                          {...register(`items.${index}.type` as const)}
                          options={[
                            { label: 'Custom URL', value: 'EXTERNAL' },
                            { label: 'Page', value: 'PAGE' },
                            { label: 'Service', value: 'SERVICE' },
                          ]}
                        />
                      </div>
                      <div className="md:col-span-5">
                        {currentType === 'PAGE' && (
                          <Select
                            label="Select Page"
                            {...register(`items.${index}.pageId` as const)}
                            options={pagesList}
                          />
                        )}
                        {currentType === 'SERVICE' && (
                          <Select
                            label="Select Service"
                            {...register(`items.${index}.serviceId` as const)}
                            options={servicesList}
                          />
                        )}
                        {(currentType === 'EXTERNAL' || currentType === 'CUSTOM') && (
                          <Input
                            label="URL"
                            placeholder="https://... or /path"
                            {...register(`items.${index}.url` as const)}
                          />
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 mt-6 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}

              {fields.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No menu items yet.</p>
                  <button
                    type="button"
                    onClick={() => append({ label: '', type: 'EXTERNAL', url: '', target: '_self' })}
                    className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add your first item
                  </button>
                </div>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
