'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
    HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineEye,
    HiOutlineCollection, HiOutlineDatabase, HiOutlineX, HiOutlineCheck,
    HiOutlineChevronLeft, HiOutlineKey, HiOutlineClipboardCopy, HiOutlineRefresh,
    HiOutlinePlay, HiOutlinePaperAirplane, HiOutlineCode
} from 'react-icons/hi';

const FIELD_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'date', label: 'Date' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Select' },
    { value: 'checkbox', label: 'Checkbox' },
];

export default function ClientModulesTab({ clientId, clientSlug, isClientView = false }) {
    const toast = useToast();
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // list | create | detail | addRecord
    const [selectedModule, setSelectedModule] = useState(null);
    const [records, setRecords] = useState([]);
    const [recordsLoading, setRecordsLoading] = useState(false);
    const [templates, setTemplates] = useState([]);

    // Create module form
    const [moduleForm, setModuleForm] = useState({ name: '', description: '', fields: [], mail_template_id: '' });
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Track edit mode

    // Add record form
    const [recordForm, setRecordForm] = useState({});
    const [recordSaving, setRecordSaving] = useState(false);

    // API Key state
    const [apiKeyInfo, setApiKeyInfo] = useState({ has_api_key: false, api_key_preview: null });
    const [generatedKey, setGeneratedKey] = useState(null);
    const [keyLoading, setKeyLoading] = useState(false);

    // List state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 20;

    useEffect(() => {
        fetchModules();
        fetchApiKeyStatus();
        if (!isClientView) fetchTemplates();
    }, [clientId]);

    const fetchTemplates = async () => {
        try {
            const res = await api.get(`/clients/${clientId}/mail-templates`);
            setTemplates(res.items || []);
        } catch (e) { console.error(e); }
    };

    const fetchModules = async () => {
        try {
            const res = await api.get(`/clients/${clientId}/modules`);
            setModules(res.items || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchRecords = async (moduleId, pageNum = 1) => {
        setRecordsLoading(true);
        try {
            const res = await api.get(`/clients/${clientId}/modules/${moduleId}/records?page=${pageNum}&page_size=${pageSize}`);
            setRecords(res.items || []);
            setTotalPages(Math.ceil((res.total || 0) / pageSize));
            setPage(pageNum);
        } catch (e) { console.error(e); }
        finally { setRecordsLoading(false); }
    };

    // ===== Templates (Preview & Edit) =====
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateForm, setTemplateForm] = useState({ name: '', subject: '', html_body: '', from_email: '', cc_email: '', bcc_email: '' });
    const [templateSaving, setTemplateSaving] = useState(false);

    const handlePreviewTemplate = async (templateId) => {
        try {
            const template = await api.get(`/clients/${clientId}/mail-templates/${templateId}`);
            setPreviewTemplate(template);
        } catch (e) { toast.error('Failed to load template preview'); }
    };

    const handleEditTemplate = async (templateId) => {
        try {
            const template = await api.get(`/clients/${clientId}/mail-templates/${templateId}`);
            setEditingTemplate(template);
            setTemplateForm({
                name: template.name,
                subject: template.subject,
                html_body: template.html_body || '',
                from_email: template.from_email || '',
                cc_email: (template.cc_email || []).join(', '),
                bcc_email: (template.bcc_email || []).join(', ')
            });
        } catch (e) { toast.error('Failed to load template for editing'); }
    };

    const handleUpdateTemplate = async () => {
        if (!templateForm.name || !templateForm.subject || !templateForm.html_body) {
            toast.error('All fields are required');
            return;
        }
        setTemplateSaving(true);
        try {
            const payload = {
                ...templateForm,
                cc_email: templateForm.cc_email.split(',').map(e => e.trim()).filter(Boolean),
                bcc_email: templateForm.bcc_email.split(',').map(e => e.trim()).filter(Boolean),
                variables: editingTemplate.variables // Maintain existing variables for now
            };
            await api.put(`/clients/${clientId}/mail-templates/${editingTemplate.id}`, payload);
            toast.success('Template updated!');
            setEditingTemplate(null);
            fetchTemplates(); // Refresh list
        } catch (e) {
            toast.error(e.message || 'Failed to update template');
        } finally { setTemplateSaving(false); }
    };
    const fetchApiKeyStatus = async () => {
        try {
            const res = await api.get(`/clients/${clientId}/api-key`);
            setApiKeyInfo(res);
        } catch (e) { console.error(e); }
    };

    const handleGenerateKey = async () => {
        setKeyLoading(true);
        try {
            const res = await api.post(`/clients/${clientId}/api-key`);
            setGeneratedKey(res.api_key);
            setApiKeyInfo({ has_api_key: true, api_key_preview: `${res.api_key.slice(0, 8)}...${res.api_key.slice(-4)}` });
            toast.success('API key generated! Copy it now — it won\'t be shown again.');
        } catch (e) { toast.error(e.message || 'Failed to generate API key'); }
        finally { setKeyLoading(false); }
    };

    const handleRevokeKey = async () => {
        if (!confirm('Revoke API key? External integrations using this key will stop working.')) return;
        setKeyLoading(true);
        try {
            await api.delete(`/clients/${clientId}/api-key`);
            setApiKeyInfo({ has_api_key: false, api_key_preview: null });
            setGeneratedKey(null);
            toast.success('API key revoked');
        } catch (e) { toast.error(e.message || 'Failed to revoke key'); }
        finally { setKeyLoading(false); }
    };

    // POST Tester State
    const [showPostTester, setShowPostTester] = useState(false);
    const [postJson, setPostJson] = useState('{}');
    const [postLoading, setPostLoading] = useState(false);

    const openPostTester = () => {
        const dummy = {};
        (selectedModule?.fields || []).forEach(f => {
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
            const res = await api.post(`/clients/${clientId}/modules/${selectedModule.id}/records`, body);
            alert('Success!\n' + JSON.stringify(res, null, 2));
            setShowPostTester(false);
            fetchRecords(selectedModule.id);
        } catch (e) {
            alert('Error: ' + (e.message || 'Invalid JSON or API error'));
        } finally {
            setPostLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    // ===== Module Builder =====
    const addField = () => {
        setModuleForm(prev => ({
            ...prev,
            fields: [...prev.fields, { name: '', label: '', type: 'text', required: false, options: [], placeholder: '' }]
        }));
    };

    const updateField = (index, key, value) => {
        setModuleForm(prev => {
            const fields = [...prev.fields];
            fields[index] = { ...fields[index], [key]: value };
            // Auto-generate name from label
            if (key === 'label') {
                fields[index].name = value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
            }
            return { ...prev, fields };
        });
    };

    const removeField = (index) => {
        setModuleForm(prev => ({ ...prev, fields: prev.fields.filter((_, i) => i !== index) }));
    };

    const handleCreateModule = async () => {
        if (!moduleForm.name.trim()) { toast.error('Module name is required'); return; }
        if (moduleForm.fields.length === 0) { toast.error('At least one field is required'); return; }
        for (const f of moduleForm.fields) {
            if (!f.label.trim()) { toast.error('All fields must have a label'); return; }
        }

        setSaving(true);
        try {
            const payload = {
                ...moduleForm,
                mail_template_id: moduleForm.mail_template_id ? parseInt(moduleForm.mail_template_id) : null
            };

            if (isEditing) {
                await api.put(`/clients/${clientId}/modules/${selectedModule.id}`, payload);
                toast.success('Module updated successfully!');
            } else {
                await api.post(`/clients/${clientId}/modules`, payload);
                toast.success('Module created successfully!');
            }

            setModuleForm({ name: '', description: '', fields: [], mail_template_id: '' });
            setIsEditing(false); // Reset edit mode
            setView('list');
            fetchModules();
        } catch (e) {
            toast.error(e.message || `Failed to ${isEditing ? 'update' : 'create'} module`);
        } finally { setSaving(false); }
    };

    const startEditModule = (mod) => {
        setModuleForm({
            name: mod.name,
            description: mod.description || '',
            fields: mod.fields.map(f => ({ ...f, options: f.options || [] })), // Ensure options array exists
            mail_template_id: mod.mail_template_id || ''
        });
        setIsEditing(true);
        setSelectedModule(mod); // Ensure we know which one to update
        setView('create'); // Re-use create view
    };

    const handleDeleteModule = async (moduleId) => {
        if (!confirm('Delete this module and all its records?')) return;
        try {
            await api.delete(`/clients/${clientId}/modules/${moduleId}`);
            toast.success('Module deleted');
            fetchModules();
            if (selectedModule?.id === moduleId) { setView('list'); setSelectedModule(null); }
        } catch (e) { toast.error(e.message || 'Failed to delete'); }
    };

    // ===== Records =====
    const openModule = async (mod) => {
        // Fetch full module detail (includes fields array)
        try {
            const fullModule = await api.get(`/clients/${clientId}/modules/${mod.id}`);
            setSelectedModule(fullModule);
        } catch (e) {
            // Fallback to list item data
            setSelectedModule(mod);
        }
        setView('detail');
        fetchRecords(mod.id);
    };

    const startAddRecord = () => {
        const initial = {};
        (selectedModule?.fields || []).forEach(f => {
            initial[f.name] = f.type === 'checkbox' ? false : (f.default_value || '');
        });
        setRecordForm(initial);
        setView('addRecord');
    };

    const handleCreateRecord = async () => {
        setRecordSaving(true);
        try {
            await api.post(`/clients/${clientId}/modules/${selectedModule.id}/records`, { data: recordForm });
            toast.success('Record added!');
            setView('detail');
            fetchRecords(selectedModule.id);
            // Update count
            setModules(prev => prev.map(m => m.id === selectedModule.id ? { ...m, record_count: m.record_count + 1 } : m));
        } catch (e) {
            toast.error(e.message || 'Failed to add record');
        } finally { setRecordSaving(false); }
    };

    const handleDeleteRecord = async (recordId) => {
        if (!confirm('Delete this record?')) return;
        try {
            await api.delete(`/clients/${clientId}/modules/${selectedModule.id}/records/${recordId}`);
            toast.success('Record deleted');
            fetchRecords(selectedModule.id);
        } catch (e) { toast.error(e.message || 'Failed to delete'); }
    };

    // ===== LIST VIEW =====
    if (view === 'list') {
        return (
            <div className="space-y-8 animate-fade-in-up">
                {/* API Key Section */}
                <Card className="overflow-hidden border border-border/60 shadow-md">
                    <CardBody className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/20">
                                    <HiOutlineKey className="w-6 h-6 text-amber-500" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-foreground text-lg">API Key Access</h4>
                                        {apiKeyInfo.has_api_key && (
                                            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-500/20">Active</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Authenticate external requests to your dynamic API endpoints.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {apiKeyInfo.has_api_key ? (
                                    <>
                                        <Button variant="danger" size="sm" onClick={handleRevokeKey} loading={keyLoading} className="shadow-none border border-transparent hover:border-border">
                                            <HiOutlineTrash className="w-4 h-4 mr-1.5" /> Revoke
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleGenerateKey} loading={keyLoading}>
                                            <HiOutlineRefresh className="w-4 h-4 mr-1.5" /> Regenerate
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="primary" size="sm" onClick={handleGenerateKey} loading={keyLoading} className="shadow-lg shadow-primary/20">
                                        <HiOutlineKey className="w-4 h-4 mr-1.5" /> Generate Key
                                    </Button>
                                )}
                            </div>
                        </div>

                        {generatedKey && (
                            <div className="mt-6 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl animate-fade-in">
                                <div className="flex items-center justify-between gap-3 mb-2">
                                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                                        <HiOutlineKey className="w-4 h-4" /> Your New API Key
                                    </p>
                                    <span className="text-xs text-amber-600/80 dark:text-amber-500/80 bg-amber-100/50 dark:bg-amber-900/30 px-2 py-0.5 rounded">Secret</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 block text-sm font-mono bg-white dark:bg-black/20 border border-amber-200/50 dark:border-amber-800/30 p-3 rounded-lg break-all select-all text-foreground shadow-sm">
                                        {generatedKey}
                                    </code>
                                    <button onClick={() => copyToClipboard(generatedKey)} className="p-3 bg-white dark:bg-black/20 border border-amber-200/50 dark:border-amber-800/30 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 transition-colors shadow-sm">
                                        <HiOutlineClipboardCopy className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 ml-1">
                                    ⚠️ Save this key securely. It will not be shown again.
                                </p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                    <div>
                        <h3 className="text-xl font-bold text-foreground">Dynamic Modules</h3>
                        <p className="text-sm text-muted-foreground mt-1">Custom data collections and records</p>
                    </div>
                    {/* Allow all users to create modules */}
                    <Button variant="primary" onClick={() => { setIsEditing(false); setModuleForm({ name: '', description: '', fields: [], mail_template_id: '' }); setView('create'); }} className="shadow-lg shadow-primary/20">
                        <HiOutlinePlus className="w-4 h-4 mr-1.5" /> New Module
                    </Button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 bg-muted/10 rounded-2xl border border-border/40 animate-pulse" />
                        ))}
                    </div>
                ) : modules.length === 0 ? (
                    <div className="text-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border/60">
                        <div className="w-20 h-20 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-iner border border-violet-500/10">
                            <HiOutlineDatabase className="w-10 h-10 text-violet-500/60" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No modules yet</h3>
                        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Create your first dynamic module to start tracking custom data records and auto-generate APIs.</p>
                        <Button variant="primary" onClick={() => { setIsEditing(false); setModuleForm({ name: '', description: '', fields: [], mail_template_id: '' }); setView('create'); }} className="shadow-xl shadow-primary/20">
                            <HiOutlinePlus className="w-4 h-4 mr-2" /> Create First Module
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map(mod => (
                            <Card key={mod.id} className="group hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 border-border/60 hover:border-primary/30 cursor-pointer overflow-hidden relative" onClick={() => openModule(mod)}>
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <CardBody className="p-6 relative">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-xl flex items-center justify-center border border-violet-500/10 group-hover:border-violet-500/30 transition-colors">
                                            <HiOutlineCollection className="w-6 h-6 text-violet-500 group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }} className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-muted-foreground/50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0" title="Delete Module">
                                            <HiOutlineTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="mb-4">
                                        <h4 className="font-bold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">{mod.name}</h4>
                                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5em]">{mod.description || 'No description provided.'}</p>
                                    </div>
                                    <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Fields</span>
                                            <span className="text-sm font-semibold text-foreground">{mod.field_count}</span>
                                        </div>
                                        <div className="w-px h-8 bg-border/40" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Records</span>
                                            <span className="text-sm font-semibold text-foreground">{mod.record_count}</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                        <HiOutlineChevronLeft className="w-5 h-5 text-primary rotate-180" />
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ===== CREATE MODULE VIEW =====
    if (view === 'create') {
        return (
            <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-2">
                    <button onClick={() => setView('list')} className="p-2.5 rounded-xl bg-background border border-border/60 hover:bg-muted/50 transition-colors shadow-sm">
                        <HiOutlineChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div>
                        <h3 className="text-xl font-bold text-foreground">{isEditing ? 'Edit Module' : 'Create New Module'}</h3>
                        <p className="text-sm text-muted-foreground">{isEditing ? 'Update your module structure and settings.' : 'Define your data structure. We\'ll generate the API automatically.'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-border/60">
                            <CardHeader title="Basic Info" className="border-b border-border/40" />
                            <CardBody className="space-y-5 p-6">
                                <Input
                                    label="Module Name"
                                    value={moduleForm.name}
                                    onChange={e => setModuleForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g., Products"
                                    required
                                    className="bg-muted/10 border-border/60 focus:bg-background transition-all"
                                />
                                <div className="input-wrapper">
                                    <label className="input-label">Description</label>
                                    <textarea
                                        value={moduleForm.description}
                                        onChange={e => setModuleForm(p => ({ ...p, description: e.target.value }))}
                                        placeholder="Briefly describe what this module tracks..."
                                        className="input min-h-[120px] bg-muted/10 border-border/60 focus:bg-background transition-all resize-none"
                                    />
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="border-border/60">
                            <CardHeader title="Automation" className="border-b border-border/40" />
                            <CardBody className="space-y-5 p-6">
                                <div className="input-wrapper">
                                    <label className="input-label text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Confirmation Email Template</label>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Automatically send this email when a new record is created via public API.
                                        Requires an 'email' field in the record.
                                    </p>
                                    <div className="relative">
                                        <select
                                            value={moduleForm.mail_template_id}
                                            onChange={e => setModuleForm(p => ({ ...p, mail_template_id: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-lg bg-muted/10 border border-border/60 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all cursor-pointer pr-10"
                                        >
                                            <option value="">No Auto-Email</option>
                                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-auto">
                                            {moduleForm.mail_template_id && (
                                                <>
                                                    <button onClick={() => handlePreviewTemplate(moduleForm.mail_template_id)} className="p-1 text-muted-foreground hover:text-primary transition-colors" title="Preview Template">
                                                        <HiOutlineEye className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleEditTemplate(moduleForm.mail_template_id)} className="p-1 text-muted-foreground hover:text-primary transition-colors" title="Edit Template">
                                                        <HiOutlinePencil className="w-4 h-4" />
                                                    </button>
                                                    <div className="w-px h-4 bg-border/60 mx-1" />
                                                </>
                                            )}
                                            <HiOutlineChevronLeft className="w-4 h-4 -rotate-90 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-muted-foreground">
                                            {templates.length === 0 ? "No templates found." : `${templates.length} templates available.`}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => fetchTemplates()} className="h-6 text-xs px-2 hover:bg-primary/10 hover:text-primary" title="Refresh list">
                                                <HiOutlineRefresh className="w-3 h-3 mr-1" /> Refresh
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => toast.info("Please switch to the 'Mail' tab to create new templates.")} className="h-6 text-xs px-2 hover:bg-primary/10 hover:text-primary">
                                                <HiOutlinePlus className="w-3 h-3 mr-1" /> Create Template
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-border/60 min-h-[500px] flex flex-col">
                            <div className="p-5 border-b border-border/40 flex items-center justify-between bg-muted/5">
                                <div>
                                    <h4 className="font-bold text-foreground">Fields Configuration</h4>
                                    <p className="text-xs text-muted-foreground">Define the inputs for your records</p>
                                </div>
                                <Button size="sm" variant="secondary" onClick={addField} className="shadow-sm">
                                    <HiOutlinePlus className="w-4 h-4 mr-1.5" /> Add Field
                                </Button>
                            </div>
                            <CardBody className="p-6 flex-1 bg-muted/5 space-y-4">
                                {moduleForm.fields.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full py-16 text-center border-2 border-dashed border-border/40 rounded-2xl">
                                        <div className="w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center mb-3">
                                            <HiOutlineCollection className="w-6 h-6 text-muted-foreground/40" />
                                        </div>
                                        <p className="font-medium text-foreground">No fields yet</p>
                                        <p className="text-sm text-muted-foreground mb-4">Add your first field to get started</p>
                                        <Button size="sm" variant="outline" onClick={addField}>
                                            Start Adding
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {moduleForm.fields.map((field, idx) => (
                                            <div key={idx} className="p-4 bg-background border border-border/60 rounded-xl shadow-sm animate-fade-in group hover:border-primary/30 transition-all">
                                                <div className="flex items-start gap-4">
                                                    <div className="mt-2 w-6 h-6 rounded-full bg-muted/20 flex items-center justify-center text-xs font-mono text-muted-foreground shrink-0 border border-border/40">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                                                        <div className="md:col-span-12 flex justify-between items-center md:hidden">
                                                            <span className="text-xs font-bold uppercase text-muted-foreground">Field {idx + 1}</span>
                                                            <button onClick={() => removeField(idx)} className="text-rose-500"><HiOutlineTrash className="w-4 h-4" /></button>
                                                        </div>

                                                        <div className="md:col-span-5">
                                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Label</label>
                                                            <input
                                                                type="text"
                                                                placeholder="e.g. Price"
                                                                value={field.label}
                                                                onChange={e => updateField(idx, 'label', e.target.value)}
                                                                className="w-full px-3 py-2 rounded-lg bg-muted/10 border border-border/60 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                            />
                                                        </div>
                                                        <div className="md:col-span-3">
                                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                                                            <div className="relative">
                                                                <select
                                                                    value={field.type}
                                                                    onChange={e => updateField(idx, 'type', e.target.value)}
                                                                    className="w-full pl-3 pr-8 py-2 rounded-lg bg-muted/10 border border-border/60 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all cursor-pointer"
                                                                >
                                                                    {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                                </select>
                                                                <HiOutlineCode className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-4 flex items-center gap-3 pt-6">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`req-${idx}`}
                                                                    checked={field.required}
                                                                    onChange={e => updateField(idx, 'required', e.target.checked)}
                                                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                                                                />
                                                                <label htmlFor={`req-${idx}`} className="text-xs font-medium text-muted-foreground cursor-pointer select-none">Required</label>
                                                            </div>
                                                            <button
                                                                onClick={() => removeField(idx)}
                                                                className="hidden md:flex ml-auto p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-muted-foreground hover:text-rose-500 transition-colors"
                                                                title="Remove field"
                                                            >
                                                                <HiOutlineTrash className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        {/* Supplemental Inputs */}
                                                        {field.type === 'select' && (
                                                            <div className="md:col-span-12 animate-fade-in pl-1">
                                                                <label className="text-xs font-medium text-primary mb-1 block">Dropdown Options</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Option 1, Option 2, Option 3"
                                                                    value={(field.options || []).join(', ')}
                                                                    onChange={e => updateField(idx, 'options', e.target.value.split(',').map(s => s.trim()))}
                                                                    className="w-full px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="md:col-span-12">
                                                            <input
                                                                type="text"
                                                                placeholder="Helper text / placeholder..."
                                                                value={field.placeholder || ''}
                                                                onChange={e => updateField(idx, 'placeholder', e.target.value)}
                                                                className="w-full px-3 py-1.5 rounded-lg bg-transparent border-b border-border/40 text-xs focus:border-primary/50 outline-none transition-all hover:border-border/80"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardBody>
                            <div className="p-5 border-t border-border/40 bg-background rounded-b-xl flex gap-4">
                                <Button variant="secondary" onClick={() => setView('list')} className="w-1/3">Cancel</Button>
                                <Button variant="primary" onClick={handleCreateModule} loading={saving} className="w-2/3 shadow-xl shadow-primary/20">
                                    <HiOutlineCheck className="w-5 h-5 mr-2" /> {isEditing ? 'Update Module' : 'Create Module'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Preview Template Modal */}
                {previewTemplate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-background rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-border/60">
                            <div className="p-4 border-b border-border/40 flex justify-between items-center bg-muted/5">
                                <h3 className="font-bold text-lg">{previewTemplate.name || 'Template Preview'}</h3>
                                <button onClick={() => setPreviewTemplate(null)} className="p-2 hover:bg-muted/20 rounded-lg transition-colors"><HiOutlineX className="w-5 h-5 text-muted-foreground" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <span className="text-xs font-bold uppercase text-muted-foreground block mb-1">Subject</span>
                                    <p className="font-medium text-foreground text-sm">{previewTemplate.subject}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold uppercase text-muted-foreground block mb-2">Content</span>
                                    <div className="p-4 bg-muted/5 rounded-lg border border-border/40 prose prose-sm max-w-none dark:prose-invert max-h-[400px] overflow-y-auto text-sm" dangerouslySetInnerHTML={{ __html: previewTemplate.html_body || '' }} />
                                </div>
                            </div>
                            <div className="p-4 border-t border-border/40 flex justify-end bg-muted/5">
                                <Button variant="secondary" onClick={() => setPreviewTemplate(null)}>Close</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Template Modal */}
                {editingTemplate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-background rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-border/60">
                            <div className="p-4 border-b border-border/40 flex justify-between items-center bg-muted/5">
                                <h3 className="font-bold text-lg">Quick Edit Template</h3>
                                <button onClick={() => setEditingTemplate(null)} className="p-2 hover:bg-muted/20 rounded-lg transition-colors"><HiOutlineX className="w-5 h-5 text-muted-foreground" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <Input label="Template Name" value={templateForm.name} onChange={e => setTemplateForm(p => ({ ...p, name: e.target.value }))} />
                                <Input label="Subject Line" value={templateForm.subject} onChange={e => setTemplateForm(p => ({ ...p, subject: e.target.value }))} />
                                <Input label="From Email (Optional)" value={templateForm.from_email} onChange={e => setTemplateForm(p => ({ ...p, from_email: e.target.value }))} placeholder="Override default sender. e.g. support@example.com" className="bg-muted/10 border-border/60" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="CC (Optional)" value={templateForm.cc_email} onChange={e => setTemplateForm(p => ({ ...p, cc_email: e.target.value }))} placeholder="Comma-separated emails" className="bg-muted/10 border-border/60" />
                                    <Input label="BCC (Optional)" value={templateForm.bcc_email} onChange={e => setTemplateForm(p => ({ ...p, bcc_email: e.target.value }))} placeholder="Comma-separated emails" className="bg-muted/10 border-border/60" />
                                </div>
                                <div className="input-wrapper">
                                    <label className="input-label">HTML Body</label>
                                    <textarea
                                        value={templateForm.html_body}
                                        onChange={e => setTemplateForm(p => ({ ...p, html_body: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg bg-muted/10 border border-border/60 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[200px] font-mono text-sm"
                                        placeholder="<html>..."
                                    />
                                </div>
                            </div>
                            <div className="p-4 border-t border-border/40 flex justify-end gap-3 bg-muted/5">
                                <Button variant="secondary" onClick={() => setEditingTemplate(null)}>Cancel</Button>
                                <Button variant="primary" onClick={handleUpdateTemplate} loading={templateSaving}>Update Template</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        );
    }


    // ===== MODULE DETAIL VIEW (records) =====
    if (view === 'detail' && selectedModule) {
        const fields = selectedModule.fields || [];

        return (
            <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center justify-between pb-4 border-b border-border/40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => { setView('list'); setSelectedModule(null); }} className="p-2 rounded-xl bg-background border border-border/60 hover:bg-muted/50 transition-colors shadow-sm group">
                            <HiOutlineChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                        <div>
                            <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                                {selectedModule.name}
                                <span className="px-2.5 py-0.5 rounded-full bg-muted/20 border border-border/40 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{selectedModule.slug}</span>
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                {selectedModule.description}
                                <button onClick={() => fetchRecords(selectedModule.id, page)} className="p-1 rounded-full hover:bg-muted/30 text-muted-foreground/50 hover:text-primary transition-colors ml-2" title="Refresh Data">
                                    <HiOutlineRefresh className={`w-3.5 h-3.5 ${recordsLoading ? 'animate-spin' : ''}`} />
                                </button>
                                <button onClick={() => startEditModule(selectedModule)} className="p-1 rounded-full hover:bg-muted/30 text-muted-foreground/50 hover:text-primary transition-colors ml-1" title="Edit Module">
                                    <HiOutlinePencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDeleteModule(selectedModule.id)} className="p-1 rounded-full hover:bg-muted/30 text-muted-foreground/50 hover:text-rose-500 transition-colors ml-1" title="Delete Module">
                                    <HiOutlineTrash className="w-3.5 h-3.5" />
                                </button>
                            </p>
                        </div>
                    </div>
                    <Button variant="primary" onClick={startAddRecord} className="shadow-lg shadow-primary/20">
                        <HiOutlinePlus className="w-4 h-4 mr-1.5" /> Add Record
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* LEFT COLUMN: Data Table */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="border border-border/60 shadow-sm overflow-hidden min-h-[400px]">
                            <CardBody className="p-0">
                                {recordsLoading ? (
                                    <div className="flex flex-col items-center justify-center h-64">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Loading Records...</p>
                                    </div>
                                ) : records.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-80 text-center p-8 bg-muted/5">
                                        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                                            <HiOutlineDatabase className="w-8 h-8 text-muted-foreground/30" />
                                        </div>
                                        <p className="font-semibold text-foreground text-lg mb-1">No records found</p>
                                        <p className="text-muted-foreground text-sm mb-6 max-w-xs">This module is empty. Add your first data entry.</p>
                                        <Button variant="outline" onClick={startAddRecord} className="bg-background">
                                            Add First Record
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-border/60 bg-muted/30">
                                                        <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-16">#</th>
                                                        {fields.slice(0, 5).map(f => (
                                                            <th key={f.name} className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{f.label}</th>
                                                        ))}
                                                        <th className="text-right px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/30">
                                                    {records.map((rec, idx) => (
                                                        <tr key={rec.id} className="hover:bg-muted/10 transition-colors group">
                                                            <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{(page - 1) * pageSize + idx + 1}</td>
                                                            {fields.slice(0, 5).map(f => (
                                                                <td key={f.name} className="px-6 py-4 text-sm text-foreground">
                                                                    {f.type === 'checkbox' ? (
                                                                        rec.data[f.name] ?
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-xs font-medium border border-emerald-500/20">Yes</span> :
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 text-xs font-medium border border-rose-500/20">No</span>
                                                                    ) : (
                                                                        <span className="line-clamp-1">{rec.data[f.name] || <span className="text-muted-foreground/40 italic">Null</span>}</span>
                                                                    )}
                                                                </td>
                                                            ))}
                                                            <td className="px-6 py-4 text-right">
                                                                <button onClick={() => handleDeleteRecord(rec.id)} className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-muted-foreground/60 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                                                                    <HiOutlineTrash className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* Pagination */}
                                        <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/5">
                                            <p className="text-xs text-muted-foreground font-medium">
                                                Page <span className="text-foreground">{page}</span> of {totalPages}
                                            </p>
                                            <div className="flex gap-2">
                                                <Button size="xs" variant="outline" disabled={page <= 1} onClick={() => fetchRecords(selectedModule.id, page - 1)} className="bg-background">Previous</Button>
                                                <Button size="xs" variant="outline" disabled={page >= totalPages} onClick={() => fetchRecords(selectedModule.id, page + 1)} className="bg-background">Next</Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: API Docs */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border border-indigo-500/20 shadow-lg shadow-indigo-500/5 overflow-hidden sticky top-6">
                            <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 p-4 border-b border-indigo-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white dark:bg-black/20 rounded-xl flex items-center justify-center shadow-sm border border-indigo-500/20">
                                        <HiOutlineCode className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground text-sm">Developer API</h4>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">External Access</p>
                                    </div>
                                </div>
                            </div>
                            <CardBody className="p-4 bg-muted/5 space-y-5">
                                {apiKeyInfo.has_api_key ? (
                                    <>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-indigo-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />GET Records</span>
                                                <Button size="xs" variant="outline" onClick={async () => {
                                                    try {
                                                        const res = await api.get(`/clients/${clientId}/modules/${selectedModule.id}/records`);
                                                        alert(JSON.stringify(res, null, 2));
                                                    } catch (e) { alert('Error: ' + e.message); }
                                                }} className="h-6">Test</Button>
                                            </div>
                                            <div className="bg-black/80 dark:bg-black/40 rounded-lg p-3 border border-white/5 shadow-inner">
                                                <code className="text-[10px] font-mono text-indigo-200 block break-all leading-relaxed">
                                                    GET /api/v1/public/{clientSlug}/{selectedModule.slug}/records<br />
                                                    <span className="text-muted-foreground">-H "X-API-Key: YOUR_KEY"</span>
                                                </code>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />POST Record</span>
                                                <Button size="xs" variant="outline" onClick={openPostTester} className="h-6">Test</Button>
                                            </div>
                                            <div className="bg-black/80 dark:bg-black/40 rounded-lg p-3 border border-white/5 shadow-inner">
                                                <code className="text-[10px] font-mono text-emerald-200 block break-all leading-relaxed">
                                                    POST /api/v1/public/{clientSlug}/{selectedModule.slug}/records<br />
                                                    <span className="text-muted-foreground">-H "X-API-Key: YOUR_KEY"</span>
                                                </code>
                                            </div>
                                        </div>

                                        <div className="pt-4 mt-2 border-t border-border/40">
                                            <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                                                <HiOutlinePaperAirplane className="w-3.5 h-3.5" /> Send Email API
                                            </p>
                                            <div className="bg-black/80 dark:bg-black/40 rounded-lg p-3 border border-white/5 shadow-inner">
                                                <code className="text-[10px] font-mono text-amber-200 block break-all leading-relaxed mb-2">
                                                    POST /api/v1/public/{clientSlug}/send-email
                                                </code>
                                                <p className="text-[10px] font-mono text-muted-foreground">Payload:</p>
                                                <code className="text-[10px] font-mono text-muted-foreground block text-opacity-60">
                                                    {"{ \"to_email\": \"...\", \"template_id\": 1, \"variables\": { ... } }"}
                                                </code>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-xs text-muted-foreground mb-3">Generate an API Key to see setup instructions.</p>
                                        <Button size="sm" variant="outline" onClick={handleGenerateKey} loading={keyLoading}>Generate Key</Button>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </div>

                {/* POST Tester Modal */}
                <Modal
                    isOpen={showPostTester}
                    onClose={() => setShowPostTester(false)}
                    title="Test POST API"
                    size="lg"
                >
                    <div className="space-y-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg flex items-start gap-3">
                            <div className="mt-0.5"><HiOutlineCode className="w-4 h-4 text-amber-600" /></div>
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                Edit the JSON payload below and click "Send Payload". This simulates an external POST request to create a record in the <strong>{selectedModule.name}</strong> module.
                            </p>
                        </div>
                        <div className="relative group">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <span className="text-[10px] bg-black/50 text-white px-2 py-1 rounded">JSON Editor</span>
                            </div>
                            <textarea
                                value={postJson}
                                onChange={e => setPostJson(e.target.value)}
                                className="w-full h-60 bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-xl resize-none focus:ring-2 focus:ring-primary/50 outline-none shadow-inner"
                                placeholder='{"data": { ... }}'
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="secondary" onClick={() => setShowPostTester(false)}>Close</Button>
                            <Button variant="primary" onClick={handleTestPost} loading={postLoading} className="shadow-lg shadow-primary/20">
                                <HiOutlinePaperAirplane className="w-4 h-4 rotate-90 mr-2" /> Send Payload
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div >
        );
    }

    // ===== ADD RECORD VIEW =====
    if (view === 'addRecord' && selectedModule) {
        const fields = selectedModule.fields || [];

        return (
            <div className="space-y-6 animate-fade-in-up max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-2">
                    <button onClick={() => setView('detail')} className="p-2.5 rounded-xl bg-background border border-border/60 hover:bg-muted/50 transition-colors shadow-sm">
                        <HiOutlineChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div>
                        <h3 className="text-xl font-bold text-foreground">Add New Record</h3>
                        <p className="text-sm text-muted-foreground module-breadcrumb">Module: <span className="font-semibold text-foreground">{selectedModule.name}</span></p>
                    </div>
                </div>

                <Card className="border-border/60 shadow-lg shadow-black/5">
                    <CardBody className="p-8 space-y-6">
                        {fields.map(field => {
                            if (field.type === 'textarea') {
                                return (
                                    <div key={field.name} className="input-wrapper">
                                        <label className="input-label text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">{field.label} {field.required && <span className="text-rose-500">*</span>}</label>
                                        <textarea value={recordForm[field.name] || ''} onChange={e => setRecordForm(p => ({ ...p, [field.name]: e.target.value }))} placeholder={field.placeholder || ''} className="w-full min-h-[100px] px-4 py-3 rounded-lg bg-muted/10 border border-border/60 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y" />
                                    </div>
                                );
                            }
                            if (field.type === 'select') {
                                return (
                                    <div key={field.name} className="input-wrapper">
                                        <label className="input-label text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">{field.label} {field.required && <span className="text-rose-500">*</span>}</label>
                                        <div className="relative">
                                            <select value={recordForm[field.name] || ''} onChange={e => setRecordForm(p => ({ ...p, [field.name]: e.target.value }))} className="w-full px-4 py-3 rounded-lg bg-muted/10 border border-border/60 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all cursor-pointer">
                                                <option value="">Select Option...</option>
                                                {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                            <HiOutlineChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>
                                );
                            }
                            if (field.type === 'checkbox') {
                                return (
                                    <div key={field.name} className="input-wrapper p-4 bg-muted/10 rounded-xl border border-border/40">
                                        <div className="flex items-center gap-3">
                                            <input type="checkbox" id={`field-${field.name}`} checked={!!recordForm[field.name]} onChange={e => setRecordForm(p => ({ ...p, [field.name]: e.target.checked }))} className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer" />
                                            <label htmlFor={`field-${field.name}`} className="text-sm font-semibold text-foreground cursor-pointer select-none">{field.label}</label>
                                        </div>
                                    </div>
                                );
                            }
                            return (
                                <div key={field.name} className="input-wrapper">
                                    <label className="input-label text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">{field.label} {field.required && <span className="text-rose-500">*</span>}</label>
                                    <input
                                        type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : 'text'}
                                        value={recordForm[field.name] || ''}
                                        onChange={e => setRecordForm(p => ({ ...p, [field.name]: e.target.value }))}
                                        placeholder={field.placeholder || ''}
                                        className="w-full px-4 py-3 rounded-lg bg-muted/10 border border-border/60 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                            );
                        })}
                    </CardBody>
                    <div className="p-6 bg-muted/5 border-t border-border/40 flex gap-4 rounded-b-xl">
                        <Button variant="secondary" onClick={() => setView('detail')} className="flex-1 py-2.5">Cancel</Button>
                        <Button variant="primary" onClick={handleCreateRecord} loading={recordSaving} className="flex-1 shadow-lg shadow-primary/20 py-2.5">
                            <HiOutlineCheck className="w-5 h-5 mr-2" /> Save Record
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

}
