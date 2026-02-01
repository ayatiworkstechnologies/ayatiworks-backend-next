'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, StatusBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineBadgeCheck,
  HiOutlineCheck, HiOutlineEye, HiOutlineSearch
} from 'react-icons/hi';

// Helper function to generate code from name
const generateCodeFromName = (name) => {
  if (!name) return '';

  // Remove special characters and extra spaces
  const cleaned = name.trim().replace(/[^a-zA-Z\s]/g, '');

  // Split into words
  const words = cleaned.split(/\s+/).filter(word => word.length > 0);

  if (words.length === 0) return '';

  // If single word, take first 3-4 letters
  if (words.length === 1) {
    return words[0].substring(0, 4).toUpperCase();
  }

  // If 2 words, abbreviate intelligently
  if (words.length === 2) {
    // For designations like "Senior Engineer" -> "SR-ENG"
    const first = words[0].substring(0, 2).toUpperCase();
    const second = words[1].substring(0, 3).toUpperCase();
    return `${first}-${second}`;
  }

  // If 3+ words, take first letter of each (max 4)
  const initials = words.slice(0, 4).map(word => word[0]).join('');
  return initials.toUpperCase();
};

export default function DesignationsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDes, setEditingDes] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, des: null });
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department_id: null,
    description: '',
    level: 1,
    min_salary: '',
    max_salary: ''
  });

  useEffect(() => {
    if (user) {
      fetchDesignations();
      fetchDepartments();
    }
  }, [user]);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/organizations/designations');
      setDesignations(response.items || response || []);
    } catch (error) {
      console.error('Failed to fetch designations:', error);
      toast.error('Failed to load designations');
      setDesignations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/organizations/departments', {
        params: { company_id: user?.company_id }
      });
      setDepartments(response.items || response || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setDepartments([]);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.code?.trim()) newErrors.code = 'Code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fix validation errors');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        description: formData.description || null,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        level: formData.level || 1,
        min_salary: formData.min_salary ? parseInt(formData.min_salary) : null,
        max_salary: formData.max_salary ? parseInt(formData.max_salary) : null,
      };

      if (editingDes) {
        await api.put(`/organizations/designations/${editingDes.id}`, payload);
        toast.success('Designation updated successfully');
      } else {
        await api.post('/organizations/designations', payload);
        toast.success('Designation created successfully');
      }
      fetchDesignations();
      closeModal();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.detail || error.message || 'Failed to save designation');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.des) return;
    setDeleting(true);
    try {
      await api.delete(`/organizations/designations/${deleteModal.des.id}`);
      toast.success('Designation deleted successfully');
      setDeleteModal({ open: false, des: null });
      fetchDesignations();
    } catch (error) {
      toast.error(error.response?.data?.detail || error.message || 'Failed to delete designation');
    } finally {
      setDeleting(false);
    }
  };

  const openModal = (des = null) => {
    if (des) {
      setEditingDes(des);
      setFormData({
        name: des.name,
        code: des.code || '',
        department_id: des.department_id || null,
        description: des.description || '',
        level: des.level || 1,
        min_salary: des.min_salary || '',
        max_salary: des.max_salary || ''
      });
    } else {
      setEditingDes(null);
      setFormData({
        name: '',
        code: '',
        department_id: null,
        description: '',
        level: 1,
        min_salary: '',
        max_salary: ''
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDes(null);
  };

  // Filter designations based on search and department filter
  const filteredDesignations = designations.filter(des => {
    const matchesSearch =
      des.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      des.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      des.department?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = !filterDepartment || des.department_id === parseInt(filterDepartment);

    return matchesSearch && matchesDepartment;
  });

  const getLevelLabel = (level) => {
    const labels = {
      1: 'Junior',
      2: 'Mid-Level',
      3: 'Senior',
      4: 'Lead',
      5: 'Principal',
    };
    return labels[level] || `Level ${level}`;
  };

  const isAdmin = ['admin', 'manager', 'super_admin'].includes(user?.role?.code?.toLowerCase());

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Designations</h1>
          <p className="text-muted-foreground mt-1">Manage job titles and designations</p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => openModal()} className="shadow-lg shadow-primary/20">
            <HiOutlinePlus className="w-5 h-5" />
            Add Designation
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search designations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 bg-background"
            />
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="input md:w-64"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="table-container border-0 bg-transparent">
          {loading ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading designations...</p>
            </div>
          ) : filteredDesignations.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <HiOutlineBadgeCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{searchTerm || filterDepartment ? 'No designations found matching your filters.' : 'No designations found. Create one to get started.'}</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Designation</th>
                  <th>Code</th>
                  <th>Department</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDesignations.map((des) => (
                  <tr key={des.id} className="group hover:bg-muted/20 transition-colors">
                    <td>
                      <Link
                        href={`/settings/designations/${des.id}`}
                        className="font-medium flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <HiOutlineBadgeCheck className="w-4 h-4 text-muted-foreground" />
                        {des.name}
                      </Link>
                      {des.description && (
                        <p className="text-xs text-muted-foreground mt-1">{des.description}</p>
                      )}
                    </td>
                    <td>
                      <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {des.code || '-'}
                      </span>
                    </td>
                    <td className="text-muted-foreground">
                      {des.department?.name || '-'}
                    </td>
                    <td>
                      <span className="text-sm text-muted-foreground">
                        {getLevelLabel(des.level)}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={des.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/settings/designations/${des.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <HiOutlineEye className="w-4 h-4" />
                          </Button>
                        </Link>
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openModal(des)}
                            >
                              <HiOutlinePencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600"
                              onClick={() => setDeleteModal({ open: true, des })}
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
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingDes ? 'Edit Designation' : 'Create Designation'}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="input-label">
                Designation Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setFormData({ ...formData, name: newName });

                  // Auto-generate code from name only if code is empty or was auto-generated
                  if (!formData.code || formData.code === generateCodeFromName(formData.name)) {
                    const generatedCode = generateCodeFromName(newName);
                    setFormData(prev => ({ ...prev, name: newName, code: generatedCode }));
                  }

                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g., Senior Engineer"
              />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>

            <div className="space-y-1">
              <label className="input-label">
                Code <span className="text-red-500">*</span>
                <span className="text-xs text-muted-foreground ml-2">(Auto-generated, can be edited)</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => {
                  setFormData({ ...formData, code: e.target.value.toUpperCase() });
                  if (errors.code) setErrors({ ...errors, code: null });
                }}
                className={`input ${errors.code ? 'input-error' : ''}`}
                placeholder="e.g., SR-ENG"
                maxLength={20}
              />
              {errors.code && <p className="error-message">{errors.code}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="input-label">Department</label>
              <select
                value={formData.department_id || ''}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value || null })}
                className="input"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="input-label">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                className="input"
              >
                <option value="1">Junior (Level 1)</option>
                <option value="2">Mid-Level (Level 2)</option>
                <option value="3">Senior (Level 3)</option>
                <option value="4">Lead (Level 4)</option>
                <option value="5">Principal (Level 5)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="input-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[60px]"
              placeholder="Brief description of the designation..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="input-label">Min Salary (Optional)</label>
              <input
                type="number"
                value={formData.min_salary}
                onChange={(e) => setFormData({ ...formData, min_salary: e.target.value })}
                className="input"
                placeholder="e.g., 50000"
              />
            </div>

            <div className="space-y-1">
              <label className="input-label">Max Salary (Optional)</label>
              <input
                type="number"
                value={formData.max_salary}
                onChange={(e) => setFormData({ ...formData, max_salary: e.target.value })}
                className="input"
                placeholder="e.g., 70000"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : (
                <>
                  <HiOutlineCheck className="w-4 h-4" />
                  {editingDes ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, des: null })}
        onConfirm={confirmDelete}
        title="Delete Designation"
        message={`Are you sure you want to delete "${deleteModal.des?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
