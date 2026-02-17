'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatCard, StatusBadge, Avatar, PageHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import api from '@/lib/api';
import { useAPI, useList } from '@/hooks/useAPI';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlineSearch, HiOutlinePlus, HiOutlineUsers, HiOutlineBriefcase,
  HiOutlineOfficeBuilding, HiOutlineUserAdd, HiOutlineEye, HiOutlinePencil,
  HiOutlineTrash, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineDownload,
  HiOutlineCheck, HiOutlineRefresh
} from 'react-icons/hi';

export default function EmployeesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ open: false, employee: null });
  const [deleting, setDeleting] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Debounce search
  const searchTimeout = useCallback((value) => {
    setSearch(value);
    clearTimeout(window._empSearchTimer);
    window._empSearchTimer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
  }, []);

  // SWR — Employees list (cached, instant back-nav)
  const { data: employeesData, isLoading: loading, mutate: refreshEmployees } = useList('/employees', {
    page,
    page_size: 12,
    search: debouncedSearch || undefined,
    department_id: selectedDept || undefined,
    status: selectedStatus || undefined,
  });

  const employees = useMemo(() => employeesData?.items || employeesData?.data || [], [employeesData]);
  const totalPages = employeesData?.total_pages || 1;

  // SWR — Departments (cached, shared across pages)
  const { data: deptData } = useAPI('/organizations/departments');
  const departments = useMemo(() => deptData?.items || deptData || [], [deptData]);

  // SWR — Stats (from attendance overview + organizations)
  const { data: overviewData } = useAPI('/dashboard/attendance-overview');
  const { data: desigData } = useAPI('/organizations/designations');

  const stats = useMemo(() => ({
    total: overviewData?.total_employees || 0,
    departments: departments.length,
    designations: (desigData?.items || desigData || []).length,
  }), [overviewData, departments, desigData]);

  const handleDelete = useCallback((employee) => {
    setDeleteModal({ open: true, employee });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteModal.employee) return;
    setDeleting(true);
    try {
      await api.delete(`/employees/${deleteModal.employee.id}`);
      toast.success('Employee deleted successfully');
      setDeleteModal({ open: false, employee: null });
      refreshEmployees();
    } catch (error) {
      toast.error(error.message || 'Failed to delete employee');
    } finally {
      setDeleting(false);
    }
  }, [deleteModal.employee, toast, refreshEmployees]);

  // Bulk operations
  const handleSelectAll = useCallback(() => {
    if (selectedEmployees.length === employees.length && employees.length > 0) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(e => e.id));
    }
  }, [employees, selectedEmployees]);

  const handleSelectEmployee = useCallback((empId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(empId)) return prev.filter(id => id !== empId);
      return [...prev, empId];
    });
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedEmployees.length === 0) return;
    setBulkLoading(true);
    try {
      await api.post('/employees/bulk-delete', selectedEmployees);
      toast.success(`${selectedEmployees.length} employees deleted`);
      setSelectedEmployees([]);
      refreshEmployees();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete employees');
    } finally {
      setBulkLoading(false);
    }
  }, [selectedEmployees, toast, refreshEmployees]);

  const handleExportCSV = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDept) params.append('department_id', selectedDept);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees/export/csv?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employees.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Employees exported successfully');
    } catch (error) {
      toast.error('Failed to export employees');
    }
  }, [selectedDept, selectedStatus, toast]);

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      <PageHeader
        title="Employees"
        description="Manage your team members"
      >
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExportCSV}>
            <HiOutlineDownload className="w-5 h-5" /> Export CSV
          </Button>
          {user?.role?.code?.toLowerCase() !== 'employee' && (
            <Link href="/employees/new">
              <Button variant="primary" className="shadow-lg shadow-primary/20">
                <HiOutlinePlus className="w-5 h-5" /> Add Employee
              </Button>
            </Link>
          )}
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<HiOutlineUsers className="w-6 h-6" />} iconColor="blue" value={stats.total} label="Total Employees" />
        <StatCard icon={<HiOutlineUserAdd className="w-6 h-6" />} iconColor="green" value="-" label="New This Month" />
        <StatCard icon={<HiOutlineOfficeBuilding className="w-6 h-6" />} iconColor="purple" value={stats.departments} label="Departments" />
        <StatCard icon={<HiOutlineBriefcase className="w-6 h-6" />} iconColor="orange" value={stats.designations} label="Designations" />
      </div>

      {/* Filters and Actions */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 sticky top-[73px] z-10 backdrop-blur-md bg-opacity-90">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
            {/* Select All Checkbox for Cards */}
            <div
              onClick={handleSelectAll}
              className={`
                flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer border transition-all
                ${selectedEmployees.length > 0 && selectedEmployees.length === employees.length
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-background border-border text-muted-foreground hover:bg-muted'}
              `}
              title="Select All"
            >
              <HiOutlineCheck className={`w-5 h-5 ${selectedEmployees.length === employees.length && employees.length > 0 ? 'opacity-100' : 'opacity-0'}`} />
            </div>

            <div className="relative flex-1 min-w-[200px]">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => searchTimeout(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <select
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[140px]"
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setPage(1); }}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[120px]"
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={() => refreshEmployees()}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Refresh"
            >
              <HiOutlineRefresh className="w-5 h-5" />
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedEmployees.length > 0 && (
            <div className="flex items-center gap-3 animate-fade-in">
              <span className="text-sm font-medium text-muted-foreground">
                {selectedEmployees.length} selected
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="shadow-sm"
              >
                <HiOutlineTrash className="w-4 h-4 mr-2" /> Delete Selected
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Result count */}
      {!loading && employees.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {employees.length} employee{employees.length !== 1 ? 's' : ''}
          {debouncedSearch && ` matching "${debouncedSearch}"`}
        </p>
      )}

      {/* Employees Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-card border border-border/50 overflow-hidden">
              <div className="p-5 flex flex-col items-center pt-8">
                <div className="w-16 h-16 rounded-full bg-muted/30 animate-pulse mb-4" />
                <div className="h-5 w-32 bg-muted/30 animate-pulse rounded mb-2" />
                <div className="h-4 w-24 bg-muted/30 animate-pulse rounded mb-1" />
                <div className="h-3 w-40 bg-muted/30 animate-pulse rounded mb-4" />
                <div className="w-full border-t border-border/40 my-4" />
                <div className="w-full h-16 bg-muted/20 animate-pulse rounded-lg mb-4" />
                <div className="flex gap-2 w-full">
                  <div className="flex-1 h-9 bg-muted/20 animate-pulse rounded-lg" />
                  <div className="flex-1 h-9 bg-muted/20 animate-pulse rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-2xl border-2 border-dashed border-border/50">
          <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-6">
            <HiOutlineUsers className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No employees found</h3>
          <p className="text-muted-foreground mb-8">
            {debouncedSearch || selectedDept || selectedStatus
              ? 'Try adjusting your filters.'
              : 'Add your first employee to get started.'}
          </p>
          {user?.role?.code?.toLowerCase() !== 'employee' && !debouncedSearch && (
            <Link href="/employees/new">
              <Button variant="primary" className="shadow-lg shadow-primary/20">
                <HiOutlinePlus className="w-5 h-5 mr-2" /> Add Employee
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className={`
                group relative bg-card hover:bg-muted/5 rounded-2xl border transition-all duration-300 overflow-hidden
                ${selectedEmployees.includes(emp.id) ? 'border-primary ring-1 ring-primary shadow-md' : 'border-border/50 hover:border-primary/30 hover:shadow-lg'}
              `}
            >
              {/* Selection Checkbox (Overlay) */}
              <div
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectEmployee(emp.id);
                }}
                className={`
                  absolute top-3 left-3 z-10 w-6 h-6 rounded-md border cursor-pointer flex items-center justify-center transition-all bg-card
                  ${selectedEmployees.includes(emp.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-border/80 text-transparent hover:border-primary/60'}
                `}
              >
                <HiOutlineCheck className="w-4 h-4" />
              </div>

              {/* Card Content */}
              <div className="p-5 flex flex-col items-center text-center pt-8">
                <StatusBadge status={emp.employment_status || 'active'} className="absolute top-3 right-3 text-[10px] px-2 py-0.5" />

                <div className="relative mb-4">
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur" />
                  <Avatar
                    name={`${emp.first_name} ${emp.last_name}`}
                    src={emp.avatar}
                    size="lg"
                    className="relative ring-4 ring-background shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <h3 className="text-lg font-bold text-foreground truncate w-full px-2" title={`${emp.first_name} ${emp.last_name}`}>
                  {emp.first_name} {emp.last_name}
                </h3>
                <p className="text-primary font-medium text-sm mb-1">{emp.designation_name || 'N/A'}</p>
                <p className="text-muted-foreground text-xs truncate w-full px-4">{emp.email}</p>

                <div className="w-full border-t border-border/40 my-4" />

                <div className="grid grid-cols-2 gap-2 w-full text-left bg-muted/20 rounded-lg p-3 text-xs mb-4">
                  <div>
                    <p className="text-muted-foreground uppercase tracking-wider mb-0.5 text-[10px]">Department</p>
                    <p className="font-semibold text-foreground truncate">{emp.department_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground uppercase tracking-wider mb-0.5 text-[10px]">Emp ID</p>
                    <p className="font-semibold text-foreground truncate">{emp.employee_code || '-'}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full">
                  <Link href={`/employees/${emp.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full h-9 bg-background/50 hover:bg-background border-border/50">
                      <HiOutlineEye className="w-4 h-4 mr-1" /> View
                    </Button>
                  </Link>
                  {user?.role?.code?.toLowerCase() !== 'employee' && (
                    <>
                      <Link href={`/employees/${emp.id}`} className="flex-1">
                        <Button variant="primary" size="sm" className="w-full h-9 shadow-none">
                          <HiOutlinePencil className="w-4 h-4 mr-1" /> Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-rose-500 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-200"
                        onClick={() => handleDelete(emp)}
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 p-4 mt-8">
          <button
            className="p-2 rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-card border border-border/50 shadow-sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <HiOutlineChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 py-2 text-sm text-foreground font-medium bg-card border border-border/50 rounded-xl shadow-sm">Page {page} of {totalPages}</span>
          <button
            className="p-2 rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-card border border-border/50 shadow-sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            <HiOutlineChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, employee: null })}
        onConfirm={confirmDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteModal.employee?.first_name} ${deleteModal.employee?.last_name}? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
