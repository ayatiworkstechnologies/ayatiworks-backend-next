'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
    HiOutlinePlus, HiOutlineTrash, HiOutlineSearch,
    HiOutlineChevronLeft, HiOutlineCheck, HiOutlineX,
    HiOutlineUserAdd, HiOutlineClipboardCopy, HiOutlineDatabase,
    HiOutlineRefresh, HiOutlinePaperAirplane, HiOutlinePlay
} from 'react-icons/hi';

// Default "Leads" module field definitions — auto-created on first use
const LEADS_MODULE_FIELDS = [
    { label: 'Name', name: 'name', type: 'text', required: true, placeholder: 'Lead name' },
    { label: 'Email', name: 'email', type: 'email', required: false, placeholder: 'email@example.com' },
    { label: 'Phone', name: 'phone', type: 'text', required: false, placeholder: '+91 ...' },
    { label: 'Company', name: 'company', type: 'text', required: false, placeholder: 'Company name' },
    { label: 'Status', name: 'status', type: 'select', required: true, options: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'] },
    { label: 'Source', name: 'source', type: 'text', required: false, placeholder: 'e.g. Website, Referral' },
    { label: 'Budget', name: 'budget', type: 'number', required: false, placeholder: '0.00' },
    { label: 'Notes', name: 'notes', type: 'textarea', required: false, placeholder: 'Additional notes...' },
];

const STATUS_COLORS = {
    'New': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Contacted': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Qualified': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Proposal': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    'Negotiation': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Won': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Lost': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function ClientLeadsTab({ crmClientId, clientSlug }) {
    const toast = useToast();
    const [leadsModule, setLeadsModule] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recordsLoading, setRecordsLoading] = useState(false);
    const [view, setView] = useState('list'); // list | add
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({});

    // List state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 20;

    // API Key info
    const [apiKeyInfo, setApiKeyInfo] = useState({ has_api_key: false, api_key_preview: null });

    // POST Tester State
    const [showPostTester, setShowPostTester] = useState(false);
    const [postJson, setPostJson] = useState('{}');
    const [postLoading, setPostLoading] = useState(false);

    // API Response Viewer
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);
    const [apiResponseType, setApiResponseType] = useState('GET'); // GET | POST

    useEffect(() => {
        initLeadsModule();
        fetchApiKeyStatus();
    }, [crmClientId]);

    // ... (rest of the code)

    // ===== POST Tester =====
    const openPostTester = () => {
        const dummy = {};
        (leadsModule?.fields || []).forEach(f => {
            if (f.type === 'number') dummy[f.name] = 0;
            else if (f.type === 'checkbox') dummy[f.name] = false;
            else dummy[f.name] = f.type === 'date' ? '2026-01-01' : f.name === 'status' ? 'New' : `Test ${f.label}`;
        });
        setPostJson(JSON.stringify({ data: dummy }, null, 2));
        setShowPostTester(true);
    };

    const handleTestPost = async () => {
        setPostLoading(true);
        try {
            const body = JSON.parse(postJson);
            const res = await api.post(`/clients/${crmClientId}/modules/${leadsModule.id}/records`, body);
            setApiResponse(JSON.stringify(res, null, 2));
            setApiResponseType('POST');
            setShowResponseModal(true);
            setShowPostTester(false);
            fetchRecords(leadsModule.id); // Refresh list
        } catch (e) {
            alert('Error: ' + (e.message || 'Invalid JSON or API error'));
        } finally {
            setPostLoading(false);
        }
    };

    // Auto-create the "Leads" module if it doesn't exist, then fetch records
    const initLeadsModule = async () => {
        setLoading(true);
        try {
            // 1. Fetch all modules to find "leads" slug
            const res = await api.get(`/clients/${crmClientId}/modules?page_size=100`);
            const modules = res.items || [];
            let mod = modules.find(m => m.slug === 'leads');

            if (mod) {
                // Fetch full module detail (with fields)
                const fullMod = await api.get(`/clients/${crmClientId}/modules/${mod.id}`);
                setLeadsModule(fullMod);
                fetchRecords(fullMod.id);
            } else {
                // 2. Auto-create the Leads module
                const created = await api.post(`/clients/${crmClientId}/modules`, {
                    name: 'Leads',
                    description: 'Auto-generated leads module for tracking client leads',
                    fields: LEADS_MODULE_FIELDS,
                });
                setLeadsModule(created);
                setRecords([]);
            }
        } catch (e) {
            console.error('Failed to init leads module:', e);
            toast.error('Failed to load leads module');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecords = async (moduleId, pageNum = 1) => {
        setRecordsLoading(true);
        try {
            const res = await api.get(`/clients/${crmClientId}/modules/${moduleId}/records?page=${pageNum}&page_size=${pageSize}`);
            setRecords(res.items || []);
            setTotalPages(Math.ceil((res.total || 0) / pageSize));
            setPage(pageNum);
        } catch (e) {
            console.error('Failed to fetch records:', e);
        } finally {
            setRecordsLoading(false);
        }
    };

    const fetchApiKeyStatus = async () => {
        try {
            const res = await api.get(`/clients/${crmClientId}/api-key`);
            setApiKeyInfo(res);
        } catch (e) { /* ignore */ }
    };

    const startAddRecord = () => {
        const initial = {};
        (leadsModule?.fields || []).forEach(f => {
            initial[f.name] = f.type === 'checkbox' ? false : '';
        });
        // Set default status
        initial.status = 'New';
        setForm(initial);
        setView('add');
    };

    const handleCreate = async () => {
        if (!form.name?.trim()) { toast.error('Name is required'); return; }
        setSaving(true);
        try {
            await api.post(`/clients/${crmClientId}/modules/${leadsModule.id}/records`, { data: form });
            toast.success('Lead added!');
            setView('list');
            fetchRecords(leadsModule.id);
        } catch (e) {
            toast.error(e.message || 'Failed to add lead');
        } finally { setSaving(false); }
    };

    const handleDelete = async (recordId) => {
        if (!confirm('Delete this lead?')) return;
        try {
            await api.delete(`/clients/${crmClientId}/modules/${leadsModule.id}/records/${recordId}`);
            toast.success('Lead deleted');
            fetchRecords(leadsModule.id);
        } catch (e) { toast.error(e.message || 'Failed to delete'); }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied!');
    };

    const fields = leadsModule?.fields || [];

    // Filter records
    const filteredRecords = useMemo(() => {
        return records.filter(rec => {
            const data = rec.data || {};
            const matchSearch = !search ||
                Object.values(data).some(v =>
                    String(v).toLowerCase().includes(search.toLowerCase())
                );
            const matchStatus = !statusFilter || data.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [records, search, statusFilter]);

    // Stats
    const stats = useMemo(() => {
        const all = records.map(r => r.data?.status);
        return {
            total: records.length,
            new: all.filter(s => s === 'New').length,
            qualified: all.filter(s => ['Qualified', 'Proposal', 'Negotiation'].includes(s)).length,
            won: all.filter(s => s === 'Won').length,
        };
    }, [records]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!leadsModule) {
        return (
            <Card>
                <CardBody className="text-center py-8 text-muted-foreground">
                    <p>Failed to initialize leads module.</p>
                    <Button variant="secondary" onClick={initLeadsModule} className="mt-3">
                        <HiOutlineRefresh className="w-4 h-4" /> Retry
                    </Button>
                </CardBody>
            </Card>
        );
    }

    // ===== ADD LEAD VIEW =====
    if (view === 'add') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => setView('list')} className="p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <HiOutlineChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Add New Lead</h3>
                        <p className="text-sm text-muted-foreground">Create a new lead record using the dynamic Leads module</p>
                    </div>
                </div>

                <Card>
                    <CardHeader title="Lead Information" />
                    <CardBody className="space-y-4">
                        {fields.map(field => {
                            if (field.type === 'textarea') {
                                return (
                                    <div key={field.name} className="input-wrapper">
                                        <label className="input-label">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                                        <textarea
                                            value={form[field.name] || ''}
                                            onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                                            placeholder={field.placeholder || ''}
                                            className="input min-h-[80px]"
                                        />
                                    </div>
                                );
                            }
                            if (field.type === 'select') {
                                return (
                                    <div key={field.name} className="input-wrapper">
                                        <label className="input-label">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                                        <select
                                            value={form[field.name] || ''}
                                            onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                                            className="input"
                                        >
                                            <option value="">Select {field.label}...</option>
                                            {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                );
                            }
                            if (field.type === 'checkbox') {
                                return (
                                    <div key={field.name} className="input-wrapper">
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={!!form[field.name]} onChange={e => setForm(p => ({ ...p, [field.name]: e.target.checked }))} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                                            <label className="text-sm font-medium text-foreground">{field.label}</label>
                                        </div>
                                    </div>
                                );
                            }
                            return (
                                <Input
                                    key={field.name}
                                    label={`${field.label}${field.required ? ' *' : ''}`}
                                    type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : 'text'}
                                    value={form[field.name] || ''}
                                    onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                                    placeholder={field.placeholder || ''}
                                />
                            );
                        })}
                    </CardBody>
                </Card>

                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setView('list')} className="flex-1">Cancel</Button>
                    <Button variant="primary" onClick={handleCreate} loading={saving} className="flex-1 shadow-lg shadow-primary/20">
                        <HiOutlineCheck className="w-4 h-4" /> Save Lead
                    </Button>
                </div>
            </div>
        );
    }

    // ===== LIST VIEW =====
    // Get status options from the module fields definition
    const statusField = fields.find(f => f.name === 'status');
    const statusOptions = statusField?.options || [];

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Leads', value: stats.total, color: 'from-blue-500/20 to-indigo-500/20', textColor: 'text-blue-600' },
                    { label: 'New', value: stats.new, color: 'from-cyan-500/20 to-blue-500/20', textColor: 'text-cyan-600' },
                    { label: 'Qualified', value: stats.qualified, color: 'from-violet-500/20 to-purple-500/20', textColor: 'text-violet-600' },
                    { label: 'Won', value: stats.won, color: 'from-emerald-500/20 to-green-500/20', textColor: 'text-emerald-600' },
                ].map(stat => (
                    <Card key={stat.label}>
                        <CardBody className="py-4">
                            <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* API Info Card */}
            <Card>
                <CardBody>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                            <HiOutlineDatabase className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground text-sm">Leads API (Dynamic Module)</h4>
                            <p className="text-xs text-muted-foreground">Auto-generated from the <code className="px-1 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded font-mono">{leadsModule.slug}</code> module</p>
                        </div>
                        <button onClick={() => copyToClipboard(leadsModule.slug)} className="ml-auto p-1.5 rounded hover:bg-muted/30 text-muted-foreground" title="Copy slug">
                            <HiOutlineClipboardCopy className="w-4 h-4" />
                        </button>
                    </div>

                    {apiKeyInfo.has_api_key ? (
                        <div className="p-3 bg-muted/20 rounded-xl border border-border/40 space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold text-foreground mb-1">API Endpoints</p>
                                    <div className="space-y-1.5">
                                        <p className="text-xs text-muted-foreground">📥 GET Records</p>
                                        <code className="block text-xs font-mono text-muted-foreground bg-black/5 dark:bg-white/5 p-2 rounded-lg break-all">
                                            curl -H "X-API-Key: YOUR_KEY" {typeof window !== 'undefined' ? window.location.origin.replace(':3000', ':8000') : ''}/api/v1/public/{clientSlug}/{leadsModule.slug}/records
                                        </code>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="xs"
                                                variant="outline"
                                                onClick={async () => {
                                                    try {
                                                        const res = await api.get(`/clients/${crmClientId}/modules/${leadsModule.id}/records`);
                                                        setApiResponse(JSON.stringify(res, null, 2));
                                                        setApiResponseType('GET');
                                                        setShowResponseModal(true);
                                                    } catch (e) {
                                                        alert('Error: ' + e.message);
                                                    }
                                                }}
                                            >
                                                <HiOutlinePlay className="w-3 h-3" /> Test API
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 mt-2">
                                        <p className="text-xs text-muted-foreground">📤 POST Record</p>
                                        <code className="block text-xs font-mono text-muted-foreground bg-black/5 dark:bg-white/5 p-2 rounded-lg break-all">
                                            curl -X POST -H "X-API-Key: YOUR_KEY" -H "Content-Type: application/json" -d '{`{"data": {${fields.map(f => `"${f.name}": ""`).join(', ')}}}`}' {typeof window !== 'undefined' ? window.location.origin.replace(':3000', ':8000') : ''}/api/v1/public/{clientSlug}/{leadsModule.slug}/records
                                        </code>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="xs"
                                                variant="outline"
                                                onClick={openPostTester}
                                            >
                                                <HiOutlinePlay className="w-3 h-3" /> Test API
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">💡 Fields: {fields.map(f => f.label).join(', ')}</p>
                        </div>
                    ) : (
                        <p className="text-xs text-amber-600 dark:text-amber-400">⚠️ Generate an API Key in the Modules tab to use these endpoints externally.</p>
                    )}

                    {/* POST Tester Modal */}
                    <Modal
                        isOpen={showPostTester}
                        onClose={() => setShowPostTester(false)}
                        title="Test POST API"
                        size="lg"
                    >
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Edit the JSON payload below and click "Send Payload" to test creating a record via the API.
                            </p>
                            <textarea
                                value={postJson}
                                onChange={e => setPostJson(e.target.value)}
                                className="input font-mono text-xs min-h-[200px]"
                                placeholder='{"data": { ... }}'
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="secondary" onClick={() => setShowPostTester(false)}>Cancel</Button>
                                <Button variant="primary" onClick={handleTestPost} loading={postLoading}>
                                    <HiOutlinePaperAirplane className="w-3 h-3 rotate-90" /> Send Payload
                                </Button>
                            </div>
                        </div>
                    </Modal>

                    {/* API Response Modal */}
                    <Modal
                        isOpen={showResponseModal}
                        onClose={() => setShowResponseModal(false)}
                        title={`${apiResponseType} Response`}
                        size="lg"
                    >
                        <div className="space-y-4">
                            <div className="p-3 bg-muted/30 rounded-lg max-h-[400px] overflow-auto">
                                <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all">
                                    {apiResponse}
                                </pre>
                            </div>
                            <div className="flex justify-end">
                                <Button variant="secondary" onClick={() => setShowResponseModal(false)}>Close</Button>
                            </div>
                        </div>
                    </Modal>
                </CardBody>
            </Card>

            {/* Search + Filter + Add */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-3 flex-1 w-full sm:w-auto">
                    <div className="relative flex-1">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="input pl-10 text-sm"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="input w-auto text-sm"
                    >
                        <option value="">All Status</option>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <Button variant="secondary" onClick={() => fetchRecords(leadsModule.id, page)} title="Refresh">
                    <HiOutlineRefresh className={`w-4 h-4 ${recordsLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="primary" onClick={startAddRecord} className="shadow-lg shadow-primary/20">
                    <HiOutlinePlus className="w-4 h-4" /> Add Lead
                </Button>
            </div>

            {/* Leads Table — auto-generated from module fields */}
            <Card>
                <CardBody className="p-0">
                    {recordsLoading ? (
                        <div className="p-8 text-center">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="p-8 text-center">
                            <HiOutlineUserAdd className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground">
                                {search || statusFilter ? 'No leads match your filters.' : 'No leads yet. Add your first lead.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/50 bg-muted/20">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                                        {fields.map(f => (
                                            <th key={f.name} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                {f.label}
                                            </th>
                                        ))}
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((rec, idx) => (
                                        <tr key={rec.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{idx + 1}</td>
                                            {fields.map(f => {
                                                const val = rec.data?.[f.name];
                                                // Render status with color badge
                                                if (f.name === 'status' && val) {
                                                    const color = STATUS_COLORS[val] || 'bg-muted/30 text-muted-foreground';
                                                    return (
                                                        <td key={f.name} className="px-4 py-3">
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{val}</span>
                                                        </td>
                                                    );
                                                }
                                                if (f.type === 'checkbox') {
                                                    return <td key={f.name} className="px-4 py-3 text-sm">{val ? '✅' : '❌'}</td>;
                                                }
                                                return (
                                                    <td key={f.name} className="px-4 py-3 text-sm text-foreground max-w-[200px] truncate">
                                                        {val || '—'}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleDelete(rec.id)}
                                                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-muted-foreground hover:text-rose-500 transition-colors"
                                                >
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardBody>
                {/* Pagination */}
                {records.length > 0 && (
                    <div className="flex items-center justify-between p-4 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button size="xs" variant="secondary" disabled={page <= 1} onClick={() => fetchRecords(leadsModule.id, page - 1)}>Previous</Button>
                            <Button size="xs" variant="secondary" disabled={page >= totalPages} onClick={() => fetchRecords(leadsModule.id, page + 1)}>Next</Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Showing {filteredRecords.length} of {records.length} leads</span>
                {(search || statusFilter) && (
                    <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="text-primary hover:underline flex items-center gap-1">
                        <HiOutlineX className="w-3 h-3" /> Clear filters
                    </button>
                )}
            </div>
        </div>
    );
}
