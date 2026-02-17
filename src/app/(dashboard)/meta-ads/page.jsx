/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import {
    Card, CardHeader, CardBody, PageHeader, StatusBadge, Button
} from '@/components/ui';
import {
    HiOutlineRefresh, HiOutlineCog, HiOutlineChartBar,
    HiOutlineUserGroup, HiOutlineCurrencyDollar, HiOutlineExternalLink,
    HiX
} from 'react-icons/hi';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { usePermission } from '@/hooks/usePermission';
import { motion, AnimatePresence } from 'framer-motion';

// --- Components ---

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`relative px-6 py-3 text-sm font-medium transition-colors duration-200 ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
    >
        {children}
        {active && (
            <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
            />
        )}
    </button>
);

const MetricCard = ({ title, value, icon: Icon, colorClass, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
    >
        <Card className="h-full border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 group">
            <CardBody className="flex items-center gap-5">
                <div className={`p-4 rounded-xl ${colorClass} bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                    <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                </div>
            </CardBody>
        </Card>
    </motion.div>
);

const LeadDetailModal = ({ lead, onClose }) => {
    if (!lead) return null;
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                >
                    <div className="flex justify-between items-center p-6 border-b border-border/50">
                        <div>
                            <h3 className="text-xl font-bold">Lead Details</h3>
                            <p className="text-sm text-muted-foreground">ID: {lead.lead_id}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors">
                            <HiX className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Full Name</label>
                                <p className="font-medium text-lg">{lead.full_name || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
                                <p className="font-medium text-lg">{lead.email || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Campaign</label>
                                <p className="font-medium">{lead.campaign_name || 'Generic / Organic'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Created At</label>
                                <p className="text-sm">{new Date(lead.created_time).toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
                                <StatusBadge status={lead.status} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Raw Meta Data</label>
                            <div className="bg-black/30 p-4 rounded-lg overflow-x-auto">
                                <pre className="text-xs font-mono text-emerald-400">
                                    {JSON.stringify(lead.raw_data || {}, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-border/50 bg-accent/5 flex justify-end">
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default function MetaAdsPage() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [config, setConfig] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);

    // Filter state
    const [selectedCampaignFilter, setSelectedCampaignFilter] = useState('all');

    const toast = useToast();
    const { isAdmin } = usePermission();

    // Admin features
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');

    const [settingsForm, setSettingsForm] = useState({
        ad_account_id: '',
        access_token: '',
        app_id: '',
        app_secret: ''
    });

    useEffect(() => {
        // Only fetch clients if admin
        if (isAdmin()) {
            fetchClients();
        } else {
            loadData();
        }
    }, []);

    useEffect(() => {
        if (isAdmin() && selectedClientId) {
            loadData();
        }
    }, [selectedClientId]);

    // When tab changes, ensure data is fresh but no need to full reload if just switching view
    useEffect(() => {
        if (!isAdmin() || (isAdmin() && selectedClientId)) {
            if (activeTab === 'dashboard' || activeTab === 'campaigns') fetchCampaigns();
            if (activeTab === 'dashboard' || activeTab === 'leads') fetchLeads();
            if (activeTab === 'settings') fetchConfig();
        }
    }, [activeTab]);

    // Refetch leads when filter changes
    useEffect(() => {
        if (activeTab === 'leads') {
            fetchLeads();
        }
    }, [selectedCampaignFilter]);

    const loadData = () => {
        fetchConfig();
        fetchCampaigns();
        fetchLeads();
    };

    const fetchClients = async () => {
        try {
            const res = await api.get('/clients?page=1&page_size=100');
            setClients(res.items || []);
            if (res.items && res.items.length > 0) {
                setSelectedClientId(res.items[0].id);
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    const fetchConfig = async () => {
        try {
            const params = isAdmin() && selectedClientId ? { params: { client_id: selectedClientId } } : {};
            const res = await api.get('/meta/config', params);
            setConfig(res);
            setSettingsForm({
                ad_account_id: res.ad_account_id || '',
                access_token: res.access_token || '',
                app_id: res.app_id || '',
                app_secret: res.app_secret || ''
            });
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error("Error fetching config:", error);
            } else {
                setConfig(null); // Reset config if 404
            }
        }
    };

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const params = isAdmin() && selectedClientId ? { params: { client_id: selectedClientId } } : {};
            const res = await api.get('/meta/campaigns', params);
            setCampaigns(res.items || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeads = async () => {
        try {
            let params = {};
            // Admin context
            if (isAdmin() && selectedClientId) {
                params.client_id = selectedClientId;
            }
            // Filter logic
            if (selectedCampaignFilter && selectedCampaignFilter !== 'all') {
                params.campaign_id = selectedCampaignFilter;
            }

            const res = await api.get('/meta/leads', { params });
            setLeads(res.items || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSync = async () => {
        try {
            setSyncing(true);
            const params = isAdmin() && selectedClientId ? `?client_id=${selectedClientId}` : '';
            const res = await api.post(`/meta/sync${params}`);
            toast.success(res?.message || "Synchronization completed successfully!");
            loadData(); // Reload all
        } catch (error) {
            toast.error("Sync failed. Check settings.");
            console.error(error);
        } finally {
            setSyncing(false);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            const configParams = isAdmin() && selectedClientId ? { params: { client_id: selectedClientId } } : {};
            await api.post('/meta/config', settingsForm, configParams);
            toast.success("Settings saved successfully");
            fetchConfig();
        } catch (error) {
            toast.error("Failed to save settings");
        }
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'campaigns', label: 'Campaigns' },
        { id: 'leads', label: 'Leads' },
        { id: 'settings', label: 'Settings' },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up pb-10">
            <PageHeader
                title="Meta Ads Integration"
                description="Manage your Facebook & Instagram Ads campaigns and leads"
            >
                <div className="flex gap-3 items-center">
                    {isAdmin() && (
                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10 backdrop-blur-sm">
                            <span className="text-xs font-medium text-muted-foreground pl-2 uppercase tracking-wider">Client</span>
                            <select
                                className="bg-transparent text-sm font-medium py-1 px-2 outline-none cursor-pointer hover:text-primary transition-colors min-w-[150px]"
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                            >
                                <option value="" disabled className="bg-slate-800 text-muted-foreground">Select Client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id} className="bg-slate-800 text-foreground">
                                        {client.first_name} {client.last_name || ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {(config || isAdmin()) && (
                        <Button
                            variant="primary"
                            onClick={handleSync}
                            disabled={syncing || (isAdmin() && !selectedClientId)}
                            className={`shadow-lg shadow-primary/20 ${syncing ? 'opacity-80' : ''}`}
                        >
                            <HiOutlineRefresh className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Syncing...' : 'Sync Now'}
                        </Button>
                    )}
                </div>
            </PageHeader>

            <div className="border-b border-white/10">
                <div className="flex gap-2">
                    {tabs.map(tab => (
                        <TabButton
                            key={tab.id}
                            active={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </TabButton>
                    ))}
                </div>
            </div>

            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* DASHBOARD TAB */}
                        {activeTab === 'dashboard' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MetricCard
                                    title="Active Campaigns"
                                    value={campaigns.filter(c => c.status === 'ACTIVE').length}
                                    icon={HiOutlineChartBar}
                                    colorClass="bg-blue-500 text-blue-100"
                                    delay={0}
                                />
                                <MetricCard
                                    title="Total Leads"
                                    value={leads.length}
                                    icon={HiOutlineUserGroup}
                                    colorClass="bg-emerald-500 text-emerald-100"
                                    delay={0.1}
                                />
                                <MetricCard
                                    title="Total Spend"
                                    value="$0.00"
                                    icon={HiOutlineCurrencyDollar}
                                    colorClass="bg-amber-500 text-amber-100"
                                    delay={0.2}
                                />
                            </div>
                        )}

                        {/* CAMPAIGNS TAB */}
                        {activeTab === 'campaigns' && (
                            <Card className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-md">
                                <CardHeader title="Your Campaigns" />
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr className="bg-white/5">
                                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Budget</th>
                                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Leads</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {campaigns.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="text-center p-12 text-muted-foreground">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <HiOutlineChartBar className="w-8 h-8 opacity-50" />
                                                            <p>No campaigns found yet.</p>
                                                            <Button variant="secondary" size="sm" onClick={() => setActiveTab('settings')}>Configure Settings</Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                campaigns.map((camp, i) => (
                                                    <motion.tr
                                                        key={camp.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="hover:bg-white/5 transition-colors"
                                                    >
                                                        <td className="p-4 font-medium">{camp.name}</td>
                                                        <td className="p-4"><StatusBadge status={camp.status.toLowerCase()} /></td>
                                                        <td className="p-4 text-muted-foreground">${camp.daily_budget} / day</td>
                                                        <td className="p-4 font-semibold text-primary">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedCampaignFilter(camp.id);
                                                                    setActiveTab('leads');
                                                                }}
                                                                className="hover:underline hover:text-primary/80 transition-colors"
                                                            >
                                                                {camp.lead_count}
                                                            </button>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}

                        {/* LEADS TAB */}
                        {activeTab === 'leads' && (
                            <>
                                <Card className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-md">
                                    <CardHeader title="Captured Leads">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filter:</span>
                                            <select
                                                className="bg-white/5 border border-white/10 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-primary/50 transition-colors hover:bg-white/10"
                                                value={selectedCampaignFilter}
                                                onChange={(e) => setSelectedCampaignFilter(e.target.value)}
                                            >
                                                <option value="all" className="bg-slate-900">All Campaigns</option>
                                                {campaigns.map(c => (
                                                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </CardHeader>
                                    <div className="overflow-x-auto">
                                        <table className="table w-full">
                                            <thead>
                                                <tr className="bg-white/5">
                                                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                                                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                                                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Campaign</th>
                                                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                                                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                                    <th className="w-[50px]"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {leads.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="text-center p-12 text-muted-foreground">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <HiOutlineUserGroup className="w-8 h-8 opacity-50" />
                                                                <p>No leads found for this view.</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    leads.map((lead, i) => (
                                                        <motion.tr
                                                            key={lead.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            onClick={() => setSelectedLead(lead)}
                                                            className="hover:bg-white/5 cursor-pointer transition-colors group"
                                                        >
                                                            <td className="p-4 font-medium">{lead.full_name}</td>
                                                            <td className="p-4 text-sm text-muted-foreground">{lead.email}</td>
                                                            <td className="p-4 text-sm">{lead.campaign_name || '-'}</td>
                                                            <td className="p-4 text-sm text-muted-foreground">{new Date(lead.created_time).toLocaleDateString()}</td>
                                                            <td className="p-4"><StatusBadge status={lead.status} /></td>
                                                            <td className="p-4 text-right">
                                                                <HiOutlineExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </td>
                                                        </motion.tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                                {selectedLead && (
                                    <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
                                )}
                            </>
                        )}

                        {/* SETTINGS TAB */}
                        {activeTab === 'settings' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-xl mx-auto"
                            >
                                <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                                    <CardHeader title="API Configuration" />
                                    <CardBody>
                                        <form onSubmit={handleSaveSettings} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Ad Account ID</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="input w-full bg-white/5 border-white/10 focus:border-primary/50"
                                                    placeholder="act_123456789"
                                                    value={settingsForm.ad_account_id}
                                                    onChange={e => setSettingsForm({ ...settingsForm, ad_account_id: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Access Token</label>
                                                <textarea
                                                    required
                                                    className="input w-full min-h-[120px] font-mono text-xs bg-white/5 border-white/10 focus:border-primary/50"
                                                    placeholder="EAA..."
                                                    value={settingsForm.access_token}
                                                    onChange={e => setSettingsForm({ ...settingsForm, access_token: e.target.value })}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Provide a long-lived User or System User access token with `ads_read` and `leads_retrieval` permissions.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">App ID (Optional)</label>
                                                    <input
                                                        type="text"
                                                        className="input w-full bg-white/5 border-white/10"
                                                        value={settingsForm.app_id}
                                                        onChange={e => setSettingsForm({ ...settingsForm, app_id: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">App Secret (Optional)</label>
                                                    <input
                                                        type="password"
                                                        className="input w-full bg-white/5 border-white/10"
                                                        value={settingsForm.app_secret}
                                                        onChange={e => setSettingsForm({ ...settingsForm, app_secret: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-6 flex justify-end">
                                                <Button type="submit" variant="primary" className="w-full sm:w-auto shadow-lg shadow-primary/20">
                                                    Save Configuration
                                                </Button>
                                            </div>
                                        </form>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
