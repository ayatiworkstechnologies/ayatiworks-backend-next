'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, PageHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { useAPI } from '@/hooks/useAPI';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlineCheck, HiOutlineMail, HiOutlinePhone, HiOutlineUser,
  HiOutlineOfficeBuilding
} from 'react-icons/hi';

export default function EditClientPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(null);

  // SWR-cached dropdown data
  const { data: deptRes } = useAPI('/organizations/departments', { dedupingInterval: 60000 });
  const { data: desigRes } = useAPI('/organizations/designations', { dedupingInterval: 60000 });

  const departments = useMemo(() => deptRes?.items || deptRes || [], [deptRes]);
  const designations = useMemo(() => desigRes?.items || desigRes || [], [desigRes]);

  // SWR-cached client data — populates the form on first load
  const { isLoading } = useAPI(`/clients/${id}`, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
    onSuccess: (data) => {
      if (!formData) {
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          department_id: data.department_id || '',
          designation_id: data.designation_id || '',
          status: data.status || (data.is_active ? 'active' : 'inactive'),
          company_name: data.company_name || '',
          industry: data.industry || '',
          address: data.address || '',
        });
      }
    },
    onError: () => {
      toast.error('Failed to load client data');
    },
  });

  // Filter designations by department
  const filteredDesignations = useMemo(() => {
    if (formData?.department_id) {
      return designations.filter(d =>
        !d.department_id || d.department_id === parseInt(formData.department_id)
      );
    }
    return designations;
  }, [formData?.department_id, designations]);

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the validation errors'); return; }
    setSaving(true);
    try {
      const payload = { ...formData };
      ['department_id', 'designation_id'].forEach(field => {
        if (payload[field] === '' || payload[field] === undefined) {
          payload[field] = null;
        } else if (payload[field]) {
          payload[field] = parseInt(payload[field], 10);
        }
      });

      await api.put(`/clients/${id}`, payload);
      toast.success('Client updated successfully');
      setTimeout(() => router.push(`/clients/${id}`), 1000);
    } catch (error) {
      toast.error(error.message || 'Failed to update client');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !formData) return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="h-8 w-48 bg-muted/20 rounded animate-pulse" />
      <Card><CardBody className="h-48 animate-pulse bg-muted/10" /></Card>
      <Card><CardBody className="h-32 animate-pulse bg-muted/10" /></Card>
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in-up">
      <PageHeader
        title="Edit Client"
        description={`Update details for ${formData.first_name} ${formData.last_name}`.trim()}
        backLink={`/clients/${id}`}
        backText="Back to Client"
      />

      <form onSubmit={handleSubmit}>
        {/* Personal Info */}
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
              />
              <Input
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="input-wrapper">
                <label className="input-label">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={`input pl-10 ${errors.email ? 'input-error' : ''}`} />
                </div>
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>
              <div className="input-wrapper">
                <label className="input-label">Phone</label>
                <div className="relative">
                  <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input pl-10" />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Organization */}
        <Card className="mb-6">
          <CardHeader title="Organization" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="input-wrapper">
                <label className="input-label">Department</label>
                <select name="department_id" value={formData.department_id} onChange={handleChange} className="input">
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-wrapper">
                <label className="input-label">Designation</label>
                <select name="designation_id" value={formData.designation_id} onChange={handleChange} className="input">
                  <option value="">Select Designation</option>
                  {filteredDesignations.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-wrapper">
              <label className="input-label">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </CardBody>
        </Card>

        {/* Company Info */}
        <Card className="mb-6">
          <CardHeader title="Company Details (Optional)" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="input-wrapper">
                <label className="input-label">Company Name</label>
                <div className="relative">
                  <HiOutlineOfficeBuilding className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="input pl-10" />
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
              <textarea name="address" value={formData.address} onChange={handleChange} className="input min-h-[80px]" />
            </div>
          </CardBody>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">Cancel</Button>
          <Button type="submit" variant="primary" loading={saving} className="flex-1 shadow-lg shadow-primary/20"><HiOutlineCheck className="w-4 h-4" /> Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
