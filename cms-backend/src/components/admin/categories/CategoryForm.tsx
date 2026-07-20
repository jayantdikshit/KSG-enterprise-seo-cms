"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Input } from '@/components/admin/ui/forms/Input';
import { Textarea } from '@/components/admin/ui/forms/Textarea';
import { Toggle } from '@/components/admin/ui/Toggle';
import { useToast } from '@/components/admin/ui/Toast';
import { apiCall } from '@/utils/apiUtils';
import { CategoryDTO, CreateCategoryDTO } from '@/types/category.types';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';

interface CategoryFormProps {
  initialData?: CategoryDTO;
  isEdit?: boolean;
}

export default function CategoryForm({ initialData, isEdit = false }: CategoryFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<CreateCategoryDTO & { isActive?: boolean }>({
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      isActive: initialData?.isActive ?? true,
    }
  });

  const generateSlug = () => {
    const name = watch('name');
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', slug, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: CreateCategoryDTO & { isActive?: boolean }) => {
    try {
      setLoading(true);
      const url = isEdit ? `/api/blogs/categories/${initialData?._id}` : '/api/blogs/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiCall(url, {
        method,
        body: JSON.stringify(data)
      });

      if (res.success) {
        showToast(`Category ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        router.push('/admin/categories');
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
      
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/admin/categories" className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {isEdit ? 'Edit Category' : 'Create Category'}
              </h1>
            </div>
          </div>
          
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Category
          </button>
        </div>

        <form className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Category Name"
            placeholder="e.g. Technology"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
            required
          />
          
          <div className="relative">
            <Input
              label="URL Slug"
              placeholder="e.g. technology"
              {...register('slug', { required: 'Slug is required' })}
              error={errors.slug?.message}
              required
            />
            <button
              type="button"
              onClick={generateSlug}
              className="absolute right-2 top-8 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Generate
            </button>
          </div>

          <Textarea
            label="Description"
            placeholder="Brief description about this category..."
            {...register('description')}
            rows={4}
          />

          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Status"
                description="If inactive, this category won't be selectable for new blogs."
                checked={field.value ?? true}
                onChange={field.onChange}
              />
            )}
          />
        </form>
      </div>
    </div>
  );
}
