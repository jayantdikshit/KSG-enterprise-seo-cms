"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ServiceForm from '@/components/admin/services/ServiceForm';
import { apiCall } from '@/utils/apiUtils';
import { ServiceDTO } from '@/types/service.types';
import { Loader } from '@/components/admin/ui/Loader';
import { useToast } from '@/components/admin/ui/Toast';

export default function EditService() {
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
      <div className="flex justify-center items-center h-full">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        Service not found
      </div>
    );
  }

  return <ServiceForm initialData={serviceData} isEdit />;
}
