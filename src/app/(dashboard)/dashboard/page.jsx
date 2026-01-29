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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate dashboard component
  return <DashboardComponent user={user} />;
}
