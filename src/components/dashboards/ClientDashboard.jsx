/**
 * Client Dashboard Component
 * Client portal view
 */

'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardBody, StatusBadge, PageHeader } from '@/components/ui';
import { QuickActionsGrid, RecentActivityWidget, StatsGrid } from './DashboardWidgets';

import { SpendingTrendChart, ProjectDistributionChart } from './DashboardCharts';
import { useDashboardStats, useRecentActivity, useQuickActions, useDashboardCharts } from '@/hooks/useDashboardData';
import {
    HiOutlineFolder, HiOutlineCurrencyDollar, HiOutlineClipboardCheck,
    HiOutlineSupport
} from 'react-icons/hi';

export default function ClientDashboard({ user }) {
    const { data: dashboardData, isLoading: statsLoading } = useDashboardStats();
    const { data: chartData, isLoading: chartsLoading } = useDashboardCharts();
    const { data: activities } = useRecentActivity(5);
    const { data: quickActions } = useQuickActions();

    // Format stats for display
    const stats = useMemo(() => {
        if (!dashboardData) return [];

        return [
            {
                icon: <HiOutlineFolder className="w-6 h-6" />,
                iconBg: 'bg-violet-500/10',
                iconColor: 'text-violet-600',
                value: dashboardData.my_projects_count || 0,
                label: 'My Projects',
            },
            {
                icon: <HiOutlineCurrencyDollar className="w-6 h-6" />,
                iconBg: 'bg-amber-500/10',
                iconColor: 'text-amber-600',
                value: dashboardData.open_invoices_count || 0,
                label: 'Open Invoices',
            },
            {
                icon: <HiOutlineClipboardCheck className="w-6 h-6" />,
                iconBg: 'bg-blue-500/10',
                iconColor: 'text-blue-600',
                value: dashboardData.active_tasks_count || 0,
                label: 'Active Tasks',
            },
            {
                icon: <HiOutlineCurrencyDollar className="w-6 h-6" />,
                iconBg: 'bg-emerald-500/10',
                iconColor: 'text-emerald-600',
                value: `$${(dashboardData.total_spent || 0).toLocaleString()}`,
                label: 'Total Spent',
            },
        ];
    }, [dashboardData]);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <PageHeader
                title={`Welcome back, ${user?.first_name || 'Client'}!`}
                description="Track your projects, invoices, and view updates"
            />

            {/* Stats Grid */}
            <StatsGrid stats={stats} loading={statsLoading} />

            {/* Quick Actions */}
            <QuickActionsGrid actions={quickActions} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SpendingTrendChart data={chartData?.spending_trend} />
                <ProjectDistributionChart data={chartData?.project_status} title="Project Status" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <RecentActivityWidget activities={activities} title="Project Updates" />
                </div>

                {/* Account Summary */}
                <Card>
                    <CardHeader title="Account Summary" />
                    <CardBody className="space-y-4">
                        {dashboardData?.open_invoices_count > 0 && (
                            <div className="p-4 bg-amber-500/10 rounded-xl border-l-4 border-amber-500">
                                <h4 className="font-semibold text-amber-600 text-sm flex items-center gap-2">
                                    <HiOutlineCurrencyDollar className="w-4 h-4" />
                                    Payment Pending
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {dashboardData.open_invoices_count} invoice{dashboardData.open_invoices_count !== 1 ? 's' : ''} awaiting payment
                                </p>
                            </div>
                        )}

                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Active Projects</span>
                                <span className="text-sm font-semibold text-violet-600">
                                    {dashboardData?.my_projects_count || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Ongoing Tasks</span>
                                <span className="text-sm font-semibold text-blue-600">
                                    {dashboardData?.active_tasks_count || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Pending Invoices</span>
                                <span className="text-sm font-semibold text-amber-600">
                                    {dashboardData?.open_invoices_count || 0}
                                </span>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-border/30">
                            <p className="text-sm text-muted-foreground">Total Investment</p>
                            <p className="font-medium text-foreground text-xl text-emerald-600">
                                ${(dashboardData?.total_spent || 0).toLocaleString()}
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
