import useSWR from 'swr';
import api from '@/lib/api';

/**
 * Global SWR fetcher — single definition used everywhere.
 */
export const fetcher = (url) => api.get(url);

/**
 * Production-tuned SWR config.
 * Apply this via <SWRConfig value={swrConfig}> in root layout.
 */
export const swrConfig = {
  fetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,       // 5s dedup window — kills duplicate requests
  focusThrottleInterval: 30000, // Throttle focus revalidation to 30s
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  keepPreviousData: true,       // Show stale data while fetching new
  onError: (error) => {
    if (error?.status === 401) return; // Auth errors handled by API client
    console.error('SWR Error:', error?.message || error);
  },
};

/**
 * Main data-fetching hook. All components should use this.
 * 
 * @param {string|null} key - API endpoint or null to disable
 * @param {object} options - SWR overrides
 * @returns {{ data, error, isLoading, isValidating, mutate }}
 */
export function useAPI(key, options = {}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(key, fetcher, {
    ...options,
  });

  return { data, error, isLoading, isValidating, mutate };
}

// ============== Dashboard Hooks ==============

export function useDashboardStats() {
  return useAPI('/dashboard/stats', {
    refreshInterval: 30000, // 30s — not 10s, reduces backend load 3×
  });
}

export function useTodayAttendance() {
  return useAPI('/attendance/today', {
    refreshInterval: 15000, // 15s — not 5s
  });
}

export function useAttendanceOverview() {
  return useAPI('/dashboard/attendance-overview', {
    refreshInterval: 60000, // 1 min
  });
}

export function useProjectOverview() {
  return useAPI('/dashboard/project-overview', {
    refreshInterval: 60000, // 1 min
  });
}

// ============== CRUD Hooks ==============

/**
 * Paginated list hook.
 */
export function useList(endpoint, params = {}) {
  // Filter out empty params
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );
  const qs = new URLSearchParams(filtered).toString();
  const key = qs ? `${endpoint}?${qs}` : endpoint;

  return useAPI(key);
}

/**
 * Single item hook.
 */
export function useItem(endpoint, id) {
  return useAPI(id ? `${endpoint}/${id}` : null);
}
