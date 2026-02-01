'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/components/ui';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import {
    HiOutlineUser, HiOutlineShieldCheck, HiOutlineBell, HiOutlineMoon,
    HiOutlineOfficeBuilding, HiOutlineLocationMarker, HiOutlineCollection, HiOutlineIdentification,
    HiOutlineBadgeCheck, HiOutlineClock
} from 'react-icons/hi';

// Role group constants
const ADMIN_ROLES = ['Super Admin', 'Admin', 'SUPER_ADMIN', 'ADMIN'];
const MANAGEMENT_ROLES = ['Manager', 'MANAGER'];
const HR_ROLES = ['HR Manager', 'HR', 'HR_MANAGER'];

export default function SettingsLayout({ children }) {
    const { user } = useAuth();
    const pathname = usePathname();

    // Get user role info
    const userRole = useMemo(() => {
        const roleName = user?.role?.name || user?.role?.code || '';
        const roleCode = user?.role?.code || user?.role?.name || '';
        return { name: roleName, code: roleCode };
    }, [user]);

    // Permission checks
    const isSuperAdmin = useMemo(() => {
        return userRole.code === 'SUPER_ADMIN' || userRole.name === 'Super Admin';
    }, [userRole]);

    const isAdmin = useMemo(() => {
        return ADMIN_ROLES.includes(userRole.name) || ADMIN_ROLES.includes(userRole.code);
    }, [userRole]);

    const isManagement = useMemo(() => {
        return MANAGEMENT_ROLES.includes(userRole.name) || MANAGEMENT_ROLES.includes(userRole.code);
    }, [userRole]);

    const isHR = useMemo(() => {
        return HR_ROLES.includes(userRole.name) || HR_ROLES.includes(userRole.code);
    }, [userRole]);

    // Organization links (shown only to Admin and HR roles)
    const organizationLinks = useMemo(() => {
        if (!isHR && !isAdmin && !isManagement) return [];

        const links = [];

        if (isAdmin || isSuperAdmin) {
            links.push({ href: '/settings/companies', label: 'Companies', icon: HiOutlineOfficeBuilding });
            links.push({ href: '/settings/branches', label: 'Branches', icon: HiOutlineLocationMarker });
        }

        if (isHR || isAdmin || isManagement) {
            links.push({ href: '/settings/departments', label: 'Departments', icon: HiOutlineCollection });
            links.push({ href: '/settings/designations', label: 'Designations', icon: HiOutlineIdentification });
        }

        if (isHR || isAdmin || isManagement) {
            links.push({ href: '/settings/shifts', label: 'Shifts', icon: HiOutlineClock });
        }

        return links;
    }, [isHR, isAdmin, isSuperAdmin, isManagement]);

    // Preference links
    const preferenceLinks = [
        { href: '/settings/security', label: 'Security', icon: HiOutlineShieldCheck },
        { href: '/settings/notifications', label: 'Notifications', icon: HiOutlineBell },
        { href: '/settings/appearance', label: 'Appearance', icon: HiOutlineMoon },
    ];

    // Role badge color
    const getRoleBadgeColor = (roleName) => {
        const name = roleName?.toLowerCase() || '';
        if (name.includes('super')) return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
        if (name.includes('admin')) return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
        if (name.includes('manager')) return 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white';
        if (name.includes('hr')) return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white';
        if (name.includes('employee')) return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white';
        if (name.includes('client')) return 'bg-gradient-to-r from-slate-500 to-gray-500 text-white';
        return 'bg-primary/10 text-primary';
    };

    return (
        <div className="space-y-6 animate-fade-in-up">


            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-6 self-start h-fit">
                    {/* Menu Section */}
                    <Card className="overflow-hidden border-0 shadow-lg bg-card/50 backdrop-blur-sm">

                        {/* Organization Group */}
                        {organizationLinks.length > 0 && (
                            <>
                                <div className="p-3 bg-muted/30 border-b border-border/50">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1">Organization</h3>
                                </div>
                                <div className="p-2 space-y-1">
                                    {organizationLinks.map((link) => {
                                        const Icon = link.icon;
                                        const isActive = pathname.startsWith(link.href);
                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 group ${isActive
                                                    ? 'bg-primary/10 text-primary shadow-sm border border-primary/10 relative overflow-hidden'
                                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-1'
                                                    }`}
                                            >
                                                {isActive && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                                                )}
                                                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-primary scale-110' : 'text-muted-foreground group-hover:scale-110'}`} />
                                                <span>{link.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Preferences Group */}
                        <div className="p-3 bg-muted/30 border-b border-border/50 border-t mt-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1">Preferences</h3>
                        </div>
                        <div className="p-2 space-y-1">
                            {preferenceLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname.startsWith(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 group ${isActive
                                            ? 'bg-primary/10 text-primary shadow-sm border border-primary/10 relative overflow-hidden'
                                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-1'
                                            }`}
                                    >
                                        {isActive && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                                        )}
                                        <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-primary scale-110' : 'text-muted-foreground group-hover:scale-110'}`} />
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Role Info Card */}
                    <Card className="overflow-hidden border-0 shadow-lg">
                        <div className="p-3 bg-muted/30 border-b border-border/50">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1">Your Role</h3>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <HiOutlineBadgeCheck className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className={`text-sm font-bold px-3 py-1 rounded-full inline-block ${getRoleBadgeColor(userRole.name)}`}>
                                        {userRole.name || 'User'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9">
                    {children}
                </div>
            </div>
        </div>
    );
}
