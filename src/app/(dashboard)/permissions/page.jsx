'use client';

import { useState, useEffect } from 'react';
import { Card, StatusBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineShieldCheck, HiOutlineCheck, HiOutlineSearch } from 'react-icons/hi';

export default function PermissionsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPerm, setEditingPerm] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, perm: null });
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ name: '', code: '', description: '', module: '' });

  // Synced with backend permissions.py
  const modules = [
    'dashboard', 'users', 'roles', 'settings', 'company', 'branch',
    'department', 'employee', 'attendance', 'leave', 'holiday',
    'shift', 'payroll', 'project', 'task', 'client', 'lead',
    'deal', 'invoice', 'timesheet', 'report', 'audit'
  ];

  const canManagePermissions = useMemo(() => {
    const role = user?.role?.code;
    if (['admin', 'super_admin'].includes(role)) return true;
    return user?.permissions?.includes('permission.edit') || user?.permissions?.includes('permission.create');
  }, [user]);

  const canDeletePermissions = useMemo(() => {
    const role = user?.role?.code;
    if (['admin', 'super_admin'].includes(role)) return true;
    return user?.permissions?.includes('permission.delete');
  }, [user]);

  useEffect(() => { fetchPermissions(); }, []);

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions');
      setPermissions(response.items || response || []);
    } catch (error) {
      setPermissions([]);
      if (error.status !== 403) toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Permission name is required';
    if (!formData.code.trim()) newErrors.code = 'Permission code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) { toast.error('Please fix validation errors'); return; }
    setSaving(true);
    try {
      if (editingPerm) {
        await api.put(`/permissions/${editingPerm.id}`, formData);
        toast.success('Permission updated successfully');
      } else {
        await api.post('/permissions', formData);
        toast.success('Permission created successfully');
      }
      fetchPermissions();
      closeModal();
    } catch (error) {
      toast.error(error.message || 'Failed to save permission');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.perm) return;
    setDeleting(true);
    try {
      await api.delete(`/permissions/${deleteModal.perm.id}`);
      toast.success('Permission deleted successfully');
      setDeleteModal({ open: false, perm: null });
      fetchPermissions();
    } catch (error) {
      toast.error(error.message || 'Failed to delete permission');
    } finally {
      setDeleting(false);
    }
  };

  const openModal = (perm = null) => {
    if (perm) {
      setEditingPerm(perm);
      setFormData({ name: perm.name, code: perm.code || '', description: perm.description || '', module: perm.module || '' });
    } else {
      setEditingPerm(null);
      setFormData({ name: '', code: '', description: '', module: '' });
    }
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingPerm(null); };

  const filteredPermissions = permissions.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.module?.toLowerCase().includes(search.toLowerCase())
  );

  const groupedByModule = filteredPermissions.reduce((acc, perm) => {
    const mod = perm.module || 'Other';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(perm);
    return acc;
  }, {});

  if (!user) return null; // Wait for auth

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Permissions</h1>
          <p className="page-subtitle">Manage system permissions for role-based access control</p>
        </div>
        {canManagePermissions && (
          <Button variant="primary" onClick={() => openModal()}><HiOutlinePlus className="w-5 h-5" /> Add Permission</Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <div className="p-4">
          <div className="relative max-w-md">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search permissions..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
          </div>
        </div>
      </Card>

      {/* Permissions List by Module */}
      {loading ? (
        <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : (
        <div className="space-y-4">
          {Object.keys(groupedByModule).length === 0 ? (
            <div className="p-8 text-center text-gray-500">No permissions found matching your search.</div>
          ) : (
            Object.entries(groupedByModule).map(([module, perms]) => (
              <Card key={module}>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                    <HiOutlineShieldCheck className="w-5 h-5 text-blue-500" /> {module}
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{perms.length}</span>
                  </h3>
                </div>
                <div className="table-container border-0">
                  <table className="table">
                    <thead><tr><th>Permission</th><th>Code</th><th>Status</th>{(canManagePermissions || canDeletePermissions) && <th>Actions</th>}</tr></thead>
                    <tbody>
                      {perms.map((perm) => (
                        <tr key={perm.id}>
                          <td className="font-medium">{perm.name}</td>
                          <td><span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{perm.code}</span></td>
                          <td><StatusBadge status={perm.status || 'active'} /></td>
                          {(canManagePermissions || canDeletePermissions) && (
                            <td>
                              <div className="flex gap-1">
                                {canManagePermissions && (
                                  <Button variant="ghost" size="sm" onClick={() => openModal(perm)}><HiOutlinePencil className="w-4 h-4" /></Button>
                                )}
                                {canDeletePermissions && (
                                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteModal({ open: true, perm })}><HiOutlineTrash className="w-4 h-4" /></Button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingPerm ? 'Edit Permission' : 'Add Permission'}
        footer={<><Button variant="secondary" onClick={closeModal}>Cancel</Button><Button variant="primary" onClick={handleSubmit} loading={saving}><HiOutlineCheck className="w-4 h-4" /> {editingPerm ? 'Save' : 'Create'}</Button></>}>
        <div className="space-y-4">
          <div className="input-wrapper">
            <label className="input-label">Permission Name <span className="text-red-500">*</span></label>
            <input type="text" value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: null }); }} placeholder="e.g., View Employees" className={`input ${errors.name ? 'input-error' : ''}`} />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>
          <div className="input-wrapper">
            <label className="input-label">Code <span className="text-red-500">*</span></label>
            <input type="text" value={formData.code} onChange={(e) => { setFormData({ ...formData, code: e.target.value }); if (errors.code) setErrors({ ...errors, code: null }); }} placeholder="e.g., employees.view" className={`input font-mono ${errors.code ? 'input-error' : ''}`} />
            {errors.code && <p className="error-message">{errors.code}</p>}
          </div>
          <div className="input-wrapper">
            <label className="input-label">Module</label>
            <select value={formData.module} onChange={(e) => setFormData({ ...formData, module: e.target.value })} className="input">
              <option value="">Select module</option>
              {modules.map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
            </select>
          </div>
          <div className="input-wrapper">
            <label className="input-label">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input min-h-[80px]" placeholder="Describe what this permission allows..." />
          </div>
        </div>
      </Modal>

      <DeleteConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, perm: null })} onConfirm={confirmDelete} title="Delete Permission" message={`Are you sure you want to delete "${deleteModal.perm?.name}"? This may affect roles using this permission.`} loading={deleting} />
    </div>
  );
}
