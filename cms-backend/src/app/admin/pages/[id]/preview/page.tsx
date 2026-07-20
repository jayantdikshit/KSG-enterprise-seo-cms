"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiCall } from '@/utils/apiUtils';
import { PageDTO } from '@/types/page.types';
import { Loader } from '@/components/admin/ui/Loader';
import { useToast } from '@/components/admin/ui/Toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PreviewPage() {
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();
  
  const [pageData, setPageData] = useState<PageDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await apiCall<{ success: boolean; data: PageDTO }>(`/api/pages/${id}`);
        if (res.success) {
          setPageData(res.data);
        }
      } catch (error: any) {
        showToast(error.message || 'Failed to load page data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPage();
    }
  }, [id, showToast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-500">
        Page not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Admin Preview Header */}
      <div className="bg-indigo-600 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <Link href="/admin/pages" className="mr-4 hover:text-indigo-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-medium">Preview Mode: {pageData.title}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm bg-indigo-800 px-3 py-1 rounded-full">
            Status: {pageData.status}
          </span>
          <Link 
            href={`/admin/pages/${pageData._id}/edit`}
            className="text-sm bg-white text-indigo-600 px-4 py-1.5 rounded-md font-medium hover:bg-indigo-50 transition-colors"
          >
            Edit Page
          </Link>
        </div>
      </div>

      {/* Actual Page Content Preview */}
      <main className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          {pageData.title}
        </h1>
        
        {pageData.content ? (
          <div 
            className="prose prose-indigo max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: pageData.content }}
          />
        ) : (
          <div className="p-12 text-center text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            No content provided for this page yet.
          </div>
        )}
      </main>
    </div>
  );
}
