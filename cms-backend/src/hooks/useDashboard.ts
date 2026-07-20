import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalUsers: number;
  totalLeads: number;
  totalPosts: number;
  totalMedia: number;
}

export const useDashboard = () => {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/dashboard', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error('Failed to load dashboard');
        const data = await res.json();
        setStats(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [accessToken]);

  return { stats, loading, error };
};
