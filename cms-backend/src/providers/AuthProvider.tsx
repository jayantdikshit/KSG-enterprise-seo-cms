"use client";
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: any;
  name?: string;
}

interface AuthContextProps {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // on mount, try to refresh token
  useEffect(() => {
    refresh();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // for refresh token cookie
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      
      const token = data.accessToken || (data.data && data.data.accessToken);
      const userData = data.user || (data.data && data.data.user);
      
      if (token) localStorage.setItem('accessToken', token);
      
      setAccessToken(token);
      setUser(userData);
      return true;
    } catch (e: any) {
      setError(e.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Logout failed', err);
        throw new Error('Logout failed');
      }
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      router.replace('/admin/login');
    } catch (e) {
      console.error(e);
    }
  };

  const refresh = async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Refresh failed');
      const data = await res.json();
      
      const token = data.accessToken || (data.data && data.data.accessToken);
      const userData = data.user || (data.data && data.data.user);
      
      if (token) localStorage.setItem('accessToken', token);
      
      setAccessToken(token);
      setUser(userData);
    } catch (e) {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  };

  // attach token to fetch globally (optional helper)
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    const res = await fetch(url, { ...options, headers, credentials: 'include' });
    if (res.status === 401) {
      await refresh();
      // retry once
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
        return fetch(url, { ...options, headers, credentials: 'include' });
      }
    }
    return res;
  };

  const value: AuthContextProps = {
    user,
    accessToken,
    loading,
    error,
    login,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
