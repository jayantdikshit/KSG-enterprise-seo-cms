"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';

import { Input } from '@/components/admin/ui/forms/Input';
import { Textarea } from '@/components/admin/ui/forms/Textarea';
import { Select } from '@/components/admin/ui/forms/Select';
import { SEOForm } from '@/components/admin/common/SEOForm';
import { useToast } from '@/components/admin/ui/Toast';
import { apiCall } from '@/utils/apiUtils';
import { IHomePage } from '@/types/homepage.types';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';
import { Loader } from '@/components/admin/ui/Loader';

export default function HomepageForm() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [homepageId, setHomepageId] = useState<string | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<IHomePage>({
    defaultValues: {
      hero: { headline: '', subheadline: '' },
      status: 'DRAFT'
    }
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control,
    name: "faq"
  });
  
  const { fields: testimonialFields, append: appendTestimonial, remove: removeTestimonial } = useFieldArray({
    control,
    name: "testimonials"
  });

  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        const res = await apiCall<{ success: boolean; data: IHomePage }>('/api/homepage');
        if (res.success && res.data) {
          setHomepageId(res.data._id || null);
          reset(res.data);
        }
      } catch (error: any) {
        // If not found, it might be the first time setting it up. Just ignore 404s.
        if (error.message !== 'Homepage not found') {
          showToast(error.message || 'Failed to load homepage data', 'error');
        }
      } finally {
        setInitialLoading(false);
      }
    };

    fetchHomepage();
  }, [reset, showToast]);

  const onSubmit = async (data: IHomePage) => {
    try {
      setLoading(true);
      const res = await apiCall('/api/homepage', {
        method: homepageId ? 'PUT' : 'POST', // Depending on backend implementation, might always be POST or PUT
        body: JSON.stringify(data)
      });

      if (res.success) {
        showToast('Homepage updated successfully!', 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="flex justify-center items-center h-full"><Loader size="lg" /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pb-12">
      <Breadcrumb />
      
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Homepage Settings
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage the content for your website's main landing page.
            </p>
          </div>
          
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </button>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          
          {/* Status */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
             <div className="max-w-xs">
                <Select
                  label="Publish Status"
                  {...register('status')}
                  options={[
                    { label: 'Draft', value: 'DRAFT' },
                    { label: 'Published', value: 'PUBLISHED' }
                  ]}
                />
             </div>
          </div>

          {/* Hero Section */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Hero Section
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Headline"
                  {...register('hero.headline', { required: 'Headline is required' })}
                  error={errors.hero?.headline?.message}
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  label="Subheadline"
                  {...register('hero.subheadline', { required: 'Subheadline is required' })}
                  error={errors.hero?.subheadline?.message}
                />
              </div>
              
              <Input label="Background Image URL" {...register('hero.backgroundImage')} />
              <Input label="Mobile Background Image URL" {...register('hero.backgroundMobileImage')} />
              
              {/* Primary CTA */}
              <div className="p-4 border rounded-md border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Primary CTA</h3>
                <div className="space-y-4">
                  <Input label="Button Text" {...register('hero.primaryCTA.text')} />
                  <Input label="Button URL" {...register('hero.primaryCTA.url')} />
                </div>
              </div>

              {/* Secondary CTA */}
              <div className="p-4 border rounded-md border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Secondary CTA</h3>
                <div className="space-y-4">
                  <Input label="Button Text" {...register('hero.secondaryCTA.text')} />
                  <Input label="Button URL" {...register('hero.secondaryCTA.url')} />
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              About Section
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input label="Heading" {...register('about.heading')} />
              </div>
              <div className="md:col-span-2">
                <Textarea label="Description" {...register('about.description')} rows={4} />
              </div>
              <Input label="Image URL" {...register('about.image')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Button Text" {...register('about.buttonText')} />
                <Input label="Button URL" {...register('about.buttonUrl')} />
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Testimonials
              </h2>
              <button
                type="button"
                onClick={() => appendTestimonial({ customerName: '', review: '' })}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Testimonial
              </button>
            </div>
            
            <div className="space-y-6">
              {testimonialFields.map((item, index) => (
                <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 relative">
                  <button
                    type="button"
                    onClick={() => removeTestimonial(index)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                    <Input label="Customer Name" {...register(`testimonials.${index}.customerName` as const)} />
                    <Input label="Designation" {...register(`testimonials.${index}.designation` as const)} />
                    <Input label="Company" {...register(`testimonials.${index}.company` as const)} />
                    <Input label="Rating (1-5)" type="number" {...register(`testimonials.${index}.rating` as const)} />
                    <div className="md:col-span-2">
                      <Textarea label="Review" {...register(`testimonials.${index}.review` as const)} rows={2} />
                    </div>
                  </div>
                </div>
              ))}
              {testimonialFields.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-4">No testimonials added yet.</p>
              )}
            </div>
          </div>

          {/* SEO Integration */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              SEO Settings
            </h2>
            {/* The SEOForm component expects standard keys at the root level, but for Homepage, SEO fields are nested under `seo`. We need to pass a specific prefix or adapt it. For simplicity, we can manually define the nested fields here since SEOForm expects flat structure. Actually, we can use the `register` with `seo.` prefix if we build it manually, or if SEOForm supports nested structure, but we didn't add nested prefix support in SEOForm yet. Let's just do it manually for homepage to be safe, or just adapt SEOForm. Wait, we can just use `register('seo.title')` etc. */}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <Input label="Meta Title" {...register('seo.title')} />
              <Input label="Meta Keywords" {...register('seo.metaKeywords')} placeholder="Comma separated" />
              <div className="md:col-span-2">
                <Textarea label="Meta Description" {...register('seo.metaDescription')} rows={3} />
              </div>
              <Input label="OG Title" {...register('seo.ogTitle')} />
              <Input label="OG Image URL" {...register('seo.ogImage')} />
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
