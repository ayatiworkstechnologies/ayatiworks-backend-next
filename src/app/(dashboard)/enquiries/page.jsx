'use client';

import { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiEye, FiTrash2, FiCheck, FiX, FiFilter, FiRefreshCw, FiPlus } from 'react-icons/fi';
import Swal from 'sweetalert2';
import api from '@/lib/api';

const statusColors = {
    new: 'bg-blue-100 text-blue-700',
    read: 'bg-yellow-100 text-yellow-700',
    replied: 'bg-green-100 text-green-700',
    closed: 'bg-slate-100 text-slate-700',
};

export default function EnquiriesPage() {
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
            Swal.fire({
                icon: 'success',
                title: 'Enquiry Created',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
            });
            setShowCreateModal(false);
            fetchEnquiries();
            form.reset();
        } catch (error) {
            Swal.fire('Error', 'Failed to create enquiry', 'error');
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
            Swal.fire('Error', 'Failed to load enquiries', 'error');
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
            Swal.fire({
                icon: 'success',
                title: 'Status Updated',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
            });
            fetchEnquiries();
            setShowModal(false);
        } catch (error) {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Enquiry?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Delete',
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/public/contact/${id}`);
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                });
                fetchEnquiries();
            } catch (error) {
                Swal.fire('Error', 'Failed to delete enquiry', 'error');
            }
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Contact Enquiries</h1>
                    <p className="text-muted-foreground mt-1">Manage contact form submissions</p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <FiPlus className="w-4 h-4" /> Add Enquiry
                    </button>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="input py-2 px-3 pr-8"
                    >
                        <option value="">All Status</option>
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="closed">Closed</option>
                    </select>
                    <button
                        onClick={fetchEnquiries}
                        className="btn btn-secondary p-2"
                        title="Refresh"
                    >
                        <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Subject</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                                        Loading...
                                    </td>
                                </tr>
                            ) : enquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                                        No enquiries found
                                    </td>
                                </tr>
                            ) : (
                                enquiries.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-4 font-medium">{item.name}</td>
                                        <td className="px-4 py-4 text-muted-foreground">{item.email}</td>
                                        <td className="px-4 py-4 max-w-[200px] truncate">{item.subject}</td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status] || 'bg-slate-100'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-muted-foreground text-sm">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(item)}
                                                    className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                                                    title="View"
                                                >
                                                    <FiEye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="btn btn-secondary py-1 px-3 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="btn btn-secondary py-1 px-3 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showModal && selectedEnquiry && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Enquiry Details</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm text-muted-foreground">From</label>
                                <p className="font-medium">{selectedEnquiry.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                                        <FiMail className="w-3 h-3" /> Email
                                    </label>
                                    <p className="font-medium">{selectedEnquiry.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                                        <FiPhone className="w-3 h-3" /> Phone
                                    </label>
                                    <p className="font-medium">{selectedEnquiry.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">Subject</label>
                                <p className="font-medium">{selectedEnquiry.subject}</p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">Message</label>
                                <p className="mt-1 p-3 bg-muted/50 rounded-lg whitespace-pre-wrap">{selectedEnquiry.message}</p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">Update Status</label>
                                <div className="flex gap-2 mt-2">
                                    {['read', 'replied', 'closed'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusUpdate(selectedEnquiry.id, status)}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${statusColors[status]} hover:opacity-80 transition-opacity`}
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Add New Enquiry</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
                                <input name="name" required className="input w-full" placeholder="John Doe" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
                                    <input name="email" type="email" required className="input w-full" placeholder="john@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    <input name="phone" className="input w-full" placeholder="+1234567890" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Subject <span className="text-red-500">*</span></label>
                                <input name="subject" required className="input w-full" placeholder="Enquiry Subject" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Message <span className="text-red-500">*</span></label>
                                <textarea name="message" required rows={4} className="input w-full resize-none" placeholder="Enter message details..." />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={creating} className="btn btn-primary">
                                    {creating ? 'Creating...' : 'Create Enquiry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
