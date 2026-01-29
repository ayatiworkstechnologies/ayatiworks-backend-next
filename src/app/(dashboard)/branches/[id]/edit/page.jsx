'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi';

export default function EditBranchPage() {
    const params = useParams();
    const router = useRouter();
    const toast = useToast();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        company_id: '',
        name: '',
        code: '',
        email: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        timezone: 'UTC',
        is_active: true,
        description: '',
        branch_type: '',
        operating_hours: ''
    });

    useEffect(() => {
        fetchCompanies();
        fetchBranch();
    }, [params.id]);

    const fetchCompanies = async () => {
        try {
            const response = await api.get('/companies?page_size=100');
            setCompanies(response.items || []);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const fetchBranch = async () => {
        try {
            const data = await api.get(`/branches/${params.id}`);
            setFormData({
                company_id: data.company_id || '',
                name: data.name || '',
                code: data.code || '',
                email: data.email || '',
                phone: data.phone || '',
                address_line1: data.address_line1 || '',
                address_line2: data.address_line2 || '',
                city: data.city || '',
                state: data.state || '',
                country: data.country || '',
                postal_code: data.postal_code || '',
                timezone: data.timezone || 'UTC',
                is_active: data.is_active !== undefined ? data.is_active : true,
                description: data.description || '',
                branch_type: data.branch_type || '',
                operating_hours: data.operating_hours || ''
            });
        } catch (error) {
            console.error('Error fetching branch:', error);
            toast.error('Failed to load branch details');
            router.push('/branches');
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.company_id) newErrors.company_id = 'Company is required';
        if (!formData.name.trim()) newErrors.name = 'Branch name is required';
        if (!formData.code.trim()) newErrors.code = 'Branch code is required';
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
            data.company_id = parseInt(data.company_id, 10);

            await api.put(`/branches/${params.id}`, data);
            toast.success('Branch updated successfully');
            router.push(`/branches/${params.id}`);
        } catch (error) {
            toast.error(error.message || 'Failed to update branch');
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
                <Link href={`/branches/${params.id}`} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-2">
                    <HiOutlineArrowLeft className="w-4 h-4" /> Back to Branch Details
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Branch</h1>
                <p className="text-muted-foreground mt-1">Update branch information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader title="Basic Information" />
                    <CardBody className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="input-wrapper md:col-span-2">
                                <label className="input-label">Company <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.company_id}
                                    onChange={(e) => handleChange('company_id', e.target.value)}
                                    className={`input ${errors.company_id ? 'input-error' : ''}`}
                                >
                                    <option value="">Select Company</option>
                                    {companies.map(company => (
                                        <option key={company.id} value={company.id}>{company.name}</option>
                                    ))}
                                </select>
                                {errors.company_id && <p className="error-message">{errors.company_id}</p>}
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Branch Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className={`input ${errors.name ? 'input-error' : ''}`}
                                    placeholder="e.g., New York Office"
                                />
                                {errors.name && <p className="error-message">{errors.name}</p>}
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Branch Code <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                                    className={`input font-mono ${errors.code ? 'input-error' : ''}`}
                                    placeholder="e.g., NYC01"
                                />
                                {errors.code && <p className="error-message">{errors.code}</p>}
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Branch Type</label>
                                <select
                                    value={formData.branch_type}
                                    onChange={(e) => handleChange('branch_type', e.target.value)}
                                    className="input"
                                >
                                    <option value="">Select Type</option>
                                    <option value="headquarters">Headquarters</option>
                                    <option value="regional">Regional Office</option>
                                    <option value="branch">Branch Office</option>
                                    <option value="warehouse">Warehouse</option>
                                    <option value="factory">Factory</option>
                                </select>
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Operating Hours</label>
                                <input
                                    type="text"
                                    value={formData.operating_hours}
                                    onChange={(e) => handleChange('operating_hours', e.target.value)}
                                    className="input"
                                    placeholder="e.g., Mon-Fri 9:00 AM - 6:00 PM"
                                />
                            </div>
                        </div>

                        <div className="input-wrapper">
                            <label className="input-label">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className="input min-h-[80px]"
                                placeholder="Brief description of this branch..."
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader title="Contact Information" />
                    <CardBody className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="input-wrapper">
                                <label className="input-label">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="input"
                                    placeholder="branch@company.com"
                                />
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className="input"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Address */}
                <Card>
                    <CardHeader title="Address" />
                    <CardBody className="space-y-4">
                        <div className="input-wrapper">
                            <label className="input-label">Address Line 1</label>
                            <input
                                type="text"
                                value={formData.address_line1}
                                onChange={(e) => handleChange('address_line1', e.target.value)}
                                className="input"
                                placeholder="Street address"
                            />
                        </div>

                        <div className="input-wrapper">
                            <label className="input-label">Address Line 2</label>
                            <input
                                type="text"
                                value={formData.address_line2}
                                onChange={(e) => handleChange('address_line2', e.target.value)}
                                className="input"
                                placeholder="Apartment, suite, etc. (optional)"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="input-wrapper">
                                <label className="input-label">City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                    className="input"
                                    placeholder="City"
                                />
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">State/Province</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => handleChange('state', e.target.value)}
                                    className="input"
                                    placeholder="State"
                                />
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Country</label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => handleChange('country', e.target.value)}
                                    className="input"
                                    placeholder="Country"
                                />
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Postal Code</label>
                                <input
                                    type="text"
                                    value={formData.postal_code}
                                    onChange={(e) => handleChange('postal_code', e.target.value)}
                                    className="input"
                                    placeholder="Postal code"
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Settings */}
                <Card>
                    <CardHeader title="Settings" />
                    <CardBody className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="input-wrapper">
                                <label className="input-label">Timezone</label>
                                <select
                                    value={formData.timezone}
                                    onChange={(e) => handleChange('timezone', e.target.value)}
                                    className="input"
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">Eastern Time (ET)</option>
                                    <option value="America/Chicago">Central Time (CT)</option>
                                    <option value="America/Denver">Mountain Time (MT)</option>
                                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                    <option value="Europe/London">London (GMT)</option>
                                    <option value="Asia/Kolkata">India (IST)</option>
                                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                                </select>
                            </div>

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
                        </div>
                    </CardBody>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Link href={`/branches/${params.id}`}>
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
