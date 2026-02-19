'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import {
    HiOutlineChevronLeft, HiOutlinePlus, HiOutlineTrash,
    HiOutlineCheck, HiOutlineCollection, HiOutlineCode,
    HiOutlineEye, HiOutlinePencil, HiOutlineRefresh
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

export default function ModuleBuilder({ clientId, module, onBack, onSuccess }) {
    const toast = useToast();
    const [form, setForm] = useState({ name: '', description: '', fields: [], mail_template_id: '' });
    const [saving, setSaving] = useState(false);
    const [templates, setTemplates] = useState([]);
    const isEditing = !!module;

    useEffect(() => {
        fetchTemplates();
        if (module) {
            setForm({
                name: module.name,
                description: module.description || '',
                fields: module.fields.map(f => ({ ...f, options: f.options || [] })),
                mail_template_id: module.mail_template_id || ''
            });
        }
    }, [module, clientId]);

    const fetchTemplates = async () => {
        try {
            const res = await api.get(`/clients/${clientId}/mail-templates`);
            setTemplates(res.items || []);
        } catch (e) {
            console.error(e);
        }
    };

    const addField = () => {
        setForm(prev => ({
            ...prev,
            fields: [...prev.fields, { name: '', label: '', type: 'text', required: false, options: [], placeholder: '' }]
        }));
    };

    const updateField = (index, key, value) => {
        setForm(prev => {
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
        setForm(prev => ({ ...prev, fields: prev.fields.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) { toast.error('Module name is required'); return; }
        if (form.fields.length === 0) { toast.error('At least one field is required'); return; }
        for (const f of form.fields) {
            if (!f.label.trim()) { toast.error('All fields must have a label'); return; }
        }

        if (form.mail_template_id) {
            const emailField = form.fields.find(f =>
                ['email', 'to_email', 'contact_email', 'recipient_email'].includes(f.name) ||
                (f.type === 'email')
            );
            if (!emailField) {
                toast.error("Modules with Auto-Email must have an 'email' field.");
                return;
            }
        }

        setSaving(true);
        try {
            const payload = {
                ...form,
                mail_template_id: form.mail_template_id ? parseInt(form.mail_template_id) : null
            };

            if (isEditing) {
                await api.put(`/clients/${clientId}/modules/${module.id}`, payload);
                toast.success('Module updated successfully!');
            } else {
                await api.post(`/clients/${clientId}/modules`, payload);
                toast.success('Module created successfully!');
            }
            onSuccess();
        } catch (e) {
            toast.error(e.message || `Failed to ${isEditing ? 'update' : 'create'} module`);
        } finally { setSaving(false); }
    };

    return (
        <div className="space-y-6 animate-fade-in-up max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
                <button onClick={onBack} className="p-2.5 rounded-xl bg-background border border-border/60 hover:bg-muted/50 transition-colors shadow-sm group">
                    <HiOutlineChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
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
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="e.g., Products"
                                required
                                className="bg-muted/10 border-border/60 focus:bg-background transition-all"
                            />
                            <div className="input-wrapper">
                                <label className="input-label">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
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
                                    Requires an 'email' field.
                                </p>
                                <div className="relative">
                                    <select
                                        value={form.mail_template_id}
                                        onChange={e => setForm(p => ({ ...p, mail_template_id: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg bg-muted/10 border border-border/60 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all cursor-pointer pr-10"
                                    >
                                        <option value="">No Auto-Email</option>
                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-auto">
                                        <HiOutlineChevronLeft className="w-4 h-4 -rotate-90 text-muted-foreground pointer-events-none" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs text-muted-foreground">
                                        {templates.length === 0 ? "No templates found." : `${templates.length} templates available.`}
                                    </p>
                                    <Button variant="ghost" size="sm" onClick={() => fetchTemplates()} className="h-6 text-xs px-2 hover:bg-primary/10 hover:text-primary">
                                        <HiOutlineRefresh className="w-3 h-3 mr-1" /> Refresh
                                    </Button>
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
                        <CardBody className="p-6 flex-1 bg-muted/5 space-y-4 max-h-[600px] overflow-y-auto">
                            {form.fields.length === 0 ? (
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
                                    {form.fields.map((field, idx) => (
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
                                                            className="w-full px-3 py-2 rounded-lg bg-muted/10 border border-border/60 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:bg-muted/20"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                                                        <div className="relative">
                                                            <select
                                                                value={field.type}
                                                                onChange={e => updateField(idx, 'type', e.target.value)}
                                                                className="w-full pl-3 pr-8 py-2 rounded-lg bg-muted/10 border border-border/60 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all cursor-pointer hover:bg-muted/20"
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

                                                    {/* Options for Select */}
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
                                                            <p className="text-[10px] text-muted-foreground mt-1 ml-1">Comma separated list of options</p>
                                                        </div>
                                                    )}

                                                    {/* Placeholder */}
                                                    <div className="md:col-span-12 border-t border-border/30 pt-3 mt-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Helper text / placeholder..."
                                                            value={field.placeholder || ''}
                                                            onChange={e => updateField(idx, 'placeholder', e.target.value)}
                                                            className="w-full px-3 py-1.5 rounded-lg bg-transparent border-none text-xs focus:ring-0 outline-none transition-all hover:bg-muted/10 placeholder:text-muted-foreground/50"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                        <div className="p-5 border-t border-border/40 bg-background rounded-b-xl flex gap-4 sticky bottom-0 z-10">
                            <Button variant="secondary" onClick={onBack} className="w-1/3">Cancel</Button>
                            <Button variant="primary" onClick={handleSubmit} loading={saving} className="w-2/3 shadow-xl shadow-primary/20">
                                <HiOutlineCheck className="w-5 h-5 mr-2" /> {isEditing ? 'Update Module' : 'Create Module'}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
