'use client';

import { Card, CardHeader, CardBody } from '@/components/ui';

export default function NotificationsSettingsPage() {
    return (
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
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input type="checkbox" defaultChecked={pref.checked} className="sr-only peer" />
                                <div className="w-11 h-6 bg-muted/50 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-colors duration-300 border border-border"></div>
                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md -z-10 scale-150" />
                            </label>
                        </div>
                    ))}
                </div>
            </CardBody >
        </Card >
    );
}
