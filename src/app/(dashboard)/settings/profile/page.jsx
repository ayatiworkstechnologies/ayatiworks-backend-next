'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import {
    HiOutlineUser, HiOutlineMail, HiOutlinePhone,
    HiOutlineCalendar, HiOutlineBadgeCheck, HiOutlineCamera,
    HiOutlineOfficeBuilding, HiOutlinePencil, HiOutlineCheck, HiOutlineX
} from 'react-icons/hi';

export default function ProfileSettingsPage() {
    const { user, refreshUser } = useAuth();
    const toast = useToast();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || user.name || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const initials = useMemo(() => {
        const name = user?.full_name || user?.name || user?.email || 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }, [user]);

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

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/auth/profile', formData);
            toast.success('Profile updated successfully');
            setEditing(false);
            if (refreshUser) refreshUser();
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            full_name: user?.full_name || user?.name || '',
            phone: user?.phone || '',
        });
        setEditing(false);
    };

    const roleName = user?.role?.name || user?.role?.code || 'User';
    const badgeStyle = getRoleBadgeStyle(roleName);

    const infoItems = [
        { icon: HiOutlineMail, label: 'Email', value: user?.email, editable: false },
        { icon: HiOutlineOfficeBuilding, label: 'Department', value: user?.department?.name || 'Not assigned', editable: false },
        { icon: HiOutlineBadgeCheck, label: 'Designation', value: user?.designation?.name || 'Not assigned', editable: false },
        { icon: HiOutlineCalendar, label: 'Member since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '-', editable: false },
    ];

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Profile Header Card */}
            <Card className="border-0 shadow-xl overflow-hidden">
                {/* Banner */}
                <div className={`h-28 md:h-36 bg-gradient-to-r ${badgeStyle} relative`}>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')] opacity-50" />
                </div>

                {/* Profile Info */}
                <div className="px-6 pb-6 -mt-14 md:-mt-16">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br ${badgeStyle} flex items-center justify-center text-white font-bold text-3xl shadow-xl ring-4 ring-card`}>
                                {initials}
                            </div>
                            <button className="absolute bottom-1 right-1 w-8 h-8 rounded-lg bg-card shadow-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                                <HiOutlineCamera className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Name & Role */}
                        <div className="flex-1 pb-1">
                            <h2 className="text-2xl font-bold text-foreground">{user?.full_name || user?.name || 'User'}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${badgeStyle} text-white`}>
                                    <HiOutlineBadgeCheck className="w-3 h-3" />
                                    {roleName}
                                </span>
                                <span className="text-sm text-muted-foreground">{user?.email}</span>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="flex gap-2">
                            {editing ? (
                                <>
                                    <Button variant="secondary" onClick={handleCancel} size="sm">
                                        <HiOutlineX className="w-4 h-4 mr-1" /> Cancel
                                    </Button>
                                    <Button variant="primary" onClick={handleSave} disabled={saving} size="sm">
                                        <HiOutlineCheck className="w-4 h-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
                                    </Button>
                                </>
                            ) : (
                                <Button variant="secondary" onClick={() => setEditing(true)} size="sm">
                                    <HiOutlinePencil className="w-4 h-4 mr-1" /> Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Profile Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Editable Info */}
                <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="p-4 bg-muted/20 border-b border-border/50">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <HiOutlineUser className="w-4 h-4 text-primary" />
                            Personal Information
                        </h3>
                    </div>
                    <CardBody className="p-5 space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Full Name</label>
                            {editing ? (
                                <Input
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="Your full name"
                                    icon={<HiOutlineUser className="w-4 h-4" />}
                                />
                            ) : (
                                <p className="text-foreground font-medium py-2">{formData.full_name || '-'}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Phone Number</label>
                            {editing ? (
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Your phone number"
                                    icon={<HiOutlinePhone className="w-4 h-4" />}
                                />
                            ) : (
                                <p className="text-foreground font-medium py-2">{formData.phone || '-'}</p>
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* Read-only Info */}
                <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="p-4 bg-muted/20 border-b border-border/50">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <HiOutlineOfficeBuilding className="w-4 h-4 text-primary" />
                            Account Details
                        </h3>
                    </div>
                    <CardBody className="p-0">
                        <div className="divide-y divide-border/30">
                            {infoItems.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div key={idx} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/10 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{item.label}</p>
                                            <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
