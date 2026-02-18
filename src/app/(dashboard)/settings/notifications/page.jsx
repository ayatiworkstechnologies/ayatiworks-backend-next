'use client';

import { useState } from 'react';
import { Card, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import {
    HiOutlineMail, HiOutlineBell, HiOutlineClipboardList,
    HiOutlineCalendar, HiOutlineChat, HiOutlineSpeakerphone,
    HiOutlineDeviceMobile, HiOutlineCheck
} from 'react-icons/hi';

const defaultPreferences = {
    email_notifications: true,
    push_notifications: false,
    task_assignments: true,
    project_updates: true,
    leave_approvals: true,
    attendance_alerts: false,
    daily_digest: true,
    mentions: true,
};

export default function NotificationsSettingsPage() {
    const toast = useToast();
    const [prefs, setPrefs] = useState(defaultPreferences);
    const [saving, setSaving] = useState(false);

    const toggle = (key) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        await new Promise(r => setTimeout(r, 600));
        toast.success('Notification preferences saved');
        setSaving(false);
    };

    const categories = [
        {
            title: 'Channels',
            desc: 'How you receive notifications',
            icon: HiOutlineSpeakerphone,
            gradient: 'from-blue-500 to-indigo-500',
            items: [
                { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive summaries and alerts via email', icon: HiOutlineMail },
                { key: 'push_notifications', label: 'Push Notifications', desc: 'Get real-time browser push alerts', icon: HiOutlineDeviceMobile },
            ]
        },
        {
            title: 'Activity',
            desc: 'What triggers notifications',
            icon: HiOutlineBell,
            gradient: 'from-amber-500 to-orange-500',
            items: [
                { key: 'task_assignments', label: 'Task Assignments', desc: 'When you are assigned a new task', icon: HiOutlineClipboardList },
                { key: 'project_updates', label: 'Project Updates', desc: 'Status changes on projects you follow', icon: HiOutlineCalendar },
                { key: 'leave_approvals', label: 'Leave Approvals', desc: 'Leave request status updates', icon: HiOutlineCalendar },
                { key: 'mentions', label: 'Mentions & Comments', desc: 'When someone mentions you or replies', icon: HiOutlineChat },
            ]
        },
        {
            title: 'Digest',
            desc: 'Periodic summary emails',
            icon: HiOutlineMail,
            gradient: 'from-emerald-500 to-teal-500',
            items: [
                { key: 'attendance_alerts', label: 'Attendance Alerts', desc: 'Daily check-in/check-out reminders', icon: HiOutlineBell },
                { key: 'daily_digest', label: 'Daily Digest', desc: 'End-of-day summary of all activity', icon: HiOutlineMail },
            ]
        },
    ];

    const Toggle = ({ checked, onChange }) => (
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 ${checked ? 'bg-primary' : 'bg-muted/60 border border-border'
                }`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'
                }`} />
        </button>
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            {categories.map((cat, catIdx) => {
                const CatIcon = cat.icon;
                return (
                    <Card key={catIdx} className="border-0 shadow-xl overflow-hidden">
                        <div className="p-5 bg-muted/20 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-lg`}>
                                    <CatIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{cat.title}</h3>
                                    <p className="text-sm text-muted-foreground">{cat.desc}</p>
                                </div>
                            </div>
                        </div>
                        <CardBody className="p-0">
                            <div className="divide-y divide-border/30">
                                {cat.items.map((item) => {
                                    const Icon = item.icon;
                                    const isOn = prefs[item.key];
                                    return (
                                        <div
                                            key={item.key}
                                            className="flex items-center justify-between px-6 py-4 hover:bg-muted/5 transition-colors cursor-pointer"
                                            onClick={() => toggle(item.key)}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isOn ? 'bg-primary/10 text-primary' : 'bg-muted/30 text-muted-foreground'
                                                    }`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-foreground text-sm">{item.label}</h4>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                                                </div>
                                            </div>
                                            <Toggle checked={isOn} onChange={() => toggle(item.key)} />
                                        </div>
                                    );
                                })}
                            </div>
                        </CardBody>
                    </Card>
                );
            })}

            {/* Save Button */}
            <div className="flex justify-end">
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                    <HiOutlineCheck className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
            </div>
        </div>
    );
}
