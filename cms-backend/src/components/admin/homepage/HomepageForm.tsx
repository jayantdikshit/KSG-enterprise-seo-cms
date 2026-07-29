"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Save, Loader2, Plus, Trash2, GripVertical, Image as ImageIcon, Layout, Settings, FileText, Phone, ListChecks } from 'lucide-react';

import { Input } from '@/components/admin/ui/forms/Input';
import { Textarea } from '@/components/admin/ui/forms/Textarea';
import { Select } from '@/components/admin/ui/forms/Select';
import { useToast } from '@/components/admin/ui/Toast';
import { apiCall } from '@/utils/apiUtils';
import { IHomePage } from '@/types/homepage.types';
import { ServiceDTO } from '@/types/service.types';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';
import { Loader } from '@/components/admin/ui/Loader';
import { MediaPickerModal } from '@/components/admin/common/MediaPickerModal';

type Tab = 'hero' | 'content' | 'dynamic' | 'footer' | 'seo';

export default function HomepageForm() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [homepageId, setHomepageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('hero');
  const [servicesList, setServicesList] = useState<ServiceDTO[]>([]);
  
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [activeMediaField, setActiveMediaField] = useState<any>(null);

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<IHomePage>({
    defaultValues: {
      hero: { headline: '', subheadline: '' },
      about: { heading: '', description: '', image: '', buttonText: '', buttonUrl: '' },
      services: { heading: '', description: '', selectedServices: [], showSection: true },
      whyChooseUs: { heading: '', subheading: '', cards: [] },
      testimonials: [],
      faq: [],
      contactCTA: { heading: '', description: '', buttonText: '', buttonUrl: '', backgroundImage: '' },
      footer: { copyright: '', address: '', phone: '', email: '', socialLinks: {} },
      seo: { title: '', metaDescription: '', metaKeywords: '', canonicalUrl: '', ogTitle: '', ogDescription: '', ogImage: '', twitterCard: 'summary_large_image', twitterTitle: '', twitterDescription: '', twitterImage: '', schemaMarkup: '', robotsIndex: true, robotsFollow: true },
      status: 'DRAFT'
    }
  });

  const { fields: whyChooseUsFields, append: appendWhyChooseUs, remove: removeWhyChooseUs, move: moveWhyChooseUs } = useFieldArray({
    control,
    name: "whyChooseUs.cards"
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq, move: moveFaq } = useFieldArray({
    control,
    name: "faq"
  });
  
  const { fields: testimonialFields, append: appendTestimonial, remove: removeTestimonial, move: moveTestimonial } = useFieldArray({
    control,
    name: "testimonials"
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [homepageRes, servicesRes] = await Promise.all([
          apiCall<{ success: boolean; data: IHomePage }>('/api/homepage').catch(() => null),
          apiCall<{ success: boolean; data: { services: ServiceDTO[] } }>('/api/services').catch(() => null)
        ]);
        
        if (servicesRes && servicesRes.success && servicesRes.data?.services) {
           setServicesList(servicesRes.data.services);
        }

        if (homepageRes && homepageRes.success && homepageRes.data) {
          setHomepageId(homepageRes.data._id || null);
          reset(homepageRes.data);
        }
      } catch (error: any) {
        showToast(error.message || 'Failed to load data', 'error');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [reset, showToast]);

  const onSubmit = async (data: IHomePage) => {
    try {
      setLoading(true);
      
      if (data.whyChooseUs?.cards) {
         data.whyChooseUs.cards = data.whyChooseUs.cards.map((c, i) => ({...c, order: i}));
      }
      if (data.faq) {
         data.faq = data.faq.map((c, i) => ({...c, order: i}));
      }
      if (data.testimonials) {
         data.testimonials = data.testimonials.map((c, i) => ({...c, order: i}));
      }

      const res = await apiCall('/api/homepage', {
        method: homepageId ? 'PUT' : 'POST',
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

  const openMediaPicker = (fieldName: any) => {
    setActiveMediaField(fieldName);
    setMediaPickerOpen(true);
  };

  if (initialLoading) {
    return <div className="flex justify-center items-center h-full"><Loader size="lg" /></div>;
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'hero', label: 'Hero & General', icon: <Layout className="w-4 h-4 mr-2" /> },
    { id: 'content', label: 'About & Services', icon: <FileText className="w-4 h-4 mr-2" /> },
    { id: 'dynamic', label: 'Dynamic Lists', icon: <ListChecks className="w-4 h-4 mr-2" /> },
    { id: 'footer', label: 'Footer & Contact', icon: <Phone className="w-4 h-4 mr-2" /> },
    { id: 'seo', label: 'SEO Settings', icon: <Settings className="w-4 h-4 mr-2" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pb-20 relative">
      <Breadcrumb />
      
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Homepage Settings
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage all content sections and SEO for your main landing page.
            </p>
          </div>
          
          <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-40">
              <Select
                {...register('status')}
                options={[
                  { label: 'Draft', value: 'DRAFT' },
                  { label: 'Published', value: 'PUBLISHED' }
                ]}
                className="!mb-0"
              />
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
        </div>

        {/* Custom Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6 flex overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          
          {/* TAB 1: HERO */}
          {activeTab === 'hero' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
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
                      rows={3}
                    />
                  </div>
                  
                  <div className="col-span-1 flex items-end gap-2">
                    <div className="flex-1">
                      <Input label="Background Image URL" {...register('hero.backgroundImage')} />
                    </div>
                    <button type="button" onClick={() => openMediaPicker('hero.backgroundImage')} className="mb-[2px] p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                      <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>

                  <div className="col-span-1 flex items-end gap-2">
                    <div className="flex-1">
                      <Input label="Mobile Background Image URL" {...register('hero.backgroundMobileImage')} />
                    </div>
                    <button type="button" onClick={() => openMediaPicker('hero.backgroundMobileImage')} className="mb-[2px] p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                      <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>

                  <div className="md:col-span-2">
                     <Input label="Video Background URL (Optional)" placeholder="e.g. YouTube or direct MP4 link" {...register('hero.videoUrl')} />
                  </div>
                  
                  {/* Primary CTA */}
                  <div className="p-4 border rounded-md border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Primary CTA</h3>
                    <div className="space-y-4">
                      <Input label="Button Text" {...register('hero.primaryCTA.text')} placeholder="e.g. Get Started" />
                      <Input label="Button URL" {...register('hero.primaryCTA.url')} placeholder="e.g. /contact" />
                    </div>
                  </div>

                  {/* Secondary CTA */}
                  <div className="p-4 border rounded-md border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Secondary CTA</h3>
                    <div className="space-y-4">
                      <Input label="Button Text" {...register('hero.secondaryCTA.text')} placeholder="e.g. Learn More" />
                      <Input label="Button URL" {...register('hero.secondaryCTA.url')} placeholder="e.g. /about" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTENT */}
          {activeTab === 'content' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* About Section */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                  About Section
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input label="Heading" {...register('about.heading')} placeholder="e.g. About Our Company" />
                  </div>
                  <div className="md:col-span-2">
                    <Textarea label="Description" {...register('about.description')} rows={4} placeholder="Write a short summary..." />
                  </div>
                  <div className="col-span-1 md:col-span-2 flex items-end gap-2">
                    <div className="flex-1">
                      <Input label="Image URL" {...register('about.image')} />
                    </div>
                    <button type="button" onClick={() => openMediaPicker('about.image')} className="mb-[2px] p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                      <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                  <Input label="Button Text" {...register('about.buttonText')} placeholder="e.g. Read More" />
                  <Input label="Button URL" {...register('about.buttonUrl')} placeholder="e.g. /about" />
                </div>
              </div>

              {/* Services Section */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Services Section</h2>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="showServices" {...register('services.showSection')} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <label htmlFor="showServices" className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Section</label>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <Input label="Heading" {...register('services.heading')} placeholder="e.g. Our Core Services" />
                  <Textarea label="Description" {...register('services.description')} rows={2} placeholder="Short text below heading..." />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Services to Display</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                      {servicesList.length === 0 ? (
                        <p className="text-sm text-gray-500 col-span-full">No services found. Create some services first.</p>
                      ) : (
                        servicesList.map(service => (
                          <div key={service._id} className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded shadow-sm border border-gray-100 dark:border-gray-700">
                            <input 
                              type="checkbox" 
                              value={service._id} 
                              id={`svc-${service._id}`}
                              {...register('services.selectedServices')}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor={`svc-${service._id}`} className="text-sm text-gray-800 dark:text-gray-200 truncate cursor-pointer">{service.name}</label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC LISTS */}
          {activeTab === 'dynamic' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
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
                          <button type="button" onClick={() => openMediaPicker(`whyChooseUs.cards.${index}.icon`)} className="mb-[2px] p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300">
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
                          <button type="button" onClick={() => openMediaPicker(`testimonials.${index}.image`)} className="mb-[2px] p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300">
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
            </div>
          )}

          {/* TAB 4: FOOTER & CTA */}
          {activeTab === 'footer' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Contact CTA Section */}
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
                    <button type="button" onClick={() => openMediaPicker('contactCTA.backgroundImage')} className="mb-[2px] p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                      <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Content */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                  Footer Content
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input label="Copyright Text" {...register('footer.copyright')} placeholder="e.g. © 2026 Your Company. All rights reserved." />
                  </div>
                  <div className="md:col-span-2">
                    <Textarea label="Address" {...register('footer.address')} rows={2} />
                  </div>
                  <Input label="Phone Number" {...register('footer.phone')} />
                  <Input label="Email Address" {...register('footer.email')} />
                  
                  <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                    <h3 className="font-medium mb-4 text-gray-800 dark:text-gray-200">Social Media Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Facebook URL" {...register('footer.socialLinks.facebook')} />
                      <Input label="Twitter URL" {...register('footer.socialLinks.twitter')} />
                      <Input label="LinkedIn URL" {...register('footer.socialLinks.linkedin')} />
                      <Input label="Instagram URL" {...register('footer.socialLinks.instagram')} />
                      <Input label="YouTube URL" {...register('footer.socialLinks.youtube')} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SEO SETTINGS */}
          {activeTab === 'seo' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  SEO Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="SEO Title" {...register('seo.title')} placeholder="Max 60 characters" />
                  <Input label="Canonical URL" {...register('seo.canonicalUrl')} placeholder="e.g. https://www.yourdomain.com/" />
                  <div className="md:col-span-2">
                    <Textarea label="Meta Description" {...register('seo.metaDescription')} rows={3} placeholder="Max 160 characters" />
                  </div>
                  <div className="md:col-span-2">
                    <Input label="Meta Keywords" {...register('seo.metaKeywords')} placeholder="Comma separated, e.g. staffing, finance, jobs" />
                  </div>

                  {/* Open Graph */}
                  <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                    <h3 className="font-medium mb-4 text-gray-800 dark:text-gray-200">Open Graph (Facebook/LinkedIn)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="OG Title" {...register('seo.ogTitle')} />
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Input label="OG Image URL" {...register('seo.ogImage')} />
                        </div>
                        <button type="button" onClick={() => openMediaPicker('seo.ogImage')} className="mb-[2px] p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                          <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                      </div>
                      <div className="md:col-span-2">
                        <Textarea label="OG Description" {...register('seo.ogDescription')} rows={2} />
                      </div>
                    </div>
                  </div>

                  {/* Twitter Cards */}
                  <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                    <h3 className="font-medium mb-4 text-gray-800 dark:text-gray-200">Twitter Cards</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select label="Card Type" {...register('seo.twitterCard')} options={[
                        {label: 'Summary', value: 'summary'},
                        {label: 'Summary Large Image', value: 'summary_large_image'}
                      ]} />
                      <Input label="Twitter Title" {...register('seo.twitterTitle')} />
                      <div className="md:col-span-2 flex items-end gap-2">
                        <div className="flex-1">
                          <Input label="Twitter Image URL" {...register('seo.twitterImage')} />
                        </div>
                        <button type="button" onClick={() => openMediaPicker('seo.twitterImage')} className="mb-[2px] p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                          <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                      </div>
                      <div className="md:col-span-2">
                        <Textarea label="Twitter Description" {...register('seo.twitterDescription')} rows={2} />
                      </div>
                    </div>
                  </div>

                  {/* Schema Markup */}
                  <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                    <h3 className="font-medium mb-4 text-gray-800 dark:text-gray-200">Schema Markup (JSON-LD)</h3>
                    <Textarea 
                      label="Custom JSON-LD" 
                      {...register('seo.schemaMarkup')} 
                      rows={6} 
                      className="font-mono text-xs" 
                      placeholder='{ "@context": "https://schema.org", "@type": "Organization" }' 
                    />
                  </div>

                  {/* Robots */}
                  <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2 flex gap-6">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="robotsIndex" {...register('seo.robotsIndex')} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <label htmlFor="robotsIndex" className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Search Engines to Index (Index)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="robotsFollow" {...register('seo.robotsFollow')} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <label htmlFor="robotsFollow" className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Search Engines to Follow Links (Follow)</label>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

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
        title="Select Media"
      />
    </div>
  );
}
