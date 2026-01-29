'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatCard, StatusBadge, Avatar } from '@/components/ui';
import Button from '@/components/ui/Button';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import Modal from '@/components/ui/Modal';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import {
  HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus,
  HiOutlineChartBar, HiOutlineCurrencyDollar, HiOutlineCalendar, HiOutlineClock,
  HiOutlineClipboardList, HiOutlineFlag, HiOutlineUserGroup, HiOutlineDocumentText,
  HiOutlineCheckCircle, HiOutlineOfficeBuilding, HiOutlineExclamationCircle,
  HiOutlineViewGrid, HiOutlineViewList
} from 'react-icons/hi';

const statusColumns = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-500', icon: HiOutlineClipboardList },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500', icon: HiOutlineClock },
  { id: 'in_review', label: 'In Review', color: 'bg-amber-500', icon: HiOutlineExclamationCircle },
  { id: 'done', label: 'Done', color: 'bg-emerald-500', icon: HiOutlineCheckCircle },
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [taskView, setTaskView] = useState('board');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [milestoneModal, setMilestoneModal] = useState(false);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [milestoneSubmitting, setMilestoneSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [deleteTaskModal, setDeleteTaskModal] = useState({ open: false, task: null });
  const [deleteMilestoneModal, setDeleteMilestoneModal] = useState({ open: false, milestone: null });
  const [timeEntries, setTimeEntries] = useState([]);
  const [timeEntryModal, setTimeEntryModal] = useState(false);
  const [timeEntrySubmitting, setTimeEntrySubmitting] = useState(false);
  const [timeEntryForm, setTimeEntryForm] = useState({
    task_id: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    description: ''
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assignee_id: '',
    due_date: '',
    estimated_hours: ''
  });
  const [memberForm, setMemberForm] = useState({ employee_id: '', role: 'member' });
  const [milestoneForm, setMilestoneForm] = useState({
    name: '',
    description: '',
    due_date: '',
    amount: '',
    status: 'pending'
  });

  const isProjectMember = useMemo(() => {
    if (!user || !user.employee_id || teamMembers.length === 0) return false;
    return teamMembers.some(m => m.employee_id === user.employee_id);
  }, [user, teamMembers]);

  const canManageProject = useMemo(() => {
    const roleCode = user?.role?.code?.toLowerCase() || '';
    const roleName = user?.role?.name?.toLowerCase() || '';
    const isAdmin = ['admin', 'super_admin', 'manager'].includes(roleCode) || ['admin', 'super admin', 'manager'].includes(roleName);

    // Also allow if user is the project manager
    const isProjectManager = project?.manager_id && user?.employee_id && project.manager_id === user.employee_id;

    return isAdmin || isProjectManager;
  }, [user, project]);


  // Fetch project details
  const fetchProject = useCallback(async () => {
    try {
      const data = await api.get(`/projects/${id}`);
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast?.error?.('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  // Fetch project tasks
  const fetchTasks = useCallback(async () => {
    try {
      const response = await api.get(`/tasks?project_id=${id}`);
      setTasks(response?.items || response || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  }, [id]);

  // Fetch employees for dropdowns
  const fetchEmployees = useCallback(async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response?.items || response || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }, []);

  // Fetch project members
  const fetchMembers = useCallback(async () => {
    try {
      const response = await api.get(`/projects/${id}/members`);
      setTeamMembers(response || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  }, [id]);

  // Fetch project milestones
  const fetchMilestones = useCallback(async () => {
    try {
      const response = await api.get(`/milestones?project_id=${id}`);
      setMilestones(response || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  }, [id]);

  // Fetch time entries
  const fetchTimeEntries = useCallback(async () => {
    try {
      const response = await api.get(`/time-entries?project_id=${id}`);
      setTimeEntries(response?.items || response || []);
    } catch (error) {
      console.error('Error fetching time entries:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
    fetchTasks();
    fetchEmployees();
    fetchMembers();
    fetchMilestones();
    fetchTimeEntries();
  }, [fetchProject, fetchTasks, fetchEmployees, fetchMembers, fetchMilestones, fetchTimeEntries]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await api.delete(`/projects/${id}`);
      toast?.success?.('Project deleted successfully');
      router.push('/projects');
    } catch (error) {
      toast?.error?.(error.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  }, [id, toast, router]);

  const handleOpenTaskModal = useCallback(() => {
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      assignee_id: '',
      due_date: '',
      estimated_hours: ''
    });
    setTaskModal(true);
  }, []);

  const handleOpenMemberModal = useCallback(() => {
    setMemberForm({ employee_id: '', role: 'member' });
    setMemberModal(true);
  }, []);

  const handleTaskSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast?.error?.('Task title is required');
      return;
    }

    setTaskSubmitting(true);
    try {
      const submitData = {
        title: taskForm.title.trim(),
        description: taskForm.description?.trim() || null,
        priority: taskForm.priority,
        project_id: parseInt(id, 10),
      };

      if (taskForm.assignee_id) {
        submitData.assignee_id = parseInt(taskForm.assignee_id, 10);
      }
      if (taskForm.due_date) {
        submitData.due_date = taskForm.due_date;
      }
      if (taskForm.estimated_hours) {
        submitData.estimated_hours = parseFloat(taskForm.estimated_hours);
      }

      await api.post('/tasks', submitData);
      toast?.success?.('Task created successfully');
      setTaskModal(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      toast?.error?.(error.message || 'Failed to save task');
    } finally {
      setTaskSubmitting(false);
    }
  }, [id, taskForm, editingTask, toast, fetchTasks]);

  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      assignee_id: task.assignee_id || '',
      due_date: task.due_date || '',
      estimated_hours: task.estimated_hours || ''
    });
    setTaskModal(true);
  }, []);

  const handleUpdateTask = useCallback(async () => {
    if (!taskForm.title.trim() || !editingTask) {
      toast?.error?.('Task title is required');
      return;
    }

    setTaskSubmitting(true);
    try {
      const submitData = {
        title: taskForm.title.trim(),
        description: taskForm.description?.trim() || null,
        priority: taskForm.priority,
        status: taskForm.status,
      };

      if (taskForm.assignee_id) {
        submitData.assignee_id = parseInt(taskForm.assignee_id, 10);
      }
      if (taskForm.due_date) {
        submitData.due_date = taskForm.due_date;
      }
      if (taskForm.estimated_hours) {
        submitData.estimated_hours = parseFloat(taskForm.estimated_hours);
      }

      await api.put(`/tasks/${editingTask.id}`, submitData);
      toast?.success?.('Task updated successfully');
      setTaskModal(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      toast?.error?.(error.message || 'Failed to update task');
    } finally {
      setTaskSubmitting(false);
    }
  }, [taskForm, editingTask, toast, fetchTasks]);

  const handleDeleteTask = useCallback(async () => {
    if (!deleteTaskModal.task) return;

    try {
      await api.delete(`/tasks/${deleteTaskModal.task.id}`);
      toast?.success?.('Task deleted successfully');
      setDeleteTaskModal({ open: false, task: null });
      fetchTasks();
    } catch (error) {
      toast?.error?.(error.message || 'Failed to delete task');
    }
  }, [deleteTaskModal.task, toast, fetchTasks]);

  const handleOpenMilestoneModal = useCallback(() => {
    setMilestoneForm({
      name: '',
      description: '',
      due_date: '',
      amount: '',
      status: 'pending'
    });
    setMilestoneModal(true);
  }, []);

  const handleMilestoneSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!milestoneForm.name.trim()) {
      toast?.error?.('Milestone name is required');
      return;
    }

    setMilestoneSubmitting(true);
    try {
      const submitData = {
        name: milestoneForm.name.trim(),
        description: milestoneForm.description?.trim() || null,
        project_id: parseInt(id, 10),
        status: milestoneForm.status,
      };

      if (milestoneForm.due_date) {
        submitData.due_date = milestoneForm.due_date;
      }
      if (milestoneForm.amount) {
        submitData.amount = parseFloat(milestoneForm.amount);
      }

      await api.post('/milestones', submitData);
      toast?.success?.('Milestone created successfully');
      setMilestoneModal(false);
      setEditingMilestone(null);
      fetchMilestones();
    } catch (error) {
      toast?.error?.(error.message || 'Failed to create milestone');
    } finally {
      setMilestoneSubmitting(false);
    }
  }, [id, milestoneForm, toast, fetchMilestones]);

  const handleEditMilestone = useCallback((milestone) => {
    setEditingMilestone(milestone);
    setMilestoneForm({
      name: milestone.name || '',
      description: milestone.description || '',
      due_date: milestone.due_date || '',
      amount: milestone.amount || '',
      status: milestone.status || 'pending'
    });
    setMilestoneModal(true);
  }, []);

  const handleUpdateMilestone = useCallback(async () => {
    if (!milestoneForm.name.trim() || !editingMilestone) {
      toast?.error?.('Milestone name is required');
      return;
    }

    setMilestoneSubmitting(true);
    try {
      const submitData = {
        name: milestoneForm.name.trim(),
        description: milestoneForm.description?.trim() || null,
        status: milestoneForm.status,
      };

      if (milestoneForm.due_date) {
        submitData.due_date = milestoneForm.due_date;
      }
      if (milestoneForm.amount) {
        submitData.amount = parseFloat(milestoneForm.amount);
      }

      await api.put(`/milestones/${editingMilestone.id}`, submitData);
      toast?.success?.('Milestone updated successfully');
      setMilestoneModal(false);
      setEditingMilestone(null);
      fetchMilestones();
    } catch (error) {
      toast?.error?.(error.message || 'Failed to update milestone');
    } finally {
      setMilestoneSubmitting(false);
    }
  }, [milestoneForm, editingMilestone, toast, fetchMilestones]);

  const handleDeleteMilestone = useCallback(async () => {
    if (!deleteMilestoneModal.milestone) return;

    try {
      await api.delete(`/milestones/${deleteMilestoneModal.milestone.id}`);
      toast?.success?.('Milestone deleted successfully');
      setDeleteMilestoneModal({ open: false, milestone: null });
      fetchMilestones();
    } catch (error) {
      toast?.error?.(error.message || 'Failed to delete milestone');
    }
  }, [deleteMilestoneModal.milestone, toast, fetchMilestones]);

  const handleMemberSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!memberForm.employee_id) {
      toast?.error?.('Please select an employee');
      return;
    }

    setMemberSubmitting(true);
    try {
      await api.post(`/projects/${id}/members`, {
        employee_id: parseInt(memberForm.employee_id, 10),
        role: memberForm.role
      });
      toast?.success?.('Team member added successfully');
      setMemberModal(false);
      fetchMembers(); // Refresh to get updated members
    } catch (error) {
      toast?.error?.(error.message || 'Failed to add team member');
    } finally {
      setMemberSubmitting(false);
    }
  }, [id, memberForm, toast, fetchMembers]);

  // Time Entry Submit
  const handleTimeEntrySubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!timeEntryForm.hours || parseFloat(timeEntryForm.hours) <= 0) {
      toast?.error?.('Please enter valid hours');
      return;
    }

    setTimeEntrySubmitting(true);
    try {
      const submitData = {
        project_id: parseInt(id, 10),
        date: timeEntryForm.date,
        hours: parseFloat(timeEntryForm.hours),
        description: timeEntryForm.description?.trim() || null
      };

      if (timeEntryForm.task_id) {
        submitData.task_id = parseInt(timeEntryForm.task_id, 10);
      }

      await api.post('/time-entries', submitData);
      toast?.success?.('Time entry logged successfully');
      setTimeEntryModal(false);
      setTimeEntryForm({
        task_id: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: ''
      });
      fetchTimeEntries();
    } catch (error) {
      toast?.error?.(error.message || 'Failed to log time');
    } finally {
      setTimeEntrySubmitting(false);
    }
  }, [id, timeEntryForm, toast, fetchTimeEntries]);





  const filteredTasks = useMemo(() => {
    // Show all tasks to admins, managers, AND project members
    if (canManageProject || isProjectMember) return tasks;
    // Fallback: only show assigned tasks for non-members (shouldn't happen if they can access project, but safe)
    return tasks.filter(t => t.assignee_id === user?.employee_id);
  }, [tasks, canManageProject, isProjectMember, user]);

  const tabs = useMemo(() => {
    const items = [
      { id: 'overview', label: 'Overview', icon: HiOutlineDocumentText },
      { id: 'tasks', label: 'Tasks', icon: HiOutlineClipboardList },
      { id: 'milestones', label: 'Milestones', icon: HiOutlineFlag },
    ];

    // Show Team tab to admins, managers, AND project members
    if (canManageProject || isProjectMember) {
      items.push({ id: 'team', label: 'Team', icon: HiOutlineUserGroup });
    }

    items.push({ id: 'time', label: 'Time Entries', icon: HiOutlineClock });
    return items;
  }, [canManageProject, isProjectMember]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getTasksByStatus = (status) => filteredTasks.filter(t => t.status === status);

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-rose-100 text-rose-700 border-rose-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      medium: 'bg-blue-100 text-blue-700 border-blue-200',
      low: 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[priority] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="empty-state">
        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <HiOutlineOfficeBuilding className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <h3 className="empty-state-title">Project not found</h3>
        <Link href="/projects"><Button variant="primary"><HiOutlineArrowLeft className="w-4 h-4 mr-2" /> Back to Projects</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="page-header sticky top-0 bg-background/95 backdrop-blur-sm z-20 py-4 border-b border-border/50 mb-0">
        <div>
          <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-2">
            <HiOutlineArrowLeft className="w-4 h-4" /> Back to Projects
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{project.code} • {project.client_name || 'Internal Project'}</p>
        </div>
        <div className="flex gap-2">
          {canManageProject && (
            <Link href={`/projects/${id}/edit`}>
              <Button variant="secondary" className="shadow-sm border-border/50"><HiOutlinePencil className="w-4 h-4 mr-2" /> Edit</Button>
            </Link>
          )}
          <Button variant="primary" onClick={handleOpenTaskModal} className="shadow-lg shadow-primary/20"><HiOutlinePlus className="w-4 h-4 mr-2" /> Add Task</Button>
          {canManageProject && (
            <Button variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20" onClick={() => setDeleteModal(true)}>
              <HiOutlineTrash className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard icon={<HiOutlineChartBar className="w-6 h-6" />} iconColor="blue" value={`${project.progress || 0}%`} label="Progress" />
        <StatCard icon={<HiOutlineCurrencyDollar className="w-6 h-6" />} iconColor="green" value={`$${((project.budget || 0) / 1000).toFixed(0)}K`} label="Budget" />
        <StatCard icon={<HiOutlineClipboardList className="w-6 h-6" />} iconColor="purple" value={project.task_count || tasks.length} label="Tasks" />
        <StatCard icon={<HiOutlineCalendar className="w-6 h-6" />} iconColor="orange" value={formatDate(project.end_date)} label="Due Date" />
      </div>

      {/* Progress Bar */}
      <Card>
        <CardBody className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm font-bold text-primary">{project.progress || 0}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${project.progress || 0}%` }} />
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <div className="bg-muted/30 p-1 rounded-xl w-fit border border-border/40 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.id ? 'bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader title="Description" />
              <CardBody>
                <p className="text-muted-foreground leading-relaxed">{project.description || 'No description provided'}</p>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Timeline & Owner" />
              <CardBody className="space-y-6">
                <InfoItem icon={HiOutlineCalendar} label="Start Date" value={formatDate(project.start_date)} />
                <InfoItem icon={HiOutlineCalendar} label="End Date" value={formatDate(project.end_date)} />
                <InfoItem icon={HiOutlineUserGroup} label="Project Manager" value={project.manager_name || 'Not assigned'} />
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="bg-muted p-1 rounded-lg flex items-center border border-border/50">
                <button
                  onClick={() => setTaskView('board')}
                  className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${taskView === 'board' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <HiOutlineViewGrid className="w-4 h-4" /> Board
                </button>
                <button
                  onClick={() => setTaskView('list')}
                  className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${taskView === 'list' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <HiOutlineViewList className="w-4 h-4" /> List
                </button>
              </div>
              <Button variant="primary" onClick={handleOpenTaskModal} className="shadow-lg shadow-primary/20"><HiOutlinePlus className="w-4 h-4 mr-2" /> Add Task</Button>
            </div>

            {taskView === 'board' ? (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent min-h-[500px]">
                {statusColumns.map((column) => (
                  <div key={column.id} className="min-w-[280px] w-full max-w-xs flex flex-col gap-3">
                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${column.color.replace('bg-', 'bg-').replace('500', '50')} ${column.color.replace('bg-', 'border-').replace('500', '100')} ${column.color.replace('bg-', 'text-').replace('500', '700')} dark:bg-opacity-10 dark:border-opacity-10`}>
                      <div className="flex items-center gap-2">
                        <column.icon className="w-4 h-4" />
                        <span className="font-semibold text-sm">{column.label}</span>
                      </div>
                      <span className="text-xs font-bold bg-background/50 px-2 py-0.5 rounded-full">{getTasksByStatus(column.id).length}</span>
                    </div>

                    <div className="flex flex-col gap-3 flex-1">
                      {getTasksByStatus(column.id).map((task) => (
                        <div
                          key={task.id}
                          className="bg-card border border-border/50 p-3 rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                          onClick={() => handleEditTask(task)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            {canManageProject && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeleteTaskModal({ open: true, task }); }}
                                className="text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <HiOutlineTrash className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <h4 className="font-medium text-sm text-foreground mb-2 line-clamp-2">{task.title}</h4>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                            <div className="flex items-center gap-1.5">
                              <Avatar name={task.assignee_name || 'Unassigned'} size="xs" />
                              <span className="text-xs text-muted-foreground truncate max-w-[80px]">{task.assignee_name?.split(' ')[0] || 'Unassigned'}</span>
                            </div>
                            {task.due_date && (
                              <span className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded border border-border/30 flex items-center gap-1">
                                <HiOutlineCalendar className="w-3 h-3" /> {formatDate(task.due_date)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {getTasksByStatus(column.id).length === 0 && (
                        <div className="h-24 border-2 border-dashed border-border/30 rounded-xl flex items-center justify-center text-muted-foreground/40 text-xs">
                          No tasks
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <div className="table-container border-0 bg-transparent">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <HiOutlineClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>No tasks yet. Create your first task!</p>
                    </div>
                  ) : (
                    <table className="table">
                      <thead><tr><th>Task</th><th>Assignee</th><th>Priority</th><th>Due Date</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                      <tbody>
                        {filteredTasks.map((task) => (
                          <tr key={task.id} className="group hover:bg-muted/30 transition-colors">
                            <td className="font-medium text-foreground">{task.title}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                <Avatar name={task.assignee_name || 'Unassigned'} size="xs" />
                                <span className="text-sm text-muted-foreground">{task.assignee_name || 'Unassigned'}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </td>
                            <td className="text-muted-foreground text-sm font-mono">{formatDate(task.due_date)}</td>
                            <td><StatusBadge status={task.status} /></td>
                            <td className="text-right">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                                  <HiOutlinePencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                </Button>
                                {canManageProject && (
                                  <Button variant="ghost" size="sm" onClick={() => setDeleteTaskModal({ open: true, task })}>
                                    <HiOutlineTrash className="w-4 h-4 text-muted-foreground hover:text-rose-500" />
                                  </Button>
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
            )}
          </div>
        )}

        {activeTab === 'milestones' && (
          <Card>
            <CardHeader title="Milestones" action={canManageProject && <Button variant="secondary" size="sm" onClick={handleOpenMilestoneModal}><HiOutlinePlus className="w-4 h-4 mr-2" /> Add Milestone</Button>} />
            <div className="table-container border-0 bg-transparent">
              {milestones.length > 0 ? (
                <table className="table">
                  <thead><tr><th>Milestone</th><th>Due Date</th><th>Amount</th><th>Status</th>{canManageProject && <th className="text-right">Actions</th>}</tr></thead>
                  <tbody>
                    {milestones.map((m) => (
                      <tr key={m.id} className="group hover:bg-muted/30 transition-colors">
                        <td className="font-medium text-foreground flex items-center gap-2">
                          <HiOutlineFlag className="w-4 h-4 text-muted-foreground" />
                          {m.name}
                        </td>
                        <td className="text-muted-foreground font-mono text-sm">{formatDate(m.due_date)}</td>
                        <td className="font-bold text-foreground">${m.amount?.toLocaleString() || '0'}</td>
                        <td><StatusBadge status={m.status} /></td>
                        {canManageProject && (
                          <td className="text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" onClick={() => handleEditMilestone(m)}>
                                <HiOutlinePencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteMilestoneModal({ open: true, milestone: m })}>
                                <HiOutlineTrash className="w-4 h-4 text-muted-foreground hover:text-rose-500" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <HiOutlineFlag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No milestones defined</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'team' && (
          <Card>
            <CardHeader title="Team Members" action={canManageProject && <Button variant="secondary" size="sm" onClick={handleOpenMemberModal}><HiOutlinePlus className="w-4 h-4 mr-2" /> Add Member</Button>} />
            <CardBody>
              {teamMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-muted/20 border border-border/50 rounded-xl group hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar name={member.employee_name || 'Unknown'} size="md" />
                        <div>
                          <p className="font-bold text-foreground">{member.employee_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground capitalize font-medium px-1.5 py-0.5 bg-background border border-border/50 rounded-md w-fit mt-1">{member.role}</p>
                        </div>
                      </div>
                      {canManageProject && (
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to remove this member?')) {
                              api.delete(`/projects/${id}/members/${member.employee_id}`)
                                .then(() => {
                                  toast?.success?.('Member removed successfully');
                                  fetchMembers();
                                })
                                .catch(err => toast?.error?.(err.message || 'Failed to remove member'));
                            }
                          }}
                          className="text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-rose-50 rounded-lg dark:hover:bg-rose-900/20"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <HiOutlineUserGroup className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No team members assigned yet</p>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {activeTab === 'time' && (
          <Card>
            <CardHeader title="Time Entries" action={
              <Button variant="secondary" size="sm" onClick={() => setTimeEntryModal(true)}>
                <HiOutlinePlus className="w-4 h-4 mr-2" /> Log Time
              </Button>
            } />
            <div className="table-container border-0 bg-transparent">
              {timeEntries.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Task</th>
                      <th>Hours</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                        <td className="font-mono text-sm text-muted-foreground">{formatDate(entry.date)}</td>
                        <td className="font-medium text-foreground">
                          {tasks.find(t => t.id === entry.task_id)?.title || '-'}
                        </td>
                        <td>
                          <span className="font-bold text-primary">{entry.hours}h</span>
                        </td>
                        <td className="text-muted-foreground max-w-xs truncate">{entry.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <HiOutlineClock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No time entries logged yet</p>
                  <Button variant="primary" size="sm" className="mt-4" onClick={() => setTimeEntryModal(true)}>
                    <HiOutlinePlus className="w-4 h-4 mr-2" /> Log Your First Entry
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Task Creation/Edit Modal */}
      <Modal
        isOpen={taskModal}
        onClose={() => { setTaskModal(false); setEditingTask(null); }}
        title={editingTask ? "Edit Task" : "Add New Task"}
        size="lg"
      >
        <form onSubmit={editingTask ? handleUpdateTask : handleTaskSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="input-wrapper">
              <label className="input-label">Task Title <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="input"
                placeholder="Enter task title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="input-wrapper">
                <label className="input-label">Assign To</label>
                <select
                  value={taskForm.assignee_id}
                  onChange={(e) => setTaskForm({ ...taskForm, assignee_id: e.target.value })}
                  className="input"
                >
                  <option value="">Select assignee</option>
                  {teamMembers.length > 0 ? (
                    teamMembers.map(member => (
                      <option key={member.employee_id} value={member.employee_id}>
                        {member.employee_name || 'Unknown Member'}
                      </option>
                    ))
                  ) : (
                    employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="input-wrapper">
                <label className="input-label">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="input-wrapper">
                <label className="input-label">Due Date</label>
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  className="input"
                />
              </div>
              <div className="input-wrapper">
                <label className="input-label">Est. Hours</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={taskForm.estimated_hours}
                  onChange={(e) => setTaskForm({ ...taskForm, estimated_hours: e.target.value })}
                  className="input"
                  placeholder="0.0"
                />
              </div>
            </div>

            {editingTask && (
              <div className="input-wrapper">
                <label className="input-label">Status</label>
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  className="input"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button variant="secondary" onClick={() => { setTaskModal(false); setEditingTask(null); }} disabled={taskSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={taskSubmitting} className="min-w-[100px] shadow-lg shadow-primary/20">
              {taskSubmitting ? 'Saving...' : (editingTask ? 'Save Changes' : 'Create Task')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Member Modal */}
      <Modal
        isOpen={memberModal}
        onClose={() => setMemberModal(false)}
        title="Add Team Member"
      >
        <form onSubmit={handleMemberSubmit} className="space-y-4">
          <div className="input-wrapper">
            <label className="input-label">Employee <span className="text-rose-500">*</span></label>
            <select
              value={memberForm.employee_id}
              onChange={(e) => setMemberForm({ ...memberForm, employee_id: e.target.value })}
              className="input"
              required
            >
              <option value="">Select employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="input-wrapper">
            <label className="input-label">Role</label>
            <select
              value={memberForm.role}
              onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
              className="input"
            >
              <option value="member">Member</option>
              <option value="lead">Lead</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button variant="secondary" onClick={() => setMemberModal(false)} disabled={memberSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={memberSubmitting} className="shadow-lg shadow-primary/20">
              {memberSubmitting ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Time Entry Modal */}
      <Modal
        isOpen={timeEntryModal}
        onClose={() => setTimeEntryModal(false)}
        title="Log Time"
      >
        <form onSubmit={handleTimeEntrySubmit} className="space-y-4">
          <div className="input-wrapper">
            <label className="input-label">Task (Optional)</label>
            <select
              value={timeEntryForm.task_id}
              onChange={(e) => setTimeEntryForm({ ...timeEntryForm, task_id: e.target.value })}
              className="input"
            >
              <option value="">General project work</option>
              {tasks.map(task => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="input-wrapper">
              <label className="input-label">Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                required
                value={timeEntryForm.date}
                onChange={(e) => setTimeEntryForm({ ...timeEntryForm, date: e.target.value })}
                className="input"
              />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Hours <span className="text-rose-500">*</span></label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="24"
                required
                value={timeEntryForm.hours}
                onChange={(e) => setTimeEntryForm({ ...timeEntryForm, hours: e.target.value })}
                className="input"
                placeholder="e.g. 2.5"
              />
            </div>
          </div>

          <div className="input-wrapper">
            <label className="input-label">Description</label>
            <textarea
              value={timeEntryForm.description}
              onChange={(e) => setTimeEntryForm({ ...timeEntryForm, description: e.target.value })}
              className="input min-h-[80px] resize-none"
              placeholder="What did you work on?"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button variant="secondary" onClick={() => setTimeEntryModal(false)} disabled={timeEntrySubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={timeEntrySubmitting} className="shadow-lg shadow-primary/20">
              {timeEntrySubmitting ? 'Logging...' : 'Log Time'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Milestone Modal */}
      <Modal
        isOpen={milestoneModal}
        onClose={() => { setMilestoneModal(false); setEditingMilestone(null); }}
        title={editingMilestone ? "Edit Milestone" : "Add Milestone"}
      >
        <form onSubmit={editingMilestone ? handleUpdateMilestone : handleMilestoneSubmit} className="space-y-4">
          <div className="input-wrapper">
            <label className="input-label">Milestone Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={milestoneForm.name}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
              className="input"
              placeholder="e.g., Phase 1 Complete"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="input-wrapper">
              <label className="input-label">Due Date</label>
              <input
                type="date"
                value={milestoneForm.due_date}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })}
                className="input"
              />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Amount</label>
              <input
                type="number"
                step="100"
                min="0"
                value={milestoneForm.amount}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, amount: e.target.value })}
                className="input"
                placeholder="e.g., 5000"
              />
            </div>
          </div>

          <div className="input-wrapper">
            <label className="input-label">Status</label>
            <select
              value={milestoneForm.status}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
              className="input"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="input-wrapper">
            <label className="input-label">Description</label>
            <textarea
              value={milestoneForm.description}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
              className="input min-h-[80px] resize-none"
              placeholder="Milestone details..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button variant="secondary" onClick={() => { setMilestoneModal(false); setEditingMilestone(null); }} disabled={milestoneSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={milestoneSubmitting} className="shadow-lg shadow-primary/20">
              {milestoneSubmitting ? 'Saving...' : (editingMilestone ? 'Save Changes' : 'Add Milestone')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Task Confirmation */}
      <DeleteConfirmModal
        isOpen={deleteTaskModal.open}
        onClose={() => setDeleteTaskModal({ open: false, task: null })}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTaskModal.task?.title}"? This action cannot be undone.`}
      />

      {/* Delete Milestone Confirmation */}
      <DeleteConfirmModal
        isOpen={deleteMilestoneModal.open}
        onClose={() => setDeleteMilestoneModal({ open: false, milestone: null })}
        onConfirm={handleDeleteMilestone}
        title="Delete Milestone"
        message={`Are you sure you want to delete "${deleteMilestoneModal.milestone?.name}"? This action cannot be undone.`}
      />

      {/* Delete Project Confirmation */}
      <DeleteConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${project?.name}"? All tasks, milestones, and time entries will also be deleted.`}
        loading={deleting}
      />

    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="w-9 h-9 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground mb-0.5 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-foreground block truncate">{value}</p>
      </div>
    </div>
  );
}
