'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/lib/api';

const PermissionContext = createContext(null);

export function PermissionProvider({ children }) {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState(null);

    // Fetch user permissions from backend
    const fetchPermissions = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setPermissions([]);
            setUserRole(null);
            return;
        }

        try {
            setLoading(true);
            const response = await api.get('/permissions/my-permissions');

            // Extract permission codes
            const permissionCodes = response.map(p => p.code);
            setPermissions(permissionCodes);

            // Store full permission objects for reference
            localStorage.setItem('user_permissions', JSON.stringify(permissionCodes));

        } catch (error) {
            console.error('Failed to fetch permissions:', error);
            setPermissions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Check if user has a specific permission
    const hasPermission = useCallback((permissionCode) => {
        if (!permissionCode) return true;

        // Super admin check
        if (permissions.includes('super_admin')) return true;

        return permissions.includes(permissionCode);
    }, [permissions]);

    // Check if user has ANY of the provided permissions (OR logic)
    const hasAnyPermission = useCallback((permissionCodes) => {
        if (!permissionCodes || permissionCodes.length === 0) return true;

        // Super admin check
        if (permissions.includes('super_admin')) return true;

        return permissionCodes.some(code => permissions.includes(code));
    }, [permissions]);

    // Check if user has ALL of the provided permissions (AND logic)
    const hasAllPermissions = useCallback((permissionCodes) => {
        if (!permissionCodes || permissionCodes.length === 0) return true;

        // Super admin check
        if (permissions.includes('super_admin')) return true;

        return permissionCodes.every(code => permissions.includes(code));
    }, [permissions]);

    // Clear permissions (on logout)
    const clearPermissions = useCallback(() => {
        setPermissions([]);
        setUserRole(null);
        localStorage.removeItem('user_permissions');
    }, []);

    // Load permissions from cache on mount (for faster initial load)
    useEffect(() => {
        const cachedPermissions = localStorage.getItem('user_permissions');
        if (cachedPermissions) {
            try {
                setPermissions(JSON.parse(cachedPermissions));
            } catch (e) {
                console.error('Failed to parse cached permissions:', e);
            }
        }
    }, []);

    // Auto-fetch permissions when auth token is available
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token && permissions.length === 0) {
            fetchPermissions();
        }
    }, [fetchPermissions, permissions.length]);

    const value = useMemo(() => ({
        permissions,
        loading,
        userRole,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        fetchPermissions,
        clearPermissions,
    }), [
        permissions,
        loading,
        userRole,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        fetchPermissions,
        clearPermissions
    ]);

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
}

export function usePermissions() {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermissions must be used within a PermissionProvider');
    }
    return context;
}
