'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui';

// Role group constants
const ADMIN_ROLES = ['Super Admin', 'Admin', 'SUPER_ADMIN', 'ADMIN'];
const MANAGEMENT_ROLES = ['Manager', 'MANAGER'];
const HR_ROLES = ['HR Manager', 'HR', 'HR_MANAGER'];

export default function SettingsRedirectPage() {
  const { user } = useAuth();
  const router = useRouter();

  const isHR = useMemo(() => {
    const roleName = user?.role?.name || '';
    const roleCode = user?.role?.code || '';
    return HR_ROLES.includes(roleName) || HR_ROLES.includes(roleCode);
  }, [user]);

  const isAdmin = useMemo(() => {
    const roleName = user?.role?.name || '';
    const roleCode = user?.role?.code || '';
    return ADMIN_ROLES.includes(roleName) || ADMIN_ROLES.includes(roleCode);
  }, [user]);

  const isManagement = useMemo(() => {
    const roleName = user?.role?.name || '';
    const roleCode = user?.role?.code || '';
    return MANAGEMENT_ROLES.includes(roleName) || MANAGEMENT_ROLES.includes(roleCode);
  }, [user]);

  useEffect(() => {
    if (user) {
      // Redirect to first available tab
      if (isAdmin || isHR || isManagement) {
        router.replace('/settings/companies'); // Or departments if companies restricted, but good enough default
      } else {
        router.replace('/settings/security');
      }
    }
  }, [user, isAdmin, isHR, isManagement, router]);

  return (
    <div className="flex h-full items-center justify-center p-8">
      <LoadingSpinner size="lg" />
    </div>
  );
}
