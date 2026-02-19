'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import {
    HiOutlineChevronLeft, HiOutlineRefresh, HiOutlinePlus,
    HiOutlineTrash, HiOutlinePencil, HiOutlineSearch,
    HiOutlineCheck, HiOutlineX, HiOutlineDownload, HiOutlineCollection
} from 'react-icons/hi';
import { format } from 'date-fns';

export default function RecordManager({ clientId, module, onBack }) {
    const toast = useToast();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const pageSize = 20;

    // Form State
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(null); // record ID
    const [recordForm, setRecordForm] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (module?.id) {
            fetchRecords(1);
        }
    }, [module, searchTerm]);

    const fetchRecords = async (pageNum = 1) => {
        setLoading(true);
        try {
            // Include search param if exists
            const query = new URLSearchParams({
                page: pageNum,
                page_size: pageSize,
                ...(searchTerm && { search: searchTerm })
            });

            const res = await api.get(`/clients/${clientId}/modules/${module.id}/records?${query.toString()}`);
            setRecords(res.items || []);
            setTotalPages(Math.ceil((res.total || 0) / pageSize));
            setPage(pageNum);
        } catch (e) {
            console.error(e);
            toast.error('Failed to load records');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1); // Reset to page 1 on search
    };

    // --- CRUD Operations ---

    const startCreate = () => {
        const initial = {};
        (module.fields || []).forEach(f => {
            initial[f.name] = f.type === 'checkbox' ? false : (f.default_value || '');
        });
        setRecordForm(initial);
        setIsCreating(true);
    };

    const startEdit = (record) => {
        setRecordForm({ ...record.data });
        setIsEditing(record.id);
        setIsCreating(true); // Reuse create modal/view
    };

    const handleDelete = async (recordId) => {
        if (!confirm('Delete this record permanently?')) return;
        try {
            await api.delete(`/clients/${clientId}/modules/${module.id}/records/${recordId}`);
            toast.success('Record deleted');
            fetchRecords(page);
        } catch (e) { toast.error(e.message || 'Failed to delete'); }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (isEditing) {
                await api.put(`/clients/${clientId}/modules/${module.id}/records/${isEditing}`, { data: recordForm });
                toast.success('Record updated');
            } else {
                const res = await api.post(`/clients/${clientId}/modules/${module.id}/records`, { data: recordForm });
                if (res.email_sent) {
                    toast.success('Record added & Email sent');
                } else if (module.mail_template_id) {
                    toast.warning('Record added, but email likely failed');
                } else {
                    toast.success('Record added');
                }
            }
            setIsCreating(false);
            setIsEditing(null);
            fetchRecords(page);
        } catch (e) {
            toast.error(e.message || 'Failed to save record');
        } finally {
            setSaving(false);
        }
    };

    // Helper to render field inputs based on type
    const renderFieldInput = (field) => {
        const val = recordForm[field.name];

        const handleChange = (value) => {
            setRecordForm(prev => ({ ...prev, [field.name]: value }));
        };

        if (field.type === 'textarea') {
            return (
                <textarea
                    value={val || ''}
                    onChange={e => handleChange(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-muted/10 border border-border/60 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px]"
                    placeholder={field.placeholder || field.label}
                    required={field.required}
                />
            );
        }

        if (field.type === 'select') {
            return (
                <div className="relative">
                    <select
                        value={val || ''}
                        onChange={e => handleChange(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-muted/10 border border-border/60 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all cursor-pointer"
                        required={field.required}
                    >
                        <option value="">Select...</option>
                        {(field.options || []).map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            );
        }

        if (field.type === 'checkbox') {
            return (
                <div className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg border border-border/60">
                    <input
                        type="checkbox"
                        checked={!!val}
                        onChange={e => handleChange(e.target.checked)}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-sm font-medium">{val ? 'Yes' : 'No'}</span>
                </div>
            );
        }

        return (
            <Input
                type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : 'text'}
                value={val || ''}
                onChange={e => handleChange(e.target.value)}
                placeholder={field.placeholder || field.label}
                required={field.required}
                className="bg-muted/10 border-border/60 focus:bg-background"
            />
        );
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-xl bg-background border border-border/60 hover:bg-muted/50 transition-colors shadow-sm group">
                        <HiOutlineChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                            {module.name}
                            <span className="px-2.5 py-0.5 rounded-full bg-muted/20 border border-border/40 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{module.slug}</span>
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            {module.description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 group">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/10 border border-border/60 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm hover:border-border/80"
                        />
                    </div>
                    <Button variant="outline" onClick={() => fetchRecords(page)}>
                        <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button variant="primary" onClick={startCreate} className="shadow-lg shadow-primary/20 bg-primary/90 hover:bg-primary backdrop-blur-sm">
                        <HiOutlinePlus className="w-4 h-4 md:mr-1.5" /> <span className="hidden md:inline">Add Record</span>
                    </Button>
                </div>
            </div>

            {/* Content */}
            {loading && records.length === 0 ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-muted/10 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : records.length === 0 ? (
                <div className="text-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border/60">
                    <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <HiOutlineCollection className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">No records found</h3>
                    <p className="text-muted-foreground mb-6">
                        {searchTerm ? `No records match "${searchTerm}"` : 'This module has no data yet.'}
                    </p>
                    <Button variant="primary" onClick={startCreate}>
                        <HiOutlinePlus className="w-4 h-4 mr-2" /> Add Record
                    </Button>
                </div>
            ) : (
                <div className="bg-muted/5 rounded-2xl border border-border/60 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/20 border-b border-border/60 text-xs uppercase font-semibold text-muted-foreground">
                                <tr>
                                    {/* Show first 5 fields max to prevent overcrowding */}
                                    {(module.fields || []).slice(0, 5).map(f => (
                                        <th key={f.name} className="px-6 py-4 whitespace-nowrap">{f.label}</th>
                                    ))}
                                    <th className="px-6 py-4 whitespace-nowrap w-20 text-right">Created</th>
                                    <th className="px-6 py-4 whitespace-nowrap w-20 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {records.map(record => (
                                    <tr key={record.id} className="hover:bg-muted/10 transition-colors group">
                                        {(module.fields || []).slice(0, 5).map(f => (
                                            <td key={f.name} className="px-6 py-4 whitespace-nowrap">
                                                <div className="max-w-[200px] truncate text-foreground font-medium">
                                                    {fieldValueToString(record.data[f.name], f.type)}
                                                </div>
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-muted-foreground text-xs">
                                            {format(new Date(record.created_at), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEdit(record)} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                                                    <HiOutlinePencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(record.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-muted-foreground hover:text-rose-500 transition-colors">
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-border/60 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                Page {page} of {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => fetchRecords(page - 1)}>Previous</Button>
                                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => fetchRecords(page + 1)}>Next</Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal Side-Panel */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md bg-background border-l border-border/60 shadow-2xl h-full flex flex-col animate-slide-in-right">

                        {/* Sticky Header */}
                        <div className="p-6 border-b border-border/40 flex items-center justify-between bg-muted/5">
                            <h3 className="text-xl font-bold text-foreground">{isEditing ? 'Edit Record' : 'New Record'}</h3>
                            <button onClick={() => { setIsCreating(false); setIsEditing(null); }} className="p-2 hover:bg-muted/10 rounded-lg transition-colors">
                                <HiOutlineX className="w-6 h-6 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Scrollable Form Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {(module.fields || []).map(field => (
                                <div key={field.name} className="space-y-1.5">
                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                        {field.label}
                                        {field.required && <span className="text-rose-500">*</span>}
                                    </label>
                                    {renderFieldInput(field)}
                                </div>
                            ))}
                        </div>

                        {/* Sticky Footer */}
                        <div className="p-6 border-t border-border/40 bg-muted/5 flex gap-4">
                            <Button variant="secondary" className="flex-1" onClick={() => { setIsCreating(false); setIsEditing(null); }}>Cancel</Button>
                            <Button variant="primary" className="flex-1 shadow-lg shadow-primary/20" onClick={handleSave} loading={saving}>
                                <HiOutlineCheck className="w-4 h-4 mr-2" /> Save Record
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function fieldValueToString(val, type) {
    if (val === null || val === undefined) return '-';
    if (type === 'checkbox') return val ? 'Yes' : 'No';
    if (type === 'date') return val ? format(new Date(val), 'MMM d, yyyy') : '-';
    return String(val);
}
