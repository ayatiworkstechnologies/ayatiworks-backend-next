'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import {
    HiOutlineUser, HiOutlineShieldCheck, HiOutlineBell, HiOutlineMoon,
    HiOutlineOfficeBuilding, HiOutlineLocationMarker, HiOutlineCollection, HiOutlineIdentification,
    HiOutlineBadgeCheck, HiOutlineClock, HiOutlineCog, HiOutlineChevronDown
} from 'react-icons/hi';

// Role group constants
const ADMIN_ROLES = ['Super Admin', 'Admin', 'SUPER_ADMIN', 'ADMIN'];
const MANAGEMENT_ROLES = ['Manager', 'MANAGER'];
const HR_ROLES = ['HR Manager', 'HR', 'HR_MANAGER'];

export default function SettingsLayout({ children }) {
    const { user } = useAuth();
    const pathname = usePathname();
    const [orgExpanded, setOrgExpanded] = useState(true);
    const [prefExpanded, setPrefExpanded] = useState(true);

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
            links.push({ href: '/settings/companies', label: 'Companies', icon: HiOutlineOfficeBuilding, desc: 'Manage companies' });
            links.push({ href: '/settings/branches', label: 'Branches', icon: HiOutlineLocationMarker, desc: 'Office locations' });
        }

        if (isHR || isAdmin || isManagement) {
            links.push({ href: '/settings/departments', label: 'Departments', icon: HiOutlineCollection, desc: 'Team structure' });
            links.push({ href: '/settings/designations', label: 'Designations', icon: HiOutlineIdentification, desc: 'Job titles' });
        }

        if (isHR || isAdmin || isManagement) {
            links.push({ href: '/settings/shifts', label: 'Shifts', icon: HiOutlineClock, desc: 'Work schedules' });
        }

        return links;
    }, [isHR, isAdmin, isSuperAdmin, isManagement]);

    // Preference links
    const preferenceLinks = [
        { href: '/settings/profile', label: 'Profile', icon: HiOutlineUser, desc: 'Your information' },
        { href: '/settings/security', label: 'Security', icon: HiOutlineShieldCheck, desc: 'Password & 2FA' },
        { href: '/settings/notifications', label: 'Notifications', icon: HiOutlineBell, desc: 'Alert preferences' },
        { href: '/settings/appearance', label: 'Appearance', icon: HiOutlineMoon, desc: 'Theme & display' },
    ];

    // Role badge styles
    const getRoleBadgeStyle = (roleName) => {
        const name = roleName?.toLowerCase() || '';
        if (name.includes('super')) return 'from-violet-500 to-fuchsia-500';
        if (name.includes('admin')) return 'from-blue-500 to-indigo-500';
        if (name.includes('manager')) return 'from-cyan-500 to-teal-500';
        if (name.includes('hr')) return 'from-orange-500 to-amber-500';
        if (name.includes('employee')) return 'from-emerald-500 to-green-500';
        if (name.includes('client')) return 'from-slate-500 to-gray-500';
        return 'from-primary to-primary/70';
    };

    // User initials
    const initials = useMemo(() => {
        const name = user?.full_name || user?.name || user?.email || 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }, [user]);

    const NavLink = ({ link }) => {
        const Icon = link.icon;
        const isActive = pathname === link.href || (link.href !== '/settings' && pathname.startsWith(link.href));
        return (
            <Link
                href={link.href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
            >
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                )}
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted/40 text-muted-foreground group-hover:bg-muted/70 group-hover:text-foreground'
                    }`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="truncate">{link.label}</div>
                    <div className={`text-[10px] truncate transition-colors ${isActive ? 'text-primary/60' : 'text-muted-foreground/60'}`}>{link.desc}</div>
                </div>
                {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
            </Link>
        );
    };

    const SectionHeader = ({ title, expanded, onToggle }) => (
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest hover:text-muted-foreground transition-colors"
        >
            <span>{title}</span>
            <HiOutlineChevronDown className={`w-3 h-3 transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`} />
        </button>
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Page Header */}
            <PageHeader
                title="Settings"
                description="Manage your account and organization preferences"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-6 self-start h-fit">

                    {/* User Profile Card */}
                    <Card className="overflow-hidden border-0 shadow-lg">
                        <div className={`h-16 bg-gradient-to-r ${getRoleBadgeStyle(userRole.name)} opacity-80`} />
                        <div className="px-4 pb-4 -mt-8">
                            <div className="flex items-end gap-3 mb-3">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getRoleBadgeStyle(userRole.name)} flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-card`}>
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0 pb-0.5">
                                    <h3 className="font-bold text-foreground text-sm truncate">{user?.full_name || user?.name || 'User'}</h3>
                                    <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                                </div>
                            </div>
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${getRoleBadgeStyle(userRole.name)} text-white shadow-sm`}>
                                <HiOutlineBadgeCheck className="w-3 h-3" />
                                {userRole.name || 'User'}
                            </div>
                        </div>
                    </Card>

                    {/* Navigation Card */}
                    <Card className="overflow-hidden border-0 shadow-lg p-2">
                        {/* Organization Group */}
                        {organizationLinks.length > 0 && (
                            <div className="mb-1">
                                <SectionHeader title="Organization" expanded={orgExpanded} onToggle={() => setOrgExpanded(!orgExpanded)} />
                                {orgExpanded && (
                                    <div className="space-y-0.5">
                                        {organizationLinks.map((link) => (
                                            <NavLink key={link.href} link={link} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Divider */}
                        {organizationLinks.length > 0 && (
                            <div className="mx-3 my-2 border-t border-border/40" />
                        )}

                        {/* Preferences Group */}
                        <div>
                            <SectionHeader title="Preferences" expanded={prefExpanded} onToggle={() => setPrefExpanded(!prefExpanded)} />
                            {prefExpanded && (
                                <div className="space-y-0.5">
                                    {preferenceLinks.map((link) => (
                                        <NavLink key={link.href} link={link} />
                                    ))}
                                </div>
                            )}
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
