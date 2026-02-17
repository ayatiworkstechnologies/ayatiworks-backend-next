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
    HiOutlineRefresh, HiOutlinePaperAirplane, HiOutlinePlay,
    HiOutlineUsers
} from 'react-icons/hi';

// Default "Contacts" module field definitions — auto-created on first use
const CONTACTS_MODULE_FIELDS = [
    { label: 'Name', name: 'name', type: 'text', required: true, placeholder: 'Contact name' },
    { label: 'Email', name: 'email', type: 'email', required: false, placeholder: 'email@example.com' },
    { label: 'Phone', name: 'phone', type: 'text', required: false, placeholder: '+91 ...' },
    { label: 'Title', name: 'title', type: 'text', required: false, placeholder: 'Job Title' },
    { label: 'Company', name: 'company', type: 'text', required: false, placeholder: 'Company name' },
    { label: 'Status', name: 'status', type: 'select', required: true, options: ['Active', 'Inactive', 'Lead', 'Customer', 'Partner'] },
    { label: 'Notes', name: 'notes', type: 'textarea', required: false, placeholder: 'Additional notes...' },
];

const STATUS_COLORS = {
    'Active': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Inactive': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    'Lead': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Customer': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Partner': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function ClientContactsTab({ crmClientId, clientSlug }) {
    const toast = useToast();
    const [contactsModule, setContactsModule] = useState(null);
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
        initContactsModule();
        fetchApiKeyStatus();
    }, [crmClientId]);

    // ===== POST Tester =====
    const openPostTester = () => {
        const dummy = {};
        (contactsModule?.fields || []).forEach(f => {
            if (f.type === 'number') dummy[f.name] = 0;
            else if (f.type === 'checkbox') dummy[f.name] = false;
            else dummy[f.name] = f.type === 'date' ? '2026-01-01' : f.name === 'status' ? 'Active' : `Test ${f.label}`;
        });
        setPostJson(JSON.stringify({ data: dummy }, null, 2));
        setShowPostTester(true);
    };

    const handleTestPost = async () => {
        setPostLoading(true);
        try {
            const body = JSON.parse(postJson);
            const res = await api.post(`/clients/${crmClientId}/modules/${contactsModule.id}/records`, body);
            setApiResponse(JSON.stringify(res, null, 2));
            setApiResponseType('POST');
            setShowResponseModal(true);
            setShowPostTester(false);
            fetchRecords(contactsModule.id); // Refresh list
        } catch (e) {
            alert('Error: ' + (e.message || 'Invalid JSON or API error'));
        } finally {
            setPostLoading(false);
        }
    };

    // Auto-create the "Contacts" module if it doesn't exist, then fetch records
    const initContactsModule = async () => {
        setLoading(true);
        try {
            // 1. Fetch all modules to find "contacts" slug
            const res = await api.get(`/clients/${crmClientId}/modules?page_size=100`);
            const modules = res.items || [];
            let mod = modules.find(m => m.slug === 'contacts');

            if (mod) {
                // Fetch full module detail (with fields)
                const fullMod = await api.get(`/clients/${crmClientId}/modules/${mod.id}`);
                setContactsModule(fullMod);
                fetchRecords(fullMod.id);
            } else {
                // 2. Auto-create the Contacts module
                const created = await api.post(`/clients/${crmClientId}/modules`, {
                    name: 'Contacts',
                    description: 'Auto-generated contacts module for tracking client contacts',
                    fields: CONTACTS_MODULE_FIELDS,
                });
                setContactsModule(created);
                setRecords([]);
            }
        } catch (e) {
            console.error('Failed to init contacts module:', e);
            toast.error('Failed to load contacts module');
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
        (contactsModule?.fields || []).forEach(f => {
            initial[f.name] = f.type === 'checkbox' ? false : '';
        });
        // Set default status
        initial.status = 'Active';
        setForm(initial);
        setView('add');
    };

    const handleCreate = async () => {
        if (!form.name?.trim()) { toast.error('Name is required'); return; }
        setSaving(true);
        try {
            await api.post(`/clients/${crmClientId}/modules/${contactsModule.id}/records`, { data: form });
            toast.success('Contact added!');
            setView('list');
            fetchRecords(contactsModule.id);
        } catch (e) {
            toast.error(e.message || 'Failed to add contact');
        } finally { setSaving(false); }
    };

    const handleDelete = async (recordId) => {
        if (!confirm('Delete this contact?')) return;
        try {
            await api.delete(`/clients/${crmClientId}/modules/${contactsModule.id}/records/${recordId}`);
            toast.success('Contact deleted');
            fetchRecords(contactsModule.id);
        } catch (e) { toast.error(e.message || 'Failed to delete'); }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied!');
    };

    const fields = contactsModule?.fields || [];

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
            active: all.filter(s => s === 'Active').length,
            inactive: all.filter(s => s === 'Inactive').length,
            partners: all.filter(s => s === 'Partner').length,
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

    if (!contactsModule) {
        return (
            <Card>
                <CardBody className="text-center py-8 text-muted-foreground">
                    <p>Failed to initialize contacts module.</p>
                    <Button variant="secondary" onClick={initContactsModule} className="mt-3">
                        <HiOutlineRefresh className="w-4 h-4" /> Retry
                    </Button>
                </CardBody>
            </Card>
        );
    }

    // ===== ADD CONTACT VIEW =====
    if (view === 'add') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => setView('list')} className="p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <HiOutlineChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Add New Contact</h3>
                        <p className="text-sm text-muted-foreground">Create a new contact record using the dynamic Contacts module</p>
                    </div>
                </div>

                <Card>
                    <CardHeader title="Contact Information" />
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
                        <HiOutlineCheck className="w-4 h-4" /> Save Contact
                    </Button>
                </div>
            </div>
        );
    }

    // ===== LIST VIEW =====
    const statusField = fields.find(f => f.name === 'status');
    const statusOptions = statusField?.options || [];

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Contacts', value: stats.total, color: 'from-blue-500/20 to-indigo-500/20', textColor: 'text-blue-600' },
                    { label: 'Active', value: stats.active, color: 'from-green-500/20 to-emerald-500/20', textColor: 'text-green-600' },
                    { label: 'Inactive', value: stats.inactive, color: 'from-gray-500/20 to-slate-500/20', textColor: 'text-gray-600' },
                    { label: 'Partners', value: stats.partners, color: 'from-amber-500/20 to-orange-500/20', textColor: 'text-amber-600' },
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
                            <h4 className="font-bold text-foreground text-sm">Contacts API (Dynamic Module)</h4>
                            <p className="text-xs text-muted-foreground">Auto-generated from the <code className="px-1 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded font-mono">{contactsModule.slug}</code> module</p>
                        </div>
                        <button onClick={() => copyToClipboard(contactsModule.slug)} className="ml-auto p-1.5 rounded hover:bg-muted/30 text-muted-foreground" title="Copy slug">
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
                                            curl -H "X-API-Key: YOUR_KEY" {typeof window !== 'undefined' ? window.location.origin.replace(':3000', ':8000') : ''}/api/v1/public/{clientSlug}/{contactsModule.slug}/records
                                        </code>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="xs"
                                                variant="outline"
                                                onClick={async () => {
                                                    try {
                                                        const res = await api.get(`/clients/${crmClientId}/modules/${contactsModule.id}/records`);
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
                                            curl -X POST -H "X-API-Key: YOUR_KEY" -H "Content-Type: application/json" -d '{`{"data": {${fields.map(f => `"${f.name}": ""`).join(', ')}}}`}' {typeof window !== 'undefined' ? window.location.origin.replace(':3000', ':8000') : ''}/api/v1/public/{clientSlug}/{contactsModule.slug}/records
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
                            placeholder="Search contacts..."
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
                <Button variant="secondary" onClick={() => fetchRecords(contactsModule.id, page)} title="Refresh">
                    <HiOutlineRefresh className={`w-4 h-4 ${recordsLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="primary" onClick={startAddRecord} className="shadow-lg shadow-primary/20">
                    <HiOutlinePlus className="w-4 h-4" /> Add Contact
                </Button>
            </div>

            {/* Contacts Table */}
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
                                {search || statusFilter ? 'No contacts match your filters.' : 'No contacts yet. Add your first contact.'}
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
                            <Button size="xs" variant="secondary" disabled={page <= 1} onClick={() => fetchRecords(contactsModule.id, page - 1)}>Previous</Button>
                            <Button size="xs" variant="secondary" disabled={page >= totalPages} onClick={() => fetchRecords(contactsModule.id, page + 1)}>Next</Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Showing {filteredRecords.length} of {records.length} contacts</span>
                {(search || statusFilter) && (
                    <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="text-primary hover:underline flex items-center gap-1">
                        <HiOutlineX className="w-3 h-3" /> Clear filters
                    </button>
                )}
            </div>
        </div>
    );
}
