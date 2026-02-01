'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, Avatar, StatusBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import EditableField from '@/components/ui/EditableField';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import {
    HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineOfficeBuilding,
    HiOutlineBriefcase, HiOutlineCalendar, HiOutlineLocationMarker,
    HiOutlinePencil, HiOutlineIdentification, HiOutlineBadgeCheck,
    HiOutlineCamera, HiOutlineCog, HiOutlineDocumentText, HiOutlineClock, HiOutlineUserGroup,
    HiOutlineUpload
} from 'react-icons/hi';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const toast = useToast();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const avatarInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchMyProfile();
        }
    }, [user]);

    const fetchMyProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/employees/me');
            setEmployee(response);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditField = (fieldName, currentValue) => {
        setEditingField(fieldName);
        setEditValue(currentValue || '');
    };

    const handleCancelEdit = () => {
        setEditingField(null);
        setEditValue('');
    };

    const handleSaveField = async () => {
        if (!editingField) return;

        setSaving(true);
        try {
            // Determine which API to call based on field type
            const userFields = ['first_name', 'last_name', 'phone'];

            if (userFields.includes(editingField)) {
                await api.put(`/users/${user.id}`, { [editingField]: editValue });
                await refreshUser();
            } else if (employee?.id) {
                await api.put(`/employees/${employee.id}`, { [editingField]: editValue });
            }

            toast.success('Updated successfully!');
            await fetchMyProfile();
            setEditingField(null);
            setEditValue('');
        } catch (error) {
            toast.error(error.message || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload a valid image (JPG, PNG, WebP, GIF)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setAvatarUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            await api.upload('/users/avatar', formData);
            toast.success('Profile picture updated!');
            await refreshUser();
        } catch (error) {
            toast.error(error.message || 'Failed to upload avatar');
        } finally {
            setAvatarUploading(false);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    };

    // Get role badge color (helper)
    const getRoleBadgeColor = (roleName) => {
        const name = roleName?.toLowerCase() || '';
        if (name.includes('super')) return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
        if (name.includes('admin')) return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
        if (name.includes('manager')) return 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white';
        if (name.includes('hr')) return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white';
        if (name.includes('employee')) return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white';
        return 'bg-primary/10 text-primary';
    };

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: HiOutlineUser },
        { id: 'employment', label: 'Employment', icon: HiOutlineBriefcase },
        { id: 'teams', label: 'Teams', icon: HiOutlineUserGroup },
        { id: 'documents', label: 'Documents', icon: HiOutlineDocumentText },
        { id: 'attendance', label: 'Attendance', icon: HiOutlineCalendar },
        { id: 'leaves', label: 'Leaves', icon: HiOutlineClock },
    ];

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

    const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email;
    const roleName = user?.role?.name || 'Employee';

    // Dropdown Options
    const genderOptions = [{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }, { label: 'Other', value: 'Other' }];
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => ({ label: g, value: g }));
    const maritalOptions = [{ label: 'Single', value: 'Single' }, { label: 'Married', value: 'Married' }, { label: 'Divorced', value: 'Divorced' }];


    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            {/* 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card (Sticky) */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-0 shadow-xl overflow-hidden sticky top-6">
                        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 text-center pb-12">
                            {/* Avatar with Camera Upload */}
                            <div className="relative inline-block group">
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                                <div className="absolute -inset-1 bg-gradient-to-br from-primary to-blue-500 rounded-2xl opacity-75 blur group-hover:opacity-100 transition-opacity" />
                                <Avatar
                                    name={displayName}
                                    src={user?.avatar}
                                    size="2xl"
                                    className="relative ring-4 ring-background shadow-2xl"
                                />
                                {avatarUploading ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
                                        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 shadow-lg transition-transform hover:scale-110 active:scale-95 ring-4 ring-background"
                                        title="Change Profile Picture"
                                    >
                                        <HiOutlineCamera className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold text-foreground mt-6">{displayName}</h2>
                            <div className={`text-xs mt-3 font-semibold px-4 py-1.5 rounded-full inline-block shadow-sm ${getRoleBadgeColor(roleName)}`}>
                                {roleName}
                            </div>

                            <div className="mt-6 flex justify-center">
                                <StatusBadge status={employee?.employment_status || 'active'} className="px-4 py-1.5 text-sm" />
                            </div>
                        </div>

                        <div className="relative bg-card -mt-4 rounded-t-3xl p-6 border-t border-border/50">
                            {/* Quick Stats List */}
                            <div className="space-y-5">
                                <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                                    <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-lg">
                                        <HiOutlineMail className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                                        <p className="text-sm font-medium truncate" title={user?.email}>{user?.email}</p>
                                    </div>
                                </div>

                                <EditableField
                                    icon={HiOutlinePhone}
                                    label="Phone"
                                    value={user?.phone || employee?.phone}
                                    fieldName="phone"
                                    editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue}
                                    className="bg-muted/30 p-2 rounded-xl"
                                />

                                <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                                    <div className="p-2.5 bg-purple-500/10 text-purple-600 rounded-lg">
                                        <HiOutlineCalendar className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Joined</p>
                                        <p className="text-sm font-medium">{employee?.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                                    <div className="p-2.5 bg-orange-500/10 text-orange-600 rounded-lg">
                                        <HiOutlineIdentification className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Employee ID</p>
                                        <p className="text-sm font-medium">{employee?.employee_code || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Action Buttons */}
                            <div className="border-t border-border/50 mt-8 pt-6 space-y-3">
                                <Button
                                    variant="primary"
                                    className="w-full shadow-lg shadow-primary/20 py-2.5"
                                    onClick={() => setActiveTab('personal')}
                                >
                                    <HiOutlinePencil className="w-4 h-4 mr-2" /> Edit Profile
                                </Button>
                                <Link href="/settings" className="block">
                                    <Button
                                        variant="secondary"
                                        className="w-full border-border/50 hover:bg-muted/80 shadow-sm"
                                    >
                                        <HiOutlineCog className="w-4 h-4 mr-2" /> Settings
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Tabbed Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Sticky Tabs Header */}
                    <div className="bg-card p-1.5 rounded-xl border border-border/50 shadow-sm flex gap-1 overflow-x-auto sticky top-0 z-10 mx-1 md:mx-0">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-1 whitespace-nowrap
                                        ${activeTab === tab.id
                                            ? 'bg-primary text-primary-foreground shadow-md'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'}
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[500px] animate-fade-in">
                        {activeTab === 'personal' && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader title="Personal Information" subtitle="Click on any field to edit" />
                                <CardBody>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <EditableField icon={HiOutlineUser} label="First Name" value={user?.first_name} fieldName="first_name" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} />
                                        <EditableField icon={HiOutlineUser} label="Last Name" value={user?.last_name} fieldName="last_name" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} />
                                        <EditableField icon={HiOutlinePhone} label="Phone" value={user?.phone || employee?.phone} fieldName="phone" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} />
                                        <EditableField icon={HiOutlineCalendar} label="Date of Birth" value={employee?.date_of_birth ? new Date(employee.date_of_birth).toISOString().split('T')[0] : null} fieldName="date_of_birth" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} type="date" />
                                        <EditableField icon={HiOutlineUser} label="Gender" value={employee?.gender} fieldName="gender" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} type="select" options={genderOptions} capitalize />
                                        <EditableField icon={HiOutlineIdentification} label="Blood Group" value={employee?.blood_group} fieldName="blood_group" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} type="select" options={bloodGroups} />
                                        <EditableField icon={HiOutlineUser} label="Marital Status" value={employee?.marital_status} fieldName="marital_status" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} type="select" options={maritalOptions} capitalize />
                                        <EditableField icon={HiOutlineLocationMarker} label="Nationality" value={employee?.nationality} fieldName="nationality" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} />
                                        <EditableField icon={HiOutlineLocationMarker} label="Current Address" value={employee?.current_address} fieldName="current_address" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} className="md:col-span-2" />
                                    </div>
                                </CardBody>
                            </Card>
                        )}

                        {activeTab === 'employment' && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader title="Employment Details" />
                                <CardBody>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                        <InfoItem icon={HiOutlineOfficeBuilding} label="Department" value={employee?.department_name || 'N/A'} />
                                        <InfoItem icon={HiOutlineBriefcase} label="Designation" value={employee?.designation_name || 'N/A'} />
                                        <InfoItem icon={HiOutlineBriefcase} label="Employment Type" value={(employee?.employment_type || 'N/A').replace('_', ' ')} capitalize />
                                        <InfoItem icon={HiOutlineLocationMarker} label="Work Mode" value={employee?.work_mode || 'N/A'} capitalize />
                                        <InfoItem icon={HiOutlineUser} label="Reporting Manager" value={employee?.manager_name || 'N/A'} />
                                        <InfoItem icon={HiOutlineIdentification} label="Shift" value={employee?.shift_name || 'General Shift'} />
                                        <InfoItem icon={HiOutlineCalendar} label="Joining Date" value={employee?.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'} />
                                        <InfoItem icon={HiOutlineIdentification} label="Employee Code" value={employee?.employee_code || 'N/A'} />
                                        <InfoItem icon={HiOutlineBadgeCheck} label="Status" value={employee?.employment_status || 'Active'} capitalize />
                                    </div>
                                </CardBody>
                            </Card>
                        )}

                        {activeTab === 'teams' && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader
                                    title="My Teams"
                                    action={
                                        <Link href="/teams">
                                            <Button variant="secondary" size="sm">View All Teams</Button>
                                        </Link>
                                    }
                                />
                                <CardBody>
                                    {(!employee?.teams || employee.teams.length === 0) ? (
                                        <div className="text-center text-muted-foreground py-16 bg-muted/5 rounded-xl border border-dashed border-border/50">
                                            <HiOutlineUserGroup className="w-16 h-16 mx-auto mb-6 opacity-20" />
                                            <h3 className="text-lg font-medium text-foreground mb-1">No Teams Assigned</h3>
                                            <p>You are not assigned to any teams.</p>
                                            <Link href="/teams" className="text-primary hover:underline text-sm mt-4 inline-block">
                                                Browse Teams
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {employee.teams.map((team) => (
                                                <Link key={team.id} href={`/teams/${team.id}`}>
                                                    <div className="flex items-center gap-4 p-5 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors group cursor-pointer shadow-sm">
                                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                            <span className="font-bold text-xl">{team.code || team.name?.charAt(0)}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{team.name}</h4>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                                <span className="bg-muted px-2.5 py-0.5 rounded-md text-xs border border-border font-medium">
                                                                    {team.role || 'Member'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        )}

                        {activeTab === 'documents' && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader title="Documents" action={<Button variant="secondary" size="sm"><HiOutlineUpload className="w-4 h-4 mr-2" /> Upload</Button>} />
                                <CardBody>
                                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/50 rounded-xl bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer group">
                                        <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                                            <HiOutlineDocumentText className="w-10 h-10 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">No documents uploaded</h3>
                                        <p className="text-muted-foreground mt-2 max-w-sm">Upload your documents like resume, ID proof, or certificates here.</p>
                                        <Button variant="primary" className="mt-6 shadow-lg shadow-primary/20">Upload Document</Button>
                                    </div>
                                </CardBody>
                            </Card>
                        )}

                        {activeTab === 'attendance' && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader title="Attendance Summary" />
                                <CardBody>
                                    <div className="text-center text-muted-foreground py-16 bg-muted/5 rounded-xl border border-dashed border-border/50">
                                        <HiOutlineCalendar className="w-16 h-16 mx-auto mb-6 opacity-20" />
                                        <p>Your attendance records will be displayed here</p>
                                        <Link href="/attendance" className="text-primary hover:underline text-sm mt-4 inline-block font-medium">
                                            View Attendance
                                        </Link>
                                    </div>
                                </CardBody>
                            </Card>
                        )}

                        {activeTab === 'leaves' && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader
                                    title="Leave Balance & History"
                                    action={
                                        <Link href="/leaves">
                                            <Button variant="secondary" size="sm">Apply Leave</Button>
                                        </Link>
                                    }
                                />
                                <CardBody>
                                    <div className="text-center text-muted-foreground py-16 bg-muted/5 rounded-xl border border-dashed border-border/50">
                                        <HiOutlineClock className="w-16 h-16 mx-auto mb-6 opacity-20" />
                                        <p>Your leave records will be displayed here</p>
                                        <Link href="/leaves" className="text-primary hover:underline text-sm mt-4 inline-block font-medium">
                                            View Leave History
                                        </Link>
                                    </div>
                                </CardBody>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Display only field
function InfoItem({ icon: Icon, label, value, capitalize, className = '' }) {
    return (
        <div className={`flex items-start gap-4 ${className}`}>
            {Icon && (
                <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center shrink-0 border border-border/50">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
            )}
            <div className="py-0.5">
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{label}</p>
                <p className={`text-base font-bold text-foreground ${capitalize ? 'capitalize' : ''}`}>
                    {value || <span className="text-muted-foreground/40 italic">Not set</span>}
                </p>
            </div>
        </div>
    );
}
