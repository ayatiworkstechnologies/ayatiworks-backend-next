'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermission } from '@/hooks/usePermission';

/**
 * ProtectedRoute component - Protects routes based on permissions
 * 
 * @param {string} permission - Single permission required
 * @param {string[]} anyPermission - Any of these permissions required (OR logic)
 * @param {string[]} allPermissions - All of these permissions required (AND logic)
 * @param {React.ReactNode} children - Child components to render if authorized
 * @param {string} fallbackPath - Path to redirect if unauthorized (default: /access-denied)
 * @param {React.ReactNode} fallback - Component to show while loading
 * 
 * @example
 * <ProtectedRoute permission="employee.view_all">
 *   <EmployeeList />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute anyPermission={["project.view", "project.view_all"]}>
 *   <ProjectList />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
    permission,
    anyPermission,
    allPermissions,
    children,
    fallbackPath = '/access-denied',
    fallback = null
}) {
    const router = useRouter();
    const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermission();

    useEffect(() => {
        if (loading) return;

        let hasAccess = true;

        if (permission) {
            hasAccess = hasPermission(permission);
        } else if (anyPermission && anyPermission.length > 0) {
            hasAccess = hasAnyPermission(anyPermission);
        } else if (allPermissions && allPermissions.length > 0) {
            hasAccess = hasAllPermissions(allPermissions);
        }

        if (!hasAccess) {
            router.push(fallbackPath);
        }
    }, [
        permission,
        anyPermission,
        allPermissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        loading,
        router,
        fallbackPath
    ]);

    // Show loading fallback while checking permissions
    if (loading) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    // Check permissions
    let hasAccess = true;

    if (permission) {
        hasAccess = hasPermission(permission);
    } else if (anyPermission && anyPermission.length > 0) {
        hasAccess = hasAnyPermission(anyPermission);
    } else if (allPermissions && allPermissions.length > 0) {
        hasAccess = hasAllPermissions(allPermissions);
    }

    // Render children if authorized
    return hasAccess ? children : null;
}
