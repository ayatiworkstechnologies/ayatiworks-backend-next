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
    HiOutlineTrash
} from 'react-icons/hi';

export default function DepartmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const toast = useToast();
    const [department, setDepartment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchDepartment();
    }, [params.id]);

    const fetchDepartment = async () => {
        try {
            const data = await api.get(`/organizations/departments/${params.id}`);
            setDepartment(data);
        } catch (error) {
            console.error('Error fetching department:', error);
            toast.error('Failed to load department details');
            router.push('/departments');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/organizations/departments/${params.id}`);
            toast.success('Department deleted successfully');
            router.push('/departments');
        } catch (error) {
            toast.error(error.message || 'Failed to delete department');
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

    if (!department) {
        return <div>Department not found</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/departments" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-2">
                        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Departments
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <HiOutlineOfficeBuilding className="w-8 h-8 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{department.name}</h1>
                            <p className="text-muted-foreground font-mono">{department.code}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/departments/${params.id}/edit`}>
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
                            <p className="text-3xl font-bold text-foreground">{department.employee_count || 0}</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Parent Department</p>
                            <p className="text-lg font-semibold text-foreground">{department.parent_name || 'None'}</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Status</p>
                            <StatusBadge status={department.is_active ? 'active' : 'inactive'} />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Department Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader title="Basic Information" />
                    <CardBody className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Department Name</p>
                            <p className="font-medium text-foreground">{department.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Department Code</p>
                            <p className="font-medium text-foreground font-mono">{department.code}</p>
                        </div>
                        {department.parent_name && (
                            <div>
                                <p className="text-sm text-muted-foreground">Parent Department</p>
                                <p className="font-medium text-foreground">{department.parent_name}</p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Additional Info */}
                <Card>
                    <CardHeader title="Additional Information" />
                    <CardBody className="space-y-3">
                        {department.company_name && (
                            <div>
                                <p className="text-sm text-muted-foreground">Company</p>
                                <p className="font-medium text-foreground">{department.company_name}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-muted-foreground">Level</p>
                            <p className="font-medium text-foreground">{department.level || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Employees</p>
                            <p className="font-medium text-foreground">{department.employee_count || 0}</p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Description */}
            {department.description && (
                <Card>
                    <CardHeader title="Description" />
                    <CardBody>
                        <p className="text-foreground whitespace-pre-line">{department.description}</p>
                    </CardBody>
                </Card>
            )}

            <DeleteConfirmModal
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Department"
                message={`Are you sure you want to delete "${department.name}"? This action cannot be undone.`}
                loading={deleting}
            />
        </div>
    );
}
