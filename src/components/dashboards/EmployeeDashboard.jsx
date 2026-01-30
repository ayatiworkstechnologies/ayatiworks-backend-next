/**
 * Employee Dashboard Component
 * Personal workspace for employees
 */

'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardBody, StatusBadge, StatCard, PageHeader } from '@/components/ui';
import { QuickActionsGrid, RecentActivityWidget, StatsGrid } from './DashboardWidgets';
import { useDashboardStats, useRecentActivity, useQuickActions } from '@/hooks/useDashboardData';
import { useTodayAttendance } from '@/hooks/useAPI';
import {
    HiOutlineClipboardCheck, HiOutlineCalendar, HiOutlineClock,
    HiOutlineFolder, HiOutlineCurrencyDollar
} from 'react-icons/hi';

export default function EmployeeDashboard({ user }) {
    const { data: dashboardData, isLoading: statsLoading } = useDashboardStats();
    const { data: activities } = useRecentActivity(5);
    const { data: quickActions } = useQuickActions();
    const { data: attendance } = useTodayAttendance();

    // Format stats for display
    const stats = useMemo(() => {
        if (!dashboardData) return [];

        return [
            {
                icon: <HiOutlineClipboardCheck className="w-6 h-6" />,
                iconBg: 'bg-blue-500/10',
                iconColor: 'text-blue-600',
                value: dashboardData.my_tasks_count || 0,
                label: 'My Active Tasks',
            },
            {
                icon: <HiOutlineCalendar className="w-6 h-6" />,
                iconBg: 'bg-emerald-500/10',
                iconColor: 'text-emerald-600',
                value: dashboardData.leave_balance || 0,
                label: 'Leave Balance (Days)',
            },
            {
                icon: <HiOutlineClock className="w-6 h-6" />,
                iconBg: 'bg-violet-500/10',
                iconColor: 'text-violet-600',
                value: dashboardData.hours_this_month || 0,
                label: 'Hours This Month',
            },
            {
                icon: <HiOutlineFolder className="w-6 h-6" />,
                iconBg: 'bg-orange-500/10',
                iconColor: 'text-orange-600',
                value: dashboardData.my_projects_count || 0,
                label: 'My Projects',
            },
        ];
    }, [dashboardData]);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            {/* Welcome Section */}
            <PageHeader
                title={`Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, ${user?.first_name || 'User'}!`}
                description="Here's your workspace overview"
            >
                {/* Attendance Widget */}
                <Card className="md:w-auto">
                    <CardBody className="flex items-center gap-4 p-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${attendance?.check_in ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                            <HiOutlineClock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Today's Status</p>
                            <p className="font-semibold text-foreground">
                                {attendance?.check_in
                                    ? `Checked in at ${new Date(attendance.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                    : 'Not checked in'
                                }
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </PageHeader>

            {/* Stats Grid */}
            <StatsGrid stats={stats} loading={statsLoading} />

            {/* Quick Actions */}
            <QuickActionsGrid actions={quickActions} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <RecentActivityWidget activities={activities} title="My Recent Activity" />

                {/* Quick Info Card */}
                <Card>
                    <CardHeader title="My Information" />
                    <CardBody className="space-y-4">
                        <div className="p-4 bg-primary/10 rounded-xl border-l-4 border-primary">
                            <h4 className="font-semibold text-primary text-sm">Welcome!</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Track your tasks, attendance, and leaves from your dashboard.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium text-foreground">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Role</p>
                                <p className="font-medium text-foreground">{user?.role?.name || 'Employee'}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
