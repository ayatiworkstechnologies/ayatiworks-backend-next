'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { HiOutlineArrowLeft, HiOutlineCheck, HiOutlineMail, HiOutlinePhone, HiOutlineGlobe } from 'react-icons/hi';

export default function EditClientPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', website: '', industry: '', address: '', description: '',
  });

  useEffect(() => { fetchClient(); }, [id]);

  const fetchClient = async () => {
    try {
      const data = await api.get(`/clients/${id}`);
      setFormData({
        name: data.name || '', email: data.email || '', phone: data.phone || '', website: data.website || '',
        industry: data.industry || '',
        company_size: data.company_size || '',
        annual_revenue: data.annual_revenue || '',
        tax_id: data.tax_id || '',
        address: data.address || '', description: data.description || '',
      });
    } catch (error) {
      toast.error('Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Company name is required';
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
      // Create payload with proper types
      const payload = {
        ...formData,
        annual_revenue: formData.annual_revenue ? Number(formData.annual_revenue) : null
      };
      await api.put(`/clients/${id}`, payload);
      toast.success('Client updated successfully');
      setTimeout(() => router.push(`/clients/${id}`), 1500);
    } catch (error) {
      toast.error(error.message || 'Failed to update client');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="page-header">
        <div>
          <Link href={`/clients/${id}`} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700">
            <HiOutlineArrowLeft className="w-4 h-4" /> Back to Client
          </Link>
          <h1 className="page-title mt-2">Edit Client</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader title="Company Details" />
          <CardBody className="space-y-4">
            <div className="input-wrapper">
              <label className="input-label">Company Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={`input ${errors.name ? 'input-error' : ''}`} />
              {errors.name && <p className="error-message">{errors.name}</p>}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="input-wrapper">
                <label className="input-label">Website</label>
                <div className="relative">
                  <HiOutlineGlobe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="url" name="website" value={formData.website} onChange={handleChange} className="input pl-10" />
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
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="input-wrapper">
                <label className="input-label">Company Size</label>
                <select name="company_size" value={formData.company_size} onChange={handleChange} className="input">
                  <option value="">Select size</option>
                  <option value="1-10">1-10 Employees</option>
                  <option value="11-50">11-50 Employees</option>
                  <option value="51-200">51-200 Employees</option>
                  <option value="201-500">201-500 Employees</option>
                  <option value="500+">500+ Employees</option>
                </select>
              </div>
              <div className="input-wrapper">
                <label className="input-label">Annual Revenue</label>
                <input type="number" name="annual_revenue" value={formData.annual_revenue} onChange={handleChange} placeholder="e.g. 1000000" className="input" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="input-wrapper">
                <label className="input-label">Tax ID / VAT</label>
                <input type="text" name="tax_id" value={formData.tax_id} onChange={handleChange} placeholder="Tax Identification Number" className="input" />
              </div>
            </div>

            <div className="input-wrapper">
              <label className="input-label">Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} className="input min-h-[80px]" />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="input min-h-[80px]" />
            </div>
          </CardBody>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">Cancel</Button>
          <Button type="submit" variant="primary" loading={saving} className="flex-1"><HiOutlineCheck className="w-4 h-4" /> Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
