'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, PageHeader, StatCard } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import ClientModulesTab from '../clients/[id]/components/ClientModulesTab';
import ClientMailTab from '../clients/[id]/components/ClientMailTab';

import {
    HiOutlineCollection, HiOutlineMail, HiOutlineOfficeBuilding,
    HiOutlineIdentification, HiOutlineBriefcase, HiOutlineDocumentText,
    HiOutlineUsers, HiOutlineClipboardCheck, HiOutlineCurrencyDollar,
    HiOutlineCheckCircle
} from 'react-icons/hi';

export default function MyPortalPage() {
    const router = useRouter();
    const { user } = useAuth();
    const toast = useToast();
    const [portal, setPortal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(false);

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

    // Fetch projects when Projects tab is activated
    useEffect(() => {
        if (activeTab === 'projects' && portal?.client_id) {
            fetchProjects();
        }
    }, [activeTab, portal?.client_id]);

    const fetchProjects = async () => {
        setProjectsLoading(true);
        try {
            const data = await api.get(`/projects?client_id=${portal.client_id}`);
            setProjects(data?.items || data || []);
        } catch {
            setProjects([]);
        } finally {
            setProjectsLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: HiOutlineDocumentText },
        { id: 'modules', label: 'My Modules', icon: HiOutlineCollection },
        { id: 'mail', label: 'Mail', icon: HiOutlineMail },
        { id: 'projects', label: 'Projects', icon: HiOutlineBriefcase },
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

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <StatCard
                    icon={<HiOutlineIdentification className="w-6 h-6" />}
                    iconColor="emerald"
                    value={portal.status ? portal.status.charAt(0).toUpperCase() + portal.status.slice(1) : 'Active'}
                    label="Status"
                />
                <StatCard
                    icon={<HiOutlineCollection className="w-6 h-6" />}
                    iconColor="violet"
                    value={portal.modules_count ?? 0}
                    label="Modules"
                    onClick={() => setActiveTab('modules')}
                />
                <StatCard
                    icon={<HiOutlineBriefcase className="w-6 h-6" />}
                    iconColor="blue"
                    value={portal.projects_count ?? 0}
                    label="Active Projects"
                    onClick={() => setActiveTab('projects')}
                />
                <StatCard
                    icon={<HiOutlineClipboardCheck className="w-6 h-6" />}
                    iconColor="orange"
                    value={portal.active_tasks_count ?? 0}
                    label="Active Tasks"
                />
                <StatCard
                    icon={<HiOutlineCurrencyDollar className="w-6 h-6" />}
                    iconColor="green"
                    value={portal.open_invoices_count ?? 0}
                    label="Open Invoices"
                />
            </div>

            {/* Tabs */}
            <div className="bg-muted/30 p-1 rounded-xl w-fit border border-border/40 flex gap-1 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.id ? 'bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon className="w-4 h-4" /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader title="Your Portal" />
                            <CardBody className="space-y-4">
                                <p className="text-muted-foreground">
                                    Welcome to your client portal. From here you can manage your modules, email templates, send emails, and track your projects.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Button variant="secondary" className="w-full justify-start" onClick={() => setActiveTab('modules')}>
                                        <HiOutlineCollection className="w-5 h-5 mr-3 text-violet-500" /> Manage Modules
                                    </Button>
                                    <Button variant="secondary" className="w-full justify-start" onClick={() => setActiveTab('mail')}>
                                        <HiOutlineMail className="w-5 h-5 mr-3 text-cyan-500" /> Manage Mail
                                    </Button>
                                    <Button variant="secondary" className="w-full justify-start" onClick={() => setActiveTab('projects')}>
                                        <HiOutlineBriefcase className="w-5 h-5 mr-3 text-blue-500" /> View Projects
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Financial Summary */}
                    <Card>
                        <CardHeader title="Financial Summary" />
                        <CardBody className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total Spent</span>
                                <span className="text-lg font-bold text-foreground">
                                    ₹{(portal.total_spent ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Open Invoices</span>
                                <span className={`text-sm font-semibold ${portal.open_invoices_count > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {portal.open_invoices_count ?? 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Active Projects</span>
                                <span className="text-sm font-semibold text-foreground">{portal.projects_count ?? 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Active Tasks</span>
                                <span className="text-sm font-semibold text-foreground">{portal.active_tasks_count ?? 0}</span>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}

            {activeTab === 'modules' && <ClientModulesTab clientId={portal.client_id} clientSlug={portal.slug} isClientView={true} />}

            {activeTab === 'mail' && <ClientMailTab clientId={portal.client_id} />}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
                <Card>
                    <CardHeader title="My Projects" />
                    <CardBody>
                        {projectsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <HiOutlineBriefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="font-medium mb-1">No projects yet</p>
                                <p className="text-sm">Projects assigned to you will appear here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                                        onClick={() => router.push(`/projects/${project.id}`)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-semibold text-foreground">{project.name}</h4>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${project.status === 'active' || project.status === 'in_progress'
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : project.status === 'completed'
                                                        ? 'bg-blue-500/10 text-blue-600'
                                                        : 'bg-muted/40 text-muted-foreground'
                                                }`}>
                                                {project.status?.replace('_', ' ') || 'active'}
                                            </span>
                                        </div>
                                        {project.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{project.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            {project.start_date && (
                                                <span>Started {new Date(project.start_date).toLocaleDateString()}</span>
                                            )}
                                            {project.end_date && (
                                                <span>Due {new Date(project.end_date).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}
        </div>
    );
}

