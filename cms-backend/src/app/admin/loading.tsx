"use client";
import React from 'react';
import { Spinner } from '@/components/admin/ui/Spinner';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner size="lg" />
    </div>
  );
}
