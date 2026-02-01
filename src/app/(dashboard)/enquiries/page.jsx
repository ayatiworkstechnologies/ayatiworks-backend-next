'use client';

import { useState, useEffect } from 'react';
import {
    HiOutlineMail, HiOutlinePhone, HiOutlineEye, HiOutlineTrash,
    HiOutlineCheck, HiOutlineX, HiOutlineRefresh, HiOutlinePlus,
    HiOutlineFilter, HiOutlineInbox
} from 'react-icons/hi';
import { Card, Button, StatusBadge, LoadingSpinner } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';

export default function EnquiriesPage() {
    const toast = useToast();
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        setCreating(true);
        try {
            await api.post('/public/contact', data);
            toast.success('Enquiry submitted successfully');
            setShowCreateModal(false);
            fetchEnquiries();
            form.reset();
        } catch (error) {
            toast.error('Failed to submit enquiry');
        } finally {
            setCreating(false);
        }
    };

    const fetchEnquiries = async () => {
        setLoading(true);
        try {
            let url = `/public/contact?page=${page}&page_size=10`;
            if (filter) url += `&status=${filter}`;

            const data = await api.get(url);
            setEnquiries(data.items || []);
            setTotalPages(data.total_pages || 1);
        } catch (error) {
            console.error('Failed to fetch enquiries:', error);
            toast.error('Failed to load enquiries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, [page, filter]);

    const handleView = (enquiry) => {
        setSelectedEnquiry(enquiry);
        setShowModal(true);
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/public/contact/${id}`, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
            fetchEnquiries();
            if (selectedEnquiry?.id === id) {
                setSelectedEnquiry(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) return;

        try {
            await api.delete(`/public/contact/${id}`);
            toast.success('Enquiry deleted');
            fetchEnquiries();
            if (showModal && selectedEnquiry?.id === id) setShowModal(false);
        } catch (error) {
            toast.error('Failed to delete enquiry');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Contact Enquiries</h1>
                    <p className="text-muted-foreground">Manage incoming contact form submissions</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => setShowCreateModal(true)} variant="primary" className="shadow-lg shadow-primary/20">
                        <HiOutlinePlus className="w-4 h-4 mr-2" /> Add Enquiry
                    </Button>
                    <div className="relative">
                        <HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    <Button onClick={fetchEnquiries} variant="outline" size="icon" title="Refresh">
                        <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <Card className="border-0 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Subject</th>
                                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                                <th className="text-right px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <LoadingSpinner size="lg" />
                                        <p className="text-muted-foreground mt-2">Loading enquiries...</p>
                                    </td>
                                </tr>
                            ) : enquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <HiOutlineInbox className="w-8 h-8 text-muted-foreground/50" />
                                        </div>
                                        <p className="text-lg font-medium text-foreground">No enquiries found</p>
                                        <p className="text-muted-foreground text-sm mt-1">Check back later or add a new enquiry.</p>
                                    </td>
                                </tr>
                            ) : (
                                enquiries.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-foreground">{item.name}</div>
                                            <div className="text-xs text-muted-foreground">{item.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-[200px] truncate text-sm font-medium" title={item.subject}>
                                                {item.subject}
                                            </div>
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

            {/* Enquiry Detail Modal */}
            {showModal && selectedEnquiry && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-border/50 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-border bg-muted/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Enquiry Details</h2>
                                <p className="text-sm text-muted-foreground">{new Date(selectedEnquiry.created_at).toLocaleString()}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="rounded-full hover:bg-muted">
                                <HiOutlineX className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Sender Info */}
                            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-primary font-bold">{selectedEnquiry.name.charAt(0)}</span>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-semibold text-foreground">{selectedEnquiry.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <HiOutlineMail className="w-4 h-4" /> {selectedEnquiry.email}
                                    </div>
                                    {selectedEnquiry.phone && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <HiOutlinePhone className="w-4 h-4" /> {selectedEnquiry.phone}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</label>
                                <p className="font-medium text-foreground">{selectedEnquiry.subject}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</label>
                                <div className="bg-muted/30 p-4 rounded-xl border border-border/50 text-sm leading-relaxed whitespace-pre-wrap">
                                    {selectedEnquiry.message}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 border-t border-border">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Update Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {['new', 'read', 'replied', 'closed'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusUpdate(selectedEnquiry.id, status)}
                                            className={`
                                                px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all
                                                ${selectedEnquiry.status === status
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
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border/50 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                            <h2 className="text-xl font-bold">New Enquiry</h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                                <HiOutlineX className="w-5 h-5" />
                            </Button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name *</label>
                                <input name="name" required className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="John Doe" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email *</label>
                                    <input name="email" type="email" required className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="john@example.com" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</label>
                                    <input name="phone" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="+1 (555) 000-0000" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject *</label>
                                <input name="subject" required className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Inquiry about..." />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message *</label>
                                <textarea name="message" required rows={5} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="Enter your message..." />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                                <Button type="submit" variant="primary" disabled={creating}>
                                    {creating ? <LoadingSpinner size="sm" color="white" /> : 'Submit Enquiry'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
