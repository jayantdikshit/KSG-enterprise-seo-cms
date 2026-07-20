import React from 'react';
import { useAuth } from '@/hooks/useAuth';

type RoleName = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'MARKETING_MANAGER' | 'VIEWER' | string;

interface PermissionWrapperProps {
  children: React.ReactNode;
  allowedRoles?: RoleName[];
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  allowedRoles,
  requiredPermissions,
  fallback = null,
}) => {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const userRole = typeof user.role === 'object' && user.role ? (user.role as any).name : user.role;
  const userPermissions = typeof user.role === 'object' && user.role ? (user.role as any).permissions : [];

  // Check roles
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(userRole)) {
      return <>{fallback}</>;
    }
  }

  // Check permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every((perm) => userPermissions.includes(perm));
    if (!hasAllPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
