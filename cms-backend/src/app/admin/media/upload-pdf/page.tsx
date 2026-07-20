"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PdfUploadRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/media?upload=true');
  }, [router]);
  return null;
}
