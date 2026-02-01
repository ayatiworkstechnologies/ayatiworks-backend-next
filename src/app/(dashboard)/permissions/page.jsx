'use client';

import { useState, useEffect, useMemo } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PermissionGuard from '@/components/PermissionGuard';
import { Card, CardBody, PageHeader, StatusBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineShieldCheck,
  HiOutlineCheck, HiOutlineSearch, HiOutlineX, HiOutlineKey,
  HiOutlineChevronDown, HiOutlineChevronUp
} from 'react-icons/hi';

function PermissionsPageContent() {
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
  const [expandedModules, setExpandedModules] = useState({});
  const [formData, setFormData] = useState({ name: '', code: '', description: '', module: '' });

  // Synced with backend permissions.py
  const modules = [
    'dashboard', 'users', 'roles', 'settings', 'company', 'branch',
    'department', 'employee', 'attendance', 'leave', 'holiday',
    'shift', 'payroll', 'project', 'task', 'client', 'lead',
    'deal', 'invoice', 'timesheet', 'report', 'audit', 'blog', 'meta'
  ];

  const canManagePermissions = useMemo(() => {
    const role = user?.role?.code;
    if (['ADMIN', 'SUPER_ADMIN'].includes(role)) return true;
    return user?.permissions?.includes('permission.edit') || user?.permissions?.includes('permission.create');
  }, [user]);

  const canDeletePermissions = useMemo(() => {
    const role = user?.role?.code;
    if (['ADMIN', 'SUPER_ADMIN'].includes(role)) return true;
    return user?.permissions?.includes('permission.delete');
  }, [user]);

  useEffect(() => { fetchPermissions(); }, []);

  // Auto-expand all modules on initial load
  useEffect(() => {
    if (permissions.length > 0) {
      const initial = {};
      permissions.forEach(p => {
        const mod = p.module || 'Other';
        initial[mod] = true;
      });
      setExpandedModules(initial);
    }
  }, [permissions]);

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
      console.error('Save permission error:', error);
      toast.error(error.data?.detail || error.message || 'Failed to save permission');
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
      console.error('Delete permission error:', error);
      toast.error(error.data?.detail || error.message || 'Failed to delete permission');
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

  const toggleModule = (module) => {
    setExpandedModules(prev => ({ ...prev, [module]: !prev[module] }));
  };

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

  const totalPermissions = permissions.length;
  const moduleCount = Object.keys(groupedByModule).length;

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Permissions"
        description={`Manage ${totalPermissions} system permissions across ${moduleCount} modules`}
      >
        <PermissionGuard anyPermission={['permission.create', 'super_admin']}>
          <Button variant="primary" onClick={() => openModal()} className="shadow-lg shadow-primary/20">
            <HiOutlinePlus className="w-5 h-5" /> Add Permission
          </Button>
        </PermissionGuard>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card bg-gradient-to-br from-blue-500/5 to-blue-600/10">
          <CardBody className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
              <HiOutlineKey className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalPermissions}</p>
              <p className="text-sm text-muted-foreground">Total Permissions</p>
            </div>
          </CardBody>
        </Card>
        <Card className="glass-card bg-gradient-to-br from-purple-500/5 to-purple-600/10">
          <CardBody className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center">
              <HiOutlineShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{moduleCount}</p>
              <p className="text-sm text-muted-foreground">Modules</p>
            </div>
          </CardBody>
        </Card>
        <Card className="glass-card bg-gradient-to-br from-green-500/5 to-green-600/10">
          <CardBody className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 text-green-600 rounded-xl flex items-center justify-center">
              <HiOutlineCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{filteredPermissions.length}</p>
              <p className="text-sm text-muted-foreground">Showing</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search */}
      <Card className="glass-card">
        <CardBody className="p-4">
          <div className="relative max-w-md">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search permissions by name, code, or module..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Permissions List by Module */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : Object.keys(groupedByModule).length === 0 ? (
        <Card className="glass-card border-2 border-dashed border-border/50">
          <CardBody className="p-12 text-center">
            <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiOutlineShieldCheck className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No Permissions Found</h3>
            <p className="text-muted-foreground">
              {search ? 'No permissions match your search criteria.' : 'Get started by creating your first permission.'}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByModule).sort().map(([module, perms]) => (
            <Card key={module} className="glass-card overflow-hidden">
              {/* Module Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors border-b border-border/40"
                onClick={() => toggleModule(module)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <HiOutlineShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground capitalize">{module}</h3>
                    <p className="text-xs text-muted-foreground">{perms.length} permissions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-muted/50 text-muted-foreground px-3 py-1 rounded-full font-medium">
                    {perms.length}
                  </span>
                  {expandedModules[module] ? (
                    <HiOutlineChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <HiOutlineChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Permissions Grid */}
              {expandedModules[module] && (
                <CardBody className="p-4 bg-muted/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {perms.map((perm) => (
                      <div
                        key={perm.id}
                        className="group p-4 rounded-xl border border-border/40 bg-background/50 hover:border-primary/30 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">{perm.name}</h4>
                            <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded mt-1 inline-block">
                              {perm.code}
                            </code>
                          </div>
                          {(canManagePermissions || canDeletePermissions) && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              {canManagePermissions && (
                                <button
                                  onClick={() => openModal(perm)}
                                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                                >
                                  <HiOutlinePencil className="w-4 h-4" />
                                </button>
                              )}
                              {canDeletePermissions && (
                                <button
                                  onClick={() => setDeleteModal({ open: true, perm })}
                                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors"
                                >
                                  <HiOutlineTrash className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        {perm.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{perm.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingPerm ? 'Edit Permission' : 'Add Permission'} size="lg">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium">Permission Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: null }); }}
              placeholder="e.g., View Employees"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-500' : 'border-input'} bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Code <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => { setFormData({ ...formData, code: e.target.value }); if (errors.code) setErrors({ ...errors, code: null }); }}
              placeholder="e.g., employee.view"
              className={`w-full px-4 py-2.5 rounded-xl border font-mono text-sm ${errors.code ? 'border-red-500' : 'border-input'} bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
            />
            {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Module</label>
            <select
              value={formData.module}
              onChange={(e) => setFormData({ ...formData, module: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="">Select module</option>
              {modules.map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background min-h-[80px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="Describe what this permission allows..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={saving} className="shadow-lg shadow-primary/20">
              <HiOutlineCheck className="w-4 h-4" /> {editingPerm ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, perm: null })}
        onConfirm={confirmDelete}
        title="Delete Permission"
        message={`Are you sure you want to delete "${deleteModal.perm?.name}"? This may affect roles using this permission.`}
        loading={deleting}
      />
    </div>
  );
}

export default function PermissionsPage() {
  return (
    <ProtectedRoute anyPermission={['permission.view', 'super_admin']}>
      <PermissionsPageContent />
    </ProtectedRoute>
  );
}
