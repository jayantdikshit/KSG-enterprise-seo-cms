"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Save, Loader2, Plus, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';

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
import { MediaPickerModal } from '@/components/admin/common/MediaPickerModal';

export default function AboutForm() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [aboutId, setAboutId] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [activeMediaField, setActiveMediaField] = useState<any>(null);

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<IAbout>({
    defaultValues: {
      pageTitle: '',
      pageTitleHighlight: '',
      pageSubtitle: '',
      companyOverview: '',
      mission: '',
      vision: '',
      teamMembers: [],
      statistics: [],
      images: [],
      whyChooseUs: { heading: '', subheading: '', cards: [] },
      testimonials: [],
      faq: [],
      contactCTA: { heading: '', description: '', buttonText: '', buttonUrl: '', backgroundImage: '' }
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
      if (data.whyChooseUs?.cards) {
         data.whyChooseUs.cards = data.whyChooseUs.cards.map((c, i) => ({...c, order: i}));
      }
      if (data.testimonials) {
         data.testimonials = data.testimonials.map((c, i) => ({...c, order: i}));
      }
      if (data.faq) {
         data.faq = data.faq.map((c, i) => ({...c, order: i}));
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

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Page Title (White Text)" 
                  placeholder="e.g. About"
                  {...register('pageTitle')} 
                />
                <Input 
                  label="Page Title Highlight (Green Text)" 
                  placeholder="e.g. Our Company"
                  {...register('pageTitleHighlight')} 
                />
              </div>
              <Textarea 
                label="Page Subtitle" 
                placeholder="e.g. Discover our mission, vision, and core values..."
                {...register('pageSubtitle')} 
                rows={2} 
              />
            </div>
            
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
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Office/Company Images</label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMediaField('company');
                    setMediaPickerOpen(true);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded flex items-center"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Image
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {(watch('images') || []).map((imgUrl, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                    <img src={imgUrl} alt="Company" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => {
                        const newImages = [...(watch('images') || [])];
                        newImages.splice(idx, 1);
                        setValue('images', newImages, { shouldValidate: true, shouldDirty: true });
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
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
                    
                    <div className="col-span-1 md:col-span-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Image</label>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMediaField(index);
                            setMediaPickerOpen(true);
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded"
                        >
                          Select Image
                        </button>
                      </div>
                      {watch(`teamMembers.${index}.image`) ? (
                        <div className="flex items-center space-x-3 mt-2">
                          <img src={watch(`teamMembers.${index}.image`)} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                          <button type="button" onClick={() => setValue(`teamMembers.${index}.image`, '', { shouldDirty: true })} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 italic mt-2">No image selected</div>
                      )}
                    </div>
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
              control={control as any}
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
          if (activeMediaField === 'company') {
            const currentImages = watch('images') || [];
            setValue('images', [...currentImages, url], { shouldDirty: true });
          } else if (typeof activeMediaField === 'string' && activeMediaField.includes('.')) {
            setValue(activeMediaField as any, url, { shouldDirty: true, shouldValidate: true });
          } else if (typeof activeMediaField === 'number') {
            setValue(`teamMembers.${activeMediaField}.image`, url, { shouldDirty: true });
          }
        }}
      />
    </div>
  );
}
