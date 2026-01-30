
'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatCard, StatusBadge, PageHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import {
  HiOutlinePlus, HiOutlineViewGrid, HiOutlineViewList, HiOutlineBriefcase,
  HiOutlineChartBar, HiOutlineCheckCircle, HiOutlinePause, HiOutlinePlay,
  HiOutlineEye, HiOutlinePencil, HiOutlineTrash
} from 'react-icons/hi';

// Memoized Project Card Component
const ProjectCard = memo(({ project }) => (
  <Link href={`/projects/${project.id}`} className="block group">
    <Card className="h-full hover:ring-2 hover:ring-primary/20">
      <CardBody>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <HiOutlineBriefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
              <p className="text-xs text-muted-foreground">{project.code}</p>
            </div>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Client: {project.client || project.client_name || 'Internal'}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground font-medium">Progress</span>
            <span className="font-bold text-foreground">{project.progress || 0}%</span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all"
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between text-sm pt-3 border-t border-border/30">
          <span className="text-muted-foreground">Budget</span>
          <span className="font-semibold text-foreground">${project.budget?.toLocaleString() || '0'}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-muted-foreground">Due</span>
          <span className="text-foreground">{project.due || project.end_date || '-'}</span>
        </div>
      </CardBody>
    </Card>
  </Link>
));

ProjectCard.displayName = 'ProjectCard';

export default function ProjectsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [deleteModal, setDeleteModal] = useState({ open: false, project: null });
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, onHold: 0 });

  // Memoize fetch functions with useCallback
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/project-overview');
      const byStatus = response.by_status || {};
      setStats({
        total: response.total || 0,
        active: byStatus['in_progress'] || 0,
        completed: byStatus['completed'] || 0,
        onHold: byStatus['on_hold'] || 0
      });
    } catch (error) {
      console.error('Error fetching project stats:', error);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.items || response || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, [fetchProjects, fetchStats]);

  const handleDelete = useCallback((project) => {
    setDeleteModal({ open: true, project });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteModal.project) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${deleteModal.project.id}`);
      toast.success('Project deleted successfully');
      setDeleteModal({ open: false, project: null });
      fetchProjects();
      fetchStats();
    } catch (error) {
      toast.error(error.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  }, [deleteModal.project, toast, fetchProjects, fetchStats]);

  const isAdmin = ['admin', 'manager', 'super_admin'].includes(user?.role?.code?.toLowerCase());

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <PageHeader
        title="Projects"
        description="Manage your projects and track progress"
      >
        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-border/50 shadow-sm">
            <button
              className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${view === 'grid' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
              onClick={() => setView('grid')}
            >
              <HiOutlineViewGrid className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${view === 'list' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
              onClick={() => setView('list')}
            >
              <HiOutlineViewList className="w-5 h-5" />
            </button>
          </div>
          {isAdmin && (
            <Link href="/projects/new">
              <Button variant="primary" className="shadow-lg shadow-primary/20">
                <HiOutlinePlus className="w-5 h-5" /> New Project
              </Button>
            </Link>
          )}
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<HiOutlineChartBar className="w-6 h-6" />} iconColor="blue" value={stats.total} label="Total Projects" />
        <StatCard icon={<HiOutlinePlay className="w-6 h-6" />} iconColor="green" value={stats.active} label="In Progress" />
        <StatCard icon={<HiOutlineCheckCircle className="w-6 h-6" />} iconColor="purple" value={stats.completed} label="Completed" />
        <StatCard icon={<HiOutlinePause className="w-6 h-6" />} iconColor="orange" value={stats.onHold} label="On Hold" />
      </div>

      {/* Project Grid/List */}
      {
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardBody className="space-y-3">
                  <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted/20 rounded animate-pulse" />
                  <div className="h-2 w-full bg-muted/20 rounded animate-pulse" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center p-12 glass-card border-2 border-dashed border-border/50">
            <HiOutlineBriefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">No Projects Found</h3>
            <p className="text-muted-foreground mb-6">Create your first project to get started.</p>
            {isAdmin && <Link href="/projects/new"><Button variant="primary">Create Project</Button></Link>}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="table-container border-0 bg-transparent">
              <table className="table">
                <thead>
                  <tr>
                    <th className="w-[30%]">Project</th>
                    <th>Client</th>
                    <th>Progress</th>
                    <th>Budget</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="group hover:bg-muted/20 transition-colors">
                      <td>
                        <Link href={`/projects/${project.id}`} className="block">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{project.name}</span>
                          <p className="text-xs text-muted-foreground">{project.code}</p>
                        </Link>
                      </td>
                      <td className="text-muted-foreground">{project.client || 'Internal'}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted/30 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${project.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{project.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="font-medium">${project.budget?.toLocaleString() || '0'}</td>
                      <td className="text-muted-foreground">{project.due || project.end_date || '-'}</td>
                      <td><StatusBadge status={project.status} /></td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link href={`/projects/${project.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><HiOutlineEye className="w-4 h-4" /></Button>
                          </Link>
                          {isAdmin && (
                            <>
                              <Link href={`/projects/${project.id}/edit`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><HiOutlinePencil className="w-4 h-4" /></Button>
                              </Link>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600" onClick={(e) => { e.preventDefault(); handleDelete(project); }}>
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
            </div>
          </Card>
        )
      }

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, project: null })}
        onConfirm={confirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteModal.project?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div >
  );
}
