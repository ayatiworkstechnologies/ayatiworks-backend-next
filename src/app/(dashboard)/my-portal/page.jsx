'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, PageHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import ClientModulesTab from '../clients/[id]/components/ClientModulesTab';
import ClientMailTab from '../clients/[id]/components/ClientMailTab';
import ClientContactsTab from '../clients/[id]/components/ClientContactsTab';

import {
    HiOutlineCollection, HiOutlineMail, HiOutlineOfficeBuilding,
    HiOutlineIdentification, HiOutlineBriefcase, HiOutlineDocumentText,
    HiOutlineUsers
} from 'react-icons/hi';

export default function MyPortalPage() {
    const router = useRouter();
    const { user } = useAuth();
    const toast = useToast();
    const [portal, setPortal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchPortal();
    }, []);

    const fetchPortal = async () => {
        try {
            const data = await api.get('/dashboard/my-portal');
            setPortal(data);
        } catch (error) {
            console.error('Error fetching portal:', error);
            if (error.status === 404) {
                toast.error('No client profile found for your account. Please contact support.');
            }
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: HiOutlineDocumentText },
        { id: 'modules', label: 'My Modules', icon: HiOutlineCollection },
        { id: 'mail', label: 'Mail', icon: HiOutlineMail },
    ];

    if (loading) return (
        <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!portal) return (
        <div className="empty-state">
            <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HiOutlineOfficeBuilding className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="empty-state-title">Portal Not Available</h3>
            <p className="text-muted-foreground">No client profile found for your account. Please contact your admin.</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <PageHeader
                title={`Welcome, ${portal.name}`}
                description={
                    <span className="flex items-center gap-2">
                        {portal.company_name && (
                            <>
                                <HiOutlineOfficeBuilding className="w-4 h-4" />
                                {portal.company_name}
                            </>
                        )}
                        {portal.email && (
                            <>
                                <span className="text-border">•</span>
                                <HiOutlineMail className="w-4 h-4" />
                                {portal.email}
                            </>
                        )}
                    </span>
                }
            />

            {/* Status card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardBody className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
                            <HiOutlineIdentification className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                            <p className="font-bold text-foreground capitalize">{portal.status || 'Active'}</p>
                        </div>
                    </CardBody>
                </Card>



                <Card>
                    <CardBody className="flex items-center gap-3 cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all" onClick={() => setActiveTab('modules')}>
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center">
                            <HiOutlineCollection className="w-5 h-5 text-violet-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Modules</p>
                            <p className="font-bold text-foreground">View & Manage</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="flex items-center gap-3 cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all" onClick={() => setActiveTab('mail')}>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                            <HiOutlineMail className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Mail</p>
                            <p className="font-bold text-foreground">Templates & Send</p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Tabs */}
            <div className="bg-muted/30 p-1 rounded-xl w-fit border border-border/40 flex gap-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon className="w-4 h-4" /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
                <Card>
                    <CardHeader title="Your Portal" />
                    <CardBody className="space-y-4">
                        <p className="text-muted-foreground">
                            Welcome to your client portal. From here you can manage your modules, email templates, and send emails.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <Button variant="secondary" className="w-full justify-start" onClick={() => setActiveTab('modules')}>
                                <HiOutlineCollection className="w-5 h-5 mr-3 text-violet-500" /> Manage Modules
                            </Button>
                            <Button variant="secondary" className="w-full justify-start" onClick={() => setActiveTab('mail')}>
                                <HiOutlineMail className="w-5 h-5 mr-3 text-cyan-500" /> Manage Mail
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}

            {activeTab === 'modules' && <ClientModulesTab clientId={portal.client_id} clientSlug={portal.slug} isClientView={true} />}

            {activeTab === 'mail' && <ClientMailTab clientId={portal.client_id} />}
        </div>
    );
}
