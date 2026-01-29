'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatusBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineOfficeBuilding,
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

  // If multiple words, take first letter of each word (max 4)
  const initials = words.slice(0, 4).map(word => word[0]).join('');
  return initials.toUpperCase();
};

export default function DepartmentsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, dept: null });
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    company_id: null
  });

  useEffect(() => {
    if (user?.company_id) {
      fetchDepartments();
    }
  }, [user]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/organizations/departments', {
        params: { company_id: user.company_id }
      });
      setDepartments(response.items || response || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to load departments');
      setDepartments([]);
    } finally {
      setLoading(false);
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
        ...formData,
        company_id: user.company_id
      };

      if (editingDept) {
        await api.put(`/organizations/departments/${editingDept.id}`, payload);
        toast.success('Department updated successfully');
      } else {
        await api.post('/organizations/departments', payload);
        toast.success('Department created successfully');
      }
      fetchDepartments();
      closeModal();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.detail || error.message || 'Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.dept) return;
    setDeleting(true);
    try {
      await api.delete(`/organizations/departments/${deleteModal.dept.id}`);
      toast.success('Department deleted successfully');
      setDeleteModal({ open: false, dept: null });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.detail || error.message || 'Failed to delete department');
    } finally {
      setDeleting(false);
    }
  };

  const openModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name,
        code: dept.code || '',
        description: dept.description || '',
        company_id: dept.company_id
      });
    } else {
      setEditingDept(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        company_id: user?.company_id
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDept(null);
  };

  // Filter departments based on search
  const filteredDepartments = departments.filter(dept =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = ['admin', 'manager', 'super_admin'].includes(user?.role?.code?.toLowerCase());

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Departments</h1>
          <p className="text-muted-foreground mt-1">Manage company departments and organizational structure</p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => openModal()} className="shadow-lg shadow-primary/20">
            <HiOutlinePlus className="w-5 h-5" />
            Add Department
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <Card>
        <CardBody className="p-4">
          <div className="relative max-w-md">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 bg-background"
            />
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="table-container border-0 bg-transparent">
          {loading ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading departments...</p>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <HiOutlineOfficeBuilding className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{searchTerm ? 'No departments found matching your search.' : 'No departments found. Create one to get started.'}</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Code</th>
                  <th>Employees</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="group hover:bg-muted/20 transition-colors">
                    <td>
                      <Link
                        href={`/departments/${dept.id}`}
                        className="font-medium flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <HiOutlineOfficeBuilding className="w-4 h-4 text-muted-foreground" />
                        {dept.name}
                      </Link>
                      {dept.description && (
                        <p className="text-xs text-muted-foreground mt-1">{dept.description}</p>
                      )}
                    </td>
                    <td>
                      <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {dept.code}
                      </span>
                    </td>
                    <td>{dept.employee_count || 0}</td>
                    <td>
                      <StatusBadge status={dept.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/departments/${dept.id}`}>
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
                              onClick={() => openModal(dept)}
                            >
                              <HiOutlinePencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600"
                              onClick={() => setDeleteModal({ open: true, dept })}
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
        title={editingDept ? 'Edit Department' : 'Create Department'}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          <div className="space-y-1">
            <label className="input-label">
              Department Name <span className="text-red-500">*</span>
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
              placeholder="e.g., Engineering"
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
              placeholder="e.g., ENG"
              maxLength={10}
            />
            {errors.code && <p className="error-message">{errors.code}</p>}
          </div>

          <div className="space-y-1">
            <label className="input-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[80px]"
              placeholder="Brief description of the department..."
            />
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
                  {editingDept ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, dept: null })}
        onConfirm={confirmDelete}
        title="Delete Department"
        message={`Are you sure you want to delete "${deleteModal.dept?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
