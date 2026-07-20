"use client";

import React, { useEffect, useState } from 'react';
import { Save, Loader2, Globe, Search, BarChart, Share2 } from 'lucide-react';
import { apiCall } from '@/utils/apiUtils';
import { SeoSettingDTO } from '@/types/seo.types';
import { useToast } from '@/components/admin/ui/Toast';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';
import { Input } from '@/components/admin/ui/forms/Input';
import { Textarea } from '@/components/admin/ui/forms/Textarea';

import { PermissionWrapper } from '@/components/admin/common/PermissionWrapper';

export default function SeoManagerPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'analytics' | 'webmaster' | 'social'>('general');

  const [formData, setFormData] = useState<SeoSettingDTO>({
    siteName: '',
    defaultTitle: '',
    defaultDescription: '',
    defaultKeywords: '',
    defaultCanonicalUrl: '',
    defaultOgImage: '',
    googleAnalyticsCode: '',
    googleTagManagerCode: '',
    searchConsoleVerification: '',
    bingVerification: '',
    facebookVerification: '',
    twitterHandle: '',
  });

  const fetchSeoSettings = async () => {
    try {
      setLoading(true);
      const res = await apiCall<{success: boolean; data: SeoSettingDTO}>('/api/seo/setting');
      if (res.success && res.data) {
        setFormData(res.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch SEO settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await apiCall('/api/seo/setting', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      
      if (res.success) {
        showToast('SEO settings saved successfully', 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to save SEO settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pb-12">
      <Breadcrumb />
      
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Global SEO Settings</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your site-wide metadata, analytics, and verification tags.</p>
          </div>
          <PermissionWrapper allowedRoles={['SUPER_ADMIN', 'SEO_MANAGER']}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Settings
            </button>
          </PermissionWrapper>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
            <nav className="flex space-x-1 sm:space-x-4 px-4 sm:px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center ${activeTab === 'general' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <Globe className="w-4 h-4 mr-2" /> General SEO
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center ${activeTab === 'analytics' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <BarChart className="w-4 h-4 mr-2" /> Tracking & Analytics
              </button>
              <button
                onClick={() => setActiveTab('webmaster')}
                className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center ${activeTab === 'webmaster' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <Search className="w-4 h-4 mr-2" /> Webmaster Tools
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center ${activeTab === 'social' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <Share2 className="w-4 h-4 mr-2" /> Social Media
              </button>
            </nav>
          </div>

          <div className="p-6 space-y-6">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Site Name" 
                    value={formData.siteName}
                    onChange={(e) => setFormData({...formData, siteName: e.target.value})}
                    placeholder="e.g. My Awesome CMS"
                  />
                  <Input 
                    label="Default Canonical URL (Base URL)" 
                    value={formData.defaultCanonicalUrl}
                    onChange={(e) => setFormData({...formData, defaultCanonicalUrl: e.target.value})}
                    placeholder="e.g. https://www.example.com"
                  />
                </div>
                
                <Input 
                  label="Default Meta Title" 
                  value={formData.defaultTitle}
                  onChange={(e) => setFormData({...formData, defaultTitle: e.target.value})}
                  placeholder="Will be used if a page doesn't have its own title"
                />
                
                <Textarea 
                  label="Default Meta Description" 
                  value={formData.defaultDescription}
                  onChange={(e) => setFormData({...formData, defaultDescription: e.target.value})}
                  rows={3}
                  placeholder="A short description of your website"
                />
                
                <Textarea 
                  label="Default Meta Keywords" 
                  value={formData.defaultKeywords}
                  onChange={(e) => setFormData({...formData, defaultKeywords: e.target.value})}
                  rows={2}
                  placeholder="keyword1, keyword2, keyword3..."
                  hint="Separate keywords with commas"
                />

                <div className="pt-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default OpenGraph Image</h3>
                  <Input 
                    label="Image URL"
                    value={formData.defaultOgImage}
                    onChange={(e) => setFormData({...formData, defaultOgImage: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">Recommended size: 1200x630px. Used when pages are shared on social media.</p>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 max-w-4xl">
                <Input 
                  label="Google Analytics Measurement ID" 
                  value={formData.googleAnalyticsCode}
                  onChange={(e) => setFormData({...formData, googleAnalyticsCode: e.target.value})}
                  placeholder="e.g. G-XXXXXXXXXX"
                  hint="The unique ID for your Google Analytics 4 property."
                />
                
                <Input 
                  label="Google Tag Manager Container ID" 
                  value={formData.googleTagManagerCode}
                  onChange={(e) => setFormData({...formData, googleTagManagerCode: e.target.value})}
                  placeholder="e.g. GTM-XXXXXXX"
                  hint="The unique ID for your Google Tag Manager container."
                />
              </div>
            )}

            {/* Webmaster Tab */}
            {activeTab === 'webmaster' && (
              <div className="space-y-6 max-w-4xl">
                <Input 
                  label="Google Search Console Verification Code" 
                  value={formData.searchConsoleVerification}
                  onChange={(e) => setFormData({...formData, searchConsoleVerification: e.target.value})}
                  placeholder="e.g. xxxxxxxxxxxxxxxxxxxxxx"
                  hint="Paste only the content value from the <meta name='google-site-verification'> tag."
                />
                
                <Input 
                  label="Bing Webmaster Verification Code" 
                  value={formData.bingVerification}
                  onChange={(e) => setFormData({...formData, bingVerification: e.target.value})}
                  placeholder="e.g. xxxxxxxxxxxxxxxxxxxxxx"
                  hint="Paste only the content value from the <meta name='msvalidate.01'> tag."
                />
              </div>
            )}

            {/* Social Tab */}
            {activeTab === 'social' && (
              <div className="space-y-6 max-w-4xl">
                <Input 
                  label="Twitter Handle" 
                  value={formData.twitterHandle}
                  onChange={(e) => setFormData({...formData, twitterHandle: e.target.value})}
                  placeholder="e.g. @yourcompany"
                  hint="Used for Twitter Card attribution."
                />
                
                <Input 
                  label="Facebook Verification / App ID" 
                  value={formData.facebookVerification}
                  onChange={(e) => setFormData({...formData, facebookVerification: e.target.value})}
                  placeholder="e.g. xxxxxxxxxxxxxxxxxxxxxx"
                  hint="Used for Facebook Domain Verification or fb:app_id."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
