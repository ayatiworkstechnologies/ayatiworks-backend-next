'use client';

import { usePermission } from '@/hooks/usePermission';

/**
 * PermissionGuard component - Conditionally render UI elements based on permissions
 * 
 * @param {string} permission - Single permission required
 * @param {string[]} anyPermission - Any of these permissions required (OR logic)
 * @param {string[]} allPermissions - All of these permissions required (AND logic)
 * @param {React.ReactNode} children - Components to render if authorized
 * @param {React.ReactNode} fallback - Component to render if not authorized
 * @param {boolean} invert - Invert the permission check (show if NO permission)
 * 
 * @example
 * <PermissionGuard permission="employee.create">
 *   <CreateEmployeeButton />
 * </PermissionGuard>
 * 
 * <PermissionGuard anyPermission={["project.edit", "project.delete"]}>
 *   <ActionsMenu />
 * </PermissionGuard>
 * 
 * <PermissionGuard permission="report.view" fallback={<p>No access to reports</p>}>
 *   <ReportChart />
 * </PermissionGuard>
 */
export default function PermissionGuard({
    permission,
    anyPermission,
    allPermissions,
    children,
    fallback = null,
    invert = false
}) {
    const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermission();

    // Don't render anything while loading (prevents flash of unauthorized content)
    if (loading) {
        return null;
    }

    let hasAccess = true;

    if (permission) {
        hasAccess = hasPermission(permission);
    } else if (anyPermission && anyPermission.length > 0) {
        hasAccess = hasAnyPermission(anyPermission);
    } else if (allPermissions && allPermissions.length > 0) {
        hasAccess = hasAllPermissions(allPermissions);
    }

    // Invert logic if requested
    if (invert) {
        hasAccess = !hasAccess;
    }

    return hasAccess ? children : fallback;
}
