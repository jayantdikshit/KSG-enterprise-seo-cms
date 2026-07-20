"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Save, Loader2, Plus, Trash2, GripVertical } from 'lucide-react';

import { Input } from '@/components/admin/ui/forms/Input';
import { Textarea } from '@/components/admin/ui/forms/Textarea';
import { RichTextEditor } from '@/components/admin/common/RichTextEditor';
import { SEOForm } from '@/components/admin/common/SEOForm';
import { TagsInput } from '@/components/admin/ui/forms/TagsInput';
import { useToast } from '@/components/admin/ui/Toast';
import { apiCall } from '@/utils/apiUtils';
import { IAbout } from '@/types/about.types';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';
import { Loader } from '@/components/admin/ui/Loader';

export default function AboutForm() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [aboutId, setAboutId] = useState<string | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<IAbout>({
    defaultValues: {
      companyOverview: '',
      mission: '',
      vision: '',
      teamMembers: [],
      statistics: [],
      images: []
    }
  });

  const { fields: teamFields, append: appendTeam, remove: removeTeam, move: moveTeam } = useFieldArray({
    control,
    name: "teamMembers"
  });
  
  const { fields: statFields, append: appendStat, remove: removeStat, move: moveStat } = useFieldArray({
    control,
    name: "statistics"
  });

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await apiCall<{ success: boolean; data: IAbout }>('/api/about');
        if (res.success && res.data) {
          setAboutId(res.data._id || null);
          reset(res.data);
        }
      } catch (error: any) {
        if (error.message !== 'About data not found') {
          showToast(error.message || 'Failed to load about data', 'error');
        }
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAbout();
  }, [reset, showToast]);

  const onSubmit = async (data: IAbout) => {
    try {
      setLoading(true);
      
      // Basic formatting cleanup
      if (data.teamMembers) {
        data.teamMembers = data.teamMembers.map((item, index) => ({ ...item, order: index }));
      }
      if (data.statistics) {
        data.statistics = data.statistics.map((item, index) => ({ ...item, order: index, value: Number(item.value) || 0 }));
      }

      const res = await apiCall('/api/about', {
        method: aboutId ? 'PUT' : 'POST',
        body: JSON.stringify(data)
      });

      if (res.success) {
        showToast('About Page updated successfully!', 'success');
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
              About Us Page Settings
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage the content for your company's about page.
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
          
          {/* Core Content */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Core Content
            </h2>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Overview</h3>
              <Controller
                name="companyOverview"
                control={control}
                rules={{ required: 'Overview is required' }}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Write your company overview here..."
                  />
                )}
              />
              {errors.companyOverview && <p className="text-red-500 text-sm mt-1">{errors.companyOverview.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Textarea 
                label="Mission Statement" 
                {...register('mission')} 
                rows={4} 
              />
              <Textarea 
                label="Vision Statement" 
                {...register('vision')} 
                rows={4} 
              />
            </div>
            
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <TagsInput
                  label="Office/Company Images (URLs)"
                  placeholder="Paste image URL and press Enter"
                  value={field.value || []}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Statistics */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Company Statistics
              </h2>
              <button
                type="button"
                onClick={() => appendStat({ title: '', value: 0 })}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Statistic
              </button>
            </div>
            
            <div className="space-y-4">
              {statFields.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-start p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col gap-2 mt-2">
                    <button type="button" onClick={() => index > 0 && moveStat(index, index - 1)} disabled={index === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">↑</button>
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <button type="button" onClick={() => index < statFields.length - 1 && moveStat(index, index + 1)} disabled={index === statFields.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">↓</button>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <Input label="Title" {...register(`statistics.${index}.title` as const)} placeholder="e.g. Happy Clients" />
                    </div>
                    <Input label="Value" type="number" {...register(`statistics.${index}.value` as const)} placeholder="100" />
                    <Input label="Suffix" {...register(`statistics.${index}.suffix` as const)} placeholder="+, %, k" />
                  </div>
                  
                  <button type="button" onClick={() => removeStat(index)} className="p-2 mt-6 text-red-500 hover:bg-red-50 rounded-md">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {statFields.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-4">No statistics added yet.</p>
              )}
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Team Members
              </h2>
              <button
                type="button"
                onClick={() => appendTeam({ name: '', designation: '' })}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Team Member
              </button>
            </div>
            
            <div className="space-y-6">
              {teamFields.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-start p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 relative">
                  <div className="flex flex-col gap-2 mt-2">
                    <button type="button" onClick={() => index > 0 && moveTeam(index, index - 1)} disabled={index === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">↑</button>
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <button type="button" onClick={() => index < teamFields.length - 1 && moveTeam(index, index + 1)} disabled={index === teamFields.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">↓</button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeTeam(index)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                    <Input label="Name" {...register(`teamMembers.${index}.name` as const, { required: 'Required' })} />
                    <Input label="Designation" {...register(`teamMembers.${index}.designation` as const)} />
                    <Input label="Image URL" {...register(`teamMembers.${index}.image` as const)} />
                    <Input label="Email" {...register(`teamMembers.${index}.email` as const)} />
                    <Input label="LinkedIn URL" {...register(`teamMembers.${index}.linkedin` as const)} />
                    <Input label="Twitter URL" {...register(`teamMembers.${index}.twitter` as const)} />
                  </div>
                </div>
              ))}
              {teamFields.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-4">No team members added yet.</p>
              )}
            </div>
          </div>

          {/* SEO Integration */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              SEO Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <Input label="Meta Title" {...register('seoTitle')} />
              <Input label="Meta Keywords" {...register('metaKeywords')} placeholder="Comma separated" />
              <div className="md:col-span-2">
                <Textarea label="Meta Description" {...register('metaDescription')} rows={3} />
              </div>
              <Input label="OG Title" {...register('ogTitle')} />
              <Input label="OG Image URL" {...register('ogImage')} />
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
