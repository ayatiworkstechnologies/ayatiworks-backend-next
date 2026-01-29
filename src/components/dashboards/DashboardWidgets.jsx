/**
 * Dashboard Widget Components
 * Reusable components for building role-based dashboards
 */

import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components/ui';
import * as HeroIcons from 'react-icons/hi';

/**
 * Action Card - Quick action button with icon
 */
export function ActionCard({ label, href, icon, color = 'blue' }) {
    const Icon = HeroIcons[icon] || HeroIcons.HiOutlinePlus;

    const colorClasses = {
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        violet: 'bg-violet-500',
        emerald: 'bg-emerald-500',
        green: 'bg-green-500',
        amber: 'bg-amber-500',
        orange: 'bg-orange-500',
        gray: 'bg-gray-500',
    };

    return (
        <Link href={href}>
            <Card className="h-full group hover:ring-2 hover:ring-primary/20 transition-all duration-200">
                <CardBody className="flex flex-col items-center justify-center text-center p-6">
                    <div className={`w-12 h-12 ${colorClasses[color] || colorClasses.blue} rounded-xl flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {label}
                    </span>
                </CardBody>
            </Card>
        </Link>
    );
}

/**
 * Quick Actions Grid
 */
export function QuickActionsGrid({ actions }) {
    if (!actions || actions.length === 0) {
        return null;
    }

    return (
        <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {actions.map((action, index) => (
                    <ActionCard
                        key={index}
                        label={action.label}
                        href={action.href}
                        icon={action.icon}
                        color={action.color}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * Recent Activity Widget
 */
export function RecentActivityWidget({ activities, title = 'Recent Activity' }) {
    if (!activities || activities.length === 0) {
        return (
            <Card>
                <CardHeader title={title} />
                <CardBody className="p-8 text-center text-muted-foreground">
                    No recent activity
                </CardBody>
            </Card>
        );
    }

    const getActivityIcon = (type) => {
        const icons = {
            project: HeroIcons.HiOutlineFolder,
            leave: HeroIcons.HiOutlineCalendar,
            task: HeroIcons.HiOutlineClipboardCheck,
            employee: HeroIcons.HiOutlineUser,
            default: HeroIcons.HiOutlineDocumentText,
        };
        return icons[type] || icons.default;
    };

    const getActivityColor = (type) => {
        const colors = {
            project: 'text-violet-600 bg-violet-500/10',
            leave: 'text-emerald-600 bg-emerald-500/10',
            task: 'text-blue-600 bg-blue-500/10',
            employee: 'text-orange-600 bg-orange-500/10',
            default: 'text-gray-600 bg-gray-500/10',
        };
        return colors[type] || colors.default;
    };

    return (
        <Card>
            <CardHeader title={title} />
            <CardBody className="p-0">
                <div className="divide-y divide-border/30">
                    {activities.map((activity, index) => {
                        const Icon = getActivityIcon(activity.type);
                        const colorClass = getActivityColor(activity.type);

                        return (
                            <div key={index} className="flex items-start gap-4 p-4 hover:bg-muted/20 transition-colors">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardBody>
        </Card>
    );
}

/**
 * List Widget - Generic list display  */
export function ListWidget({ title, items, emptyMessage = 'No items found', renderItem }) {
    return (
        <Card>
            <CardHeader title={title} />
            <CardBody className="p-0">
                {items && items.length > 0 ? (
                    <div className="divide-y divide-border/30">
                        {items.map((item, index) => (
                            <div key={index}>
                                {renderItem ? renderItem(item, index) : (
                                    <div className="p-4 hover:bg-muted/20 transition-colors">
                                        {item.name || item.title || 'Item'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        {emptyMessage}
                    </div>
                )}
            </CardBody>
        </Card>
    );
}

/**
 * Stats Grid - Display role-specific statistics
 */
export function StatsGrid({ stats, loading }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-24 bg-muted/20 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!stats || stats.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <Card key={index} className="border-0 shadow-lg">
                    <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.iconBg || 'bg-primary/10'} ${stat.iconColor || 'text-primary'}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}
