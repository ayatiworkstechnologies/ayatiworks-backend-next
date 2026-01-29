'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { HiOutlineArrowLeft, HiOutlineCheck, HiOutlineCurrencyDollar } from 'react-icons/hi';

export default function EditProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    name: '', code: '', client_id: '', manager_id: '', description: '',
    start_date: '', end_date: '', budget: '', status: 'planned',
    currency: 'USD', billing_type: 'fixed'
  });

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchProject(), fetchDropdowns()]);
      setLoading(false);
    };
    init();
  }, [id]);

  const fetchDropdowns = async () => {
    try {
      const [empRes, clientRes] = await Promise.all([
        api.get('/employees').catch(() => ({ items: [] })),
        api.get('/clients').catch(() => ({ items: [] }))
      ]);
      setEmployees(empRes?.items || empRes || []);
      setClients(clientRes?.items || clientRes || []);
    } catch (error) {
      console.error('Failed to fetch dropdowns');
    }
  };

  const fetchProject = async () => {
    try {
      const data = await api.get(`/projects/${id}`);
      setFormData({
        name: data.name || '',
        code: data.code || '',
        client_id: data.client_id || '',
        manager_id: data.manager_id || '',
        description: data.description || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        budget: data.budget || '',
        status: data.status || 'planned',
        currency: data.currency || 'USD',
        billing_type: data.billing_type || 'fixed'
      });
    } catch (error) {
      toast.error('Failed to load project data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.code.trim()) newErrors.code = 'Project code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the validation errors'); return; }

    setSaving(true);
    try {
      const cleanData = { ...formData };

      // Handle foreign keys
      if (cleanData.client_id) cleanData.client_id = parseInt(cleanData.client_id, 10);
      else cleanData.client_id = null;

      if (cleanData.manager_id) cleanData.manager_id = parseInt(cleanData.manager_id, 10);
      else cleanData.manager_id = null;

      // Handle numbers
      if (cleanData.budget) cleanData.budget = parseFloat(cleanData.budget);

      await api.put(`/projects/${id}`, cleanData);
      toast.success('Project updated successfully');
      setTimeout(() => router.push(`/projects/${id}`), 1500);
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.detail || error.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in-up">
      <div className="page-header">
        <div>
          <Link href={`/projects/${id}`} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <HiOutlineArrowLeft className="w-4 h-4" /> Back to Project
          </Link>
          <h1 className="page-title mt-2">Edit Project</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader title="Project Details" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="input-wrapper">
                <label className="input-label">Project Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={`input ${errors.name ? 'input-error' : ''}`} />
                {errors.name && <p className="error-message">{errors.name}</p>}
              </div>
              <div className="input-wrapper">
                <label className="input-label">Project Code <span className="text-red-500">*</span></label>
                <input type="text" name="code" value={formData.code} readOnly className="input bg-muted/50 text-muted-foreground cursor-not-allowed" />
                <p className="text-xs text-muted-foreground mt-1">Project code cannot be changed</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="input-wrapper">
                <label className="input-label">Client</label>
                <select name="client_id" value={formData.client_id} onChange={handleChange} className="input">
                  <option value="">Select client (Optional)</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-wrapper">
                <label className="input-label">Project Manager</label>
                <select name="manager_id" value={formData.manager_id} onChange={handleChange} className="input">
                  <option value="">Select manager (Optional)</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="input-wrapper">
              <label className="input-label">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="input min-h-[100px]" placeholder="Project description..." />
            </div>
          </CardBody>
        </Card>

        <Card className="mb-6">
          <CardHeader title="Timeline & Budget" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="input-wrapper"><label className="input-label">Start Date</label><input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="input" /></div>
              <div className="input-wrapper"><label className="input-label">End Date</label><input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="input" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="input-wrapper">
                <label className="input-label">Budget</label>
                <div className="relative">
                  <HiOutlineCurrencyDollar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="number" name="budget" value={formData.budget} onChange={handleChange} className="input pl-10" min="0" step="100" />
                </div>
              </div>
              <div className="input-wrapper">
                <label className="input-label">Currency</label>
                <select name="currency" value={formData.currency} onChange={handleChange} className="input">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              <div className="input-wrapper">
                <label className="input-label">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="input">
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">Cancel</Button>
          <Button type="submit" variant="primary" loading={saving} className="flex-1"><HiOutlineCheck className="w-4 h-4 mr-2" /> Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
