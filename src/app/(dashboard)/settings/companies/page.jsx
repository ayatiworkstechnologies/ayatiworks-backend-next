'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardBody, StatCard, StatusBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
    HiOutlinePlus, HiOutlineOfficeBuilding, HiOutlineChartBar,
    HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineEye,
    HiOutlinePencil, HiOutlineTrash, HiOutlineSearch
} from 'react-icons/hi';

export default function CompaniesPage() {
    const toast = useToast();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ open: false, company: null });
    const [deleting, setDeleting] = useState(false);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });

    const fetchCompanies = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                page_size: 20,
            });

            if (searchTerm) params.append('search', searchTerm);
            if (filterActive !== null) params.append('is_active', filterActive);

            const response = await api.get(`/companies?${params}`);
            setCompanies(response.items || []);
            setPagination({
                total: response.total || 0,
                pages: response.pages || 1
            });

            // Calculate stats
            const active = response.items?.filter(c => c.is_active).length || 0;
            const total = response.total || 0;
            setStats({
                total,
                active,
                inactive: total - active
            });
        } catch (error) {
            console.error('Error fetching companies:', error);
            toast.error('Failed to load companies');
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filterActive, toast]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const handleDelete = useCallback(async (company) => {
        const isConfirmed = await toast.confirm(
            'Delete Company',
            `Are you sure you want to delete "${company.name}"? This action cannot be undone.`,
            'Yes, delete it!'
        );

        if (isConfirmed) {
            try {
                await api.delete(`/companies/${company.id}`);
                toast.success('Company deleted successfully');
                fetchCompanies();
            } catch (error) {
                toast.error(error.message || 'Failed to delete company');
            }
        }
    }, [toast, fetchCompanies]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchCompanies();
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Companies</h1>
                    <p className="text-muted-foreground mt-1">Manage your organization's companies</p>
                </div>
                <Link href="/settings/companies/new">
                    <Button variant="primary" className="shadow-lg shadow-primary/20">
                        <HiOutlinePlus className="w-5 h-5" /> Add Company
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={<HiOutlineOfficeBuilding className="w-6 h-6" />} iconColor="blue" value={stats.total} label="Total Companies" />
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
                                placeholder="Search companies by name or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
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

            {/* Companies Table */}
            {loading ? (
                <Card>
                    <CardBody className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-muted/30 rounded animate-pulse" />
                        ))}
                    </CardBody>
                </Card>
            ) : companies.length === 0 ? (
                <div className="text-center p-12 glass-card border-2 border-dashed border-border/50">
                    <HiOutlineOfficeBuilding className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-foreground">No Companies Found</h3>
                    <p className="text-muted-foreground mb-6">Create your first company to get started.</p>
                    <Link href="/settings/companies/new"><Button variant="primary">Add Company</Button></Link>
                </div>
            ) : (
                <Card className="overflow-hidden border-0 shadow-xl">
                    <div className="table-container border-0 bg-transparent">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="w-[25%]">Company</th>
                                    <th>Contact</th>
                                    <th>Location</th>
                                    <th>Branches</th>
                                    <th>Employees</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map((company) => (
                                    <tr key={company.id} className="group hover:bg-muted/20 transition-colors">
                                        <td>
                                            <Link href={`/settings/companies/${company.id}`} className="block">
                                                <div className="flex items-center gap-3">
                                                    {company.logo ? (
                                                        <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-lg object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                            <HiOutlineOfficeBuilding className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                            {company.name}
                                                        </span>
                                                        <p className="text-xs text-muted-foreground">{company.code}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td>
                                            <div className="text-sm">
                                                {company.email && <div className="text-muted-foreground">{company.email}</div>}
                                                {company.phone && <div className="text-muted-foreground">{company.phone}</div>}
                                                {!company.email && !company.phone && <span className="text-muted-foreground">-</span>}
                                            </div>
                                        </td>
                                        <td className="text-muted-foreground">
                                            {company.city ? `${company.city}, ${company.country || ''}` : '-'}
                                        </td>
                                        <td>
                                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-blue-500/10 text-blue-600 rounded-full">
                                                {company.branch_count || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-purple-500/10 text-purple-600 rounded-full">
                                                {company.employee_count || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <StatusBadge status={company.is_active ? 'active' : 'inactive'} />
                                        </td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Link href={`/settings/companies/${company.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <HiOutlineEye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/settings/companies/${company.id}/edit`}>
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
                                                        handleDelete(company);
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
                                Page {currentPage} of {pagination.pages} • {pagination.total} total companies
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
