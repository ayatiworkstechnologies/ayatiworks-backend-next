'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi';

export default function EditCompanyPage() {
    const params = useParams();
    const router = useRouter();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        email: '',
        phone: '',
        website: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        registration_number: '',
        tax_id: '',
        timezone: 'UTC',
        currency: 'USD',
        is_active: true,
    });

    useEffect(() => {
        fetchCompany();
    }, [params.id]);

    const fetchCompany = async () => {
        try {
            const data = await api.get(`/companies/${params.id}`);
            setFormData({
                name: data.name || '',
                logo: data.logo || '',
                email: data.email || '',
                phone: data.phone || '',
                website: data.website || '',
                address_line1: data.address_line1 || '',
                address_line2: data.address_line2 || '',
                city: data.city || '',
                state: data.state || '',
                country: data.country || '',
                postal_code: data.postal_code || '',
                registration_number: data.registration_number || '',
                tax_id: data.tax_id || '',
                timezone: data.timezone || 'UTC',
                currency: data.currency || 'USD',
                is_active: data.is_active ?? true,
            });
        } catch (error) {
            console.error('Error fetching company:', error);
            toast.error('Failed to load company');
            router.push('/companies');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Company name is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast?.error?.('Please fix the validation errors');
            return;
        }

        setLoading(true);
        try {
            const cleanData = {
                name: formData.name.trim(),
                timezone: formData.timezone,
                currency: formData.currency,
                is_active: formData.is_active,
            };

            // Add optional fields if they have values
            if (formData.logo) cleanData.logo = formData.logo.trim();
            if (formData.email) cleanData.email = formData.email.trim();
            if (formData.phone) cleanData.phone = formData.phone.trim();
            if (formData.website) cleanData.website = formData.website.trim();
            if (formData.address_line1) cleanData.address_line1 = formData.address_line1.trim();
            if (formData.address_line2) cleanData.address_line2 = formData.address_line2.trim();
            if (formData.city) cleanData.city = formData.city.trim();
            if (formData.state) cleanData.state = formData.state.trim();
            if (formData.country) cleanData.country = formData.country.trim();
            if (formData.postal_code) cleanData.postal_code = formData.postal_code.trim();
            if (formData.registration_number) cleanData.registration_number = formData.registration_number.trim();
            if (formData.tax_id) cleanData.tax_id = formData.tax_id.trim();

            await api.put(`/companies/${params.id}`, cleanData);
            toast?.success?.('Company updated successfully!');
            setTimeout(() => router.push(`/companies/${params.id}`), 1500);
        } catch (error) {
            console.error('Error updating company:', error);
            const errorMessage = error?.data?.detail || error?.message || 'Failed to update company';
            toast?.error?.(typeof errorMessage === 'string' ? errorMessage : 'Failed to update company');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return <div className="space-y-6"><Card><CardBody className="h-32 bg-muted/30 animate-pulse" /></Card></div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="page-header">
                <div>
                    <Link href={`/companies/${params.id}`} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700">
                        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Company
                    </Link>
                    <h1 className="page-title mt-2">Edit Company</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Basic Info */}
                <Card className="mb-6">
                    <CardHeader title="Basic Information" />
                    <CardBody className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="input-wrapper">
                                <label className="input-label">Company Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`input ${errors.name ? 'input-error' : ''}`}
                                />
                                {errors.name && <p className="error-message">{errors.name}</p>}
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">Logo URL</label>
                                <input
                                    type="text"
                                    name="logo"
                                    value={formData.logo}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>
                        </div>
                        <div className="input-wrapper">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-foreground">Active</span>
                            </label>
                        </div>
                    </CardBody>
                </Card>

                {/* Contact Information */}
                <Card className="mb-6">
                    <CardHeader title="Contact Information" />
                    <CardBody className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="input-wrapper">
                                <label className="input-label">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">Phone</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input" />
                            </div>
                        </div>
                        <div className="input-wrapper">
                            <label className="input-label">Website</label>
                            <input type="url" name="website" value={formData.website} onChange={handleChange} className="input" />
                        </div>
                    </CardBody>
                </Card>

                {/* Address */}
                <Card className="mb-6">
                    <CardHeader title="Address" />
                    <CardBody className="space-y-4">
                        <div className="input-wrapper">
                            <label className="input-label">Address Line 1</label>
                            <input type="text" name="address_line1" value={formData.address_line1} onChange={handleChange} className="input" />
                        </div>
                        <div className="input-wrapper">
                            <label className="input-label">Address Line 2</label>
                            <input type="text" name="address_line2" value={formData.address_line2} onChange={handleChange} className="input" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="input-wrapper">
                                <label className="input-label">City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} className="input" />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">State/Province</label>
                                <input type="text" name="state" value={formData.state} onChange={handleChange} className="input" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="input-wrapper">
                                <label className="input-label">Country</label>
                                <input type="text" name="country" value={formData.country} onChange={handleChange} className="input" />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">Postal Code</label>
                                <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className="input" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Legal Information */}
                <Card className="mb-6">
                    <CardHeader title="Legal Information" />
                    <CardBody className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="input-wrapper">
                                <label className="input-label">Registration Number</label>
                                <input type="text" name="registration_number" value={formData.registration_number} onChange={handleChange} className="input" />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">Tax ID</label>
                                <input type="text" name="tax_id" value={formData.tax_id} onChange={handleChange} className="input" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Settings */}
                <Card className="mb-6">
                    <CardHeader title="Company Settings" />
                    <CardBody className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="input-wrapper">
                                <label className="input-label">Timezone</label>
                                <select name="timezone" value={formData.timezone} onChange={handleChange} className="input">
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
                                <label className="input-label">Currency</label>
                                <select name="currency" value={formData.currency} onChange={handleChange} className="input">
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="INR">INR (₹)</option>
                                    <option value="JPY">JPY (¥)</option>
                                </select>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" loading={loading} disabled={loading || loadingData} className="flex-1">
                        <HiOutlineCheck className="w-4 h-4" /> Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
