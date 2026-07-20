"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiCall } from '@/utils/apiUtils';
import { BlogDTO } from '@/types/blog.types';
import { Loader } from '@/components/admin/ui/Loader';
import { useToast } from '@/components/admin/ui/Toast';
import { ArrowLeft, Clock, User, Tag } from 'lucide-react';
import Link from 'next/link';

export default function BlogPreviewPage() {
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();
  
  const [blogData, setBlogData] = useState<BlogDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await apiCall<{ success: boolean; data: BlogDTO }>(`/api/blogs/${id}`);
        if (res.success) {
          setBlogData(res.data);
        }
      } catch (error: any) {
        showToast(error.message || 'Failed to load blog data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id, showToast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  if (!blogData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-500">
        Blog not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Admin Preview Header */}
      <div className="bg-indigo-600 text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center">
          <Link href="/admin/blogs" className="mr-4 hover:text-indigo-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-medium">Preview Mode: {blogData.title}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm bg-indigo-800 px-3 py-1 rounded-full">
            Status: {blogData.status}
          </span>
          <Link 
            href={`/admin/blogs/${blogData._id}/edit`}
            className="text-sm bg-white text-indigo-600 px-4 py-1.5 rounded-md font-medium hover:bg-indigo-50 transition-colors"
          >
            Edit Blog
          </Link>
        </div>
      </div>

      {/* Actual Blog Content Preview */}
      <main className="max-w-4xl mx-auto py-12 px-6">
        <header className="mb-10 text-center">
          {blogData.category && (
            <span className="inline-block py-1 px-3 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-sm font-semibold mb-4">
              {blogData.category.name}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {blogData.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1.5" />
              {blogData.authorName || 'Unknown Author'}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5" />
              {new Date(blogData.publishDate || blogData.createdAt).toLocaleDateString()}
            </div>
          </div>
        </header>

        {blogData.featuredImage && (
          <div className="mb-12 rounded-xl overflow-hidden shadow-lg aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={blogData.featuredImage} 
              alt={blogData.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {blogData.content ? (
          <article 
            className="prose prose-indigo lg:prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: blogData.content }}
          />
        ) : (
          <div className="p-12 text-center text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            No content provided for this blog yet.
          </div>
        )}

        {blogData.tags && blogData.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center mb-4">
              <Tag className="w-4 h-4 mr-2" /> Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {blogData.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
