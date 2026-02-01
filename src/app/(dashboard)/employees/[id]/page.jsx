'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatusBadge, Avatar } from '@/components/ui';
import Button from '@/components/ui/Button';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import EditableField from '@/components/ui/EditableField';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash, HiOutlineUser,
  HiOutlineBriefcase, HiOutlineDocumentText, HiOutlineCalendar, HiOutlineClock,
  HiOutlineUpload, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker,
  HiOutlineIdentification, HiOutlineOfficeBuilding, HiOutlineUserGroup,
  HiOutlineDotsVertical, HiOutlineBadgeCheck, HiOutlineCamera
} from 'react-icons/hi';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Editing State
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Avatar State
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  // Dropdown Options
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    fetchEmployee();
    fetchOptions();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const data = await api.get(`/employees/${id}`);
      setEmployee(data);
    } catch (error) {
      console.error('Error fetching employee:', error);
      toast.error('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [deptRes, desigRes, empRes] = await Promise.all([
        api.get('/organizations/departments').catch(() => ({ items: [] })),
        api.get('/organizations/designations').catch(() => ({ items: [] })),
        api.get('/employees?status=active').catch(() => ({ items: [] }))
      ]);

      setDepartments((deptRes.items || deptRes || []).map(d => ({ label: d.name, value: d.id })));
      setDesignations((desigRes.items || desigRes || []).map(d => ({ label: d.name, value: d.id })));
      setManagers((empRes.items || empRes || []).map(e => ({ label: `${e.first_name} ${e.last_name}`, value: e.id })));

    } catch (error) {
      console.error('Error fetching options', error);
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
      // Use the admin endpoint to upload for a specific user
      await api.upload(`/users/${employee.user_id}/avatar`, formData);
      toast.success('Profile picture updated!');
      await fetchEmployee(); // Refresh data
    } catch (error) {
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Employee deleted successfully');
      router.push('/employees');
    } catch (error) {
      toast.error(error.message || 'Failed to delete employee');
    } finally {
      setDeleting(false);
    }
  };

  // Editing Handlers
  const handleEditField = (fieldName, currentValue) => {
    setEditingField(fieldName);
    // For selects, value might be ID, ensure we pass correct value
    // If field is like 'department_id', value comes from `employee.department_id` not the name displayed
    // Logic below handles getting the right value to start with
    let initialValue = currentValue;

    // Manual mapping for ID fields if the display value was passed
    if (fieldName === 'department_id') initialValue = employee.department_id;
    if (fieldName === 'designation_id') initialValue = employee.designation_id;
    if (fieldName === 'manager_id') initialValue = employee.manager_id;

    setEditValue(initialValue || '');
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleSaveField = async () => {
    if (!editingField) return;
    setSaving(true);
    try {
      const userFields = ['first_name', 'last_name', 'phone'];

      if (userFields.includes(editingField)) {
        // Update User
        await api.put(`/users/${employee.user_id}`, { [editingField]: editValue });
      } else {
        // Update Employee
        // Handle date fields or special transformations if needed
        let payload = { [editingField]: editValue };
        await api.put(`/employees/${id}`, payload);
      }

      toast.success('Updated successfully');
      await fetchEmployee(); // Refresh data
      setEditingField(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: HiOutlineUser },
    { id: 'employment', label: 'Job', icon: HiOutlineBriefcase },
    { id: 'teams', label: 'Teams', icon: HiOutlineUserGroup },
    { id: 'documents', label: 'Docs', icon: HiOutlineDocumentText },
    { id: 'attendance', label: 'Attendance', icon: HiOutlineCalendar },
    { id: 'leaves', label: 'Leaves', icon: HiOutlineClock },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="empty-state">
        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <HiOutlineUser className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="empty-state-title">Employee not found</h3>
        <Link href="/employees">
          <Button variant="primary" className="shadow-lg shadow-primary/20">
            <HiOutlineArrowLeft className="w-4 h-4 mr-2" /> Back to Employees
          </Button>
        </Link>
      </div>
    );
  }

  const roleName = employee.user?.role?.name || 'Employee';

  // Helper for options
  const genderOptions = [{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }, { label: 'Other', value: 'Other' }];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => ({ label: g, value: g }));
  const maritalOptions = [{ label: 'Single', value: 'Single' }, { label: 'Married', value: 'Married' }, { label: 'Divorced', value: 'Divorced' }];
  const empTypes = ['Full-time', 'Part-time', 'Contract', 'Intern'].map(t => ({ label: t, value: t.toLowerCase().replace('-', '_') }));
  const workModes = ['On-site', 'Remote', 'Hybrid'].map(m => ({ label: m, value: m }));
  const statusOptions = ['Active', 'Inactive', 'Terminated', 'On Leave'].map(s => ({ label: s, value: s.toLowerCase().replace(' ', '_') }));

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      {/* Back Button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/50"
        >
          <HiOutlineArrowLeft className="w-4 h-4" /> Back to Employees
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-xl overflow-hidden sticky top-6">
            <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 text-center pb-12">
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
                  name={`${employee.user?.first_name} ${employee.user?.last_name}`}
                  src={employee.user?.avatar}
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
                    className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 shadow-lg hover:scale-110 active:scale-95 ring-4 ring-background opacity-0 group-hover:opacity-100 transition-all duration-300"
                    title="Change Profile Picture"
                  >
                    <HiOutlineCamera className="w-5 h-5" />
                  </button>
                )}
              </div>
              <h2 className="text-2xl font-bold text-foreground mt-6">{employee.user?.first_name} {employee.user?.last_name}</h2>
              <div className="text-xs mt-3 font-semibold px-4 py-1.5 rounded-full inline-block shadow-sm bg-primary/10 text-primary">
                {roleName}
              </div>

              <div className="mt-6 flex justify-center">
                <StatusBadge status={employee.employment_status} className="px-4 py-1.5 text-sm" />
              </div>
            </div>

            <div className="relative bg-card -mt-4 rounded-t-3xl p-6 border-t border-border/50">
              <div className="space-y-5">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                  <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-lg">
                    <HiOutlineMail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                    <p className="text-sm font-medium truncate" title={employee.user?.email}>{employee.user?.email}</p>
                  </div>
                </div>

                <EditableField
                  icon={HiOutlinePhone}
                  label="Phone"
                  value={employee.user?.phone}
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
                    <p className="text-sm font-medium">{employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                  <div className="p-2.5 bg-orange-500/10 text-orange-600 rounded-lg">
                    <HiOutlineIdentification className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Employee ID</p>
                    <p className="text-sm font-medium">{employee.employee_code}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/50 mt-8 pt-6 space-y-3">
                <Button
                  variant="primary"
                  className="w-full shadow-lg shadow-primary/20 py-2.5"
                  onClick={() => setActiveTab('personal')}
                >
                  <HiOutlinePencil className="w-4 h-4 mr-2" /> Edit Details
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30"
                  onClick={() => setDeleteModal(true)}
                >
                  <HiOutlineTrash className="w-4 h-4 mr-2" /> Delete Employee
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Tabs & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
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

          {/* Content */}
          <div className="min-h-[500px] animate-fade-in">
            {activeTab === 'personal' && (
              <Card className="border-0 shadow-sm">
                <CardHeader title="Personal Information" subtitle="Click any field to edit" />
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <EditableField icon={HiOutlineUser} label="First Name" value={employee.user?.first_name} fieldName="first_name" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} />
                    <EditableField icon={HiOutlineUser} label="Last Name" value={employee.user?.last_name} fieldName="last_name" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} />

                    <EditableField icon={HiOutlineCalendar} label="Date of Birth" value={employee.date_of_birth ? new Date(employee.date_of_birth).toISOString().split('T')[0] : null} fieldName="date_of_birth" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} type="date" />

                    <EditableField icon={HiOutlineUser} label="Gender" value={employee.gender} fieldName="gender" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} type="select" options={genderOptions} capitalize />

                    <EditableField icon={HiOutlineIdentification} label="Blood Group" value={employee.blood_group} fieldName="blood_group" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} type="select" options={bloodGroups} />

                    <EditableField icon={HiOutlineUser} label="Marital Status" value={employee.marital_status} fieldName="marital_status" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} type="select" options={maritalOptions} capitalize />

                    <EditableField icon={HiOutlineLocationMarker} label="Nationality" value={employee.nationality} fieldName="nationality" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} />

                    <EditableField icon={HiOutlineLocationMarker} label="Current Address" value={employee.current_address} fieldName="current_address" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} className="md:col-span-2" />
                  </div>
                </CardBody>
              </Card>
            )}

            {activeTab === 'employment' && (
              <Card className="border-0 shadow-sm">
                <CardHeader title="Employment Details" subtitle="Click any field to edit" />
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                    <EditableField icon={HiOutlineOfficeBuilding} label="Department" value={employee.department_name} fieldName="department_id" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} type="select" options={departments} />

                    <EditableField icon={HiOutlineBriefcase} label="Designation" value={employee.designation_name} fieldName="designation_id" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} type="select" options={designations} />

                    <EditableField icon={HiOutlineBriefcase} label="Employment Type" value={employee.employment_type} fieldName="employment_type" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} type="select" options={empTypes} capitalize />

                    <EditableField icon={HiOutlineLocationMarker} label="Work Mode" value={employee.work_mode} fieldName="work_mode" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} type="select" options={workModes} capitalize />

                    <EditableField icon={HiOutlineUser} label="Reporting Manager" value={employee.manager_name} fieldName="manager_id" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} type="select" options={managers} />

                    <EditableField icon={HiOutlineIdentification} label="Shift" value={employee.shift_name} fieldName="shift_id" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} type="select" options={[{ label: 'General Shift', value: 1 }]} />

                    <EditableField icon={HiOutlineCalendar} label="Joining Date" value={employee.joining_date ? new Date(employee.joining_date).toISOString().split('T')[0] : null} fieldName="joining_date" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} type="date" />

                    <EditableField icon={HiOutlineBadgeCheck} label="Status" value={employee.employment_status} fieldName="employment_status" editingField={editingField} editValue={editValue} saving={saving} onEdit={handleEditField} onCancel={handleCancelEdit} onSave={handleSaveField} onChange={setEditValue} type="select" options={statusOptions} capitalize />
                  </div>
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
                    <p className="text-muted-foreground mt-2 max-w-sm">Upload employee documents such as resume, ID proof, or offer letter here.</p>
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
                    <h3 className="text-lg font-medium text-foreground mb-1">No Attendance Records</h3>
                    <p>Attendance records will be displayed here</p>
                  </div>
                </CardBody>
              </Card>
            )}

            {activeTab === 'leaves' && (
              <Card className="border-0 shadow-sm">
                <CardHeader title="Leave Balance & History" />
                <CardBody>
                  <div className="text-center text-muted-foreground py-16 bg-muted/5 rounded-xl border border-dashed border-border/50">
                    <HiOutlineClock className="w-16 h-16 mx-auto mb-6 opacity-20" />
                    <h3 className="text-lg font-medium text-foreground mb-1">No Leave History</h3>
                    <p>Leave records will be displayed here</p>
                  </div>
                </CardBody>
              </Card>
            )}

            {activeTab === 'teams' && (
              <Card className="border-0 shadow-sm">
                <CardHeader
                  title="Assigned Teams"
                  action={
                    <Link href={`/teams`}>
                      <Button variant="secondary" size="sm">Manage Teams</Button>
                    </Link>
                  }
                />
                <CardBody>
                  {(!employee.teams || employee.teams.length === 0) ? (
                    <div className="text-center text-muted-foreground py-16 bg-muted/5 rounded-xl border border-dashed border-border/50">
                      <HiOutlineUserGroup className="w-16 h-16 mx-auto mb-6 opacity-20" />
                      <h3 className="text-lg font-medium text-foreground mb-1">No Teams Assigned</h3>
                      <p>This employee is not assigned to any cross-functional teams.</p>
                      <Link href="/teams" className="text-primary hover:underline text-sm mt-4 inline-block font-medium">
                        Go to Teams to assign
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {employee.teams.map((team) => (
                        <Link key={team.id} href={`/teams/${team.id}`}>
                          <div className="flex items-center gap-4 p-5 rounded-xl border border-border/50 hover:bg-muted/30 hover:border-primary/20 transition-all group cursor-pointer shadow-sm hover:shadow-md">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <span className="font-bold text-xl">{team.code}</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{team.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <span className="bg-muted px-2.5 py-0.5 rounded-md text-xs border border-border font-medium text-foreground/80">
                                  {team.role || 'Member'}
                                </span>
                                {team.joined_date && (
                                  <span className="text-xs opacity-80">
                                    Since: {new Date(team.joined_date).toLocaleDateString()}
                                  </span>
                                )}
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
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete ${employee.user?.first_name} ${employee.user?.last_name}? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
