'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi';

export default function EditDepartmentPage() {
    const params = useParams();
    const router = useRouter();
    const toast = useToast();
    const [companies, setCompanies] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        company_id: '',
        name: '',
        code: '',
        parent_id: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        fetchCompanies();
        fetchDepartments();
        fetchDepartment();
    }, [params.id]);

    const fetchCompanies = async () => {
        try {
            const response = await api.get('/companies?page_size=100');
            setCompanies(response.items || []);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/organizations/departments?page_size=100');
            // Filter out current department to prevent setting itself as parent
            setDepartments((response.items || []).filter(d => d.id !== parseInt(params.id)));
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchDepartment = async () => {
        try {
            const data = await api.get(`/organizations/departments/${params.id}`);
            setFormData({
                company_id: data.company_id || '',
                name: data.name || '',
                code: data.code || '',
                parent_id: data.parent_id || '',
                description: data.description || '',
                is_active: data.is_active !== undefined ? data.is_active : true
            });
        } catch (error) {
            console.error('Error fetching department:', error);
            toast.error('Failed to load department details');
            router.push('/departments');
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Department name is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix validation errors');
            return;
        }

        setSaving(true);
        try {
            const data = { ...formData };
            if (data.company_id) data.company_id = parseInt(data.company_id, 10);
            else data.company_id = null;
            if (data.parent_id) data.parent_id = parseInt(data.parent_id, 10);
            else data.parent_id = null;

            await api.put(`/organizations/departments/${params.id}`, data);
            toast.success('Department updated successfully');
            router.push(`/departments/${params.id}`);
        } catch (error) {
            toast.error(error.message || 'Failed to update department');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in-up">
                <Card><CardBody className="h-32 bg-muted/30 animate-pulse" /></Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div>
                <Link href={`/departments/${params.id}`} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-2">
                    <HiOutlineArrowLeft className="w-4 h-4" /> Back to Department Details
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Department</h1>
                <p className="text-muted-foreground mt-1">Update department information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader title="Basic Information" />
                    <CardBody className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="input-wrapper">
                                <label className="input-label">Department Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className={`input ${errors.name ? 'input-error' : ''}`}
                                    placeholder="e.g., Engineering"
                                />
                                {errors.name && <p className="error-message">{errors.name}</p>}
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Department Code</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                                    className="input font-mono"
                                    placeholder="e.g., ENG"
                                />
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Company</label>
                                <select
                                    value={formData.company_id}
                                    onChange={(e) => handleChange('company_id', e.target.value)}
                                    className="input"
                                >
                                    <option value="">Select Company</option>
                                    {companies.map(company => (
                                        <option key={company.id} value={company.id}>{company.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Parent Department</label>
                                <select
                                    value={formData.parent_id}
                                    onChange={(e) => handleChange('parent_id', e.target.value)}
                                    className="input"
                                >
                                    <option value="">None (Top Level)</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="input-wrapper">
                            <label className="input-label">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className="input min-h-[80px]"
                                placeholder="Brief description of this department..."
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* Settings */}
                <Card>
                    <CardHeader title="Settings" />
                    <CardBody>
                        <div className="input-wrapper">
                            <label className="input-label">Status</label>
                            <select
                                value={formData.is_active}
                                onChange={(e) => handleChange('is_active', e.target.value === 'true')}
                                className="input"
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </CardBody>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Link href={`/departments/${params.id}`}>
                        <Button variant="secondary" type="button">Cancel</Button>
                    </Link>
                    <Button variant="primary" type="submit" loading={saving}>
                        <HiOutlineCheck className="w-4 h-4" /> Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
