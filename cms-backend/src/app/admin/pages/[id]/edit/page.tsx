"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PageForm from '@/components/admin/pages/PageForm';
import { apiCall } from '@/utils/apiUtils';
import { PageDTO } from '@/types/page.types';
import { Loader } from '@/components/admin/ui/Loader';
import { useToast } from '@/components/admin/ui/Toast';

export default function EditPage() {
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
      <div className="flex justify-center items-center h-full">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        Page not found
      </div>
    );
  }

  return <PageForm initialData={pageData} isEdit />;
}
