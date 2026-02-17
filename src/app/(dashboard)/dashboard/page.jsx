'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  SuperAdminDashboard,
  AdminDashboard,
  ManagerDashboard,
  HRDashboard,
  EmployeeDashboard,
  ClientDashboard,
} from '@/components/dashboards';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  // Determine which dashboard to show based on user role
  const DashboardComponent = useMemo(() => {
    if (!user || !user.role) {
      return EmployeeDashboard; // Default fallback
    }

    const roleCode = user.role.code;

    const dashboardMap = {
      SUPER_ADMIN: SuperAdminDashboard,
      ADMIN: AdminDashboard,
      MANAGER: ManagerDashboard,
      HR: HRDashboard,
      EMPLOYEE: EmployeeDashboard,
      CLIENT: ClientDashboard,
    };

    return dashboardMap[roleCode] || EmployeeDashboard;
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        {/* Header skeleton */}
        <div>
          <div className="h-8 w-64 bg-muted/30 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-48 bg-muted/20 rounded animate-pulse" />
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-muted/20 rounded-2xl animate-pulse" />
          ))}
        </div>
        {/* Quick actions skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-muted/20 rounded-2xl animate-pulse" />
          ))}
        </div>
        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-muted/20 rounded-2xl animate-pulse" />
          <div className="h-80 bg-muted/20 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Render the appropriate dashboard component
  return <DashboardComponent user={user} />;
}
