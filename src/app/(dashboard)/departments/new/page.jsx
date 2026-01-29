'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi';

export default function NewDepartmentPage() {
    const router = useRouter();
    const toast = useToast();
    const [companies, setCompanies] = useState([]);
    const [departments, setDepartments] = useState([]);
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
    }, []);

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
            const response = await api.get('/departments?page_size=100');
            setDepartments(response.items || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
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

            const response = await api.post('/departments', data);
            toast.success('Department created successfully');
            router.push(`/departments/${response.id}`);
        } catch (error) {
            toast.error(error.message || 'Failed to create department');
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

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div>
                <Link href="/departments" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-2">
                    <HiOutlineArrowLeft className="w-4 h-4" /> Back to Departments
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Department</h1>
                <p className="text-muted-foreground mt-1">Add a new department to your organization</p>
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
                    <Link href="/departments">
                        <Button variant="secondary" type="button">Cancel</Button>
                    </Link>
                    <Button variant="primary" type="submit" loading={saving}>
                        <HiOutlineCheck className="w-4 h-4" /> Create Department
                    </Button>
                </div>
            </form>
        </div>
    );
}
