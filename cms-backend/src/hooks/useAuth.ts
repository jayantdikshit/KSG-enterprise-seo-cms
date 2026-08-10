"use client";
import { useContext } from 'react';
import { AuthContext } from '@/providers/AuthProvider';
import { PermissionContext } from '@/providers/PermissionProvider';

interface AuthHook {
  user: any;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, captchaToken?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useAuth = (): AuthHook => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const usePermission = () => {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error('usePermission must be used within PermissionProvider');
  return ctx;
};
