/**
 * Manager Dashboard Component
 * Team and project management view
 */

'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardBody, StatusBadge, PageHeader } from '@/components/ui';
import { QuickActionsGrid, RecentActivityWidget, StatsGrid } from './DashboardWidgets';
import { useDashboardStats, useRecentActivity, useQuickActions } from '@/hooks/useDashboardData';
import {
    HiOutlineUsers, HiOutlineFolder, HiOutlineClipboardCheck,
    HiOutlineChartBar
} from 'react-icons/hi';

export default function ManagerDashboard({ user }) {
    const { data: dashboardData, isLoading: statsLoading } = useDashboardStats();
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
                value: dashboardData.team_members_count || 0,
                label: 'Team Members',
            },
            {
                icon: <HiOutlineFolder className="w-6 h-6" />,
                iconBg: 'bg-violet-500/10',
                iconColor: 'text-violet-600',
                value: dashboardData.active_projects || 0,
                label: 'Active Projects',
            },
            {
                icon: <HiOutlineClipboardCheck className="w-6 h-6" />,
                iconBg: 'bg-emerald-500/10',
                iconColor: 'text-emerald-600',
                value: dashboardData.tasks_this_week || 0,
                label: 'Tasks This Week',
            },
            {
                icon: <HiOutlineChartBar className="w-6 h-6" />,
                iconBg: 'bg-orange-500/10',
                iconColor: 'text-orange-600',
                value: `${dashboardData.team_attendance_rate || 0}%`,
                label: 'Team Attendance',
            },
        ];
    }, [dashboardData]);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <PageHeader
                title="Manager Dashboard"
                description="Oversee your team and projects"
            />

            {/* Stats Grid */}
            <StatsGrid stats={stats} loading={statsLoading} />

            {/* Quick Actions */}
            <QuickActionsGrid actions={quickActions} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <RecentActivityWidget activities={activities} title="Team Activity" />
                </div>

                {/* Team Overview */}
                <Card>
                    <CardHeader title="Team Overview" />
                    <CardBody className="space-y-4">
                        <div className="p-4 bg-violet-500/10 rounded-xl border-l-4 border-violet-500">
                            <h4 className="font-semibold text-violet-600 text-sm">Team Performance</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Your team has completed {dashboardData?.tasks_this_week || 0} tasks this week
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Active Projects</span>
                                <span className="text-sm font-semibold text-foreground">
                                    {dashboardData?.active_projects || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Team Size</span>
                                <span className="text-sm font-semibold text-foreground">
                                    {dashboardData?.team_members_count || 0} members
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Attendance Rate</span>
                                <span className="text-sm font-semibold text-emerald-600">
                                    {dashboardData?.team_attendance_rate || 0}%
                                </span>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
