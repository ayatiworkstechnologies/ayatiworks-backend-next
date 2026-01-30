'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PermissionGuard from '@/components/PermissionGuard';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/ui/Modal';
import { Card, CardBody, StatCard, StatusBadge, Avatar } from '@/components/ui';
import Button from '@/components/ui/Button';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import {
    HiOutlineUserGroup, HiOutlineMail, HiOutlineShieldCheck, HiOutlineUser,
    HiOutlinePencil, HiOutlineTrash, HiOutlineUserAdd, HiOutlineCheckCircle,
    HiOutlineXCircle, HiOutlinePhone, HiOutlineSearch
} from 'react-icons/hi';

function UsersPageContent() {
    const toast = useToast();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
    const [deleting, setDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        role_id: null
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [usersRes, rolesRes] = await Promise.all([
                api.get('/users'),
                api.get('/roles').catch(() => ({ items: [] }))
            ]);
            setUsers(Array.isArray(usersRes) ? usersRes : []);
            setRoles(Array.isArray(rolesRes) ? rolesRes : rolesRes.items || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const openCreateModal = useCallback(() => {
        setEditingUser(null);
        setFormData({
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            phone: '',
            role_id: null
        });
        setShowModal(true);
    }, []);

    const openEditModal = useCallback((user) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name || '',
            phone: user.phone || '',
            role_id: user.role_id,
            password: '' // Don't include password when editing
        });
        setShowModal(true);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.first_name) {
            toast.error('Email and first name are required');
            return;
        }

        if (!editingUser && !formData.password) {
            toast.error('Password is required for new users');
            return;
        }

        setSaving(true);
        try {
            const payload = { ...formData };

            // Remove password if editing and not changing it
            if (editingUser && !payload.password) {
                delete payload.password;
            }

            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, payload);
                toast.success('User updated successfully');
            } else {
                await api.post('/users', payload);
                toast.success('User created successfully');
            }

            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error.response?.data?.detail || 'Failed to save user');
        } finally {
            setSaving(false);
        }
    }, [formData, editingUser, toast, fetchData]);

    const handleDelete = useCallback(async () => {
        if (!deleteModal.user) return;

        setDeleting(true);
        try {
            await api.delete(`/users/${deleteModal.user.id}`);
            toast.success('User deleted successfully');
            setDeleteModal({ open: false, user: null });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to delete user');
        } finally {
            setDeleting(false);
        }
    }, [deleteModal.user, toast, fetchData]);

    const toggleUserStatus = useCallback(async (user) => {
        try {
            const endpoint = user.is_active ? 'deactivate' : 'activate';
            await api.patch(`/users/${user.id}/${endpoint}`);
            toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update user status');
        }
    }, [toast, fetchData]);

    const verifyUser = useCallback(async (userId) => {
        try {
            await api.patch(`/users/${userId}/verify`);
            toast.success('User verified successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to verify user');
        }
    }, [toast, fetchData]);

    // Filter users based on search
    const filteredUsers = users.filter(user =>
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const stats = {
        total: users.length,
        active: users.filter(u => u.is_active).length,
        withRole: users.filter(u => u.role_id).length,
        verified: users.filter(u => u.is_verified).length
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
                    <p className="text-muted-foreground mt-1">Manage system access and user roles</p>
                </div>
                <PermissionGuard anyPermission={['user.create', 'super_admin']}>
                    <Button variant="primary" onClick={openCreateModal} className="shadow-lg shadow-primary/20">
                        <HiOutlineUserAdd className="w-5 h-5" />
                        Create User
                    </Button>
                </PermissionGuard>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<HiOutlineUserGroup className="w-6 h-6" />} iconColor="blue" value={stats.total} label="Total Users" />
                <StatCard icon={<HiOutlineCheckCircle className="w-6 h-6" />} iconColor="green" value={stats.active} label="Active Users" />
                <StatCard icon={<HiOutlineShieldCheck className="w-6 h-6" />} iconColor="purple" value={stats.withRole} label="Assigned Roles" />
                <StatCard icon={<HiOutlineUser className="w-6 h-6" />} iconColor="orange" value={stats.verified} label="Verified Accounts" />
            </div>

            {/* Search and Table */}
            <Card className="overflow-hidden border-0 shadow-xl">
                <div className="p-4 border-b border-border/10 bg-muted/5">
                    <div className="relative max-w-sm">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10 bg-background"
                        />
                    </div>
                </div>

                <div className="table-container border-0 bg-transparent">
                    {loading ? (
                        <div className="p-12 text-center space-y-4">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-muted-foreground">Loading users...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <HiOutlineUserGroup className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No users found matching your search.</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="w-[30%]">User</th>
                                    <th>Contact</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Verification</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-muted/20 transition-colors">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <Avatar name={`${user.first_name} ${user.last_name}`} size="md" className="ring-2 ring-background" />
                                                <div>
                                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                        {user.first_name} {user.last_name}
                                                    </span>
                                                    <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col gap-1 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <HiOutlineMail className="w-4 h-4" />
                                                    <span>{user.email}</span>
                                                </div>
                                                {user.phone && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <HiOutlinePhone className="w-4 h-4" />
                                                        <span>{user.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {user.role ? (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <HiOutlineShieldCheck className="w-4 h-4 text-purple-600" />
                                                    <span className="font-medium text-foreground">{user.role.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">No role assigned</span>
                                            )}
                                        </td>
                                        <td>
                                            <div onClick={() => toggleUserStatus(user)} className="cursor-pointer">
                                                <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
                                            </div>
                                        </td>
                                        <td>
                                            {user.is_verified ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">
                                                    <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Verified
                                                </span>
                                            ) : (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-6 text-xs"
                                                    onClick={() => verifyUser(user.id)}
                                                >
                                                    Verify Now
                                                </Button>
                                            )}
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <PermissionGuard anyPermission={['user.edit', 'super_admin']}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => openEditModal(user)}
                                                    >
                                                        <HiOutlinePencil className="w-4 h-4" />
                                                    </Button>
                                                </PermissionGuard>
                                                <PermissionGuard anyPermission={['user.delete', 'super_admin']}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600"
                                                        onClick={() => setDeleteModal({ open: true, user })}
                                                    >
                                                        <HiOutlineTrash className="w-4 h-4" />
                                                    </Button>
                                                </PermissionGuard>
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
                onClose={() => setShowModal(false)}
                title={editingUser ? 'Edit User' : 'Create New User'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="input-label">First Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                className="input"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="input-label">Last Name</label>
                            <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                className="input"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="input-label">Email <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="input-label">Phone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="input"
                        />
                    </div>

                    {!editingUser && (
                        <div className="space-y-1">
                            <label className="input-label">Password <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input"
                                required={!editingUser}
                                minLength={8}
                            />
                            <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                        </div>
                    )}

                    {editingUser && (
                        <div className="space-y-1">
                            <label className="input-label">New Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input"
                                minLength={8}
                                placeholder="Leave blank to keep current"
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="input-label">Role</label>
                        <select
                            value={formData.role_id || ''}
                            onChange={(e) => setFormData({ ...formData, role_id: e.target.value ? parseInt(e.target.value) : null })}
                            className="input"
                        >
                            <option value="">No Role Assigned</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowModal(false)}
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
                            {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, user: null })}
                onConfirm={handleDelete}
                title="Delete User"
                message={`Are you sure you want to delete ${deleteModal.user?.first_name} ${deleteModal.user?.last_name}? This action cannot be undone.`}
                loading={deleting}
            />
        </div>
    );
}

export default function UsersPage() {
    return (
        <ProtectedRoute anyPermission={['user.view', 'super_admin']}>
            <UsersPageContent />
        </ProtectedRoute>
    );
}
