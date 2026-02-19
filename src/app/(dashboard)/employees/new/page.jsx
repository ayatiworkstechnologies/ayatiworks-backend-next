'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { HiOutlineArrowLeft, HiOutlineCheck, HiOutlineUser, HiOutlineMail } from 'react-icons/hi';

export default function CreateEmployeePage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Dynamic data from API
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredDesignations, setFilteredDesignations] = useState([]);

  // Employee ID Logic
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [nextCode, setNextCode] = useState('');

  const [formData, setFormData] = useState({
    // Essential fields only
    employee_code: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    department_id: '',
    designation_id: '',
    role_id: '',
    joining_date: new Date().toISOString().split('T')[0], // Default to today
    manager_id: '',
  });

  // Fetch dropdown data on mount
  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [deptRes, desigRes, empRes, rolesRes] = await Promise.all([
        api.get('/organizations/departments').catch(() => ({ items: [] })),
        api.get('/organizations/designations').catch(() => ({ items: [] })),
        api.get('/employees?page_size=100').catch(() => ({ items: [] })),
        api.get('/roles').catch(() => []),
      ]);

      setDepartments(deptRes.items || deptRes || []);
      setDesignations(desigRes.items || desigRes || []);
      setEmployees(empRes.items || empRes || []);
      setRoles(rolesRes || []);

      // Fetch next code on load
      fetchNextCode();
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchNextCode = async () => {
    try {
      const res = await api.get('/employees/next-code');
      setNextCode(res.code);
    } catch (e) { console.error(e); }
  };

  // Refresh code when toggling back to auto
  useEffect(() => {
    if (autoGenerate) fetchNextCode();
  }, [autoGenerate]);

  // Filter designations when department changes
  useEffect(() => {
    if (formData.department_id) {
      const filtered = designations.filter(d =>
        !d.department_id || d.department_id === parseInt(formData.department_id)
      );
      setFilteredDesignations(filtered);
    } else {
      setFilteredDesignations(designations);
    }
  }, [formData.department_id, designations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.department_id) newErrors.department_id = 'Department is required';
    if (!formData.designation_id) newErrors.designation_id = 'Designation is required';
    if (!formData.role_id) newErrors.role_id = 'Role is required';
    if (!formData.joining_date) newErrors.joining_date = 'Joining date is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the validation errors');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Clean form data - convert empty strings to null for ID fields
      const cleanData = { ...formData };
      const integerFields = ['department_id', 'designation_id', 'manager_id', 'role_id'];
      integerFields.forEach(field => {
        if (cleanData[field] === '' || cleanData[field] === undefined) {
          cleanData[field] = null;
        } else if (cleanData[field]) {
          cleanData[field] = parseInt(cleanData[field], 10);
        }
      });

      // Handle Auto-Generate
      if (autoGenerate) {
        cleanData.employee_code = null; // Let backend generate
      }

      await api.post('/employees', cleanData);
      toast.success('Employee created successfully!');
      setTimeout(() => router.push('/employees'), 1500);
    } catch (error) {
      console.error('Error creating employee:', error);
      if (error.detail && Array.isArray(error.detail)) {
        error.detail.forEach(err => {
          toast.error(`${err.loc?.join('.') || err.field || 'Error'}: ${err.msg || err.message}`);
        });
      } else {
        toast.error(error.message || 'Failed to create employee');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <Link href="/employees" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <HiOutlineArrowLeft className="w-4 h-4" /> Back to Employees
          </Link>
          <h1 className="page-title mt-2">Add New Employee</h1>
          <p className="text-muted-foreground">Create a new employee account with essential details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader title="Employee Information" />
          <CardBody className="space-y-6">
            {/* Employee ID Section */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 pb-4 border-b border-border/50">
              <div className="flex-1">
                <Input
                  label="Employee ID"
                  name="employee_code"
                  value={autoGenerate ? (nextCode || 'Loading...') : formData.employee_code}
                  onChange={handleChange}
                  placeholder="e.g. AW0001"
                  disabled={autoGenerate}
                  required={!autoGenerate}
                />
              </div>
              <div className="pb-3">
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={autoGenerate}
                    onChange={e => {
                      setAutoGenerate(e.target.checked);
                      if (e.target.checked) setFormData(p => ({ ...p, employee_code: '' }));
                    }}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                  <span>Auto-generate ID</span>
                </label>
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  {autoGenerate ? "System will assign the next available ID." : "Manually enter a unique ID."}
                </p>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                required
                icon={<HiOutlineUser className="w-5 h-5" />}
                placeholder="Enter first name"
              />
              <Input
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
              />
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                icon={<HiOutlineMail className="w-5 h-5" />}
                placeholder="employee@company.com"
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                placeholder="Minimum 8 characters"
              />
            </div>

            {/* Role, Department & Designation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="input-wrapper">
                <label className="input-label">System Role <span className="input-required">*</span></label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  className={`input ${errors.role_id ? 'input-error' : ''}`}
                >
                  <option value="">Select Role</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                {errors.role_id && <p className="error-message">{errors.role_id}</p>}
              </div>

              <div className="input-wrapper">
                <label className="input-label">Department <span className="input-required">*</span></label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className={`input ${errors.department_id ? 'input-error' : ''}`}
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {errors.department_id && <p className="error-message">{errors.department_id}</p>}
              </div>

              <div className="input-wrapper">
                <label className="input-label">Designation <span className="input-required">*</span></label>
                <select
                  name="designation_id"
                  value={formData.designation_id}
                  onChange={handleChange}
                  className={`input ${errors.designation_id ? 'input-error' : ''}`}
                >
                  <option value="">Select Designation</option>
                  {filteredDesignations.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {errors.designation_id && <p className="error-message">{errors.designation_id}</p>}
              </div>
            </div>

            {/* Joining Date & Manager */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Joining Date"
                type="date"
                name="joining_date"
                value={formData.joining_date}
                onChange={handleChange}
                error={errors.joining_date}
                required
              />

              <div className="input-wrapper">
                <label className="input-label">Reporting Manager</label>
                <select
                  name="manager_id"
                  value={formData.manager_id}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select Manager (Optional)</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-border/50">
              <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading} className="flex-1 shadow-lg shadow-primary/20">
                <HiOutlineCheck className="w-5 h-5" /> Create Employee
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </div >
  );
}
