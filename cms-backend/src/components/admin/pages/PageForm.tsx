"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Save, ArrowLeft, Loader2, Plus, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

import { Input } from '@/components/admin/ui/forms/Input';
import { Textarea } from '@/components/admin/ui/forms/Textarea';
import { Select } from '@/components/admin/ui/forms/Select';
import { Toggle } from '@/components/admin/ui/Toggle';
import { SEOForm } from '@/components/admin/common/SEOForm';
import { RichTextEditor } from '@/components/admin/common/RichTextEditor';
import { useToast } from '@/components/admin/ui/Toast';
import { apiCall } from '@/utils/apiUtils';
import { PageDTO, CreatePageDTO, UpdatePageDTO } from '@/types/page.types';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';
import { MediaPickerModal } from '@/components/admin/common/MediaPickerModal';
import { PageBuilder } from '@/components/admin/pages/PageBuilder';

interface PageFormProps {
  initialData?: PageDTO;
  isEdit?: boolean;
}

export default function PageForm({ initialData, isEdit = false }: PageFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [activeMediaField, setActiveMediaField] = useState<any>(null);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<CreatePageDTO>({
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      status: initialData?.status || 'DRAFT',
      content: initialData?.content || '',
      whyChooseUs: initialData?.whyChooseUs || { heading: '', subheading: '', cards: [] },
      testimonials: initialData?.testimonials || [],
      faq: initialData?.faq || [],
      contactCTA: initialData?.contactCTA || { heading: '', description: '', buttonText: '', buttonUrl: '', backgroundImage: '' },
      
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
      sections: initialData?.sections || [],
    }
  });

  const { fields: whyChooseUsFields, append: appendWhyChooseUs, remove: removeWhyChooseUs, move: moveWhyChooseUs } = useFieldArray({
    control,
    name: "whyChooseUs.cards"
  });
  
  const { fields: testimonialFields, append: appendTestimonial, remove: removeTestimonial, move: moveTestimonial } = useFieldArray({
    control,
    name: "testimonials"
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq, move: moveFaq } = useFieldArray({
    control,
    name: "faq"
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
      if (data.whyChooseUs?.cards) {
         data.whyChooseUs.cards = data.whyChooseUs.cards.map((c, i) => ({...c, order: i}));
      }
      if (data.testimonials) {
         data.testimonials = data.testimonials.map((c, i) => ({...c, order: i}));
      }
      if (data.faq) {
         data.faq = data.faq.map((c, i) => ({...c, order: i}));
      }
      
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

          {/* Dynamic Page Builder */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <Controller
              name="sections"
              control={control}
              render={({ field }) => (
                <PageBuilder sections={field.value || []} onChange={field.onChange} />
              )}
            />
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

          {/* FAQs */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Frequently Asked Questions</h2>
              <button type="button" onClick={() => appendFaq({ question: '', answer: '' })} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Add FAQ
              </button>
            </div>
            <div className="space-y-4">
              {faqFields.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-start p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 relative">
                  <div className="flex flex-col gap-2 mt-2">
                    <button type="button" onClick={() => index > 0 && moveFaq(index, index - 1)} disabled={index === 0} className="text-gray-400 disabled:opacity-30">↑</button>
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <button type="button" onClick={() => index < faqFields.length - 1 && moveFaq(index, index + 1)} disabled={index === faqFields.length - 1} className="text-gray-400 disabled:opacity-30">↓</button>
                  </div>
                  <div className="flex-1 space-y-4 pr-8">
                    <Input label="Question" {...register(`faq.${index}.question` as const, { required: 'Required' })} />
                    <Textarea label="Answer" {...register(`faq.${index}.answer` as const)} rows={2} />
                  </div>
                  <button type="button" onClick={() => removeFaq(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              {faqFields.length === 0 && <p className="text-sm text-gray-500 italic text-center py-4">No FAQs added yet.</p>}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
              Contact CTA Section
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
          if (activeMediaField && typeof activeMediaField === 'string' && activeMediaField.includes('.')) {
            setValue(activeMediaField as any, url, { shouldDirty: true, shouldValidate: true });
          }
        }}
      />
    </div>
  );
}

