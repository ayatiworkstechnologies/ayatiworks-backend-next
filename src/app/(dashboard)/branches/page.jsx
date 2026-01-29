'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardBody, StatCard, StatusBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
    HiOutlinePlus, HiOutlineOfficeBuilding, HiOutlineCheckCircle,
    HiOutlineXCircle, HiOutlineEye, HiOutlinePencil, HiOutlineTrash,
    HiOutlineSearch, HiOutlineLocationMarker
} from 'react-icons/hi';

export default function BranchesPage() {
    const toast = useToast();
    const [branches, setBranches] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ open: false, branch: null });
    const [deleting, setDeleting] = useState(false);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState(null);
    const [filterCompany, setFilterCompany] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchBranches = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                page_size: 20,
            });

            if (searchTerm) params.append('search', searchTerm);
            if (filterActive !== null) params.append('is_active', filterActive);
            if (filterCompany) params.append('company_id', filterCompany);

            const response = await api.get(`/branches?${params}`);
            setBranches(response.items || []);
            setPagination({
                total: response.total || 0,
                pages: response.pages || 1
            });

            // Calculate stats
            const active = response.items?.filter(b => b.is_active).length || 0;
            const total = response.total || 0;
            setStats({
                total,
                active,
                inactive: total - active
            });
        } catch (error) {
            console.error('Error fetching branches:', error);
            toast.error('Failed to load branches');
            setBranches([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filterActive, filterCompany, toast]);

    const fetchCompanies = async () => {
        try {
            const response = await api.get('/companies?page_size=100');
            setCompanies(response.items || []);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    const handleDelete = useCallback(async (branch) => {
        const isConfirmed = await toast.confirm(
            'Delete Branch',
            `Are you sure you want to delete "${branch.name}"? This action cannot be undone.`,
            'Yes, delete it!'
        );

        if (isConfirmed) {
            try {
                await api.delete(`/branches/${branch.id}`);
                toast.success('Branch deleted successfully');
                fetchBranches();
            } catch (error) {
                toast.error(error.message || 'Failed to delete branch');
            }
        }
    }, [toast, fetchBranches]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchBranches();
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Branches</h1>
                    <p className="text-muted-foreground mt-1">Manage company branches and locations</p>
                </div>
                <Link href="/branches/new">
                    <Button variant="primary" className="shadow-lg shadow-primary/20">
                        <HiOutlinePlus className="w-5 h-5" /> Add Branch
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={<HiOutlineLocationMarker className="w-6 h-6" />} iconColor="blue" value={stats.total} label="Total Branches" />
                <StatCard icon={<HiOutlineCheckCircle className="w-6 h-6" />} iconColor="green" value={stats.active} label="Active" />
                <StatCard icon={<HiOutlineXCircle className="w-6 h-6" />} iconColor="red" value={stats.inactive} label="Inactive" />
            </div>

            {/* Search and Filters */}
            <Card>
                <CardBody>
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search branches by name or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filterCompany}
                                onChange={(e) => {
                                    setFilterCompany(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-4 py-2 bg-muted/30 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            >
                                <option value="">All Companies</option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.id}>{company.name}</option>
                                ))}
                            </select>
                            <select
                                value={filterActive === null ? '' : filterActive}
                                onChange={(e) => {
                                    setFilterActive(e.target.value === '' ? null : e.target.value === 'true');
                                    setCurrentPage(1);
                                }}
                                className="px-4 py-2 bg-muted/30 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                            <Button type="submit" variant="secondary">Search</Button>
                        </div>
                    </form>
                </CardBody>
            </Card>

            {/* Branches Table */}
            {loading ? (
                <Card>
                    <CardBody className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-muted/30 rounded animate-pulse" />
                        ))}
                    </CardBody>
                </Card>
            ) : branches.length === 0 ? (
                <div className="text-center p-12 glass-card border-2 border-dashed border-border/50">
                    <HiOutlineLocationMarker className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-foreground">No Branches Found</h3>
                    <p className="text-muted-foreground mb-6">Create your first branch to get started.</p>
                    <Link href="/branches/new"><Button variant="primary">Add Branch</Button></Link>
                </div>
            ) : (
                <Card className="overflow-hidden border-0 shadow-xl">
                    <div className="table-container border-0 bg-transparent">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="w-[25%]">Branch</th>
                                    <th>Company</th>
                                    <th>Contact</th>
                                    <th>Location</th>
                                    <th>Employees</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {branches.map((branch) => (
                                    <tr key={branch.id} className="group hover:bg-muted/20 transition-colors">
                                        <td>
                                            <Link href={`/branches/${branch.id}`} className="block">
                                                <div className="flex items-center gap-3">
                                                    {branch.name}
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="text-muted-foreground">
                                            {branch.company_name || '-'}
                                        </td>
                                        <td>
                                            <div className="text-sm">
                                                {branch.email && <div className="text-muted-foreground">{branch.email}</div>}
                                                {branch.phone && <div className="text-muted-foreground">{branch.phone}</div>}
                                                {!branch.email && !branch.phone && <span className="text-muted-foreground">-</span>}
                                            </div>
                                        </td>
                                        <td className="text-muted-foreground">
                                            {branch.city ? `${branch.city}, ${branch.country || ''}` : '-'}
                                        </td>
                                        <td>
                                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-purple-500/10 text-purple-600 rounded-full">
                                                {branch.employee_count || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <StatusBadge status={branch.is_active ? 'active' : 'inactive'} />
                                        </td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Link href={`/branches/${branch.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <HiOutlineEye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/branches/${branch.id}/edit`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <HiOutlinePencil className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDelete(branch);
                                                    }}
                                                >
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="p-4 border-t border-border/30 flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                                Page {currentPage} of {pagination.pages} • {pagination.total} total branches
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={currentPage === pagination.pages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}
