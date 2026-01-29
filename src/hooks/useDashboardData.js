/**
 * Custom hook for fetching role-based dashboard data
 */

import useSWR from 'swr';
import api from '@/lib/api';

/**
 * Fetch dashboard stats based on user's role
 */
export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR(
    '/dashboard/stats',
    async (url) => {
      const response = await api.get(url);
      return response;
    },
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

/**
 * Fetch recent dashboard activity
 */
export function useRecentActivity(limit = 10) {
  const { data, error, isLoading } = useSWR(
    `/dashboard/recent-activity?limit=${limit}`,
    async (url) => {
      const response = await api.get(url);
      return response;
    },
    {
      refreshInterval: 15000, // Refresh every 15 seconds
    }
  );

  return {
    data: data || [],
    error,
    isLoading,
  };
}

/**
 * Fetch quick actions based on user's role
 */
export function useQuickActions() {
  const { data, error, isLoading } = useSWR(
    '/dashboard/quick-actions',
    async (url) => {
      const response = await api.get(url);
      return response;
    },
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
    }
  );

  return {
    data: data || [],
    error,
    isLoading,
  };
}
