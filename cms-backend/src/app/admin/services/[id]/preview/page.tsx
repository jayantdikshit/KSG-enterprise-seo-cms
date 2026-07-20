"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiCall } from '@/utils/apiUtils';
import { ServiceDTO } from '@/types/service.types';
import { Loader } from '@/components/admin/ui/Loader';
import { useToast } from '@/components/admin/ui/Toast';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ServicePreviewPage() {
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();
  
  const [serviceData, setServiceData] = useState<ServiceDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await apiCall<{ success: boolean; data: ServiceDTO }>(`/api/services/${id}`);
        if (res.success) {
          setServiceData(res.data);
        }
      } catch (error: any) {
        showToast(error.message || 'Failed to load service data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id, showToast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-500">
        Service not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Admin Preview Header */}
      <div className="bg-indigo-600 text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center">
          <Link href="/admin/services" className="mr-4 hover:text-indigo-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-medium">Preview Mode: {serviceData.name}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm bg-indigo-800 px-3 py-1 rounded-full">
            Status: {serviceData.status}
          </span>
          <Link 
            href={`/admin/services/${serviceData._id}/edit`}
            className="text-sm bg-white text-indigo-600 px-4 py-1.5 rounded-md font-medium hover:bg-indigo-50 transition-colors"
          >
            Edit Service
          </Link>
        </div>
      </div>

      {/* Actual Service Content Preview */}
      <main>
        {/* Hero Section */}
        <section className="relative bg-gray-900 text-white py-24 px-6 overflow-hidden">
          {serviceData.bannerImage && (
            <div className="absolute inset-0 z-0 opacity-40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={serviceData.bannerImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              {serviceData.name}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
              {serviceData.shortDescription}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto py-16 px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {serviceData.featuredImage && (
              <div className="rounded-xl overflow-hidden shadow-lg aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={serviceData.featuredImage} 
                  alt={serviceData.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="prose prose-indigo max-w-none dark:prose-invert">
              {serviceData.description ? (
                <div dangerouslySetInnerHTML={{ __html: serviceData.description }} />
              ) : (
                <p className="text-gray-500 italic">No detailed description provided.</p>
              )}
            </div>

            {/* FAQs */}
            {serviceData.faq && serviceData.faq.length > 0 && (
              <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-800">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {serviceData.faq.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.question}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Key Features */}
            {serviceData.keyFeatures && serviceData.keyFeatures.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Key Features</h3>
                <ul className="space-y-4">
                  {serviceData.keyFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3 shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {serviceData.benefits && serviceData.benefits.length > 0 && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-8 border border-indigo-100 dark:border-indigo-800">
                <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mb-6">Why Choose This?</h3>
                <ul className="space-y-4">
                  {serviceData.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-3 shrink-0" />
                      <span className="text-indigo-800 dark:text-indigo-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            {serviceData.ctaTitle && (
              <div className="bg-indigo-600 text-white rounded-xl p-8 text-center shadow-lg">
                <h3 className="text-2xl font-bold mb-4">{serviceData.ctaTitle}</h3>
                {serviceData.ctaButtonText && (
                  <Link 
                    href={serviceData.ctaButtonUrl || '#'}
                    className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors w-full"
                  >
                    {serviceData.ctaButtonText}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
