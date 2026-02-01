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
    HiOutlineArrowLeft, HiOutlinePencil,
    HiOutlineTrash, HiOutlineLocationMarker, HiOutlineMail,
    HiOutlinePhone, HiOutlineOfficeBuilding
} from 'react-icons/hi';

export default function BranchDetailPage() {
    const params = useParams();
    const router = useRouter();
    const toast = useToast();
    const [branch, setBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchBranch();
    }, [params.id]);

    const fetchBranch = async () => {
        try {
            const data = await api.get(`/branches/${params.id}`);
            setBranch(data);
        } catch (error) {
            console.error('Error fetching branch:', error);
            toast.error('Failed to load branch details');
            router.push('/settings/branches');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/branches/${params.id}`);
            toast.success('Branch deleted successfully');
            router.push('/settings/branches');
        } catch (error) {
            toast.error(error.message || 'Failed to delete branch');
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

    if (!branch) {
        return <div>Branch not found</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/settings/branches" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-2">
                        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Branches
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <HiOutlineLocationMarker className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{branch.name}</h1>
                            <p className="text-muted-foreground">{branch.code}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/settings/branches/${params.id}/edit`}>
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
                            <p className="text-sm text-muted-foreground mb-1">Employees</p>
                            <p className="text-3xl font-bold text-foreground">{branch.employee_count || 0}</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Company</p>
                            <Link href={`/settings/companies/${branch.company_id}`}>
                                <p className="text-lg font-semibold text-primary hover:underline">{branch.company_name || '-'}</p>
                            </Link>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Status</p>
                            <StatusBadge status={branch.is_active ? 'active' : 'inactive'} />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Branch Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card>
                    <CardHeader title="Contact Information" />
                    <CardBody className="space-y-4">
                        {branch.email && (
                            <div className="flex items-center gap-3">
                                <HiOutlineMail className="w-5 h-5 text-muted-foreground" />
                                <a href={`mailto:${branch.email}`} className="text-primary hover:underline">{branch.email}</a>
                            </div>
                        )}
                        {branch.phone && (
                            <div className="flex items-center gap-3">
                                <HiOutlinePhone className="w-5 h-5 text-muted-foreground" />
                                <a href={`tel:${branch.phone}`} className="text-foreground">{branch.phone}</a>
                            </div>
                        )}
                        {!branch.email && !branch.phone && (
                            <p className="text-muted-foreground text-sm">No contact information available</p>
                        )}
                    </CardBody>
                </Card>

                {/* Address */}
                <Card>
                    <CardHeader title="Address" />
                    <CardBody>
                        {branch.address_line1 || branch.city ? (
                            <div className="flex gap-3">
                                <HiOutlineLocationMarker className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <div className="text-foreground">
                                    {branch.address_line1 && <div>{branch.address_line1}</div>}
                                    {branch.address_line2 && <div>{branch.address_line2}</div>}
                                    {(branch.city || branch.state) && (
                                        <div>{branch.city}{branch.city && branch.state && ', '}{branch.state}</div>
                                    )}
                                    {branch.country && <div>{branch.country} {branch.postal_code}</div>}
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">No address information available</p>
                        )}
                    </CardBody>
                </Card>

                {/* Branch Info */}
                <Card>
                    <CardHeader title="Branch Information" />
                    <CardBody className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Branch Code</p>
                            <p className="font-medium text-foreground font-mono">{branch.code}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Branch Type</p>
                            <p className="font-medium text-foreground capitalize">{branch.branch_type || 'Standard'}</p>
                        </div>
                        {branch.manager_name && (
                            <div>
                                <p className="text-sm text-muted-foreground">Branch Manager</p>
                                <p className="font-medium text-foreground">{branch.manager_name}</p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Settings */}
                <Card>
                    <CardHeader title="Settings" />
                    <CardBody className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Timezone</p>
                            <p className="font-medium text-foreground">{branch.timezone || 'UTC'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Operating Hours</p>
                            <p className="font-medium text-foreground">
                                {branch.operating_hours || 'Not specified'}
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Description */}
            {branch.description && (
                <Card>
                    <CardHeader title="Description" />
                    <CardBody>
                        <p className="text-foreground whitespace-pre-line">{branch.description}</p>
                    </CardBody>
                </Card>
            )}

            <DeleteConfirmModal
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Branch"
                message={`Are you sure you want to delete "${branch.name}"? This action cannot be undone.`}
                loading={deleting}
            />
        </div>
    );
}
