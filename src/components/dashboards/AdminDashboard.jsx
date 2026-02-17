/**
 * Admin Dashboard Component
 * Company-wide management view
 */

'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardBody, StatusBadge, PageHeader } from '@/components/ui';
import { QuickActionsGrid, RecentActivityWidget, StatsGrid } from './DashboardWidgets';

import { RevenueChart, ProjectDistributionChart } from './DashboardCharts';
import { useDashboardStats, useRecentActivity, useQuickActions, useDashboardCharts } from '@/hooks/useDashboardData';
import {
    HiOutlineUsers, HiOutlineFolder, HiOutlineOfficeBuilding,
    HiOutlineClipboardCheck
} from 'react-icons/hi';

export default function AdminDashboard({ user }) {
    const { data: dashboardData, isLoading: statsLoading } = useDashboardStats();
    const { data: chartData, isLoading: chartsLoading } = useDashboardCharts();
    const { data: activities } = useRecentActivity(10);
    const { data: quickActions } = useQuickActions();

    // Format stats for display
    const stats = useMemo(() => {
        if (!dashboardData) return [];

        return [
            {
                icon: <HiOutlineUsers className="w-6 h-6" />,
                iconBg: 'bg-blue-500/10',
                iconColor: 'text-blue-600',
                value: dashboardData.employees_count || 0,
                label: 'Total Employees',
            },
            {
                icon: <HiOutlineFolder className="w-6 h-6" />,
                iconBg: 'bg-violet-500/10',
                iconColor: 'text-violet-600',
                value: dashboardData.projects_count || 0,
                label: 'Active Projects',
            },
            {
                icon: <HiOutlineOfficeBuilding className="w-6 h-6" />,
                iconBg: 'bg-emerald-500/10',
                iconColor: 'text-emerald-600',
                value: dashboardData.departments_count || 0,
                label: 'Departments',
            },
            {
                icon: <HiOutlineClipboardCheck className="w-6 h-6" />,
                iconBg: 'bg-orange-500/10',
                iconColor: 'text-orange-600',
                value: dashboardData.pending_approvals || 0,
                label: 'Pending Approvals',
            },
        ];
    }, [dashboardData]);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <PageHeader
                title="Admin Dashboard"
                description="Manage your organization and oversee all operations"
            />

            {/* Stats Grid */}
            <StatsGrid stats={stats} loading={statsLoading} />

            {/* Quick Actions */}
            <QuickActionsGrid actions={quickActions} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueChart data={chartData?.revenue_trend} />
                <ProjectDistributionChart data={chartData?.project_distribution} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <RecentActivityWidget activities={activities} title="Recent Company Activity" />
                </div>

                {/* Company Overview */}
                <Card>
                    <CardHeader title="Company Overview" />
                    <CardBody className="space-y-4">
                        {dashboardData?.pending_approvals > 0 && (
                            <div className="p-4 bg-orange-500/10 rounded-xl border-l-4 border-orange-500">
                                <h4 className="font-semibold text-orange-600 text-sm flex items-center gap-2">
                                    <HiOutlineClipboardCheck className="w-4 h-4" />
                                    Action Required
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {dashboardData.pending_approvals} item{dashboardData.pending_approvals !== 1 ? 's' : ''} awaiting your approval
                                </p>
                            </div>
                        )}

                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Employees</span>
                                <span className="text-sm font-semibold text-foreground">
                                    {dashboardData?.employees_count || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Active Projects</span>
                                <span className="text-sm font-semibold text-violet-600">
                                    {dashboardData?.projects_count || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Departments</span>
                                <span className="text-sm font-semibold text-emerald-600">
                                    {dashboardData?.departments_count || 0}
                                </span>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-border/30">
                            <p className="text-sm text-muted-foreground">Company</p>
                            <p className="font-medium text-foreground">{user?.company?.name || 'N/A'}</p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
