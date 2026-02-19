'use client';

import { useState } from 'react';
import { Card, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import {
    HiOutlineKey, HiOutlineTrash, HiOutlineRefresh, HiOutlinePlus,
    HiOutlineDatabase, HiOutlineCollection, HiOutlineChevronRight,
    HiOutlineClipboardCopy, HiOutlineSearch, HiOutlinePencil, HiOutlineCode, HiOutlineX
} from 'react-icons/hi';

export default function ModuleList({
    clientId,
    clientSlug,
    modules,
    loading,
    onCreateModule,
    onOpenModule,
    onDeleteModule,
    apiKeyInfo,
    onRefreshKey,
    onSearch,
    onEditModule
}) {
    const toast = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [keyLoading, setKeyLoading] = useState(false);

    const [generatedKey, setGeneratedKey] = useState(null);
    const [selectedApiModule, setSelectedApiModule] = useState(null);

    // Debounce search
    const handleSearch = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        onSearch(val);
    };

    const handleGenerateKey = async () => {
        setKeyLoading(true);
        try {
            const res = await api.post(`/clients/${clientId}/api-key`);
            setGeneratedKey(res.api_key);
            onRefreshKey(); // Refresh parent state
            toast.success('API key generated! Copy it now — it won\'t be shown again.');
        } catch (e) { toast.error(e.message || 'Failed to generate API key'); }
        finally { setKeyLoading(false); }
    };

    const handleRevokeKey = async () => {
        if (!confirm('Revoke API key? External integrations using this key will stop working.')) return;
        setKeyLoading(true);
        try {
            await api.delete(`/clients/${clientId}/api-key`);
            setGeneratedKey(null);
            onRefreshKey();
            toast.success('API key revoked');
        } catch (e) { toast.error(e.message || 'Failed to revoke key'); }
        finally { setKeyLoading(false); }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* API Key Section - Glassmorphism Card */}
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-background/80 to-muted/20 backdrop-blur-sm shadow-sm group">
                <div className="absolute top-0 right-0 p-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-700" />
                <div className="p-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/20 shadow-inner">
                                <HiOutlineKey className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-foreground text-lg">API Key Access</h4>
                                    {apiKeyInfo.has_api_key && (
                                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-500/20 shadow-sm">Active</span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">Authenticate external requests to your dynamic API endpoints.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {apiKeyInfo.has_api_key ? (
                                <>
                                    <Button variant="danger" size="sm" onClick={handleRevokeKey} loading={keyLoading} className="shadow-none border border-transparent hover:border-border/60 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 hover:text-rose-700">
                                        <HiOutlineTrash className="w-4 h-4 mr-1.5" /> Revoke
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleGenerateKey} loading={keyLoading} className="bg-background/50 backdrop-blur-sm border-border/60 hover:bg-background/80">
                                        <HiOutlineRefresh className="w-4 h-4 mr-1.5" /> Regenerate
                                    </Button>
                                </>
                            ) : (
                                <Button variant="primary" size="sm" onClick={handleGenerateKey} loading={keyLoading} className="shadow-lg shadow-amber-500/20 bg-gradient-to-r from-amber-600 to-orange-600 border-none hover:brightness-110">
                                    <HiOutlineKey className="w-4 h-4 mr-1.5" /> Generate Key
                                </Button>
                            )}
                        </div>
                    </div>

                    {generatedKey && (
                        <div className="mt-6 p-4 bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl animate-fade-in shadow-sm backdrop-blur-sm">
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                                    <HiOutlineKey className="w-4 h-4" /> Your New API Key
                                </p>
                                <span className="text-[10px] font-bold tracking-wider text-amber-600/80 dark:text-amber-500/80 bg-amber-100/50 dark:bg-amber-900/30 px-2 py-0.5 rounded border border-amber-200/50">SECRET</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 block text-sm font-mono bg-white/80 dark:bg-black/20 border border-amber-200/50 dark:border-amber-800/30 p-3 rounded-lg break-all select-all text-foreground shadow-inner">
                                    {generatedKey}
                                </code>
                                <button onClick={() => copyToClipboard(generatedKey)} className="p-3 bg-white/80 dark:bg-black/20 border border-amber-200/50 dark:border-amber-800/30 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 transition-all shadow-sm active:scale-95 hover:border-amber-300/50">
                                    <HiOutlineClipboardCopy className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 ml-1 flex items-center gap-1.5 opacity-80">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Save this key securely. It will not be shown again.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
                <div>
                    <h3 className="text-xl font-bold text-foreground">Dynamic Modules</h3>
                    <p className="text-sm text-muted-foreground mt-1">Custom data collections and records</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 group">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search modules..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/10 border border-border/60 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm hover:border-border/80"
                        />
                    </div>
                    <Button variant="primary" onClick={onCreateModule} className="shadow-lg shadow-primary/20 shrink-0 bg-primary/90 hover:bg-primary backdrop-blur-sm">
                        <HiOutlinePlus className="w-4 h-4 md:mr-1.5" /> <span className="hidden md:inline">New Module</span>
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-muted/10 rounded-2xl border border-border/40 animate-pulse" />
                    ))}
                </div>
            ) : modules.length === 0 ? (
                <div className="text-center py-24 bg-muted/5 rounded-3xl border border-dashed border-border/60 flex flex-col items-center justify-center group hover:bg-muted/10 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="w-24 h-24 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-violet-500/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10">
                        <HiOutlineDatabase className="w-10 h-10 text-violet-500/60 group-hover:text-violet-500 transition-colors duration-500" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 relative z-10">No modules found</h3>
                    <p className="text-muted-foreground mb-8 max-w-sm mx-auto relative z-10">
                        {searchTerm ? `No modules match "${searchTerm}".` : "Create your first dynamic module to start tracking custom data records and auto-generate APIs."}
                    </p>
                    <Button variant="primary" onClick={onCreateModule} className="shadow-xl shadow-primary/20 px-6 py-2.5 relative z-10">
                        <HiOutlinePlus className="w-4 h-4 mr-2" /> Create First Module
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map(mod => (
                        <Card key={mod.id} className="group hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 border-border/60 hover:border-primary/30 cursor-pointer overflow-hidden relative backdrop-blur-sm bg-background/50" onClick={() => onOpenModule(mod)}>
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            <CardBody className="p-6 relative flex flex-col h-full z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-xl flex items-center justify-center border border-violet-500/10 group-hover:border-violet-500/30 transition-colors shadow-sm">
                                        <HiOutlineCollection className="w-6 h-6 text-violet-500 group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                        <button onClick={(e) => { e.stopPropagation(); onEditModule(mod); }} className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground/50 hover:text-primary transition-colors" title="Edit Schema">
                                            <HiOutlinePencil className="w-5 h-5" />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedApiModule(mod); }} className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-muted-foreground/50 hover:text-amber-500 transition-colors" title="API Integration">
                                            <HiOutlineCode className="w-5 h-5" />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); onDeleteModule(mod.id); }} className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-muted-foreground/50 hover:text-rose-500 transition-colors" title="Delete Module">
                                            <HiOutlineTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-6 flex-1">
                                    <h4 className="font-bold text-foreground text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">{mod.name}</h4>
                                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5em]">{mod.description || 'No description provided.'}</p>
                                </div>

                                <div className="flex items-center gap-4 pt-4 border-t border-border/40 mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Fields</span>
                                        <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                                            {mod.field_count} <span className="text-xs font-normal text-muted-foreground/60">cols</span>
                                        </span>
                                    </div>
                                    <div className="w-px h-8 bg-border/40" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Records</span>
                                        <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                                            {mod.record_count} <span className="text-xs font-normal text-muted-foreground/60">rows</span>
                                        </span>
                                    </div>

                                    <div className="ml-auto w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                        <HiOutlineChevronRight className="w-4 h-4 text-primary" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
            {/* API Integration Modal */}
            {selectedApiModule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedApiModule(null)}>
                    <div className="bg-background border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                    <HiOutlineCode className="w-6 h-6 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">API Integration</h3>
                                    <p className="text-sm text-muted-foreground"> Integrate {selectedApiModule.name} with external tools</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedApiModule(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Endpoint URL</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 block text-sm font-mono bg-muted/30 border border-border p-3 rounded-lg break-all select-all">
                                        POST {process.env.NEXT_PUBLIC_API_URL}/public/{clientSlug}/{selectedApiModule.slug}/records
                                    </code>
                                    <button onClick={() => copyToClipboard(`POST ${process.env.NEXT_PUBLIC_API_URL}/public/${clientSlug}/${selectedApiModule.slug}/records`)} className="p-3 bg-muted/30 border border-border rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                                        <HiOutlineClipboardCopy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Authentication Header</label>
                                <div className="bg-muted/30 border border-border rounded-lg p-3 font-mono text-sm">
                                    X-API-Key: {generatedKey || 'YOUR_API_KEY'}
                                </div>
                                {!generatedKey && !apiKeyInfo?.has_api_key && (
                                    <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                                        <HiOutlineKey className="w-3 h-3" /> A valid API Key is required. Generate one above.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Sample Request Body</label>
                                <pre className="bg-muted/30 border border-border rounded-lg p-4 font-mono text-xs overflow-x-auto text-foreground/80">
                                    {JSON.stringify({
                                        "data": selectedApiModule.fields?.reduce((acc, field) => {
                                            acc[field.name] = field.type === 'number' ? 123 : "sample_value";
                                            return acc;
                                        }, {}) || {}
                                    }, null, 2)}
                                </pre>
                            </div>
                        </div>

                        <div className="p-4 border-t border-border bg-muted/5 flex justify-end">
                            <Button variant="outline" onClick={() => setSelectedApiModule(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
