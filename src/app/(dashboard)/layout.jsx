'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/context/PermissionContext';
import { Sidebar, Header } from '@/components/layout';
import SkipLinks from '@/components/SkipLinks';

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isAuthenticated, loading, user } = useAuth();
  const { fetchPermissions } = usePermissions();
  const router = useRouter();

  // Fetch permissions when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPermissions();
    }
  }, [isAuthenticated, user, fetchPermissions]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <SkipLinks />
      <div className="flex h-screen bg-background overflow-hidden font-sans">
        {/* Mobile Overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar Container - FIXED WIDTHS */}
        <div
          className={`
          fixed inset-y-0 left-0 z-50 md:relative flex-shrink-0 bg-card
          transition-all duration-300 ease-in-out  border-r border-border
          ${mobileSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full md:translate-x-0 md:shadow-none'}
          ${sidebarCollapsed ? 'w-[74px]' : 'w-[260px]'} 
        `}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full h-full"
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          <Header onMenuToggle={() => setMobileSidebarOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto no-scrollbar p-0 bg-muted/20">
            <div className="min-h-full p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
