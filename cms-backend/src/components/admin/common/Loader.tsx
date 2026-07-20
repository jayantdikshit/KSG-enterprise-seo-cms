"use client";
import React from 'react';
import { Spinner } from '@/components/admin/ui/Spinner';

type LoaderSize = 'sm' | 'md' | 'lg';

export const Loader = ({ size = 'md' }: { size?: LoaderSize }) => {
  return <Spinner size={size} />;
};
