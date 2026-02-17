'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, PageHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { useAPI } from '@/hooks/useAPI';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlineUser, HiOutlineMail, HiOutlinePhone,
  HiOutlineOfficeBuilding, HiOutlineCheck, HiOutlineKey
} from 'react-icons/hi';

export default function CreateClientPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // SWR-cached dropdown data — shared across create/edit pages
  const { data: deptRes } = useAPI('/organizations/departments', { dedupingInterval: 60000 });
  const { data: desigRes } = useAPI('/organizations/designations', { dedupingInterval: 60000 });

  const departments = useMemo(() => deptRes?.items || deptRes || [], [deptRes]);
  const designations = useMemo(() => desigRes?.items || desigRes || [], [desigRes]);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    department_id: '',
    designation_id: '',
    joining_date: new Date().toISOString().split('T')[0],
    company_name: '',
    industry: '',
    address: '',
  });

  // Filter designations by department
  const filteredDesignations = useMemo(() => {
    if (formData.department_id) {
      return designations.filter(d =>
        !d.department_id || d.department_id === parseInt(formData.department_id)
      );
    }
    return designations;
  }, [formData.department_id, designations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.joining_date) newErrors.joining_date = 'Joining date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setLoading(true);
    try {
      const cleanData = { ...formData };
      ['department_id', 'designation_id'].forEach(field => {
        if (cleanData[field] === '' || cleanData[field] === undefined) {
          cleanData[field] = null;
        } else if (cleanData[field]) {
          cleanData[field] = parseInt(cleanData[field], 10);
        }
      });

      await api.post('/clients', cleanData);
      toast.success('Client created successfully!');
      setTimeout(() => router.push('/clients'), 1000);
    } catch (error) {
      if (error.detail && Array.isArray(error.detail)) {
        error.detail.forEach(err => toast.error(`${err.field || 'Error'}: ${err.message || err.msg}`));
      } else {
        toast.error(error.message || 'Failed to create client');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in-up">
      <PageHeader
        title="Add New Client"
        description="Create a new client with employee profile"
        backLink="/clients"
        backText="Back to Clients"
      />

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader title="Personal Information" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                icon={<HiOutlineMail className="w-5 h-5" />}
                placeholder="client@company.com"
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                icon={<HiOutlineKey className="w-5 h-5" />}
                placeholder="Minimum 8 characters"
              />
            </div>

            <Input
              label="Phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              icon={<HiOutlinePhone className="w-5 h-5" />}
              placeholder="+1 234 567 8900"
            />
          </CardBody>
        </Card>

        {/* Organization */}
        <Card className="mb-6">
          <CardHeader title="Organization" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="input-wrapper">
                <label className="input-label">Department</label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select Department (Optional)</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-wrapper">
                <label className="input-label">Designation</label>
                <select
                  name="designation_id"
                  value={formData.designation_id}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select Designation (Optional)</option>
                  {filteredDesignations.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Joining Date"
              type="date"
              name="joining_date"
              value={formData.joining_date}
              onChange={handleChange}
              error={errors.joining_date}
              required
            />
          </CardBody>
        </Card>

        {/* Company Info (Optional CRM) */}
        <Card className="mb-6">
          <CardHeader title="Company Details (Optional)" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="input-wrapper">
                <label className="input-label">Company Name</label>
                <div className="relative">
                  <HiOutlineOfficeBuilding className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="e.g., ABC Corporation" className="input pl-10" />
                </div>
              </div>

              <div className="input-wrapper">
                <label className="input-label">Industry</label>
                <select name="industry" value={formData.industry} onChange={handleChange} className="input">
                  <option value="">Select industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Education">Education</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="input-wrapper">
              <label className="input-label">Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Company address..." className="input min-h-[80px]" />
            </div>
          </CardBody>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">Cancel</Button>
          <Button type="submit" variant="primary" loading={loading} className="flex-1 shadow-lg shadow-primary/20">
            <HiOutlineCheck className="w-4 h-4" /> Create Client
          </Button>
        </div>
      </form>
    </div>
  );
}
