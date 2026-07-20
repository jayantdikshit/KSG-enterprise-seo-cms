"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Input } from '@/components/admin/ui/forms/Input';
import { Select } from '@/components/admin/ui/forms/Select';
import { Toggle } from '@/components/admin/ui/Toggle';
import { SEOForm } from '@/components/admin/common/SEOForm';
import { RichTextEditor } from '@/components/admin/common/RichTextEditor';
import { useToast } from '@/components/admin/ui/Toast';
import { apiCall } from '@/utils/apiUtils';
import { PageDTO, CreatePageDTO, UpdatePageDTO } from '@/types/page.types';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';

interface PageFormProps {
  initialData?: PageDTO;
  isEdit?: boolean;
}

export default function PageForm({ initialData, isEdit = false }: PageFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<CreatePageDTO>({
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      status: initialData?.status || 'DRAFT',
      content: initialData?.content || '',
      
      // SEO
      seoTitle: initialData?.seoTitle || '',
      metaDescription: initialData?.metaDescription || '',
      metaKeywords: initialData?.metaKeywords || '',
      canonicalUrl: initialData?.canonicalUrl || '',
      robotsIndex: initialData?.robotsIndex ?? true,
      robotsFollow: initialData?.robotsFollow ?? true,
      ogTitle: initialData?.ogTitle || '',
      ogDescription: initialData?.ogDescription || '',
      ogImage: initialData?.ogImage || '',
      twitterCard: initialData?.twitterCard || 'summary_large_image',
      twitterTitle: initialData?.twitterTitle || '',
      twitterDescription: initialData?.twitterDescription || '',
      twitterImage: initialData?.twitterImage || '',
    }
  });

  const generateSlug = () => {
    const title = watch('title');
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', slug, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: CreatePageDTO) => {
    try {
      setLoading(true);
      const url = isEdit ? `/api/pages/${initialData?._id}` : '/api/pages';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiCall(url, {
        method,
        body: JSON.stringify(data)
      });

      if (res.success) {
        showToast(`Page ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        router.push('/admin/pages');
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
      
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/admin/pages" className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {isEdit ? 'Edit Page' : 'Create New Page'}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Fill in the details to {isEdit ? 'update the' : 'create a new'} dynamic page.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Page
          </button>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {/* Main Info */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Page Title"
                placeholder="e.g. About Us"
                {...register('title', { required: 'Title is required' })}
                error={errors.title?.message}
                required
              />
              
              <div className="relative">
                <Input
                  label="URL Slug"
                  placeholder="e.g. about-us"
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
            </div>

            <div className="max-w-xs">
              <Select
                label="Status"
                {...register('status')}
                options={[
                  { label: 'Draft', value: 'DRAFT' },
                  { label: 'Published', value: 'PUBLISHED' }
                ]}
              />
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Page Content
            </h2>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Write your page content here..."
                />
              )}
            />
          </div>

          {/* SEO Integration */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              SEO Settings
            </h2>
            <SEOForm
              register={register}
              control={control}
              errors={errors}
            />
          </div>

        </form>
      </div>
    </div>
  );
}
