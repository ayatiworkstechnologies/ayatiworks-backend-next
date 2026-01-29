'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatusBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
    HiOutlineArrowLeft, HiOutlineOfficeBuilding, HiOutlinePencil,
    HiOutlineTrash, HiOutlineLocationMarker, HiOutlineMail,
    HiOutlinePhone, HiOutlineGlobe, HiOutlineDocumentText
} from 'react-icons/hi';

export default function CompanyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const toast = useToast();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        fetchCompany();
        fetchBranches();
    }, [params.id]);

    const fetchCompany = async () => {
        try {
            const data = await api.get(`/companies/${params.id}`);
            setCompany(data);
        } catch (error) {
            console.error('Error fetching company:', error);
            toast.error('Failed to load company details');
            router.push('/companies');
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const data = await api.get(`/companies/${params.id}/branches`);
            setBranches(data || []);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/companies/${params.id}`);
            toast.success('Company deleted successfully');
            router.push('/companies');
        } catch (error) {
            toast.error(error.message || 'Failed to delete company');
        } finally {
            setDeleting(false);
            setDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in-up">
                <Card><CardBody className="h-32 bg-muted/30 animate-pulse" /></Card>
            </div>
        );
    }

    if (!company) {
        return <div>Company not found</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/companies" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-2">
                        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Companies
                    </Link>
                    <div className="flex items-center gap-4">
                        {company.logo ? (
                            <img src={company.logo} alt={company.name} className="w-16 h-16 rounded-xl object-cover" />
                        ) : (
                            <div className="w-16 h-16 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <HiOutlineOfficeBuilding className="w-8 h-8 text-blue-600" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{company.name}</h1>
                            <p className="text-muted-foreground">{company.code}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/companies/${params.id}/edit`}>
                        <Button variant="secondary">
                            <HiOutlinePencil className="w-4 h-4" /> Edit
                        </Button>
                    </Link>
                    <Button variant="danger" onClick={() => setDeleteModal(true)}>
                        <HiOutlineTrash className="w-4 h-4" /> Delete
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Branches</p>
                            <p className="text-3xl font-bold text-foreground">{company.branch_count || 0}</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Employees</p>
                            <p className="text-3xl font-bold text-foreground">{company.employee_count || 0}</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Status</p>
                            <StatusBadge status={company.is_active ? 'active' : 'inactive'} />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Company Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card>
                    <CardHeader title="Contact Information" />
                    <CardBody className="space-y">
                        {company.email && (
                            <div className="flex items-center gap-3">
                                <HiOutlineMail className="w-5 h-5 text-muted-foreground" />
                                <a href={`mailto:${company.email}`} className="text-primary hover:underline">{company.email}</a>
                            </div>
                        )}
                        {company.phone && (
                            <div className="flex items-center gap-3">
                                <HiOutlinePhone className="w-same5 h-5 text-muted-foreground" />
                                <a href={`tel:${company.phone}`} className="text-foreground">{company.phone}</a>
                            </div>
                        )}
                        {company.website && (
                            <div className="flex items-center gap-3">
                                <HiOutlineGlobe className="w-5 h-5 text-muted-foreground" />
                                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{company.website}</a>
                            </div>
                        )}
                        {!company.email && !company.phone && !company.website && (
                            <p className="text-muted-foreground text-sm">No contact information available</p>
                        )}
                    </CardBody>
                </Card>

                {/* Address */}
                <Card>
                    <CardHeader title="Address" />
                    <CardBody>
                        {company.address_line1 || company.city ? (
                            <div className="flex gap-3">
                                <HiOutlineLocationMarker className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <div className="text-foreground">
                                    {company.address_line1 && <div>{company.address_line1}</div>}
                                    {company.address_line2 && <div>{company.address_line2}</div>}
                                    {(company.city || company.state) && (
                                        <div>{company.city}{company.city && company.state && ', '}{company.state}</div>
                                    )}
                                    {company.country && <div>{company.country} {company.postal_code}</div>}
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">No address information available</p>
                        )}
                    </CardBody>
                </Card>

                {/* Legal Information */}
                <Card>
                    <CardHeader title="Legal Information" />
                    <CardBody className="space-y-3">
                        {company.registration_number && (
                            <div>
                                <p className="text-sm text-muted-foreground">Registration Number</p>
                                <p className="font-medium text-foreground">{company.registration_number}</p>
                            </div>
                        )}
                        {company.tax_id && (
                            <div>
                                <p className="text-sm text-muted-foreground">Tax ID</p>
                                <p className="font-medium text-foreground">{company.tax_id}</p>
                            </div>
                        )}
                        {!company.registration_number && !company.tax_id && (
                            <p className="text-muted-foreground text-sm">No legal information available</p>
                        )}
                    </CardBody>
                </Card>

                {/* Settings */}
                <Card>
                    <CardHeader title="Settings" />
                    <CardBody className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Timezone</p>
                            <p className="font-medium text-foreground">{company.timezone || 'UTC'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Currency</p>
                            <p className="font-medium text-foreground">{company.currency || 'USD'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Date Format</p>
                            <p className="font-medium text-foreground">{company.date_format || 'YYYY-MM-DD'}</p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Branches */}
            {branches.length > 0 && (
                <Card>
                    <CardHeader title="Branches" />
                    <div className="table-container border-0 bg-transparent">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Code</th>
                                    <th>City</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {branches.map((branch) => (
                                    <tr key={branch.id}>
                                        <td className="font-medium">{branch.name}</td>
                                        <td className="text-muted-foreground">{branch.code}</td>
                                        <td className="text-muted-foreground">{branch.city || '-'}</td>
                                        <td><StatusBadge status={branch.is_active ? 'active' : 'inactive'} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <DeleteConfirmModal
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Company"
                message={`Are you sure you want to delete "${company.name}"? This action cannot be undone.`}
                loading={deleting}
            />
        </div>
    );
}
