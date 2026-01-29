'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatusBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
    HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash, HiOutlineUsers,
    HiOutlineUserAdd, HiOutlineUserRemove, HiOutlineDesktopComputer,
    HiOutlinePhotograph, HiOutlinePencilAlt, HiOutlineVideoCamera,
    HiOutlineColorSwatch, HiOutlineUserGroup, HiOutlineSpeakerphone,
    HiOutlineCurrencyDollar, HiOutlineSupport, HiOutlineCheck
} from 'react-icons/hi';

// Reuse icons and colors
const TEAM_TYPE_ICONS = {
    'web': HiOutlineDesktopComputer,
    'social_media': HiOutlinePhotograph,
    'content': HiOutlinePencilAlt,
    'video': HiOutlineVideoCamera,
    'design': HiOutlineColorSwatch,
    'hr': HiOutlineUserGroup,
    'marketing': HiOutlineSpeakerphone,
    'sales': HiOutlineCurrencyDollar,
    'support': HiOutlineSupport,
    'other': HiOutlineUsers
};

const TEAM_TYPE_COLORS = {
    'web': 'bg-blue-100 text-blue-700',
    'social_media': 'bg-purple-100 text-purple-700',
    'content': 'bg-emerald-100 text-emerald-700',
    'video': 'bg-red-100 text-red-700',
    'design': 'bg-pink-100 text-pink-700',
    'hr': 'bg-orange-100 text-orange-700',
    'marketing': 'bg-violet-100 text-violet-700',
    'sales': 'bg-green-100 text-green-700',
    'support': 'bg-cyan-100 text-cyan-700',
    'other': 'bg-gray-100 text-gray-700'
};

