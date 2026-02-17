/**
 * Custom Hooks Index
 * Re-exports all custom hooks for easy importing
 * 
 * @example
 * import { useLocalStorage, useMediaQuery, useDebounce } from '@/hooks';
 */

// Existing hooks
export { useDebounce } from './useDebounce';
export { useClickOutside } from './useClickOutside';
export { usePermission } from './usePermission';
// API & data fetching hooks
export { useAPI, useList, useItem, useTodayAttendance, useAttendanceOverview, useProjectOverview } from './useAPI';
export { useDashboardStats, useRecentActivity, useQuickActions, useDashboardCharts } from './useDashboardData';
export { useCrudOperations } from './useCrudOperations';

// New utility hooks
export { useLocalStorage } from './useLocalStorage';
export { 
  useMediaQuery, 
  useIsMobile, 
  useIsTablet, 
  useIsDesktop,
  usePrefersDarkMode,
  usePrefersReducedMotion 
} from './useMediaQuery';
export { useAsync, useAsyncEffect } from './useAsync';
