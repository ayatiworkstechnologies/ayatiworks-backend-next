/**
 * HR Dashboard Component
 * HR operations and employee management view
 */

'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardBody, StatusBadge, PageHeader } from '@/components/ui';
import { QuickActionsGrid, RecentActivityWidget, StatsGrid } from './DashboardWidgets';

import { RecruitmentChart, LeaveTrendChart } from './DashboardCharts';
import { useDashboardStats, useRecentActivity, useQuickActions, useDashboardCharts } from '@/hooks/useDashboardData';
import {
    HiOutlineUsers, HiOutlineCalendar, HiOutlineClipboardList,
    HiOutlineUserAdd
} from 'react-icons/hi';

export default function HRDashboard({ user }) {
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
                icon: <HiOutlineCalendar className="w-6 h-6" />,
                iconBg: 'bg-orange-500/10',
                iconColor: 'text-orange-600',
                value: dashboardData.on_leave_today || 0,
                label: 'On Leave Today',
            },
            {
                icon: <HiOutlineClipboardList className="w-6 h-6" />,
                iconBg: 'bg-emerald-500/10',
                iconColor: 'text-emerald-600',
                value: dashboardData.pending_leaves || 0,
                label: 'Pending Leaves',
            },
            {
                icon: <HiOutlineUserAdd className="w-6 h-6" />,
                iconBg: 'bg-violet-500/10',
                iconColor: 'text-violet-600',
                value: dashboardData.new_hires_month || 0,
                label: 'New Hires (Month)',
            },
        ];
    }, [dashboardData]);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <PageHeader
                title="HR Dashboard"
                description="Manage employees, attendance, and leave requests"
            />

            {/* Stats Grid */}
            <StatsGrid stats={stats} loading={statsLoading} />

            {/* Quick Actions */}
            <QuickActionsGrid actions={quickActions} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecruitmentChart data={chartData?.recruitment_trend} />
                <LeaveTrendChart data={chartData?.leave_trend} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <RecentActivityWidget activities={activities} title="HR Activity" />
                </div>

                {/* HR Highlights */}
                <Card>
                    <CardHeader title="Quick Stats" />
                    <CardBody className="space-y-4">
                        {dashboardData?.pending_leaves > 0 && (
                            <div className="p-4 bg-amber-500/10 rounded-xl border-l-4 border-amber-500">
                                <h4 className="font-semibold text-amber-600 text-sm flex items-center gap-2">
                                    <HiOutlineClipboardList className="w-4 h-4" />
                                    Pending Approvals
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {dashboardData.pending_leaves} leave request{dashboardData.pending_leaves !== 1 ? 's' : ''} awaiting approval
                                </p>
                            </div>
                        )}

                        {dashboardData?.new_hires_month > 0 && (
                            <div className="p-4 bg-violet-500/10 rounded-xl border-l-4 border-violet-500">
                                <h4 className="font-semibold text-violet-600 text-sm flex items-center gap-2">
                                    <HiOutlineUserAdd className="w-4 h-4" />
                                    New Hires
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {dashboardData.new_hires_month} new employee{dashboardData.new_hires_month !== 1 ? 's' : ''} joined this month
                                </p>
                            </div>
                        )}

                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total Employees</span>
                                <span className="text-sm font-semibold text-foreground">
                                    {dashboardData?.employees_count || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Present Today</span>
                                <span className="text-sm font-semibold text-emerald-600">
                                    {dashboardData?.present_today || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">On Leave</span>
                                <span className="text-sm font-semibold text-orange-600">
                                    {dashboardData?.on_leave_today || 0}
                                </span>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
