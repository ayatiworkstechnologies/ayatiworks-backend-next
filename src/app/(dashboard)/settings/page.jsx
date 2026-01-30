'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, Avatar, PageHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import {
  HiOutlineUser, HiOutlineShieldCheck, HiOutlineBell, HiOutlineMoon, HiOutlineSun,
  HiOutlineOfficeBuilding, HiOutlineLocationMarker, HiOutlineCollection, HiOutlineIdentification,
  HiOutlineUserGroup, HiOutlineUserCircle, HiOutlineLockClosed, HiOutlineBadgeCheck, HiOutlineChevronRight,
  HiOutlineCamera, HiOutlineMail, HiOutlinePhone, HiOutlineCheck, HiOutlineKey, HiOutlineDeviceMobile,
  HiOutlineCheckCircle
} from 'react-icons/hi';

// Role group constants
const ADMIN_ROLES = ['Super Admin', 'Admin', 'SUPER_ADMIN', 'ADMIN'];
const MANAGEMENT_ROLES = ['Manager', 'MANAGER'];
const HR_ROLES = ['HR Manager', 'HR', 'HR_MANAGER'];

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Profile form state
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

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

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: HiOutlineUser, desc: 'Personal details and photo' },
    { id: 'security', label: 'Security', icon: HiOutlineShieldCheck, desc: 'Password and 2FA' },
    { id: 'notifications', label: 'Notifications', icon: HiOutlineBell, desc: 'Email and push alerts' },
    { id: 'appearance', label: 'Appearance', icon: HiOutlineMoon, desc: 'Theme preferences' },
  ];

  // Organization links (shown only to Admin and HR roles)
  const organizationLinks = useMemo(() => {
    if (!isHR && !isAdmin) return [];

    const links = [];

    if (isAdmin || isSuperAdmin) {
      links.push({ href: '/companies', label: 'Companies', icon: HiOutlineOfficeBuilding, desc: 'Manage company profiles' });
      links.push({ href: '/branches', label: 'Branches', icon: HiOutlineLocationMarker, desc: 'Manage branch locations' });
    }

    if (isHR || isAdmin) {
      links.push({ href: '/departments', label: 'Departments', icon: HiOutlineCollection, desc: 'Manage departments' });
      links.push({ href: '/designations', label: 'Designations', icon: HiOutlineIdentification, desc: 'Manage job titles' });
    }

    return links;
  }, [isHR, isAdmin, isSuperAdmin]);

  // Admin links (shown only to Super Admin and Admin)
  const adminLinks = useMemo(() => {
    if (!isAdmin) return [];

    const links = [
      { href: '/employees', label: 'Employees', icon: HiOutlineUserGroup, desc: 'Manage employee records' },
      { href: '/users', label: 'Users', icon: HiOutlineUserCircle, desc: 'Manage user accounts' },
    ];

    if (isSuperAdmin) {
      links.push({ href: '/permissions', label: 'Permissions', icon: HiOutlineLockClosed, desc: 'Manage role permissions' });
    }

    return links;
  }, [isAdmin, isSuperAdmin]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/users/${user.id}`, profileData);
      toast.success('Profile updated successfully');
      await refreshUser();
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await api.post('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      toast.success('Password changed successfully');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

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
      <PageHeader
        title="Settings"
        description="Manage your account preferences and system configurations"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-3 space-y-6">
          {/* Account Section */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="p-3 bg-muted/30 border-b border-border/50">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1">Account</h3>
            </div>
            <div className="p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                      ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="text-left">
                      <div className={isActive ? 'font-semibold' : 'font-medium'}>{tab.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Organization Section - Only for Admin/HR roles */}
          {organizationLinks.length > 0 && (
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="p-3 bg-muted/30 border-b border-border/50">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1">Organization</h3>
              </div>
              <div className="p-2 space-y-1">
                {organizationLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-xl transition-all duration-200 group"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                        <div>
                          <div className="font-medium">{link.label}</div>
                          <div className="text-xs text-muted-foreground/70">{link.desc}</div>
                        </div>
                      </span>
                      <HiOutlineChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </Link>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Admin Section - Only for Super Admin and Admin */}
          {adminLinks.length > 0 && (
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-border/50">
                <h3 className="text-xs font-semibold text-purple-600 uppercase tracking-wider px-3 py-1 flex items-center gap-2">
                  <HiOutlineLockClosed className="w-4 h-4" />
                  Administration
                </h3>
              </div>
              <div className="p-2 space-y-1">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all duration-200 group"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-5 h-5 group-hover:text-purple-500 transition-colors" />
                        <div>
                          <div className="font-medium">{link.label}</div>
                          <div className="text-xs text-muted-foreground/70">{link.desc}</div>
                        </div>
                      </span>
                      <HiOutlineChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-purple-500" />
                    </Link>
                  );
                })}
              </div>
            </Card>
          )}

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
                  <p className="text-xs text-muted-foreground mt-1">
                    {isSuperAdmin && 'Full system access'}
                    {!isSuperAdmin && isAdmin && 'Administrative privileges'}
                    {!isAdmin && isManagement && 'Management access'}
                    {!isManagement && isHR && 'HR department access'}
                    {!isHR && !isManagement && !isAdmin && 'Standard user access'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          {activeTab === 'profile' && (
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardHeader
                title="Profile Settings"
                subtitle="Update your personal information and profile picture"
                className="bg-muted/10"
              />
              <CardBody className="space-y-8 p-8">
                <form onSubmit={handleProfileSave} className="space-y-8">
                  {/* Avatar Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-muted/20 rounded-2xl border border-border/50">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-blue-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-200" />
                      <Avatar name={`${profileData.first_name} ${profileData.last_name}`} size="xl" className="relative ring-4 ring-background w-24 h-24 text-2xl" />
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 shadow-lg transition-transform hover:scale-110 active:scale-95 ring-4 ring-background"
                      >
                        <HiOutlineCamera className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg font-bold text-foreground">{profileData.first_name} {profileData.last_name}</h3>
                      <p className="text-muted-foreground">{profileData.email}</p>
                      <div className={`text-xs mt-2 font-semibold px-3 py-1 rounded-full inline-block ${getRoleBadgeColor(userRole.name)}`}>
                        {userRole.name || 'User'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Input
                        label="First Name"
                        value={profileData.first_name}
                        onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                        icon={<HiOutlineUser className="w-4 h-4" />}
                        required
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        icon={<HiOutlineMail className="w-4 h-4" />}
                        required
                        disabled={true} // Usually email change requires verification
                        wrapperClassName="opacity-75"
                      />
                    </div>
                    <div className="space-y-4">
                      <Input
                        label="Last Name"
                        value={profileData.last_name}
                        onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                        icon={<HiOutlineUser className="w-4 h-4" />}
                      />
                      <Input
                        label="Phone Number"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        icon={<HiOutlinePhone className="w-4 h-4" />}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border/50">
                    <Button type="submit" variant="primary" disabled={saving} className="min-w-[120px] shadow-lg shadow-primary/20">
                      <HiOutlineCheck className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardHeader title="Change Password" subtitle="Keep your account secure with a strong password" className="bg-muted/10" />
                <CardBody className="p-8">
                  <form onSubmit={handlePasswordChange} className="space-y-5 max-w-lg">
                    <Input
                      label="Current Password"
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      icon={<HiOutlineKey className="w-4 h-4" />}
                      required
                      placeholder="••••••••"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="New Password"
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        icon={<HiOutlineKey className="w-4 h-4" />}
                        required
                        minLength={8}
                        placeholder="Min 8 chars"
                      />
                      <Input
                        label="Confirm Password"
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        icon={<HiOutlineKey className="w-4 h-4" />}
                        required
                        minLength={8}
                        placeholder="Re-enter password"
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button type="submit" variant="primary" disabled={saving}>
                        {saving ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>

              <Card className="border-0 shadow-xl overflow-hidden">
                <CardHeader title="Two-Factor Authentication" subtitle="Add an extra layer of security" className="bg-muted/10" />
                <CardBody className="p-8">
                  <div className="flex items-center justify-between p-4 border border-border/60 rounded-xl bg-muted/5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <HiOutlineDeviceMobile className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Authenticator App</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">Secure your account with TOTP (Google Authenticator, Authy)</p>
                      </div>
                    </div>
                    <Button variant="secondary" onClick={() => toast.info('2FA setup coming soon')}>
                      {user?.is_2fa_enabled ? 'Disable' : 'Set Up'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardHeader title="Notification Preferences" subtitle="Manage your communication settings" className="bg-muted/10" />
              <CardBody className="p-0">
                <div className="divide-y divide-border/30">
                  {[
                    { label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email', checked: true },
                    { label: 'Push Notifications', desc: 'Get real-time updates on your browser', checked: false },
                    { label: 'Task Assignments', desc: 'Notify me when I am assigned a new task', checked: true },
                    { label: 'Project Updates', desc: 'Notify me about project status changes', checked: true },
                  ].map((pref, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 hover:bg-muted/5 transition-colors">
                      <div className="pr-4">
                        <h4 className="font-semibold text-foreground">{pref.label}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">{pref.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={pref.checked} className="sr-only peer" />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardHeader title="Appearance" subtitle="Customize the look and feel" className="bg-muted/10" />
              <CardBody className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    className={`group relative p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-border/80'}`}
                    onClick={() => theme === 'dark' && toggleTheme()}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><HiOutlineSun className="w-5 h-5" /></div>
                      <span className="font-bold text-foreground">Light Mode</span>
                    </div>
                    <div className="h-20 bg-gray-100 rounded-lg w-full border border-gray-200"></div>
                    {theme === 'light' && (
                      <div className="absolute top-4 right-4 text-primary"><HiOutlineCheckCircle className="w-6 h-6" /></div>
                    )}
                  </button>

                  <button
                    className={`group relative p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-border/80'}`}
                    onClick={() => theme === 'light' && toggleTheme()}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gray-800 text-yellow-400 rounded-lg"><HiOutlineMoon className="w-5 h-5" /></div>
                      <span className="font-bold text-foreground">Dark Mode</span>
                    </div>
                    <div className="h-20 bg-gray-900 rounded-lg w-full border border-gray-700"></div>
                    {theme === 'dark' && (
                      <div className="absolute top-4 right-4 text-primary"><HiOutlineCheckCircle className="w-6 h-6" /></div>
                    )}
                  </button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
