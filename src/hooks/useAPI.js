import useSWR from 'swr';
import api from '@/lib/api';

/**
 * Custom SWR fetcher function that uses our API client
 * @param {string} url - API endpoint to fetch from
 * @returns {Promise} - Fetched data
 */
export const fetcher = async (url) => {
  const response = await api.get(url);
  return response;
};

/**
 * Hook for fetching data with SWR
 * Provides automatic caching, revalidation, and error handling
 * 
 * @param {string} key - API endpoint or null to disable
 * @param {object} options - SWR configuration options
 * @returns {object} - { data, error, isLoading, mutate }
 */
export function useAPI(key, options = {}) {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR(key, fetcher, {
    revalidateOnFocus: false, // Don't refetch on window focus
    revalidateOnReconnect: true, // Refetch when internet reconnects
    dedupingInterval: 2000, // Dedupe requests within 2 seconds
    ...options, // Allow custom options to override defaults
  });

  return {
    data,
    error,
    isLoading,
    mutate, // Function to manually revalidate
  };
}

/**
 * Hook for fetching dashboard statistics
 * Cached for 30 seconds
 */
export function useDashboardStats() {
  return useAPI('/dashboard/stats', {
    refreshInterval: 10000, // Refresh every 10 seconds
  });
}

/**
 * Hook for fetching today's attendance
 */
export function useTodayAttendance() {
  return useAPI('/attendance/today', {
    refreshInterval: 5000, // Check check-in status every 5 seconds
  });
}

/**
 * Hook for fetching attendance overview
 */
export function useAttendanceOverview() {
  return useAPI('/dashboard/attendance-overview', {
    refreshInterval: 15000,
  });
}

/**
 * Hook for fetching project overview with recent projects
 */
export function useProjectOverview() {
  return useAPI('/dashboard/project-overview', {
    refreshInterval: 15000,
  });
}

/**
 * Hook for fetching list data with pagination
 * @param {string} endpoint - API endpoint
 * @param {object} params - Query parameters (page, limit, filters)
 */
export function useList(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const key = queryString ? `${endpoint}?${queryString}` : endpoint;
  
  return useAPI(key, {
    revalidateOnFocus: false,
  });
}

/**
 * Hook for fetching a single item by ID
 * @param {string} endpoint - API endpoint (e.g., '/employees')
 * @param {string|number} id - Item ID
 */
export function useItem(endpoint, id) {
  const key = id ? `${endpoint}/${id}` : null; // Null key disables fetching
  
  return useAPI(key, {
    revalidateOnFocus: false,
  });
}

/**
 * Global SWR configuration
 * Apply this in your root layout or app component
 */
export const swrConfig = {
  fetcher,
  onError: (error) => {
    console.error('SWR Error:', error);
    // You can add toast notification here
  },
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};
