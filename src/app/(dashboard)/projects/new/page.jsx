'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlineArrowLeft, HiOutlineBriefcase, HiOutlineCalendar,
  HiOutlineCurrencyDollar, HiOutlineCheck
} from 'react-icons/hi';

export default function CreateProjectPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    client_id: '',
    manager_id: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: '',
    currency: 'USD',
    billing_type: 'fixed',
    status: 'planned',
  });

  // Fetch clients, employees, and next project code
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, employeesRes, nextCodeRes] = await Promise.all([
          api.get('/clients').catch(() => ({ items: [] })),
          api.get('/employees').catch(() => ({ items: [] })),
          api.get('/projects/next-code').catch(() => ({ next_code: 'PRJ001' })),
        ]);
        setClients(clientsRes?.items || clientsRes || []);
        setEmployees(employeesRes?.items || employeesRes || []);

        // Auto-fill the project code
        if (nextCodeRes?.next_code) {
          setFormData(prev => ({ ...prev, code: nextCodeRes.next_code }));
        }
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };



  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.code.trim()) newErrors.code = 'Project code is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast?.error?.('Please fix the validation errors');
      return;
    }

    setLoading(true);
    try {
      // Clean data - convert empty strings to null
      const cleanData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description?.trim() || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        currency: formData.currency,
        billing_type: formData.billing_type,
        status: formData.status,
      };

      // Handle optional foreign keys
      if (formData.client_id) {
        cleanData.client_id = parseInt(formData.client_id, 10);
      }
      if (formData.manager_id) {
        cleanData.manager_id = parseInt(formData.manager_id, 10);
      }
      if (formData.budget) {
        cleanData.budget = parseFloat(formData.budget);
      }

      await api.post('/projects', cleanData);
      toast?.success?.('Project created successfully!');
      setTimeout(() => router.push('/projects'), 1500);
    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage = error?.data?.detail || error?.message || 'Failed to create project';
      toast?.error?.(typeof errorMessage === 'string' ? errorMessage : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <Link href="/projects" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700">
            <HiOutlineArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
          <h1 className="page-title mt-2">Create New Project</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <Card className="mb-6">
          <CardHeader title="Project Details" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="input-wrapper">
                <label className="input-label">Project Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., HRMS Platform"
                  className={`input ${errors.name ? 'input-error' : ''}`}
                />
                {errors.name && <p className="error-message">{errors.name}</p>}
              </div>
              <div className="input-wrapper">
                <label className="input-label">Project Code <span className="text-green-600 text-xs font-normal">(Auto-generated)</span></label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  readOnly
                  className={`input uppercase bg-gray-50 cursor-not-allowed ${errors.code ? 'input-error' : ''}`}
                />
                <p className="text-xs text-gray-500 mt-1">Code is automatically generated in sequence</p>
                {errors.code && <p className="error-message">{errors.code}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="input-wrapper">
                <label className="input-label">Client</label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  className="input"
                  disabled={loadingData}
                >
                  <option value="">Select client (optional)</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-wrapper">
                <label className="input-label">Project Manager</label>
                <select
                  name="manager_id"
                  value={formData.manager_id}
                  onChange={handleChange}
                  className="input"
                  disabled={loadingData}
                >
                  <option value="">Select manager (optional)</option>
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
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Project description..."
                className="input min-h-[100px]"
              />
            </div>
          </CardBody>
        </Card>

        {/* Timeline & Budget */}
        <Card className="mb-6">
          <CardHeader title="Timeline & Budget" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="input-wrapper">
                <label className="input-label">Start Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={`input ${errors.start_date ? 'input-error' : ''}`}
                />
                {errors.start_date && <p className="error-message">{errors.start_date}</p>}
              </div>
              <div className="input-wrapper">
                <label className="input-label">End Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  min={formData.start_date}
                  className={`input ${errors.end_date ? 'input-error' : ''}`}
                />
                {errors.end_date && <p className="error-message">{errors.end_date}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="input-wrapper">
                <label className="input-label">Budget</label>
                <div className="relative">
                  <HiOutlineCurrencyDollar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="50000"
                    className="input pl-10"
                    min="0"
                    step="100"
                  />
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
                <label className="input-label">Billing Type</label>
                <select name="billing_type" value={formData.billing_type} onChange={handleChange} className="input">
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                  <option value="milestone">Milestone Based</option>
                </select>
              </div>
            </div>

            <div className="input-wrapper">
              <label className="input-label">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input">
                <option value="draft">Draft</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </CardBody>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={loading || loadingData} className="flex-1">
            <HiOutlineCheck className="w-4 h-4" /> Create Project
          </Button>
        </div>
      </form>
    </div>
  );
}
