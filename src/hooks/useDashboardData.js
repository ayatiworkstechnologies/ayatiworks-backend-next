/**
 * Custom hook for fetching role-based dashboard data.
 * Uses the consolidated useAPI hook with production-tuned intervals.
 */

import { useAPI } from './useAPI';

/**
 * Fetch dashboard stats (auto-refreshes every 30s)
 */
export function useDashboardStats() {
  return useAPI('/dashboard/stats', {
    refreshInterval: 30000,
  });
}

/**
 * Fetch recent dashboard activity (auto-refreshes every 60s)
 */
export function useRecentActivity(limit = 10) {
  const { data, error, isLoading } = useAPI(
    `/dashboard/recent-activity?limit=${limit}`,
    { refreshInterval: 60000 }
  );

  return {
    data: data || [],
    error,
    isLoading,
  };
}

/**
 * Fetch quick actions (no auto-refresh, fetched once)
 */
export function useQuickActions() {
  const { data, error, isLoading } = useAPI('/dashboard/quick-actions', {
    revalidateOnMount: true,
    revalidateOnFocus: false,
  });

  return {
    data: data || [],
    error,
    isLoading,
  };
}

/**
 * Fetch dashboard charts data (no auto-refresh — user triggers)
 */
export function useDashboardCharts() {
  const { data, error, isLoading, mutate } = useAPI('/dashboard/charts', {
    revalidateOnFocus: false,
  });

  return {
    data: data || {},
    error,
    isLoading,
    refresh: mutate,
  };
}
