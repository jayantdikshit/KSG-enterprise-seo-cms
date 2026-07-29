"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Save, ArrowLeft, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

import { Input } from '@/components/admin/ui/forms/Input';
import { Textarea } from '@/components/admin/ui/forms/Textarea';
import { Select } from '@/components/admin/ui/forms/Select';
import { MediaPickerModal } from '@/components/admin/common/MediaPickerModal';
import { useToast } from '@/components/admin/ui/Toast';
import { CreateProductInput, createProductSchema } from '@/validators/product.validator';

interface ProductFormProps {
  productId?: string;
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!productId);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors }, reset } = useForm<CreateProductInput>({
    defaultValues: {
      name: '',
      slug: '',
      shortDescription: '',
      description: '',
      featuredImage: '',
      category: '',
      status: 'DRAFT',
    }
  });

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const res = await fetch(`/api/products/${productId}`);
          const data = await res.json();
          if (data.success) {
            reset(data.data);
          } else {
            showToast("Failed to load product", "error");
          }
        } catch (e) {
          console.error(e);
          showToast("Failed to load product", "error");
        } finally {
          setInitialLoading(false);
        }
      };
      fetchProduct();
    }
  }, [productId, reset, showToast]);

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

  const onSubmit = async (data: CreateProductInput) => {
    try {
      setLoading(true);
      
      const url = productId ? `/api/products/${productId}` : '/api/products';
      const method = productId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong");

      showToast(`Product ${productId ? 'updated' : 'created'} successfully!`, 'success');
      router.push('/admin/products');
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="flex-1 max-w-4xl w-full">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Product
          </button>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Product Name"
                placeholder="e.g. Solar Inverter"
                {...register('name', { required: 'Name is required' })}
                error={errors.name?.message}
                required
              />
              
              <div className="relative">
                <Input
                  label="URL Slug"
                  placeholder="e.g. solar-inverter"
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

              <div className="md:col-span-2">
                <Input
                  label="Category"
                  placeholder="e.g. Solar, EV"
                  {...register('category')}
                  error={errors.category?.message}
                />
              </div>

              <div className="md:col-span-2">
                <Textarea
                  label="Short Description"
                  placeholder="A brief summary of this product..."
                  {...register('shortDescription')}
                  rows={3}
                />
              </div>

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
                  {watch('featuredImage') && (
                    <div className="mb-4 relative w-full max-w-md h-48 rounded-lg overflow-hidden border border-gray-200">
                      <img src={watch('featuredImage') as string} alt="Featured" className="w-full h-full object-cover" />
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

              <div className="col-span-1">
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
