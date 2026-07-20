"use client";
import React, { createContext, useContext, ReactNode } from 'react';
// Duplicate export removed; PermissionContext defined later
import { ROLE_PERMISSIONS } from '@/config/permissions.config';

interface PermissionContextProps {
  role: string | null;
  hasRole: (role: string) => boolean;
  hasPermission: (perm: string) => boolean;
}

export const PermissionContext = createContext<PermissionContextProps | undefined>(undefined);

export const PermissionProvider = ({ children, role }: { children: ReactNode; role?: string }) => {
  // role can be passed from server side or derived from AuthContext; fallback to null
  const userRole = role || null;

  const hasRole = (r: string) => userRole === r;

  const hasPermission = (perm: string) => {
    if (!userRole) return false;
    const perms = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
    if (!perms) return false;
    // '*' means all permissions
    if (perms.includes('*')) return true;
    return perms.includes(perm);
  };

  const value: PermissionContextProps = {
    role: userRole,
    hasRole,
    hasPermission,
  };

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

export const usePermission = () => {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error('usePermission must be used within PermissionProvider');
  return ctx;
};
