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
    HiOutlineArrowLeft, HiOutlineBadgeCheck, HiOutlinePencil,
    HiOutlineTrash
} from 'react-icons/hi';

export default function DesignationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const toast = useToast();
    const [designation, setDesignation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchDesignation();
    }, [params.id]);

    const fetchDesignation = async () => {
        try {
            const data = await api.get(`/organizations/designations/${params.id}`);
            setDesignation(data);
        } catch (error) {
            console.error('Error fetching designation:', error);
            toast.error('Failed to load designation details');
            router.push('/designations');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/organizations/designations/${params.id}`);
            toast.success('Designation deleted successfully');
            router.push('/designations');
        } catch (error) {
            toast.error(error.message || 'Failed to delete designation');
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

    if (!designation) {
        return <div>Designation not found</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/designations" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-2">
                        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Designations
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <HiOutlineBadgeCheck className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{designation.name}</h1>
                            <p className="text-muted-foreground font-mono">{designation.code}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/designations/${params.id}/edit`}>
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
                            <p className="text-3xl font-bold text-foreground">{designation.employee_count || 0}</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Department</p>
                            <p className="text-lg font-semibold text-foreground">{designation.department_name || 'N/A'}</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Status</p>
                            <StatusBadge status={designation.is_active ? 'active' : 'inactive'} />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Designation Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader title="Basic Information" />
                    <CardBody className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Designation Name</p>
                            <p className="font-medium text-foreground">{designation.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Designation Code</p>
                            <p className="font-medium text-foreground font-mono">{designation.code || 'N/A'}</p>
                        </div>
                        {designation.department_name && (
                            <div>
                                <p className="text-sm text-muted-foreground">Department</p>
                                <p className="font-medium text-foreground">{designation.department_name}</p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Additional Info */}
                <Card>
                    <CardHeader title="Statistics" />
                    <CardBody className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Employees</p>
                            <p className="font-medium text-foreground">{designation.employee_count || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <p className="font-medium text-foreground capitalize">
                                {designation.is_active ? 'Active' : 'Inactive'}
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Description */}
            {designation.description && (
                <Card>
                    <CardHeader title="Description" />
                    <CardBody>
                        <p className="text-foreground whitespace-pre-line">{designation.description}</p>
                    </CardBody>
                </Card>
            )}

            <DeleteConfirmModal
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Designation"
                message={`Are you sure you want to delete "${designation.name}"? This action cannot be undone.`}
                loading={deleting}
            />
        </div>
    );
}
