"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Save, ArrowLeft, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

import { Input } from '@/components/admin/ui/forms/Input';
import { Select } from '@/components/admin/ui/forms/Select';
import { TagsInput } from '@/components/admin/ui/forms/TagsInput';
import { SEOForm } from '@/components/admin/common/SEOForm';
import { RichTextEditor } from '@/components/admin/common/RichTextEditor';
import { MediaPickerModal } from '@/components/admin/common/MediaPickerModal';
import { DatePicker } from '@/components/admin/ui/DatePicker';
import { useToast } from '@/components/admin/ui/Toast';
import { apiCall } from '@/utils/apiUtils';
import { BlogDTO, CreateBlogDTO } from '@/types/blog.types';
import { CategoryDTO } from '@/types/category.types';
import { PaginatedResponse } from '@/types/page.types';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';

interface BlogFormProps {
  initialData?: BlogDTO;
  isEdit?: boolean;
}

export default function BlogForm({ initialData, isEdit = false }: BlogFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<CreateBlogDTO>({
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      content: initialData?.content || '',
      category: initialData?.category?._id || '',
      authorName: initialData?.authorName || '',
      tags: initialData?.tags || [],
      publishDate: initialData?.publishDate ? new Date(initialData.publishDate) : new Date(),
      status: initialData?.status || 'DRAFT',
      featuredImage: initialData?.featuredImage || '',
      
      // SEO
      seoTitle: initialData?.seoTitle || '',
      metaDescription: initialData?.metaDescription || '',
      metaKeywords: initialData?.metaKeywords || [],
      canonicalUrl: initialData?.canonicalUrl || '',
      ogTitle: initialData?.ogTitle || '',
      ogDescription: initialData?.ogDescription || '',
      ogImage: initialData?.ogImage || '',
      ogImage: initialData?.ogImage || '',
      twitterCard: initialData?.twitterCard || 'summary_large_image',
      twitterTitle: initialData?.twitterTitle || '',
      twitterDescription: initialData?.twitterDescription || '',
      twitterImage: initialData?.twitterImage || '',
      schemaMarkup: initialData?.schemaMarkup || '',
      robotsIndex: initialData?.robotsIndex ?? true,
      robotsFollow: initialData?.robotsFollow ?? true,
      generateFaqSchema: initialData?.generateFaqSchema ?? true,
      generateBreadcrumbSchema: initialData?.generateBreadcrumbSchema ?? true,
    }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiCall<PaginatedResponse<CategoryDTO>>('/api/blogs/categories?limit=100');
        if (res.success) {
          setCategories(res.data);
        }
      } catch (e) {
        showToast('Failed to load categories', 'error');
      }
    };
    fetchCategories();
  }, [showToast]);

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

  const onSubmit = async (data: CreateBlogDTO) => {
    try {
      setLoading(true);
      const url = isEdit ? `/api/blogs/${initialData?._id}` : '/api/blogs';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiCall(url, {
        method,
        body: JSON.stringify(data)
      });

      if (res.success) {
        showToast(`Blog ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        router.push('/admin/blogs');
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
            <Link href="/admin/blogs" className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {isEdit ? 'Edit Blog' : 'Create New Blog'}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Write and publish articles for your audience.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Blog
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
                label="Blog Title"
                placeholder="e.g. 10 Tips for Better SEO"
                {...register('title', { required: 'Title is required' })}
                error={errors.title?.message}
                required
              />
              
              <div className="relative">
                <Input
                  label="URL Slug"
                  placeholder="e.g. 10-tips-for-better-seo"
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

              <Select
                label="Category"
                {...register('category', { required: 'Category is required' })}
                error={errors.category?.message}
                required
                options={[
                  { label: 'Select a category...', value: '' },
                  ...categories.map(c => ({ label: c.name, value: c._id }))
                ]}
              />

              <Input
                label="Author Name"
                placeholder="e.g. John Doe"
                {...register('authorName', { required: 'Author Name is required' })}
                error={errors.authorName?.message}
                required
              />

              <div className="md:col-span-2 space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Featured Image</label>
                    <button
                      type="button"
                      onClick={() => setMediaPickerOpen(true)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded"
                    >
                      Select from Media Library
                    </button>
                  </div>
                  {/* URL Input for Featured Image */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Or paste image URL here..."
                      {...register('featuredImage')}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  {watch('featuredImage') && (
                    <div className="mb-4 relative w-full max-w-md h-48 rounded-lg overflow-hidden border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={watch('featuredImage')} alt="Featured" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setValue('featuredImage', '')}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {!watch('featuredImage') && (
                    <button
                      type="button"
                      onClick={() => setMediaPickerOpen(true)}
                      className="w-full relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800 p-6 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center space-y-2 text-center">
                        <ImageIcon className="h-10 w-10 text-gray-400" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          <span className="text-indigo-600 dark:text-indigo-400">Click to select</span> from Media Library
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select
                label="Status"
                {...register('status')}
                options={[
                  { label: 'Draft', value: 'DRAFT' },
                  { label: 'Published', value: 'PUBLISHED' }
                ]}
              />

              <div className="col-span-1 md:col-span-2">
                <Controller
                  name="publishDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Publish Date"
                      value={field.value as Date}
                      onChange={field.onChange}
                      error={errors.publishDate?.message}
                    />
                  )}
                />
              </div>
            </div>

            <div>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagsInput
                    label="Tags"
                    placeholder="Type a tag and press Enter"
                    value={field.value || []}
                    onChange={field.onChange}
                    error={errors.tags?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Blog Content
            </h2>
            <Controller
              name="content"
              control={control}
              rules={{ required: 'Content is required' }}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Write your amazing blog post here..."
                  error={errors.content?.message}
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

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => {
          setValue('featuredImage', url, { shouldValidate: true, shouldDirty: true });
        }}
        title="Select Featured Image"
      />
    </div>
  );
}
