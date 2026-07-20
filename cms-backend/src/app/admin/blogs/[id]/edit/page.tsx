"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BlogForm from '@/components/admin/blogs/BlogForm';
import { apiCall } from '@/utils/apiUtils';
import { BlogDTO } from '@/types/blog.types';
import { Loader } from '@/components/admin/ui/Loader';
import { useToast } from '@/components/admin/ui/Toast';

export default function EditBlog() {
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
      <div className="flex justify-center items-center h-full">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  if (!blogData) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        Blog not found
      </div>
    );
  }

  return <BlogForm initialData={blogData} isEdit />;
}
