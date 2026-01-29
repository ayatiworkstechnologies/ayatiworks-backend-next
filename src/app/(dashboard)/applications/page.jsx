'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiBriefcase, FiDownload, FiEye, FiTrash2, FiLinkedin, FiGlobe, FiX, FiRefreshCw, FiPlus } from 'react-icons/fi';
import Swal from 'sweetalert2';
import api from '@/lib/api';

const statusColors = {
    new: 'bg-blue-100 text-blue-700',
    reviewed: 'bg-yellow-100 text-yellow-700',
    interviewed: 'bg-purple-100 text-purple-700',
    rejected: 'bg-red-100 text-red-700',
    hired: 'bg-green-100 text-green-700',
};

export default function ApplicationsPage() {
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

            Swal.fire({
                icon: 'success',
                title: 'Application Created',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
            });
            setShowCreateModal(false);
            fetchApplications();
            form.reset();
        } catch (error) {
            Swal.fire('Error', 'Failed to create application', 'error');
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
            Swal.fire('Error', 'Failed to load applications', 'error');
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
            Swal.fire({
                icon: 'success',
                title: 'Status Updated',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
            });
            fetchApplications();
            setShowModal(false);
        } catch (error) {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Application?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Delete',
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/public/careers/${id}`);
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                });
                fetchApplications();
            } catch (error) {
                Swal.fire('Error', 'Failed to delete application', 'error');
            }
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Job Applications</h1>
                    <p className="text-muted-foreground mt-1">Review and manage candidate applications</p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0 flex-wrap">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <FiPlus className="w-4 h-4" /> Add Application
                    </button>
                    <input
                        type="text"
                        placeholder="Filter by position..."
                        value={positionFilter}
                        onChange={(e) => setPositionFilter(e.target.value)}
                        className="input py-2 px-3 w-48"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input py-2 px-3 pr-8"
                    >
                        <option value="">All Status</option>
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                    </select>
                    <button
                        onClick={fetchApplications}
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
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Candidate</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Position</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Experience</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Applied</th>
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
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                                        No applications found
                                    </td>
                                </tr>
                            ) : (
                                applications.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <FiUser className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{item.first_name} {item.last_name}</p>
                                                    <p className="text-sm text-muted-foreground">{item.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <FiBriefcase className="w-4 h-4 text-muted-foreground" />
                                                {item.position_applied}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-muted-foreground">
                                            {item.experience_years ? `${item.experience_years} years` : 'N/A'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[item.status] || 'bg-slate-100'}`}>
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
                                                {item.resume_url && (
                                                    <a
                                                        href={item.resume_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                                                        title="Download Resume"
                                                    >
                                                        <FiDownload className="w-4 h-4" />
                                                    </a>
                                                )}
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
            {showModal && selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Application Details</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Candidate Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                    {selectedApp.first_name[0]}{selectedApp.last_name[0]}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">{selectedApp.first_name} {selectedApp.last_name}</h3>
                                    <p className="text-muted-foreground">{selectedApp.position_applied}</p>
                                </div>
                            </div>

                            {/* Contact & Links */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-muted-foreground">Email</label>
                                    <p className="font-medium">{selectedApp.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Phone</label>
                                    <p className="font-medium">{selectedApp.phone}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Experience</label>
                                    <p className="font-medium">{selectedApp.experience_years ? `${selectedApp.experience_years} years` : 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Current Company</label>
                                    <p className="font-medium">{selectedApp.current_company || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Links */}
                            <div className="flex gap-4">
                                {selectedApp.linkedin_url && (
                                    <a
                                        href={selectedApp.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <FiLinkedin /> LinkedIn
                                    </a>
                                )}
                                {selectedApp.portfolio_url && (
                                    <a
                                        href={selectedApp.portfolio_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                                    >
                                        <FiGlobe /> Portfolio
                                    </a>
                                )}

                                {selectedApp.resume_url && (
                                    <a
                                        href={selectedApp.resume_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                    >
                                        <FiDownload /> Resume
                                    </a>
                                )}
                            </div>

                            {/* Cover Letter */}
                            {selectedApp.cover_letter && (
                                <div>
                                    <label className="text-sm text-muted-foreground">Cover Letter</label>
                                    <p className="mt-2 p-4 bg-muted/50 rounded-lg whitespace-pre-wrap">{selectedApp.cover_letter}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div>
                                <label className="text-sm text-muted-foreground">Update Status</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {['reviewed', 'interviewed', 'hired', 'rejected'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusUpdate(selectedApp.id, status)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${statusColors[status]} hover:opacity-80 transition-opacity`}
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
                    <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Add New Application</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">First Name <span className="text-red-500">*</span></label>
                                    <input name="first_name" required className="input w-full" placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Last Name <span className="text-red-500">*</span></label>
                                    <input name="last_name" required className="input w-full" placeholder="Doe" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
                                    <input name="email" type="email" required className="input w-full" placeholder="john@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone <span className="text-red-500">*</span></label>
                                    <input name="phone" required className="input w-full" placeholder="+1234567890" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Position <span className="text-red-500">*</span></label>
                                    <input name="position_applied" required className="input w-full" placeholder="Software Engineer" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Experience (Years)</label>
                                    <input name="experience_years" type="number" className="input w-full" placeholder="3" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Current Company</label>
                                <input name="current_company" className="input w-full" placeholder="Current Company Name" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                                    <input name="linkedin_url" type="url" className="input w-full" placeholder="https://linkedin.com/in/..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Portfolio URL</label>
                                    <input name="portfolio_url" type="url" className="input w-full" placeholder="https://portfolio.com" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Resume</label>
                                <input name="resume" type="file" accept=".pdf,.doc,.docx" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Cover Letter</label>
                                <textarea name="cover_letter" rows={3} className="input w-full resize-none" placeholder="Additional notes..." />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={creating} className="btn btn-primary">
                                    {creating ? 'Creating...' : 'Create Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
