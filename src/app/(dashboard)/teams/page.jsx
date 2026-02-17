'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardBody, StatusBadge, PageHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import api from '@/lib/api';
import { useAPI } from '@/hooks/useAPI';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
    HiOutlinePlus, HiOutlineSearch, HiOutlineUsers, HiOutlineDesktopComputer,
    HiOutlinePhotograph, HiOutlinePencilAlt, HiOutlineVideoCamera,
    HiOutlineColorSwatch, HiOutlineUserGroup, HiOutlineSpeakerphone,
    HiOutlineCurrencyDollar, HiOutlineSupport, HiOutlineRefresh,
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
    'web': 'bg-blue-500/10 text-blue-600',
    'social_media': 'bg-purple-500/10 text-purple-600',
    'content': 'bg-emerald-500/10 text-emerald-600',
    'video': 'bg-red-500/10 text-red-600',
    'design': 'bg-pink-500/10 text-pink-600',
    'hr': 'bg-orange-500/10 text-orange-600',
    'marketing': 'bg-violet-500/10 text-violet-600',
    'sales': 'bg-green-500/10 text-green-600',
    'support': 'bg-cyan-500/10 text-cyan-600',
    'other': 'bg-muted text-muted-foreground'
};

const formatTeamType = (type) => {
    if (!type) return 'Other';
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function TeamsPage() {
    const { user } = useAuth();
    const toast = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, team: null });
    const [deleting, setDeleting] = useState(false);

    // SWR — Teams list (cached, instant back-nav)
    const { data: teamsData, isLoading: loading, mutate: refreshTeams } = useAPI('/teams');
    const teams = useMemo(() => teamsData?.items || teamsData || [], [teamsData]);

    // Client-side search filter (memoized)
    const filteredTeams = useMemo(() => {
        if (!searchTerm) return teams;
        const term = searchTerm.toLowerCase();
        return teams.filter(team =>
            team.name?.toLowerCase().includes(term) ||
            team.code?.toLowerCase().includes(term) ||
            team.team_type?.toLowerCase().includes(term)
        );
    }, [teams, searchTerm]);

    const confirmDelete = useCallback(async () => {
        if (!deleteModal.team) return;
        setDeleting(true);
        try {
            await api.delete(`/teams/${deleteModal.team.id}`);
            toast.success('Team deleted successfully');
            setDeleteModal({ open: false, team: null });
            refreshTeams();
        } catch (error) {
            toast.error(error.response?.data?.detail || error.message || 'Failed to delete team');
        } finally {
            setDeleting(false);
        }
    }, [deleteModal.team, toast, refreshTeams]);

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <PageHeader
                title="Teams"
                description="Manage cross-functional teams and squads"
            >
                <div className="flex gap-2">
                    <button
                        onClick={() => refreshTeams()}
                        className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Refresh"
                    >
                        <HiOutlineRefresh className="w-5 h-5" />
                    </button>
                    <Link href="/teams/new">
                        <Button variant="primary" className="shadow-lg shadow-primary/20">
                            <HiOutlinePlus className="w-5 h-5" />
                            Create Team
                        </Button>
                    </Link>
                </div>
            </PageHeader>

            {/* Search */}
            <div className="bg-card rounded-xl border border-border/50 p-4">
                <div className="relative max-w-md">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search teams..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                </div>
            </div>

            {/* Result count */}
            {!loading && filteredTeams.length > 0 && (
                <p className="text-sm text-muted-foreground">
                    {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''}
                    {searchTerm && ` matching "${searchTerm}"`}
                </p>
            )}

            {/* Teams Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Card key={i}>
                            <CardBody className="p-5 space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-muted/30 animate-pulse" />
                                    <div className="flex-1">
                                        <div className="h-5 w-3/4 bg-muted/30 animate-pulse rounded mb-2" />
                                        <div className="h-3 w-1/2 bg-muted/20 animate-pulse rounded" />
                                    </div>
                                </div>
                                <div className="border-t border-border/30 pt-3">
                                    <div className="flex justify-between">
                                        <div className="h-4 w-16 bg-muted/20 animate-pulse rounded" />
                                        <div className="h-4 w-24 bg-muted/20 animate-pulse rounded" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            ) : filteredTeams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-2xl border-2 border-dashed border-border/50">
                    <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                        <HiOutlineUsers className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No Teams Found</h3>
                    <p className="text-muted-foreground mb-6">
                        {searchTerm ? 'No teams found matching your search.' : 'Create your first team to get started.'}
                    </p>
                    {!searchTerm && (
                        <Link href="/teams/new">
                            <Button variant="primary">Create Team</Button>
                        </Link>
                    )}
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
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
                                                {formatTeamType(team.team_type)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-end border-t border-border/30 pt-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Members</p>
                                                <div className="flex items-center gap-2">
                                                    <HiOutlineUserGroup className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-semibold text-foreground">{team.member_count}</span>
                                                </div>
                                            </div>

                                            {team.team_lead_name && (
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground mb-1">Team Lead</p>
                                                    <div className="flex items-center gap-1 justify-end">
                                                        <span className="text-sm font-medium text-foreground truncate max-w-[120px]">{team.team_lead_name}</span>
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