export default function TeamDetailPage() {
    const params = useParams();
    const router = useRouter();
    const toast = useToast();
    const [team, setTeam] = useState(null);
    const [employees, setEmployees] = useState([]); // For add member dropdown
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Add Member Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [addingMember, setAddingMember] = useState(false);
    const [memberForm, setMemberForm] = useState({ employee_id: '', role: '', joined_date: new Date().toISOString().split('T')[0] });

    // Remove Member Modal State
    const [removeModal, setRemoveModal] = useState({ open: false, member: null });

    useEffect(() => {
        fetchTeam();
        fetchEmployees();
    }, [params.id]);

    const fetchTeam = async () => {
        try {
            const data = await api.get(`/teams/${params.id}`);
            setTeam(data);
        } catch (error) {
            console.error('Error fetching team:', error);
            toast.error('Failed to load team details');
            router.push('/teams');
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            // Fetch all employees to populate dropdown
            // In real app maybe filter out existing members
            const response = await api.get('/employees?page_size=100');
            setEmployees(response.items || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/teams/${params.id}`);
            toast.success('Team deleted successfully');
            router.push('/teams');
        } catch (error) {
            toast.error(error.message || 'Failed to delete team');
        } finally {
            setDeleting(false);
            setDeleteModal(false);
        }
    };

    const handleAddMember = async () => {
        if (!memberForm.employee_id) {
            toast.error('Please select an employee');
            return;
        }
        setAddingMember(true);
        try {
            await api.post(`/teams/${params.id}/members`, {
                employee_id: parseInt(memberForm.employee_id),
                role: memberForm.role || null,
                joined_date: memberForm.joined_date
            });
            toast.success('Member added successfully');
            setShowAddModal(false);
            setMemberForm({ employee_id: '', role: '', joined_date: new Date().toISOString().split('T')[0] });
            fetchTeam(); // Refresh
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to add member');
        } finally {
            setAddingMember(false);
        }
    };

    const handleRemoveMember = async () => {
        if (!removeModal.member) return;
        try {
            await api.delete(`/teams/${params.id}/members/${removeModal.member.employee_id}`);
            toast.success('Member removed successfully');
            setRemoveModal({ open: false, member: null });
            fetchTeam(); // Refresh
        } catch (error) {
            toast.error('Failed to remove member');
        }
    };

    if (loading) {
        return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;
    }

    if (!team) return <div>Team not found</div>;

    const Icon = TEAM_TYPE_ICONS[team.team_type] || TEAM_TYPE_ICONS['other'];
    const colorClass = TEAM_TYPE_COLORS[team.team_type] || TEAM_TYPE_COLORS['other'];

    // Filter out employees already in team (simple check)
    const existingMemberIds = new Set((team.members || []).map(m => m.employee_id));
    const availableEmployees = employees.filter(e => !existingMemberIds.has(e.id));

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/teams" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-2">
                        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Teams
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${colorClass}`}>
                            <Icon className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{team.name}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded text-muted-foreground">{team.code}</span>
                                <StatusBadge status={team.is_active ? 'active' : 'inactive'} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/teams/${params.id}/edit`}>
                        <Button variant="secondary">
                            <HiOutlinePencil className="w-4 h-4" /> Edit Team
                        </Button>
                    </Link>
                    <Button variant="danger" onClick={() => setDeleteModal(true)}>
                        <HiOutlineTrash className="w-4 h-4" /> Delete
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card>
                    <CardBody className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Members</p>
                        <p className="text-2xl font-bold">{team.member_count}</p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Max Size</p>
                        <p className="text-2xl font-bold">{team.max_members || 'Unlimited'}</p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Team Lead</p>
                        <p className="text-md font-medium truncate" title={team.team_lead_name}>
                            {team.team_lead_name || 'Unassigned'}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Department</p>
                        <p className="text-md font-medium truncate" title={team.department_name}>
                            {team.department_name || 'None'}
                        </p>
                    </CardBody>
                </Card>
            </div>

            {/* Description */}
            {team.description && (
                <Card>
                    <CardHeader title="About this Team" />
                    <CardBody>
                        <p className="text-gray-600 whitespace-pre-line">{team.description}</p>
                    </CardBody>
                </Card>
            )}

            {/* Members */}
            <Card>
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-lg font-semibold">Team Members</h2>
                    <Button onClick={() => setShowAddModal(true)} size="sm">
                        <HiOutlineUserAdd className="w-4 h-4" /> Add Member
                    </Button>
                </div>
                <div className="table-container border-0">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Role in Team</th>
                                <th>Department</th>
                                <th>Joined</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(team.members || []).length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-muted-foreground">
                                        No members in this team yet.
                                    </td>
                                </tr>
                            ) : (
                                team.members.map((member) => (
                                    <tr key={member.id} className="group hover:bg-muted/20">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {member.employee_name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{member.employee_name}</p>
                                                    <p className="text-xs text-muted-foreground">{member.designation_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {member.role ? (
                                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                                                    {member.role}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="text-sm text-muted-foreground">{member.department_name}</td>
                                        <td className="text-sm text-muted-foreground">{new Date(member.joined_date).toLocaleDateString()}</td>
                                        <td className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => setRemoveModal({ open: true, member })}
                                                title="Remove from team"
                                            >
                                                <HiOutlineUserRemove className="w-5 h-5" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Member Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add Team Member"
                footer={(
                    <>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button onClick={handleAddMember} loading={addingMember}>
                            <HiOutlineCheck className="w-4 h-4" /> Add Member
                        </Button>
                    </>
                )}
            >
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="input-label">Select Employee</label>
                        <select
                            className="input"
                            value={memberForm.employee_id}
                            onChange={(e) => setMemberForm({ ...memberForm, employee_id: e.target.value })}
                        >
                            <option value="">Select an employee...</option>
                            {availableEmployees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.first_name} {emp.last_name} ({emp.employee_id})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">
                            Only employees not already in this team are shown.
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="input-label">Role in Team (Optional)</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g. Lead Developer, Content Writer"
                            value={memberForm.role}
                            onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="input-label">Joined Date</label>
                        <input
                            type="date"
                            className="input"
                            value={memberForm.joined_date}
                            onChange={(e) => setMemberForm({ ...memberForm, joined_date: e.target.value })}
                        />
                    </div>
                </div>
            </Modal>

            {/* Confirm Remove Modal */}
            <DeleteConfirmModal
                isOpen={removeModal.open}
                onClose={() => setRemoveModal({ open: false, member: null })}
                onConfirm={handleRemoveMember}
                title="Remove Team Member"
                message={`Are you sure you want to remove "${removeModal.member?.employee_name}" from this team?`}
            />

            {/* Confirm Delete Team Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Team"
                message={`Are you sure you want to delete "${team.name}"? This action cannot be undone.`}
                loading={deleting}
            />
        </div>
    );
}
