/**
 * Application-wide constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy h:mm a',
  INPUT: 'yyyy-MM-dd',
  INPUT_DATETIME: 'yyyy-MM-ddTHH:mm',
  API: 'yyyy-MM-dd',
  TIME_ONLY: 'h:mm a',
  TIME_24: 'HH:mm',
};

// Status Colors
export const STATUS_COLORS = {
  active: 'green',
  inactive: 'gray',
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
  cancelled: 'gray',
  completed: 'blue',
  in_progress: 'orange',
  overdue: 'red',
};

// Roles
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  HR: 'HR',
  EMPLOYEE: 'EMPLOYEE',
  CLIENT: 'CLIENT',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  LANGUAGE: 'language',
};

// Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Toast Durations (ms)
export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
};

// Debounce Delays (ms)
export const DEBOUNCE = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 100,
};

export default {
  API_CONFIG,
  PAGINATION,
  DATE_FORMATS,
  STATUS_COLORS,
  ROLES,
  STORAGE_KEYS,
  BREAKPOINTS,
  FILE_LIMITS,
  TOAST_DURATION,
  DEBOUNCE,
};
