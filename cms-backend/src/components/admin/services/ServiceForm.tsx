"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Save, ArrowLeft, Loader2, Plus, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

import { Input } from '@/components/admin/ui/forms/Input';
import { Textarea } from '@/components/admin/ui/forms/Textarea';
import { Select } from '@/components/admin/ui/forms/Select';
import { TagsInput } from '@/components/admin/ui/forms/TagsInput';
import { SEOForm } from '@/components/admin/common/SEOForm';
import { RichTextEditor } from '@/components/admin/common/RichTextEditor';
import { ImageUpload } from '@/components/admin/common/ImageUpload';
import { MediaPickerModal } from '@/components/admin/common/MediaPickerModal';
import { useToast } from '@/components/admin/ui/Toast';
import { apiCall } from '@/utils/apiUtils';
import { ServiceDTO, CreateServiceDTO } from '@/types/service.types';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';

interface ServiceFormProps {
  initialData?: ServiceDTO;
  isEdit?: boolean;
}

export default function ServiceForm({ initialData, isEdit = false }: ServiceFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [activeMediaField, setActiveMediaField] = useState<any>(null);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<CreateServiceDTO>({
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      shortDescription: initialData?.shortDescription || '',
      description: initialData?.description || '',
      featuredImage: initialData?.featuredImage || '',
      bannerImage: initialData?.bannerImage || '',
      keyFeatures: initialData?.keyFeatures || [],
      benefits: initialData?.benefits || [],
      faq: initialData?.faq && initialData.faq.length > 0 ? initialData.faq : [{ question: '', answer: '' }],
      whyChooseUs: initialData?.whyChooseUs || { heading: '', subheading: '', cards: [] },
      testimonials: initialData?.testimonials || [],
      contactCTA: initialData?.contactCTA || { heading: '', description: '', buttonText: '', buttonUrl: '', backgroundImage: '' },
      ctaTitle: initialData?.ctaTitle || '',
      ctaButtonText: initialData?.ctaButtonText || '',
      ctaButtonUrl: initialData?.ctaButtonUrl || '',
      status: initialData?.status || 'DRAFT',
      
      // SEO
      seoTitle: initialData?.seoTitle || '',
      metaDescription: initialData?.metaDescription || '',
      metaKeywords: initialData?.metaKeywords || [],
      canonicalUrl: initialData?.canonicalUrl || '',
      ogTitle: initialData?.ogTitle || '',
      ogDescription: initialData?.ogDescription || '',
      ogImage: initialData?.ogImage || '',
      schemaMarkup: initialData?.schemaMarkup || '',
      generateFaqSchema: initialData?.generateFaqSchema ?? true,
      generateBreadcrumbSchema: initialData?.generateBreadcrumbSchema ?? true,
    }
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq, move: moveFaq } = useFieldArray({
    control,
    name: "faq"
  });

  const { fields: whyChooseUsFields, append: appendWhyChooseUs, remove: removeWhyChooseUs, move: moveWhyChooseUs } = useFieldArray({
    control,
    name: "whyChooseUs.cards"
  });
  
  const { fields: testimonialFields, append: appendTestimonial, remove: removeTestimonial, move: moveTestimonial } = useFieldArray({
    control,
    name: "testimonials"
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

  const handleImageUpload = async (files: File[], field: 'featuredImage' | 'bannerImage') => {
    if (files.length === 0) return;
    
    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload file');
      }

      setValue(field, data.data.url, { shouldValidate: true, shouldDirty: true });
      showToast('Image uploaded successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to upload image', 'error');
    }
  };

  const onSubmit = async (data: CreateServiceDTO) => {
    try {
      setLoading(true);
      
      // Filter out empty FAQs
      if (data.faq) {
        data.faq = data.faq.filter(f => f.question.trim() !== '' && f.answer.trim() !== '');
      }
      if (data.whyChooseUs?.cards) {
         data.whyChooseUs.cards = data.whyChooseUs.cards.map((c, i) => ({...c, order: i}));
      }
      if (data.testimonials) {
         data.testimonials = data.testimonials.map((c, i) => ({...c, order: i}));
      }

      const url = isEdit ? `/api/services/${initialData?._id}` : '/api/services';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiCall(url, {
        method,
        body: JSON.stringify(data)
      });

      if (res.success) {
        showToast(`Service ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        router.push('/admin/services');
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
            <Link href="/admin/services" className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {isEdit ? 'Edit Service' : 'Create New Service'}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Detail the services you offer to your clients.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Service
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
                label="Service Name"
                placeholder="e.g. Web Development"
                {...register('name', { required: 'Name is required' })}
                error={errors.name?.message}
                required
              />
              
              <div className="relative">
                <Input
                  label="URL Slug"
                  placeholder="e.g. web-development"
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
                <Textarea
                  label="Short Description"
                  placeholder="A brief summary of this service..."
                  {...register('shortDescription')}
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Featured Image</label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMediaField('featuredImage');
                        setMediaPickerOpen(true);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded"
                    >
                      Select from Media Library
                    </button>
                  </div>
                  <div className="mb-4">
                    <Input
                      placeholder="Or paste image URL here..."
                      {...register('featuredImage')}
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
                      onClick={() => {
                        setActiveMediaField('featuredImage');
                        setMediaPickerOpen(true);
                      }}
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
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Banner Image</label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMediaField('bannerImage');
                        setMediaPickerOpen(true);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded"
                    >
                      Select from Media Library
                    </button>
                  </div>
                  <div className="mb-4">
                    <Input
                      placeholder="Or paste image URL here..."
                      {...register('bannerImage')}
                    />
                  </div>
                  {watch('bannerImage') && (
                    <div className="mb-4 relative w-full max-w-md h-48 rounded-lg overflow-hidden border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={watch('bannerImage')} alt="Banner" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setValue('bannerImage', '')}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {!watch('bannerImage') && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMediaField('bannerImage');
                        setMediaPickerOpen(true);
                      }}
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

          {/* Features & Benefits */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Features & Benefits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="keyFeatures"
                control={control}
                render={({ field }) => (
                  <TagsInput
                    label="Key Features"
                    placeholder="Type a feature and click Add"
                    value={field.value || []}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="benefits"
                control={control}
                render={({ field }) => (
                  <TagsInput
                    label="Benefits"
                    placeholder="Type a benefit and click Add"
                    value={field.value || []}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Detailed Description
            </h2>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Write the detailed description of this service here..."
                />
              )}
            />
          </div>

          {/* FAQ Builder */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <button
                type="button"
                onClick={() => appendFaq({ question: '', answer: '' })}
                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Add FAQ
              </button>
            </div>
            
            <div className="space-y-4">
              {faqFields.map((item, index) => (
                <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 relative">
                  <button
                    type="button"
                    onClick={() => removeFaq(index)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="space-y-4 pr-8">
                    <Input
                      label={`Question ${index + 1}`}
                      {...register(`faq.${index}.question` as const)}
                      placeholder="E.g., How much does this cost?"
                    />
                    <Textarea
                      label={`Answer ${index + 1}`}
                      {...register(`faq.${index}.answer` as const)}
                      placeholder="Write the answer here..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              {faqFields.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-4">No FAQs added yet.</p>
              )}
            </div>
          </div>

          {/* CTA Settings */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Call to Action
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
                <Input
                  label="CTA Title"
                  placeholder="e.g. Ready to start your project?"
                  {...register('ctaTitle')}
                />
              </div>
              <Input
                label="Button Text"
                placeholder="e.g. Contact Us"
                {...register('ctaButtonText')}
              />
              <div className="md:col-span-2">
                <Input
                  label="Button URL"
                  placeholder="e.g. /contact"
                  {...register('ctaButtonUrl')}
                />
              </div>
            </div>
          </div>

          
          {/* Why Choose Us */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Why Choose Us Section</h2>
              </div>
              <button type="button" onClick={() => appendWhyChooseUs({ title: '', description: '', icon: '' })} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Add Card
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input label="Heading" {...register('whyChooseUs.heading')} placeholder="e.g. Why Choose Us?" />
              <Input label="Subheading" {...register('whyChooseUs.subheading')} placeholder="e.g. Reasons to work with us" />
            </div>
            
            <div className="space-y-4">
              {whyChooseUsFields.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-start p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 relative">
                  <div className="flex flex-col gap-2 mt-2">
                    <button type="button" onClick={() => index > 0 && moveWhyChooseUs(index, index - 1)} disabled={index === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">↑</button>
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <button type="button" onClick={() => index < whyChooseUsFields.length - 1 && moveWhyChooseUs(index, index + 1)} disabled={index === whyChooseUsFields.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">↓</button>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                    <Input label="Title" {...register(`whyChooseUs.cards.${index}.title` as const)} />
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Input label="Icon URL" {...register(`whyChooseUs.cards.${index}.icon` as const)} />
                      </div>
                      <button type="button" onClick={() => { setActiveMediaField(`whyChooseUs.cards.${index}.icon`); setMediaPickerOpen(true); }} className="mb-[2px] p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300">
                        <ImageIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                    <div className="md:col-span-2">
                      <Textarea label="Description" {...register(`whyChooseUs.cards.${index}.description` as const)} rows={2} />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeWhyChooseUs(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              {whyChooseUsFields.length === 0 && <p className="text-sm text-gray-500 italic text-center py-4">No cards added yet.</p>}
            </div>
          </div>

          {/* Testimonials */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Testimonials</h2>
              <button type="button" onClick={() => appendTestimonial({ customerName: '', review: '', rating: 5 })} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Add Testimonial
              </button>
            </div>
            <div className="space-y-4">
              {testimonialFields.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-start p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 relative">
                  <div className="flex flex-col gap-2 mt-2">
                    <button type="button" onClick={() => index > 0 && moveTestimonial(index, index - 1)} disabled={index === 0} className="text-gray-400 disabled:opacity-30">↑</button>
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <button type="button" onClick={() => index < testimonialFields.length - 1 && moveTestimonial(index, index + 1)} disabled={index === testimonialFields.length - 1} className="text-gray-400 disabled:opacity-30">↓</button>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 pr-8">
                    <Input label="Customer Name" {...register(`testimonials.${index}.customerName` as const)} />
                    <Input label="Designation" {...register(`testimonials.${index}.designation` as const)} />
                    <Input label="Company" {...register(`testimonials.${index}.company` as const)} />
                    
                    <div className="flex items-end gap-2 md:col-span-2">
                      <div className="flex-1">
                        <Input label="Image URL" {...register(`testimonials.${index}.image` as const)} />
                      </div>
                      <button type="button" onClick={() => { setActiveMediaField(`testimonials.${index}.image`); setMediaPickerOpen(true); }} className="mb-[2px] p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300">
                        <ImageIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                    <Input label="Rating (1-5)" type="number" {...register(`testimonials.${index}.rating` as const)} />
                    
                    <div className="md:col-span-3">
                      <Textarea label="Review" {...register(`testimonials.${index}.review` as const)} rows={2} />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeTestimonial(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              {testimonialFields.length === 0 && <p className="text-sm text-gray-500 italic text-center py-4">No testimonials added yet.</p>}
            </div>
          </div>

          {/* New Contact CTA */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
              Detailed Contact CTA Section
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input label="Heading" {...register('contactCTA.heading')} placeholder="e.g. Ready to get started?" />
              </div>
              <div className="md:col-span-2">
                <Textarea label="Description" {...register('contactCTA.description')} rows={2} />
              </div>
              <Input label="Button Text" {...register('contactCTA.buttonText')} placeholder="e.g. Contact Us Today" />
              <Input label="Button URL" {...register('contactCTA.buttonUrl')} placeholder="e.g. /contact" />
              <div className="md:col-span-2 flex items-end gap-2">
                <div className="flex-1">
                  <Input label="Background Image URL" {...register('contactCTA.backgroundImage')} />
                </div>
                <button type="button" onClick={() => { setActiveMediaField('contactCTA.backgroundImage'); setMediaPickerOpen(true); }} className="mb-[2px] p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                  <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
\n          {/* SEO Integration */}
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
        onClose={() => {
          setMediaPickerOpen(false);
          setActiveMediaField(null);
        }}
        onSelect={(url) => {
          if (activeMediaField) {
            setValue(activeMediaField, url, { shouldValidate: true, shouldDirty: true });
          }
        }}
        title={activeMediaField === 'featuredImage' ? 'Select Featured Image' : 'Select Banner Image'}
      />
    </div>
  );
}
