'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Avatar, PageHeader, StatusBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import {
    HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineOfficeBuilding,
    HiOutlineBriefcase, HiOutlineCalendar, HiOutlineLocationMarker,
    HiOutlinePencil, HiOutlineCheck, HiOutlineIdentification, HiOutlineBadgeCheck
} from 'react-icons/hi';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const toast = useToast();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form data for editing
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        personal_email: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
    });

    useEffect(() => {
        if (user) {
            fetchMyProfile();
        }
    }, [user]);

    const fetchMyProfile = async () => {
        try {
            setLoading(true);
            // First try to get employee profile
            const response = await api.get('/employees/me');
            setEmployee(response);

            // Pre-fill form data
            setFormData({
                first_name: response.first_name || user?.first_name || '',
                last_name: response.last_name || user?.last_name || '',
                phone: response.phone || user?.phone || '',
                personal_email: response.personal_email || '',
                address_line1: response.address_line1 || '',
                address_line2: response.address_line2 || '',
                city: response.city || '',
                state: response.state || '',
                country: response.country || '',
                postal_code: response.postal_code || '',
                emergency_contact_name: response.emergency_contact_name || '',
                emergency_contact_phone: response.emergency_contact_phone || '',
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            // If no employee profile, use user data
            setFormData({
                first_name: user?.first_name || '',
                last_name: user?.last_name || '',
                phone: user?.phone || '',
                personal_email: '',
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                country: '',
                postal_code: '',
                emergency_contact_name: '',
                emergency_contact_phone: '',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Update user basic info
            await api.put(`/users/${user.id}`, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
            });

            // If employee exists, update employee profile too
            if (employee?.id) {
                await api.put(`/employees/${employee.id}`, {
                    personal_email: formData.personal_email,
                    address_line1: formData.address_line1,
                    address_line2: formData.address_line2,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    postal_code: formData.postal_code,
                    emergency_contact_name: formData.emergency_contact_name,
                    emergency_contact_phone: formData.emergency_contact_phone,
                });
            }

            toast.success('Profile updated successfully!');
            setEditMode(false);
            await refreshUser();
            await fetchMyProfile();
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    // Role badge color
    const getRoleBadgeColor = (roleName) => {
        const name = roleName?.toLowerCase() || '';
        if (name.includes('super')) return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
        if (name.includes('admin')) return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
        if (name.includes('manager')) return 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white';
        if (name.includes('hr')) return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white';
        if (name.includes('employee')) return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white';
        return 'bg-primary/10 text-primary';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    const displayName = `${formData.first_name} ${formData.last_name}`.trim() || user?.email;
    const roleName = user?.role?.name || user?.role?.code || 'Employee';

    return (
        <div className="space-y-6 animate-fade-in-up">
            <PageHeader
                title="My Profile"
                description="View and manage your personal information"
            >
                {!editMode ? (
                    <Button variant="primary" onClick={() => setEditMode(true)} className="shadow-lg shadow-primary/20">
                        <HiOutlinePencil className="w-5 h-5" />
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setEditMode(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSave} disabled={saving}>
                            <HiOutlineCheck className="w-5 h-5" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                )}
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card - Left Side */}
                <Card className="lg:col-span-1 border-0 shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 text-center">
                        <div className="relative inline-block">
                            <div className="absolute -inset-1 bg-gradient-to-br from-primary to-blue-500 rounded-full opacity-75 blur" />
                            <Avatar name={displayName} size="xl" className="relative ring-4 ring-background w-28 h-28 text-3xl" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mt-4">{displayName}</h2>
                        <p className="text-muted-foreground text-sm">{user?.email}</p>
                        <div className={`text-xs mt-3 font-semibold px-4 py-1.5 rounded-full inline-block ${getRoleBadgeColor(roleName)}`}>
                            {roleName}
                        </div>
                    </div>

                    <CardBody className="space-y-4">
                        {/* Employee Code */}
                        {employee?.employee_code && (
                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <HiOutlineIdentification className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Employee ID</p>
                                    <p className="font-semibold text-foreground">{employee.employee_code}</p>
                                </div>
                            </div>
                        )}

                        {/* Department */}
                        {employee?.department_name && (
                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <HiOutlineOfficeBuilding className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Department</p>
                                    <p className="font-semibold text-foreground">{employee.department_name}</p>
                                </div>
                            </div>
                        )}

                        {/* Designation */}
                        {employee?.designation_name && (
                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                    <HiOutlineBriefcase className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Designation</p>
                                    <p className="font-semibold text-foreground">{employee.designation_name}</p>
                                </div>
                            </div>
                        )}

                        {/* Joining Date */}
                        {employee?.joining_date && (
                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                                <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
                                    <HiOutlineCalendar className="w-5 h-5 text-violet-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Joining Date</p>
                                    <p className="font-semibold text-foreground">
                                        {new Date(employee.joining_date).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Status */}
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                <HiOutlineBadgeCheck className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Status</p>
                                <StatusBadge status={employee?.employment_status || 'active'} />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Details Cards - Right Side */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <Card className="border-0 shadow-xl">
                        <CardHeader
                            title="Personal Information"
                            subtitle="Your basic contact details"
                            className="bg-muted/10"
                        />
                        <CardBody className="p-6">
                            {editMode ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="First Name"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        icon={<HiOutlineUser className="w-4 h-4" />}
                                        required
                                    />
                                    <Input
                                        label="Last Name"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        icon={<HiOutlineUser className="w-4 h-4" />}
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        icon={<HiOutlinePhone className="w-4 h-4" />}
                                        placeholder="+91 98765 43210"
                                    />
                                    <Input
                                        label="Personal Email"
                                        type="email"
                                        value={formData.personal_email}
                                        onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                                        icon={<HiOutlineMail className="w-4 h-4" />}
                                        placeholder="personal@email.com"
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoItem icon={HiOutlineUser} label="Full Name" value={displayName} />
                                    <InfoItem icon={HiOutlineMail} label="Work Email" value={user?.email} />
                                    <InfoItem icon={HiOutlinePhone} label="Phone" value={formData.phone || 'Not set'} />
                                    <InfoItem icon={HiOutlineMail} label="Personal Email" value={formData.personal_email || 'Not set'} />
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Address Information */}
                    <Card className="border-0 shadow-xl">
                        <CardHeader
                            title="Address Information"
                            subtitle="Your residential address"
                            className="bg-muted/10"
                        />
                        <CardBody className="p-6">
                            {editMode ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Address Line 1"
                                        value={formData.address_line1}
                                        onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                                        icon={<HiOutlineLocationMarker className="w-4 h-4" />}
                                        wrapperClassName="md:col-span-2"
                                    />
                                    <Input
                                        label="Address Line 2"
                                        value={formData.address_line2}
                                        onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                                        wrapperClassName="md:col-span-2"
                                    />
                                    <Input
                                        label="City"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                    <Input
                                        label="State"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    />
                                    <Input
                                        label="Country"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    />
                                    <Input
                                        label="Postal Code"
                                        value={formData.postal_code}
                                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoItem
                                        icon={HiOutlineLocationMarker}
                                        label="Address"
                                        value={[formData.address_line1, formData.address_line2].filter(Boolean).join(', ') || 'Not set'}
                                        className="md:col-span-2"
                                    />
                                    <InfoItem label="City" value={formData.city || 'Not set'} />
                                    <InfoItem label="State" value={formData.state || 'Not set'} />
                                    <InfoItem label="Country" value={formData.country || 'Not set'} />
                                    <InfoItem label="Postal Code" value={formData.postal_code || 'Not set'} />
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Emergency Contact */}
                    <Card className="border-0 shadow-xl">
                        <CardHeader
                            title="Emergency Contact"
                            subtitle="Contact person in case of emergency"
                            className="bg-muted/10"
                        />
                        <CardBody className="p-6">
                            {editMode ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Contact Name"
                                        value={formData.emergency_contact_name}
                                        onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                                        icon={<HiOutlineUser className="w-4 h-4" />}
                                    />
                                    <Input
                                        label="Contact Phone"
                                        value={formData.emergency_contact_phone}
                                        onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                                        icon={<HiOutlinePhone className="w-4 h-4" />}
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoItem icon={HiOutlineUser} label="Contact Name" value={formData.emergency_contact_name || 'Not set'} />
                                    <InfoItem icon={HiOutlinePhone} label="Contact Phone" value={formData.emergency_contact_phone || 'Not set'} />
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Helper component for displaying info
function InfoItem({ icon: Icon, label, value, className = '' }) {
    return (
        <div className={`flex items-start gap-3 ${className}`}>
            {Icon && (
                <div className="w-9 h-9 bg-muted/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
            )}
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground">{value}</p>
            </div>
        </div>
    );
}
