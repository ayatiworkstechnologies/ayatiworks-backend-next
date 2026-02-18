'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
    HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineMail,
    HiOutlineCog, HiOutlineCheck, HiOutlineEye,
    HiOutlinePaperAirplane, HiOutlineTemplate, HiOutlineChevronLeft,
    HiOutlineServer, HiOutlineShieldCheck
} from 'react-icons/hi';

export default function ClientMailTab({ clientId }) {
    const toast = useToast();
    const [activeSection, setActiveSection] = useState('templates'); // templates | smtp | compose
    const [templates, setTemplates] = useState([]);
    const [smtpConfig, setSmtpConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    // Template form
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateForm, setTemplateForm] = useState({ name: '', subject: '', html_body: '', variables: '', to_email: '', cc_email: '', bcc_email: '' });
    const [templateSaving, setTemplateSaving] = useState(false);

    // SMTP form
    const [smtpForm, setSmtpForm] = useState({
        host: '', port: 587, username: '', password: '', from_email: '', from_name: '', use_tls: true
    });
    const [smtpSaving, setSmtpSaving] = useState(false);
    const [testRunning, setTestRunning] = useState(false);

    // Compose form
    const [composeForm, setComposeForm] = useState({
        template_id: '', to_email: '', cc: '', bcc: '', subject: '', html_body: '', variables: {}
    });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (clientId) {
            fetchTemplates();
            fetchSmtp();
        }
    }, [clientId]);

    const fetchTemplates = async () => {
        try {
            const res = await api.get(`/clients/${clientId}/mail-templates`);
            setTemplates(res.items || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchSmtp = async () => {
        try {
            const res = await api.get(`/clients/${clientId}/smtp`);
            if (res) {
                setSmtpConfig(res);
                setSmtpForm({
                    host: res.host || '',
                    port: res.port || 587,
                    username: res.username || '',
                    password: '',
                    from_email: res.from_email || '',
                    from_name: res.from_name || '',
                    use_tls: res.use_tls ?? true,
                });
            }
        } catch (e) { console.error(e); }
    };

    const PROVIDERS = [
        { id: 'custom', label: 'Custom SMTP', host: '', port: 587, use_tls: true },
        { id: 'gmail', label: 'Gmail', host: 'smtp.gmail.com', port: 587, use_tls: true },
        { id: 'outlook', label: 'Outlook / Office 365', host: 'smtp.office365.com', port: 587, use_tls: true },
    ];

    const [selectedProvider, setSelectedProvider] = useState('custom');

    const handleProviderChange = (providerId) => {
        setSelectedProvider(providerId);
        const provider = PROVIDERS.find(p => p.id === providerId);
        if (provider && providerId !== 'custom') {
            setSmtpForm(prev => ({
                ...prev,
                host: provider.host,
                port: provider.port,
                use_tls: provider.use_tls
            }));
        }
    };

    // ===== SMTP =====
    const handleSaveSmtp = async () => {
        if (!smtpForm.host || !smtpForm.username || !smtpForm.from_email) {
            toast.error('Host, username, and from email are required');
            return;
        }
        setSmtpSaving(true);
        try {
            const payload = { ...smtpForm };
            if (!payload.password && smtpConfig) delete payload.password; // Don't send empty password on update
            const res = await api.post(`/clients/${clientId}/smtp`, payload);
            setSmtpConfig(res);
            toast.success('SMTP settings saved!');
        } catch (e) {
            toast.error(e.message || 'Failed to save SMTP settings');
        } finally { setSmtpSaving(false); }
    };

    const handleTestConnection = async () => {
        if (!smtpForm.host || !smtpForm.username) {
            toast.error('Host and username are required for testing');
            return;
        }
        if (!smtpForm.password && !smtpConfig?.id) {
            toast.error('Password is required for testing new configuration');
            return;
        }

        setTestRunning(true);
        try {
            const payload = { ...smtpForm };
            // If testing existing config with empty password field, we might need to rely on backend to use saved password?
            // Actually, the backend test endpoint expects a full config. 
            // If password is empty in form but set in DB, we can't test "new" inputs without password.
            // But if user didn't change password, they might expect it to work.
            // However, for security, we usually don't send back the password.
            // LIMITATION: Test only works if password is provided or if we implement "use stored password" in backend test.
            // Our backend `ClientSmtpConfigCreate` makes password optional?
            // Let's check backend schema. `password: str | None = None`.
            // But logic: `server.login(data.username, data.password)`. If password is None, login fails.

            // So verification: User MUST enter password to test.
            if (!payload.password) {
                // Check if we are editing existing and password field is empty.
                if (smtpConfig && smtpConfig.password_set) {
                    // We can't verify because we don't have the password client-side.
                    // The backend `test_smtp_config` receives `ClientSmtpConfigCreate`.
                    // It does NOT look up the existing config from DB to fill in missing password.
                    // So we must ask user for password.
                    toast.error('Please enter the password to test connection.');
                    setTestRunning(false);
                    return;
                }
            }

            await api.post(`/clients/${clientId}/smtp/test`, payload);
            toast.success('Connection successful! settings are valid.');
        } catch (e) {
            toast.error(e.message || e.detail || 'Connection failed');
        } finally {
            setTestRunning(false);
        }
    };

    const handleDeleteSmtp = async () => {
        if (!confirm('Revert to System Default SMTP? This will delete custom settings.')) return;
        setSmtpSaving(true);
        try {
            await api.delete(`/clients/${clientId}/smtp`);
            setSmtpConfig(null);
            setSmtpForm({ host: '', port: 587, username: '', password: '', from_email: '', from_name: '', use_tls: true });
            toast.success('Reverted to System SMTP');
        } catch (e) {
            toast.error(e.message || 'Failed to revert');
        } finally { setSmtpSaving(false); }
    };

    // ===== Templates =====
    const openTemplateForm = (template = null) => {
        if (template) {
            setEditingTemplate(template);
            setTemplateForm({
                name: template.name,
                subject: template.subject,
                html_body: template.html_body || '',
                variables: (template.variables || []).join(', '),
                to_email: template.to_email || '',
                cc_email: (template.cc_email || []).join(', '),
                bcc_email: (template.bcc_email || []).join(', ')
            });
        } else {
            setEditingTemplate(null);
            setTemplateForm({ name: '', subject: '', html_body: '', variables: '', to_email: '', cc_email: '', bcc_email: '' });
        }
        setShowTemplateForm(true);
    };

    const handleSaveTemplate = async () => {
        if (!templateForm.name || !templateForm.subject || !templateForm.html_body) {
            toast.error('Name, subject, and body are required');
            return;
        }
        setTemplateSaving(true);
        try {
            const payload = {
                ...templateForm,
                variables: templateForm.variables ? templateForm.variables.split(',').map(s => s.trim()).filter(Boolean) : [],
                cc_email: templateForm.cc_email ? templateForm.cc_email.split(',').map(s => s.trim()).filter(Boolean) : [],
                bcc_email: templateForm.bcc_email ? templateForm.bcc_email.split(',').map(s => s.trim()).filter(Boolean) : []
            };
            if (editingTemplate) {
                await api.put(`/clients/${clientId}/mail-templates/${editingTemplate.id}`, payload);
                toast.success('Template updated!');
            } else {
                await api.post(`/clients/${clientId}/mail-templates`, payload);
                toast.success('Template created!');
            }
            setShowTemplateForm(false);
            fetchTemplates();
        } catch (e) {
            toast.error(e.message || 'Failed to save template');
        } finally { setTemplateSaving(false); }
    };

    const handleDeleteTemplate = async (id) => {
        if (!confirm('Delete this template?')) return;
        try {
            await api.delete(`/clients/${clientId}/mail-templates/${id}`);
            toast.success('Template deleted');
            fetchTemplates();
        } catch (e) { toast.error(e.message || 'Failed to delete'); }
    };

    // ===== Compose =====
    const handleSelectTemplate = async (templateId) => {
        if (!templateId) {
            setComposeForm(p => ({ ...p, template_id: '', subject: '', html_body: '', variables: {} }));
            return;
        }
        try {
            const tmpl = await api.get(`/clients/${clientId}/mail-templates/${templateId}`);
            const vars = {};
            (tmpl.variables || []).forEach(v => { vars[v] = ''; });
            setComposeForm(p => ({
                ...p,
                template_id: templateId,
                subject: tmpl.subject,
                html_body: tmpl.html_body,
                to_email: tmpl.to_email || p.to_email,
                cc: (tmpl.cc_email || []).join(', '),
                bcc: (tmpl.bcc_email || []).join(', '),
                variables: vars,
            }));
        } catch (e) { console.error(e); }
    };

    const handleSendEmail = async () => {
        if (!composeForm.to_email) { toast.error('Recipient email is required'); return; }
        if (!composeForm.subject && !composeForm.template_id) { toast.error('Subject is required'); return; }

        setSending(true);
        try {
            const payload = {
                to_email: composeForm.to_email,
                cc: composeForm.cc ? composeForm.cc.split(',').map(e => e.trim()).filter(Boolean) : undefined,
                bcc: composeForm.bcc ? composeForm.bcc.split(',').map(e => e.trim()).filter(Boolean) : undefined,
                subject: composeForm.subject || undefined,
                html_body: composeForm.html_body || undefined,
                template_id: composeForm.template_id ? parseInt(composeForm.template_id) : undefined,
                variables: Object.keys(composeForm.variables).length > 0 ? composeForm.variables : undefined,
            };
            await api.post(`/clients/${clientId}/send-email`, payload);
            toast.success('Email sent successfully!');
            setComposeForm({ template_id: '', to_email: '', cc: '', bcc: '', subject: '', html_body: '', variables: {} });
        } catch (e) {
            toast.error(e.message || e.detail || 'Failed to send email');
        } finally { setSending(false); }
    };

    // ===== Section Tabs =====
    const sections = [
        { id: 'templates', label: 'Templates', icon: HiOutlineTemplate },
        { id: 'compose', label: 'Send Email', icon: HiOutlinePaperAirplane },
        { id: 'smtp', label: 'SMTP Settings', icon: HiOutlineCog },
    ];

    return (
        <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-xl w-fit border border-border/40 backdrop-blur-sm">
                {sections.map(s => {
                    const Icon = s.icon;
                    const isActive = activeSection === s.id;
                    return (
                        <button key={s.id} onClick={() => setActiveSection(s.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10 scale-100'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50 scale-95 hover:scale-100'}`}>
                            <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} /> {s.label}
                        </button>
                    );
                })}
            </div>

            {/* ===== TEMPLATES SECTION ===== */}
            {activeSection === 'templates' && !showTemplateForm && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Mail Templates</h3>
                            <p className="text-sm text-muted-foreground">Reusable email templates with variable substitution</p>
                        </div>
                        <Button variant="primary" onClick={() => openTemplateForm()} className="shadow-lg shadow-primary/20">
                            <HiOutlinePlus className="w-4 h-4" /> New Template
                        </Button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2].map(i => <Card key={i}><CardBody className="h-24 animate-pulse bg-muted/20" /></Card>)}
                        </div>
                    ) : templates.length === 0 ? (
                        <Card>
                            <CardBody className="text-center py-12">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <HiOutlineTemplate className="w-8 h-8 text-emerald-500/40" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2">No templates yet</h3>
                                <p className="text-muted-foreground mb-4">Create your first email template to get started</p>
                                <Button variant="primary" onClick={() => openTemplateForm()}><HiOutlinePlus className="w-4 h-4" /> Create Template</Button>
                            </CardBody>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {templates.map(t => (
                                <Card key={t.id} className="hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer group" onClick={() => openTemplateForm(t)}>
                                    <CardBody className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <HiOutlineMail className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{t.name}</h4>
                                                <p className="text-sm text-muted-foreground line-clamp-1">{t.subject}</p>
                                                {t.variables?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {t.variables.map(v => (
                                                            <span key={v} className="text-[10px] px-1.5 py-0.5 bg-muted/50 border border-border/50 rounded text-muted-foreground font-mono">{`{{${v}}}`}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.id); }} className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-muted-foreground hover:text-rose-500 transition-colors">
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Template Form */}
            {activeSection === 'templates' && showTemplateForm && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowTemplateForm(false)} className="p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <HiOutlineChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">{editingTemplate ? 'Edit Template' : 'New Template'}</h3>
                            <p className="text-sm text-muted-foreground">Design your email template</p>
                        </div>
                    </div>

                    <Card>
                        <CardBody className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input label="Template Name" value={templateForm.name} onChange={e => setTemplateForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Welcome Email" required />
                                <Input label="Subject Line" value={templateForm.subject} onChange={e => setTemplateForm(p => ({ ...p, subject: e.target.value }))} placeholder="Email subject..." required />
                            </div>

                            <Input label="To Email (Optional)" value={templateForm.to_email} onChange={e => setTemplateForm(p => ({ ...p, to_email: e.target.value }))} placeholder="Default recipient. e.g. admin@example.com" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input label="CC (Optional)" value={templateForm.cc_email} onChange={e => setTemplateForm(p => ({ ...p, cc_email: e.target.value }))} placeholder="Comma-separated emails" />
                                <Input label="BCC (Optional)" value={templateForm.bcc_email} onChange={e => setTemplateForm(p => ({ ...p, bcc_email: e.target.value }))} placeholder="Comma-separated emails" />
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">HTML Body <span className="text-rose-500">*</span></label>
                                <textarea
                                    value={templateForm.html_body}
                                    onChange={e => setTemplateForm(p => ({ ...p, html_body: e.target.value }))}
                                    placeholder="<h2>Hello {{name}}</h2><p>Welcome to our platform!</p>"
                                    className="w-full px-4 py-3 rounded-lg bg-muted/10 border border-border/60 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[300px] font-mono text-sm leading-relaxed"
                                />
                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                    <HiOutlineEye className="w-3 h-3" /> Use {'{{variable_name}}'} for dynamic content substitution
                                </p>
                            </div>

                            <Input
                                label="Variables"
                                value={templateForm.variables}
                                onChange={e => setTemplateForm(p => ({ ...p, variables: e.target.value }))}
                                placeholder="name, email, company, date (comma separated)"
                                description="Define variables to be used in the template body"
                            />
                        </CardBody>
                        <div className="p-6 bg-muted/5 border-t border-border/40 flex gap-4 rounded-b-xl">
                            <Button variant="secondary" onClick={() => setShowTemplateForm(false)} className="flex-1 py-2.5">Cancel</Button>
                            <Button variant="primary" onClick={handleSaveTemplate} loading={templateSaving} className="flex-1 shadow-lg shadow-primary/20 py-2.5">
                                <HiOutlineCheck className="w-5 h-5 mr-2" /> {editingTemplate ? 'Update' : 'Create'} Template
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* ===== COMPOSE SECTION ===== */}
            {activeSection === 'compose' && (
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Send Email</h3>
                        <p className="text-sm text-muted-foreground">Compose and send email using client's SMTP</p>
                    </div>

                    {!smtpConfig && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 flex items-start gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400 mt-0.5">
                                <HiOutlineServer className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">SMTP Not Configured</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-400/80 mt-1 mb-3">You are currently using the system default SMTP. For branded emails, please configure custom SMTP settings.</p>
                                <Button size="sm" variant="secondary" onClick={() => setActiveSection('smtp')}>
                                    <HiOutlineCog className="w-4 h-4 mr-2" /> Configure SMTP
                                </Button>
                            </div>
                        </div>
                    )}

                    <Card>
                        <CardBody className="space-y-5">
                            {templates.length > 0 && (
                                <div className="input-wrapper">
                                    <label className="input-label">Load Template</label>
                                    <select
                                        value={composeForm.template_id}
                                        onChange={e => handleSelectTemplate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-muted/10 border border-border/60 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select a template to load...</option>
                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input label="To Email" type="email" value={composeForm.to_email} onChange={e => setComposeForm(p => ({ ...p, to_email: e.target.value }))} placeholder="recipient@example.com" required />
                                <Input label="Subject" value={composeForm.subject} onChange={e => setComposeForm(p => ({ ...p, subject: e.target.value }))} placeholder="Email subject..." required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input label="CC (Optional)" value={composeForm.cc} onChange={e => setComposeForm(p => ({ ...p, cc: e.target.value }))} placeholder="Comma-separated emails" />
                                <Input label="BCC (Optional)" value={composeForm.bcc} onChange={e => setComposeForm(p => ({ ...p, bcc: e.target.value }))} placeholder="Comma-separated emails" />
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Message Body (HTML)</label>
                                <textarea
                                    value={composeForm.html_body}
                                    onChange={e => setComposeForm(p => ({ ...p, html_body: e.target.value }))}
                                    placeholder="<h2>Hello!</h2><p>Your email content here...</p>"
                                    className="w-full px-4 py-3 rounded-lg bg-muted/10 border border-border/60 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[250px] font-mono text-sm"
                                />
                            </div>

                            {/* Variable inputs */}
                            {Object.keys(composeForm.variables).length > 0 && (
                                <div className="bg-muted/10 rounded-xl p-5 border border-border/40 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <HiOutlinePencil className="w-4 h-4 text-primary" />
                                        <h4 className="text-sm font-bold text-foreground">Template Variables</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(composeForm.variables).map(([key, val]) => (
                                            <Input key={key} label={key} value={val} onChange={e => setComposeForm(p => ({ ...p, variables: { ...p.variables, [key]: e.target.value } }))} placeholder={`Value for {{${key}}}`} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardBody>
                        <div className="p-6 bg-muted/5 border-t border-border/40 flex justify-end rounded-b-xl">
                            <Button variant="primary" onClick={handleSendEmail} loading={sending} className="shadow-lg shadow-primary/20 py-2.5 px-6">
                                <HiOutlinePaperAirplane className="w-5 h-5 mr-2" /> Send Email
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* ===== SMTP SECTION ===== */}
            {activeSection === 'smtp' && (
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <h3 className="text-lg font-bold text-foreground">SMTP Configuration</h3>
                        <p className="text-sm text-muted-foreground">Configure custom mail server settings for this client</p>
                    </div>

                    <div className="flex bg-muted/20 p-1.5 rounded-xl border border-border/40 w-full sm:w-fit">
                        <button
                            onClick={() => {
                                if (smtpConfig && !smtpConfig.id) setSmtpConfig(null); // If unsaved/new, just cancel
                                else if (smtpConfig) handleDeleteSmtp(); // If saved, delete
                            }}
                            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${!smtpConfig
                                ? 'bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> System Default
                        </button>
                        <button
                            onClick={() => {
                                if (!smtpConfig) setSmtpConfig({}); // Switch to Custom Mode (unsaved)
                            }}
                            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${smtpConfig
                                ? 'bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${smtpConfig ? 'bg-amber-500' : 'bg-muted-foreground'}`} /> Custom SMTP
                        </button>
                    </div>

                    {!smtpConfig ? (
                        <Card className="border-l-4 border-l-emerald-500 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <CardBody className="space-y-6 py-8 relative">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-100 dark:border-emerald-800/30">
                                        <HiOutlineShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-foreground">System Default SMTP Active</h4>
                                        <p className="text-muted-foreground mt-1 max-w-lg">Emails are currently sent via the global system mail server. No further configuration is needed unless you want to use a specific branding or sender identity.</p>
                                    </div>
                                </div>
                                <div className="pl-20">
                                    <Button variant="outline" onClick={() => setSmtpConfig({})}>
                                        <HiOutlineCog className="w-4 h-4 mr-2" /> Override with Custom SMTP
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    ) : (
                        <div className="space-y-6 animate-slide-up-fade">
                            <Card className="border-l-4 border-l-amber-500">
                                <CardBody className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center border border-amber-100 dark:border-amber-800/30">
                                                <HiOutlineCog className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground">Custom SMTP Configuration</h4>
                                                <p className="text-sm text-muted-foreground">Emails will be sent using these custom credentials.</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            <Card>
                                <CardHeader title="SMTP Server Settings" />
                                <CardBody className="space-y-6">
                                    <div className="input-wrapper">
                                        <label className="input-label mb-3 block">Quick Provider Setup</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {PROVIDERS.filter(p => p.id !== 'ayati').map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => handleProviderChange(p.id)}
                                                    className={`flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium border transition-all ${selectedProvider === p.id
                                                        ? 'bg-primary/5 border-primary text-primary ring-1 ring-primary/20'
                                                        : 'bg-background border-border hover:bg-muted/50 text-muted-foreground'
                                                        }`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="SMTP Host" value={smtpForm.host} onChange={e => setSmtpForm(p => ({ ...p, host: e.target.value }))} placeholder="smtp.gmail.com" required />
                                        <Input label="Port" type="number" value={smtpForm.port} onChange={e => setSmtpForm(p => ({ ...p, port: parseInt(e.target.value) || 587 }))} placeholder="587" required />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Username" value={smtpForm.username} onChange={e => setSmtpForm(p => ({ ...p, username: e.target.value }))} placeholder="your@email.com" required />
                                        <Input label="Password" type="password" value={smtpForm.password} onChange={e => setSmtpForm(p => ({ ...p, password: e.target.value }))} placeholder={smtpConfig.id ? '(unchanged)' : 'SMTP password'} required={!smtpConfig.id} />
                                    </div>

                                    <div className="p-4 bg-muted/10 rounded-xl border border-border/40 space-y-4">
                                        <h4 className="text-sm font-bold text-foreground">Sender Identity</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input label="From Email" type="email" value={smtpForm.from_email} onChange={e => setSmtpForm(p => ({ ...p, from_email: e.target.value }))} placeholder="noreply@company.com" required />
                                            <Input label="From Name" value={smtpForm.from_name} onChange={e => setSmtpForm(p => ({ ...p, from_name: e.target.value }))} placeholder="Company Name" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border/50">
                                        <input type="checkbox" checked={smtpForm.use_tls} onChange={e => setSmtpForm(p => ({ ...p, use_tls: e.target.checked }))} className="w-5 h-5 rounded border-border text-primary focus:ring-primary" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-foreground">Use TLS / STARTTLS</span>
                                            <span className="text-xs text-muted-foreground">Recommended for most secure SMTP servers (Gmail, Outlook, etc.)</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3">
                                        <Button variant="danger" ghost onClick={handleDeleteSmtp}>
                                            Reset to Default
                                        </Button>
                                        <Button variant="secondary" onClick={handleTestConnection} loading={testRunning}>
                                            Test Connection
                                        </Button>
                                        <Button variant="primary" onClick={handleSaveSmtp} loading={smtpSaving} className="shadow-xl shadow-primary/20 py-2.5 px-6">
                                            <HiOutlineCheck className="w-5 h-5 mr-2" /> Save Configuration
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
