'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatCard, StatusBadge, Avatar } from '@/components/ui';
import Button from '@/components/ui/Button';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlineSearch, HiOutlinePlus, HiOutlineUsers, HiOutlineBriefcase,
  HiOutlineOfficeBuilding, HiOutlineUserAdd, HiOutlineEye, HiOutlinePencil,
  HiOutlineTrash, HiOutlineChevronLeft, HiOutlineChevronRight
} from 'react-icons/hi';

export default function EmployeesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ open: false, employee: null });
  const [deleting, setDeleting] = useState(false);

  const [stats, setStats] = useState({ total: 0, new: 0, departments: 0, designations: 0 });
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [page, search, selectedDept, selectedStatus]);

  const fetchStats = async () => {
    try {
      const [deptRes, desigRes, overviewRes] = await Promise.all([
        api.get('/organizations/departments').catch(() => ({ items: [] })),
        api.get('/organizations/designations').catch(() => ({ items: [] })),
        api.get('/dashboard/attendance-overview').catch(() => ({ total_employees: 0 })),
      ]);

      setDepartments(deptRes.items || deptRes || []);

      setStats({
        total: overviewRes.total_employees || 0,
        new: 0,
        departments: (deptRes.items || deptRes || []).length,
        designations: (desigRes.items || desigRes || []).length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20',
      });
      if (search) params.append('search', search);
      if (selectedDept) params.append('department_id', selectedDept);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await api.get(`/employees?${params}`);
      setEmployees(response.items || response.data || []);
      setTotalPages(response.total_pages || 1);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (employee) => {
    setDeleteModal({ open: true, employee });
  };

  const confirmDelete = async () => {
    if (!deleteModal.employee) return;

    setDeleting(true);
    try {
      await api.delete(`/employees/${deleteModal.employee.id}`);
      toast.success('Employee deleted successfully');
      setDeleteModal({ open: false, employee: null });
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error(error.message || 'Failed to delete employee');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage your team members</p>
        </div>
        {user?.role?.code?.toLowerCase() !== 'employee' && (
          <Link href="/employees/new">
            <Button variant="primary" className="shadow-lg shadow-primary/20">
              <HiOutlinePlus className="w-5 h-5" /> Add Employee
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<HiOutlineUsers className="w-6 h-6" />} iconColor="blue" value={stats.total} label="Total Employees" />
        <StatCard icon={<HiOutlineUserAdd className="w-6 h-6" />} iconColor="green" value="-" label="New This Month" />
        <StatCard icon={<HiOutlineOfficeBuilding className="w-6 h-6" />} iconColor="purple" value={stats.departments} label="Departments" />
        <StatCard icon={<HiOutlineBriefcase className="w-6 h-6" />} iconColor="orange" value={stats.designations} label="Designations" />
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <select
              className="input w-auto capitalize"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <select
              className="input w-auto"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Employees Table */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="table-container border-0 bg-transparent">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : employees.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HiOutlineUsers className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">No employees found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or add your first employee.</p>
              {user?.role?.code?.toLowerCase() !== 'employee' && (
                <Link href="/employees/new">
                  <Button variant="primary"><HiOutlinePlus className="w-5 h-5" /> Add Employee</Button>
                </Link>
              )}
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th className="w-[30%]">Employee</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/20 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={`${emp.first_name || ''} ${emp.last_name || ''}`} src={emp.avatar} size="md" className="ring-2 ring-background" />
                        <div>
                          <div className="font-semibold text-foreground">{emp.first_name} {emp.last_name}</div>
                          <div className="text-sm text-muted-foreground">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="font-mono text-xs bg-muted/30 px-2 py-1 rounded-lg">{emp.employee_code}</span></td>
                    <td className="text-muted-foreground">{emp.department_name || '-'}</td>
                    <td className="text-muted-foreground">{emp.designation_name || '-'}</td>
                    <td><StatusBadge status={emp.employment_status || 'active'} /></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/employees/${emp.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View"><HiOutlineEye className="w-4 h-4" /></Button>
                        </Link>
                        {user?.role?.code?.toLowerCase() !== 'employee' && (
                          <>
                            <Link href={`/employees/${emp.id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit"><HiOutlinePencil className="w-4 h-4" /></Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Delete"
                              className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600"
                              onClick={() => handleDelete(emp)}
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4 border-t border-border/30">
            <button
              className="p-2 rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <HiOutlineChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm text-muted-foreground font-medium">Page {page} of {totalPages}</span>
            <button
              className="p-2 rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              <HiOutlineChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </Card>

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
