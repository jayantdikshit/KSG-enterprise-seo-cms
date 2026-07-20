"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CategoryForm from '@/components/admin/categories/CategoryForm';
import { apiCall } from '@/utils/apiUtils';
import { CategoryDTO } from '@/types/category.types';
import { Loader } from '@/components/admin/ui/Loader';
import { useToast } from '@/components/admin/ui/Toast';

export default function EditCategory() {
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();
  
  const [categoryData, setCategoryData] = useState<CategoryDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await apiCall<{ success: boolean; data: CategoryDTO }>(`/api/blogs/categories/${id}`);
        if (res.success) {
          setCategoryData(res.data);
        }
      } catch (error: any) {
        showToast(error.message || 'Failed to load category data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id, showToast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        Category not found
      </div>
    );
  }

  return <CategoryForm initialData={categoryData} isEdit />;
}
