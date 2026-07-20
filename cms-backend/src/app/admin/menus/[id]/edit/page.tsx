"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MenuForm from '@/components/admin/menus/MenuForm';
import { apiCall } from '@/utils/apiUtils';
import { MenuDTO } from '@/types/menu.types';
import { Loader } from '@/components/admin/ui/Loader';
import { useToast } from '@/components/admin/ui/Toast';

export default function EditMenu() {
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();
  
  const [menuData, setMenuData] = useState<MenuDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await apiCall<{ success: boolean; data: MenuDTO }>(`/api/menus/${id}`);
        if (res.success) {
          setMenuData(res.data);
        }
      } catch (error: any) {
        showToast(error.message || 'Failed to load menu data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMenu();
    }
  }, [id, showToast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        Menu not found
      </div>
    );
  }

  return <MenuForm initialData={menuData} isEdit />;
}
