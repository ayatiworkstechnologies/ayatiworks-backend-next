'use client';

import { useState, useEffect, useRef } from 'react';
import {
    HiOutlineUser, HiOutlineBriefcase, HiOutlineDownload, HiOutlineEye,
    HiOutlineTrash, HiOutlineExternalLink, HiOutlineGlobe, HiOutlineX,
    HiOutlineRefresh, HiOutlinePlus, HiOutlineSearch, HiOutlineFilter
} from 'react-icons/hi';
import { Card, CardHeader, CardBody, Button, StatusBadge, Avatar, LoadingSpinner } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';

export default function ApplicationsPage() {
    const toast = useToast();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [positionFilter, setPositionFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedApp, setSelectedApp] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const fileInputRef = useRef(null);

    const handleCreate = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        setCreating(true);
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/public/careers`, {
                method: 'POST',
                body: formData,
            });

            toast.success('Application created successfully');
            setShowCreateModal(false);
            fetchApplications();
            form.reset();
        } catch (error) {
            toast.error('Failed to create application');
        } finally {
            setCreating(false);
        }
    };

    const fetchApplications = async () => {
        setLoading(true);
        try {
            let url = `/public/careers?page=${page}&page_size=10`;
            if (statusFilter) url += `&status=${statusFilter}`;
            if (positionFilter) url += `&position=${positionFilter}`;

            const data = await api.get(url);
            setApplications(data.items || []);
            setTotalPages(data.total_pages || 1);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [page, statusFilter, positionFilter]);

    const handleView = (app) => {
        setSelectedApp(app);
        setShowModal(true);
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/public/careers/${id}`, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
            fetchApplications();
            // Update local state for immediate feedback in modal
            if (selectedApp?.id === id) {
                setSelectedApp(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) return;

        try {
            await api.delete(`/public/careers/${id}`);
            toast.success('Application deleted');
            fetchApplications();
            if (showModal && selectedApp?.id === id) setShowModal(false);
        } catch (error) {
            toast.error('Failed to delete application');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Job Applications</h1>
                    <p className="text-muted-foreground">Manage and review candidate applications</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => setShowCreateModal(true)} variant="primary" className="shadow-lg shadow-primary/20">
                        <HiOutlinePlus className="w-4 h-4 mr-2" /> Add Application
                    </Button>
                    <Button onClick={fetchApplications} variant="outline" size="icon" title="Refresh">
                        <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                <div className="relative flex-1">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by position..."
                        value={positionFilter}
                        onChange={(e) => setPositionFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <div className="relative w-full md:w-56">
                    <HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            <Card className="border-0 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Candidate</th>
                                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Position</th>
                                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Experience</th>
                                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Applied Date</th>
                                <th className="text-right px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <LoadingSpinner size="lg" />
                                        <p className="text-muted-foreground mt-2">Loading applications...</p>
                                    </td>
                                </tr>
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <HiOutlineBriefcase className="w-8 h-8 text-muted-foreground/50" />
                                        </div>
                                        <p className="text-lg font-medium text-foreground">No applications found</p>
                                        <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters or add a new application.</p>
                                    </td>
                                </tr>
                            ) : (
                                applications.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={`${item.first_name} ${item.last_name}`} className="w-10 h-10 ring-2 ring-background border border-border" />
                                                <div>
                                                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.first_name} {item.last_name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{item.position_applied}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground text-sm">
                                            {item.experience_years ? `${item.experience_years} years` : <span className="text-muted-foreground/50 italic">N/A</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground text-sm">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="ghost" onClick={() => handleView(item)} className="h-8 w-8 p-0">
                                                    <HiOutlineEye className="w-4 h-4 text-primary" />
                                                </Button>
                                                {item.resume_url && (
                                                    <a href={item.resume_url} target="_blank" rel="noopener noreferrer">
                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                            <HiOutlineDownload className="w-4 h-4 text-green-600" />
                                                        </Button>
                                                    </a>
                                                )}
                                                <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)} className="h-8 w-8 p-0 hover:text-destructive">
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t border-border flex items-center justify-between bg-muted/5">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground font-medium">
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </Card>

            {/* Application Detail Modal */}
            {showModal && selectedApp && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-border/50 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-border bg-muted/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar name={`${selectedApp.first_name} ${selectedApp.last_name}`} size="lg" className="ring-4 ring-background shadow-lg" />
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">{selectedApp.first_name} {selectedApp.last_name}</h2>
                                    <p className="text-sm text-muted-foreground">{selectedApp.position_applied}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="rounded-full hover:bg-muted">
                                <HiOutlineX className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
                            {/* Status Bar */}
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Update Status</p>
                                <div className="flex flex-wrap gap-2">
                                    {['new', 'reviewed', 'interviewed', 'hired', 'rejected'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusUpdate(selectedApp.id, status)}
                                            className={`
                                                px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all
                                                ${selectedApp.status === status
                                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-2 ring-primary ring-offset-2 ring-offset-card'
                                                    : 'bg-background border border-border text-muted-foreground hover:border-primary/50 hover:text-primary'
                                                }
                                            `}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <InfoItem label="Email" value={selectedApp.email} />
                                <InfoItem label="Phone" value={selectedApp.phone} />
                                <InfoItem label="Experience" value={selectedApp.experience_years ? `${selectedApp.experience_years} Years` : null} />
                                <InfoItem label="Current Company" value={selectedApp.current_company} />
                            </div>

                            {/* Links */}
                            <div className="flex flex-wrap gap-3">
                                {selectedApp.linkedin_url && (
                                    <a href={selectedApp.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#0077b5]/10 text-[#0077b5] rounded-lg hover:bg-[#0077b5]/20 transition-colors font-medium text-sm">
                                        <HiOutlineExternalLink className="w-4 h-4" /> LinkedIn Profile
                                    </a>
                                )}
                                {selectedApp.portfolio_url && (
                                    <a href={selectedApp.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 text-pink-500 rounded-lg hover:bg-pink-500/20 transition-colors font-medium text-sm">
                                        <HiOutlineGlobe className="w-4 h-4" /> Portfolio
                                    </a>
                                )}
                                {selectedApp.resume_url && (
                                    <a href={selectedApp.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500/20 transition-colors font-medium text-sm">
                                        <HiOutlineDownload className="w-4 h-4" /> Download Resume
                                    </a>
                                )}
                            </div>

                            {/* Cover Letter */}
                            {selectedApp.cover_letter && (
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <HiOutlineBriefcase className="w-4 h-4 text-primary" /> Cover Letter
                                    </h3>
                                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {selectedApp.cover_letter}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border/50 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                            <h2 className="text-xl font-bold">New Application</h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                                <HiOutlineX className="w-5 h-5" />
                            </Button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First Name *</label>
                                    <input name="first_name" required className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="John" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Name *</label>
                                    <input name="last_name" required className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Doe" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email *</label>
                                    <input name="email" type="email" required className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="john@example.com" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone *</label>
                                    <input name="phone" required className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="+1 (555) 000-0000" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Position *</label>
                                    <input name="position_applied" required className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Senior Developer" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Experience (Years)</label>
                                    <input name="experience_years" type="number" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="5" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Company</label>
                                <input name="current_company" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Tech Corp Inc." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">LinkedIn URL</label>
                                    <input name="linkedin_url" type="url" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="https://linkedin.com/in/..." />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Portfolio URL</label>
                                    <input name="portfolio_url" type="url" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="https://..." />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resume (PDF/DOC)</label>
                                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                    <input ref={fileInputRef} name="resume" type="file" accept=".pdf,.doc,.docx" className="hidden" />
                                    <HiOutlineDownload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-sm font-medium text-primary">Click to upload resume</p>
                                    <p className="text-xs text-muted-foreground mt-1">Max 5MB</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cover Letter</label>
                                <textarea name="cover_letter" rows={4} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="Tell us why you're a great fit..." />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                                <Button type="submit" variant="primary" disabled={creating}>
                                    {creating ? <LoadingSpinner size="sm" color="white" /> : 'Submit Application'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
            <p className="text-sm font-medium text-foreground">{value || <span className="text-muted-foreground/50 italic">Not set</span>}</p>
        </div>
    );
}
