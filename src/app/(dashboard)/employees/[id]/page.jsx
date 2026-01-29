'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatusBadge, Avatar } from '@/components/ui';
import Button from '@/components/ui/Button';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash, HiOutlineUser,
  HiOutlineBriefcase, HiOutlineDocumentText, HiOutlineCalendar, HiOutlineClock,
  HiOutlineUpload, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker,
  HiOutlineIdentification, HiOutlineOfficeBuilding, HiOutlineUserGroup
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

  useEffect(() => {
    fetchEmployee();
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

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="page-header sticky top-0 bg-background/95 backdrop-blur-sm z-20 py-4 border-b border-border/50 mb-0">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <HiOutlineArrowLeft className="w-4 h-4" /> Back to Employees
          </button>

          <div className="flex items-center gap-4">
            <Avatar name={`${employee.user?.first_name} ${employee.user?.last_name}`} src={employee.user?.avatar} size="lg" className="ring-2 ring-background shadow-lg" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{employee.user?.first_name} {employee.user?.last_name}</h1>
                <StatusBadge status={employee.employment_status} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                <HiOutlineBriefcase className="w-4 h-4" />
                <span>{employee.designation_name || 'N/A'}</span>
                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                <span>{employee.department_name || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/employees/${id}/edit`}>
            <Button variant="secondary" className="shadow-sm border-border/50">
              <HiOutlinePencil className="w-4 h-4 mr-2" /> Edit Details
            </Button>
          </Link>
          <Button variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20" onClick={() => setDeleteModal(true)}>
            <HiOutlineTrash className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
            <HiOutlineMail className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Email Address</p>
            <p className="text-sm font-medium truncate" title={employee.user?.email}>{employee.user?.email}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
            <HiOutlinePhone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone Number</p>
            <p className="text-sm font-medium">{employee.user?.phone || 'N/A'}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
            <HiOutlineCalendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Joining Date</p>
            <p className="text-sm font-medium">{employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
            <HiOutlineIdentification className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Employee ID</p>
            <p className="text-sm font-medium">{employee.employee_code}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-muted/30 p-1 rounded-xl w-fit border border-border/40 flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}
              `}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'personal' && (
          <Card>
            <CardHeader title="Personal Information" />
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
                <InfoItem icon={HiOutlineCalendar} label="Date of Birth" value={employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : 'N/A'} />
                <InfoItem icon={HiOutlineUser} label="Gender" value={employee.gender || 'N/A'} capitalize />
                <InfoItem icon={HiOutlineIdentification} label="Blood Group" value={employee.blood_group || 'N/A'} />
                <InfoItem icon={HiOutlineUser} label="Marital Status" value={employee.marital_status || 'N/A'} capitalize />
                <InfoItem icon={HiOutlineLocationMarker} label="Nationality" value={employee.nationality || 'N/A'} />
                <InfoItem icon={HiOutlineLocationMarker} label="Current Address" value={employee.current_address || 'N/A'} />
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === 'employment' && (
          <Card>
            <CardHeader title="Employment Details" />
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
                <InfoItem icon={HiOutlineOfficeBuilding} label="Department" value={employee.department_name || 'N/A'} />
                <InfoItem icon={HiOutlineBriefcase} label="Designation" value={employee.designation_name || 'N/A'} />
                <InfoItem icon={HiOutlineBriefcase} label="Employment Type" value={(employee.employment_type || '').replace('_', ' ')} capitalize />
                <InfoItem icon={HiOutlineLocationMarker} label="Work Mode" value={employee.work_mode || 'N/A'} capitalize />
                <InfoItem icon={HiOutlineUser} label="Reporting Manager" value={employee.manager_name || 'N/A'} />
                <InfoItem icon={HiOutlineIdentification} label="Shift" value={employee.shift_name || 'General Shift'} />
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === 'documents' && (
          <Card>
            <CardHeader title="Documents" action={<Button variant="secondary" size="sm"><HiOutlineUpload className="w-4 h-4 mr-2" /> Upload</Button>} />
            <CardBody>
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/50 rounded-xl bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                  <HiOutlineDocumentText className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No documents uploaded</h3>
                <p className="text-muted-foreground mt-1 max-w-sm">Upload employee documents such as resume, ID proof, or offer letter here.</p>
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === 'attendance' && (
          <Card>
            <CardHeader title="Attendance Summary" />
            <CardBody>
              <div className="text-center text-muted-foreground py-12 bg-muted/5 rounded-xl border border-dashed border-border/50">
                <HiOutlineCalendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Attendance records will be displayed here</p>
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === 'leaves' && (
          <Card>
            <CardHeader title="Leave Balance & History" />
            <CardBody>
              <div className="text-center text-muted-foreground py-12 bg-muted/5 rounded-xl border border-dashed border-border/50">
                <HiOutlineClock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Leave records will be displayed here</p>
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === 'teams' && (
          <Card>
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
                <div className="text-center text-muted-foreground py-12 bg-muted/5 rounded-xl border border-dashed border-border/50">
                  <HiOutlineUserGroup className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>This employee is not assigned to any cross-functional teams.</p>
                  <Link href="/teams" className="text-primary hover:underline text-sm mt-2 inline-block">
                    Go to Teams to assign
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.teams.map((team) => (
                    <Link key={team.id} href={`/teams/${team.id}`}>
                      <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors group cursor-pointer">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <span className="font-bold text-lg">{team.code}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{team.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span className="bg-muted px-2 py-0.5 rounded text-xs border border-border font-medium">
                              {team.role || 'Member'}
                            </span>
                            {team.joined_date && (
                              <span className="text-xs">
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

function InfoItem({ icon: Icon, label, value, capitalize }) {
  return (
    <div className="flex items-start gap-4">
      {Icon && (
        <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">{label}</p>
        <p className={`text-base font-semibold text-foreground ${capitalize ? 'capitalize' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
