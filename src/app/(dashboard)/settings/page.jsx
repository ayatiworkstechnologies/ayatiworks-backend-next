'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
  HiOutlineUser, HiOutlineShieldCheck, HiOutlineBell, HiOutlineMoon,
  HiOutlineOfficeBuilding, HiOutlineLocationMarker, HiOutlineCollection, HiOutlineIdentification,
  HiOutlineClock, HiOutlineArrowRight, HiOutlineCog
} from 'react-icons/hi';

// Role group constants
const ADMIN_ROLES = ['Super Admin', 'Admin', 'SUPER_ADMIN', 'ADMIN'];
const MANAGEMENT_ROLES = ['Manager', 'MANAGER'];
const HR_ROLES = ['HR Manager', 'HR', 'HR_MANAGER'];

export default function SettingsOverviewPage() {
  const { user } = useAuth();

  const userRole = useMemo(() => {
    const roleName = user?.role?.name || user?.role?.code || '';
    const roleCode = user?.role?.code || user?.role?.name || '';
    return { name: roleName, code: roleCode };
  }, [user]);

  const isAdmin = useMemo(() => ADMIN_ROLES.includes(userRole.name) || ADMIN_ROLES.includes(userRole.code), [userRole]);
  const isManagement = useMemo(() => MANAGEMENT_ROLES.includes(userRole.name) || MANAGEMENT_ROLES.includes(userRole.code), [userRole]);
  const isHR = useMemo(() => HR_ROLES.includes(userRole.name) || HR_ROLES.includes(userRole.code), [userRole]);
  const isSuperAdmin = useMemo(() => userRole.code === 'SUPER_ADMIN' || userRole.name === 'Super Admin', [userRole]);

  const showOrg = isHR || isAdmin || isManagement;

  const orgCards = [
    { href: '/settings/companies', label: 'Companies', desc: 'Manage your organizations and company details', icon: HiOutlineOfficeBuilding, color: 'from-blue-500 to-indigo-500', show: isAdmin || isSuperAdmin },
    { href: '/settings/branches', label: 'Branches', desc: 'Configure office locations and branches', icon: HiOutlineLocationMarker, color: 'from-emerald-500 to-teal-500', show: isAdmin || isSuperAdmin },
    { href: '/settings/departments', label: 'Departments', desc: 'Organize team structure and departments', icon: HiOutlineCollection, color: 'from-violet-500 to-purple-500', show: showOrg },
    { href: '/settings/designations', label: 'Designations', desc: 'Manage job titles and designation levels', icon: HiOutlineIdentification, color: 'from-orange-500 to-amber-500', show: showOrg },
    { href: '/settings/shifts', label: 'Shifts', desc: 'Configure work schedules and timings', icon: HiOutlineClock, color: 'from-cyan-500 to-sky-500', show: showOrg },
  ].filter(c => c.show);

  const prefCards = [
    { href: '/settings/profile', label: 'Profile', desc: 'Update your personal information and photo', icon: HiOutlineUser, color: 'from-blue-500 to-cyan-500' },
    { href: '/settings/security', label: 'Security', desc: 'Password, two-factor authentication, and sessions', icon: HiOutlineShieldCheck, color: 'from-red-500 to-rose-500' },
    { href: '/settings/notifications', label: 'Notifications', desc: 'Configure how and when you receive alerts', icon: HiOutlineBell, color: 'from-amber-500 to-yellow-500' },
    { href: '/settings/appearance', label: 'Appearance', desc: 'Customize theme, colors, and display preferences', icon: HiOutlineMoon, color: 'from-indigo-500 to-violet-500' },
  ];

  const SettingsCard = ({ item, index }) => {
    const Icon = item.icon;
    return (
      <Link href={item.href} className="group block" style={{ animationDelay: `${index * 60}ms` }}>
        <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 overflow-hidden">
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</h3>
                  <HiOutlineArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.desc}</p>
              </div>
            </div>
          </div>
          {/* Bottom gradient line */}
          <div className={`h-0.5 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        </Card>
      </Link>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Banner */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="relative p-6 md:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <HiOutlineCog className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Settings Overview</h2>
              <p className="text-muted-foreground mt-0.5">Manage your account, preferences, and organization settings from one place.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Organization Settings */}
      {orgCards.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-primary to-primary/50" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Organization</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {orgCards.map((item, idx) => (
              <SettingsCard key={item.href} item={item} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Preferences */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-primary to-primary/50" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Preferences</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prefCards.map((item, idx) => (
            <SettingsCard key={item.href} item={item} index={orgCards.length + idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
