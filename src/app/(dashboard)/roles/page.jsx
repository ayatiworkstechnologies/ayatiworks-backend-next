'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import PermissionGuard from '@/components/PermissionGuard';
import { Card, CardBody, PageHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineUserGroup,
  HiOutlineCheck, HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineKey
} from 'react-icons/hi';

function RolesPageContent() {
  const toast = useToast();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, role: null });
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    permission_ids: [],
    scope: 'company'
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles').catch(() => []),
        api.get('/permissions').catch(() => []),
      ]);
      setRoles(Array.isArray(rolesRes) ? rolesRes : []);
      setPermissions(Array.isArray(permsRes) ? permsRes : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load roles and permissions');
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Role name is required';
    if (!formData.code.trim()) newErrors.code = 'Role code is required';
    if (formData.permission_ids.length === 0) {
      toast.warning('No permissions selected. Role will have no access.');
    }
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
      if (editingRole) {
        // Update role basic info
        await api.put(`/roles/${editingRole.id}`, {
          name: formData.name,
          code: formData.code,
          description: formData.description,
        });

        // Update permissions separately
        const currentPermIds = editingRole.permissions?.map(p => p.id) || [];
        const add_permission_ids = formData.permission_ids.filter(id => !currentPermIds.includes(id));
        const remove_permission_ids = currentPermIds.filter(id => !formData.permission_ids.includes(id));

        if (add_permission_ids.length > 0 || remove_permission_ids.length > 0) {
          await api.put(`/roles/${editingRole.id}/permissions`, {
            add_permission_ids,
            remove_permission_ids
          });
        }

        toast.success('Role updated successfully');
      } else {
        // Create new role
        await api.post('/roles', {
          ...formData,
          is_system: false
        });
        toast.success('Role created successfully');
      }

      await fetchData();
      closeModal();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.data?.detail || error.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.role) return;

    // Check if system role
    if (deleteModal.role.is_system) {
      toast.error('Cannot delete system roles');
      setDeleteModal({ open: false, role: null });
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/roles/${deleteModal.role.id}`);
      toast.success('Role deleted successfully');
      setDeleteModal({ open: false, role: null });
      await fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.data?.detail || error.message || 'Failed to delete role');
    } finally {
      setDeleting(false);
    }
  };

  const openModal = async (role = null) => {
    if (role) {
      // Fetch full role details with permissions first
      try {
        const fullRole = await api.get(`/roles/${role.id}`);
        // Set editingRole with full permissions data
        setEditingRole(fullRole);
        setFormData({
          name: fullRole.name,
          code: fullRole.code || '',
          description: fullRole.description || '',
          scope: fullRole.scope || 'company',
          permission_ids: fullRole.permissions?.map(p => p.id) || []
        });
      } catch (error) {
        console.error('Failed to fetch role details:', error);
        // Fallback to basic role data
        setEditingRole(role);
        setFormData({
          name: role.name,
          code: role.code || '',
          description: role.description || '',
          scope: role.scope || 'company',
          permission_ids: []
        });
      }
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        permission_ids: [],
        scope: 'company'
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRole(null);
  };

  const handleNameChange = (name) => {
    // Auto-generate code from name
    const code = name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_');

    setFormData({ ...formData, name, code });
    if (errors.name) setErrors({ ...errors, name: null });
    if (errors.code) setErrors({ ...errors, code: null });
  };

  const togglePermission = (permId) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permId)
        ? prev.permission_ids.filter(id => id !== permId)
        : [...prev.permission_ids, permId]
    }));
  };

  const toggleAllPermissions = () => {
    if (formData.permission_ids.length === permissions.length) {
      setFormData(prev => ({ ...prev, permission_ids: [] }));
    } else {
      setFormData(prev => ({ ...prev, permission_ids: permissions.map(p => p.id) }));
    }
  };

  const toggleModulePermissions = (modulePerms) => {
    const modulePermIds = modulePerms.map(p => p.id);
    const allSelected = modulePermIds.every(id => formData.permission_ids.includes(id));

    setFormData(prev => {
      if (allSelected) {
        return {
          ...prev,
          permission_ids: prev.permission_ids.filter(id => !modulePermIds.includes(id))
        };
      } else {
        const newIds = [...prev.permission_ids];
        modulePermIds.forEach(id => {
          if (!newIds.includes(id)) newIds.push(id);
        });
        return { ...prev, permission_ids: newIds };
      }
    });
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    const mod = perm.module || 'Other';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(perm);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Roles"
        description="Manage user roles and their associated permissions"
      >
        <div className="flex gap-2">
          <PermissionGuard anyPermission={['permission.view', 'super_admin']}>
            <Link href="/permissions">
              <Button variant="secondary" className="gap-2">
                <HiOutlineKey className="w-4 h-4" /> View Permissions
              </Button>
            </Link>
          </PermissionGuard>
          <PermissionGuard anyPermission={['role.create', 'super_admin']}>
            <Button variant="primary" onClick={() => openModal()} className="shadow-lg shadow-primary/20">
              <HiOutlinePlus className="w-5 h-5" /> Create Role
            </Button>
          </PermissionGuard>
        </div>
      </PageHeader>

      {/* Roles Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        roles.length === 0 ? (
          <div className="p-12 text-center glass-card border-2 border-dashed border-border/50">
            <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiOutlineUserGroup className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No Roles Found</h3>
            <p className="text-muted-foreground mb-6">Get started by creating your first user role.</p>

            <PermissionGuard anyPermission={['role.create', 'super_admin']}>
              <Button variant="primary" onClick={() => openModal()}>
                <HiOutlinePlus className="w-4 h-4" /> Create Role
              </Button>
            </PermissionGuard>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Card
                key={role.id}
                className="group hover:ring-2 hover:ring-primary/20 transition-all duration-300 relative border-t-4 border-t-transparent hover:border-t-primary"
              >
                <CardBody className="p-6 flex flex-col h-full">
                  {/* System Role Badge */}
                  {role.is_system && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-purple-500/20">
                        <HiOutlineLockClosed className="w-3 h-3" />
                        System
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-14 h-14 ${role.is_system ? 'bg-purple-500/10 text-purple-600' : 'bg-blue-500/10 text-blue-600'} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <HiOutlineShieldCheck className="w-7 h-7" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{role.name}</h3>
                  <code className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded-md w-fit mb-4 block font-mono border border-border/40">
                    {role.code}
                  </code>
                  <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-3 leading-relaxed">
                    {role.description || 'No description provided.'}
                  </p>

                  <div className="pt-5 border-t border-border/40 mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <span className="bg-muted/50 px-2 py-1 rounded-lg border border-border/30">
                        {role.permission_count || role.permissions?.length || 0} permissions
                      </span>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-200">
                      <PermissionGuard anyPermission={['role.edit', 'super_admin']}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(role)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                          title="Edit role"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </Button>
                      </PermissionGuard>

                      <PermissionGuard anyPermission={['role.delete', 'super_admin']}>
                        {!role.is_system && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteModal({ open: true, role })}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500"
                            title="Delete role"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </Button>
                        )}
                      </PermissionGuard>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingRole ? `Edit ${editingRole.is_system ? 'System' : ''} Role` : 'Create New Role'}
        size="2xl"
      >
        <div className="space-y-6">
          {/* System Role Warning */}
          {editingRole?.is_system && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-start gap-4">
              <HiOutlineLockClosed className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-purple-700 text-sm">System Restricted Role</h4>
                <p className="text-sm text-purple-600/80 mt-1">
                  This is a core system role. You can modify permissions but cannot rename or delete it to prevent system errors.
                </p>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="input-label">Role Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Project Manager"
                className={`input ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                disabled={editingRole?.is_system}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <label className="input-label">Role Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => {
                  setFormData({ ...formData, code: e.target.value });
                  if (errors.code) setErrors({ ...errors, code: null });
                }}
                placeholder="e.g., PROJECT_MANAGER"
                className={`input font-mono text-sm ${errors.code ? 'border-red-500 focus:ring-red-500' : ''}`}
                disabled={editingRole?.is_system}
              />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="input-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[80px] py-3"
              placeholder="Briefly describe the responsibilities..."
              disabled={editingRole?.is_system}
            />
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="input-label mb-0">Permissions</label>
              <button
                type="button"
                onClick={toggleAllPermissions}
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wide"
              >
                {formData.permission_ids.length === permissions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="border border-border/50 rounded-xl overflow-hidden bg-muted/20 custom-scrollbar max-h-[400px] overflow-y-auto">
              {Object.entries(groupedPermissions).sort().map(([module, perms]) => {
                const modulePerms = perms.map(p => p.id);
                const isModuleAllSelected = modulePerms.every(id => formData.permission_ids.includes(id));
                return (
                  <div key={module} className="border-b border-border/40 last:border-0">
                    <div className="bg-muted/40 px-4 py-2 sticky top-0 backdrop-blur-md z-10 flex items-center justify-between border-b border-border/40">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isModuleAllSelected}
                          onChange={() => toggleModulePermissions(perms)}
                          className="rounded border-gray-400 text-primary focus:ring-primary/20 cursor-pointer"
                        />
                        <span className="font-bold text-sm text-foreground capitalize">{module}</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground bg-background/50 px-2 py-0.5 rounded-md border border-border/30">
                        {modulePerms.filter(id => formData.permission_ids.includes(id)).length}/{perms.length}
                      </span>
                    </div>
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-background/30">
                      {perms.map(perm => (
                        <label key={perm.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${formData.permission_ids.includes(perm.id) ? 'bg-primary/5 border-primary/30 shadow-sm' : 'border-transparent hover:bg-muted/40'}`}>
                          <input
                            type="checkbox"
                            checked={formData.permission_ids.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="mt-1 rounded border-gray-400 text-primary focus:ring-primary/20 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <span className={`block text-sm font-medium ${formData.permission_ids.includes(perm.id) ? 'text-primary' : 'text-foreground'}`}>{perm.name}</span>
                            <span className="block text-[10px] text-muted-foreground font-mono mt-0.5 truncate">{perm.code}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={saving} className="min-w-[120px] shadow-lg shadow-primary/20">
              <HiOutlineCheck className="w-4 h-4" />
              {saving ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </div>
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, role: null })}
        onConfirm={confirmDelete}
        title="Delete Role"
        message={
          deleteModal.role?.is_system
            ? `Cannot delete system role "${deleteModal.role?.name}". System roles are protected.`
            : `Are you sure you want to delete "${deleteModal.role?.name}"? This action cannot be undone.`
        }
        loading={deleting}
        confirmDisabled={deleteModal.role?.is_system}
      />
    </div>
  );
}

export default function RolesPage() {
  return (
    <ProtectedRoute anyPermission={['role.view', 'super_admin']}>
      <RolesPageContent />
    </ProtectedRoute>
  );
}
