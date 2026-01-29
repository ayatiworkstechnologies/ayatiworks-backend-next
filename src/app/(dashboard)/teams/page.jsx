'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardBody, StatusBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
    HiOutlinePlus, HiOutlineSearch, HiOutlineUsers, HiOutlineDesktopComputer,
    HiOutlinePhotograph, HiOutlinePencilAlt, HiOutlineVideoCamera,
    HiOutlineColorSwatch, HiOutlineUserGroup, HiOutlineSpeakerphone,
    HiOutlineCurrencyDollar, HiOutlineSupport, HiOutlineDotsVertical,
    HiOutlineTrash, HiOutlinePencil
} from 'react-icons/hi';

// Team type icons mapping
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

const formatTeamType = (type) => {
    if (!type) return 'Other';
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function TeamsPage() {
    const { user } = useAuth();
    const toast = useToast();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, team: null });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (user?.company_id) {
            fetchTeams();
        }
    }, [user]);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const response = await api.get('/teams', {
                params: { company_id: user.company_id }
            });
            setTeams(response.items || response || []);
        } catch (error) {
            console.error('Failed to fetch teams:', error);
            toast.error('Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal.team) return;
        setDeleting(true);
        try {
            await api.delete(`/teams/${deleteModal.team.id}`);
            toast.success('Team deleted successfully');
            setDeleteModal({ open: false, team: null });
            fetchTeams();
        } catch (error) {
            toast.error(error.response?.data?.detail || error.message || 'Failed to delete team');
        } finally {
            setDeleting(false);
        }
    };

    // Filter teams
    const filteredTeams = teams.filter(team =>
        team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.team_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Teams</h1>
                    <p className="text-muted-foreground mt-1">Manage cross-functional teams and squads</p>
                </div>
                <Link href="/teams/new">
                    <Button variant="primary" className="shadow-lg shadow-primary/20">
                        <HiOutlinePlus className="w-5 h-5" />
                        Create Team
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <Card>
                <CardBody className="p-4">
                    <div className="relative max-w-md">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search teams..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10 bg-background"
                        />
                    </div>
                </CardBody>
            </Card>

            {/* Teams Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i}><CardBody className="h-48 bg-muted/30 animate-pulse" /></Card>
                    ))}
                </div>
            ) : filteredTeams.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                    <HiOutlineUsers className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>{searchTerm ? 'No teams found matching your search.' : 'No teams found. Create one to get started.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeams.map((team) => {
                        const Icon = TEAM_TYPE_ICONS[team.team_type] || TEAM_TYPE_ICONS['other'];
                        const colorClass = TEAM_TYPE_COLORS[team.team_type] || TEAM_TYPE_COLORS['other'];

                        return (
                            <Card key={team.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary">
                                <CardBody className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/teams/${team.id}/edit`}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <HiOutlinePencil className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600"
                                                onClick={() => setDeleteModal({ open: true, team })}
                                            >
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <Link href={`/teams/${team.id}`} className="block">
                                        <h3 className="text-xl font-bold mb-1 hover:text-primary transition-colors">{team.name}</h3>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{team.code}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass.replace('bg-', 'bg-opacity-20 ')}`}>
                                                {formatTeamType(team.team_type)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-end border-t pt-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Members</p>
                                                <div className="flex items-center gap-2">
                                                    <HiOutlineUserGroup className="w-4 h-4 text-gray-400" />
                                                    <span className="font-semibold">{team.member_count}</span>
                                                </div>
                                            </div>

                                            {team.team_lead_name && (
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground mb-1">Team Lead</p>
                                                    <div className="flex items-center gap-1 justify-end">
                                                        <span className="text-sm font-medium truncat max-w-[120px]">{team.team_lead_name}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </CardBody>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation */}
            <DeleteConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, team: null })}
                onConfirm={confirmDelete}
                title="Delete Team"
                message={`Are you sure you want to delete "${deleteModal.team?.name}"? This action cannot be undone.`}
                loading={deleting}
            />
        </div>
    );
}
