'use client';

import { usePermissions } from '@/context/PermissionContext';
import { useAuth } from '@/context/AuthContext';

/**
 * Custom hook for permission checking
 * 
 * @returns {Object} Permission utilities
 * 
 * @example
 * const { hasPermission, hasAnyPermission, userRole } = usePermission();
 * 
 * if (hasPermission('employee.create')) {
 *   // Show create button
 * }
 * 
 * if (hasAnyPermission(['project.view', 'project.view_all'])) {
 *   // Show projects page
 * }
 */
export function usePermission() {
  const {
    permissions,
    loading,
    userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    fetchPermissions,
    clearPermissions
  } = usePermissions();
  
  const { user } = useAuth();

  // Helper to check if user is admin or super admin
  const isAdmin = () => {
    if (user?.role?.code === 'SUPER_ADMIN' || user?.role?.code === 'ADMIN') {
        return true;
    }
    return hasAnyPermission(['super_admin', 'admin']);
  };

  // Helper to check if user is super admin
  const isSuperAdmin = () => {
    if (user?.role?.code === 'SUPER_ADMIN') {
        return true;
    }
    return hasPermission('super_admin');
  };

  // Helper to get permission count
  const getPermissionCount = () => {
    return permissions.length;
  };

  return {
    permissions,
    loading,
    userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    fetchPermissions,
    clearPermissions,
    isAdmin,
    isSuperAdmin,
    getPermissionCount,
  };
}

export default usePermission;
