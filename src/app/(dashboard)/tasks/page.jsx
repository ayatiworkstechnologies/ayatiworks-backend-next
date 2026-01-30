'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardBody, StatusBadge, Avatar, PageHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlinePlus, HiOutlineViewGrid, HiOutlineViewList, HiOutlineClipboardList,
  HiOutlineCalendar, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle,
  HiOutlineSearch, HiOutlineUserGroup, HiOutlineUser
} from 'react-icons/hi';

const statusColumns = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-500', icon: HiOutlineClipboardList },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500', icon: HiOutlineClock },
  { id: 'in_review', label: 'In Review', color: 'bg-amber-500', icon: HiOutlineExclamationCircle },
  { id: 'done', label: 'Done', color: 'bg-emerald-500', icon: HiOutlineCheckCircle },
];

// Roles that can view all tasks
const ADMIN_ROLES = ['Super Admin', 'SUPER_ADMIN', 'Admin', 'ADMIN', 'Manager', 'MANAGER', 'HR Manager', 'HR'];

export default function TasksPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('board');
  const [showNewTask, setShowNewTask] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'my' - for admins to toggle
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    project_id: '',
    assignee_id: '',
    priority: 'medium',
    due_date: '',
    status: 'todo',
  });

  // Check if user has admin/manager role
  const isAdminOrManager = useMemo(() => {
    const roleName = user?.role?.name || '';
    const roleCode = user?.role?.code || '';
    return ADMIN_ROLES.includes(roleName) || ADMIN_ROLES.includes(roleCode);
  }, [user]);

  const fetchTasks = useCallback(async () => {
    try {
      let response;

      if (isAdminOrManager && viewMode === 'all') {
        // Admins/Managers see all tasks
        response = await api.get('/tasks?page_size=100');
        setTasks(response?.items || response || []);
      } else {
        // Employees only see their assigned tasks
        response = await api.get('/tasks/my-tasks');
        setTasks(response || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [isAdminOrManager, viewMode]);

  const fetchDropdownData = useCallback(async () => {
    try {
      const [projectsRes, employeesRes] = await Promise.all([
        api.get('/projects').catch(() => ({ items: [] })),
        api.get('/employees').catch(() => ({ items: [] })),
      ]);
      setProjects(projectsRes.items || projectsRes || []);
      setEmployees(employeesRes.items || employeesRes || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchDropdownData();
  }, [fetchTasks, fetchDropdownData]);

  const handleOpenTaskModal = useCallback(() => {
    setTaskForm({
      title: '',
      description: '',
      project_id: '',
      assignee_id: '',
      priority: 'medium',
      due_date: '',
    });
    setShowNewTask(true);
  }, []);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast?.error?.('Task title is required');
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        title: taskForm.title.trim(),
        description: taskForm.description?.trim() || null,
        priority: taskForm.priority,
      };

      if (taskForm.project_id) {
        submitData.project_id = parseInt(taskForm.project_id, 10);
      }
      if (taskForm.assignee_id) {
        submitData.assignee_id = parseInt(taskForm.assignee_id, 10);
      }
      if (taskForm.due_date) {
        submitData.due_date = taskForm.due_date;
      }

      await api.post('/tasks', submitData);
      toast?.success?.('Task created successfully');
      setShowNewTask(false);
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast?.error?.(error.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status?new_status=${newStatus}`);
      toast?.success?.('Task status updated');
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast?.error?.(error?.data?.detail || error.message || 'Failed to update task');
    }
  };

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.project_name && t.project_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTasksByStatus = (status) => filteredTasks.filter(t => t.status === status);

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 ring-rose-500/30',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 ring-orange-500/30',
      medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 ring-amber-500/30',
      low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 ring-emerald-500/30'
    };
    return colors[priority] || 'bg-slate-100 text-slate-700';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up h-full flex flex-col">
      <PageHeader
        title="Tasks"
        description={isAdminOrManager
          ? (viewMode === 'all' ? 'Viewing all tasks across the organization' : 'Viewing only your assigned tasks')
          : 'Manage and track your assigned tasks'}
      >
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Toggle - Only for Admins */}
          {isAdminOrManager && (
            <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-border/50 shadow-sm">
              <button
                className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${viewMode === 'all' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
                onClick={() => setViewMode('all')}
                title="View all tasks"
              >
                <HiOutlineUserGroup className="w-5 h-5" />
                <span className="hidden sm:inline">All Tasks</span>
              </button>
              <button
                className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${viewMode === 'my' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
                onClick={() => setViewMode('my')}
                title="View my tasks only"
              >
                <HiOutlineUser className="w-5 h-5" />
                <span className="hidden sm:inline">My Tasks</span>
              </button>
            </div>
          )}

          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-64"
            />
          </div>
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-border/50 shadow-sm">
            <button
              className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${view === 'board' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
              onClick={() => setView('board')}
            >
              <HiOutlineViewGrid className="w-5 h-5" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${view === 'list' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
              onClick={() => setView('list')}
            >
              <HiOutlineViewList className="w-5 h-5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
          {isAdminOrManager && (
            <Button variant="primary" onClick={handleOpenTaskModal} className="shadow-lg shadow-primary/20 whitespace-nowrap">
              <HiOutlinePlus className="w-5 h-5" /> <span className="hidden sm:inline">New Task</span>
            </Button>
          )}
        </div>
      </PageHeader>


      {/* Task Stats Banner */}
      {
        isAdminOrManager && viewMode === 'all' && (
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="font-bold text-foreground">{tasks.length}</span>
            </div>
            {statusColumns.map(col => (
              <div key={col.id} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <span className="text-sm text-muted-foreground">{col.label}:</span>
                <span className="font-bold text-foreground">{getTasksByStatus(col.id).length}</span>
              </div>
            ))}
          </div>
        )
      }

      {/* Kanban Board */}
      {
        view === 'board' ? (
          <div className="flex-1 overflow-x-auto pb-6 -mx-6 px-6 scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent">
            <div className="inline-flex gap-6 h-full min-w-full">
              {statusColumns.map((column) => (
                <div key={column.id} className="flex-shrink-0 w-80 flex flex-col gap-4 h-full">
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${column.color}/10 text-${column.color.split('-')[1]}-600`}>
                        <column.icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-foreground text-sm">{column.label}</h3>
                      <span className="text-xs bg-white/50 dark:bg-black/50 text-muted-foreground px-2 py-0.5 rounded-full font-medium border border-border/50">
                        {getTasksByStatus(column.id).length}
                      </span>
                    </div>
                    {isAdminOrManager && (
                      <button
                        className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/10"
                        onClick={handleOpenTaskModal}
                      >
                        <HiOutlinePlus className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Tasks Container */}
                  <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {getTasksByStatus(column.id).map((task) => (
                      <div key={task.id} className="group glass-card border border-white/50 dark:border-white/10 p-4 hover:ring-2 hover:ring-primary/20 hover:border-primary/30 transition-all cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ring-1 ${getPriorityColor(task.priority)}`}>
                            {task.priority || 'Normal'}
                          </span>

                          {/* Quick Actions (visible on hover) */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Can add edit/delete here later */}
                          </div>
                        </div>

                        <h4 className="font-semibold text-foreground mb-2 line-clamp-2 leading-relaxed text-sm">
                          {task.title}
                        </h4>

                        <div className="space-y-3">
                          {task.project_name && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <HiOutlineClipboardList className="w-3.5 h-3.5" />
                              <span className="truncate">{task.project_name}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-dashed border-border/50">
                            <div className="flex items-center gap-2">
                              <Avatar name={task.assignee_name || 'Unassigned'} size="sm" className="w-6 h-6 text-xs ring-2 ring-background" />
                              <span className="text-xs font-medium text-muted-foreground truncate max-w-[80px]">
                                {task.assignee_name?.split(' ')[0] || 'Unassigned'}
                              </span>
                            </div>

                            {task.due_date && (
                              <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md ${new Date(task.due_date) < new Date() ? 'bg-rose-500/10 text-rose-600' : 'bg-muted/50 text-muted-foreground'}`}>
                                <HiOutlineCalendar className="w-3 h-3" />
                                <span>{formatDate(task.due_date)}</span>
                              </div>
                            )}
                          </div>

                          {/* Status Dropdown - Subtle */}
                          <div className="pt-2">
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                              className="w-full text-xs py-1.5 px-2 bg-muted/30 border border-transparent hover:border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer text-muted-foreground hover:text-foreground"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="in_review">In Review</option>
                              <option value="done">Done</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Empty State for Column */}
                    {getTasksByStatus(column.id).length === 0 && (
                      <div className="h-32 border-2 border-dashed border-border/30 rounded-2xl flex flex-col items-center justify-center text-muted-foreground/40 text-sm bg-muted/5">
                        <p>No tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="table-container border-0 bg-transparent">
              <table className="table">
                <thead>
                  <tr>
                    <th className="w-[40%]">Task Details</th>
                    <th>Assignee</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8">
                        <div className="flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                      </td>
                    </tr>
                  ) : filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted-foreground py-8">No tasks found</td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => (
                      <tr key={task.id} className="group hover:bg-muted/30 transition-colors">
                        <td>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{task.title}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <HiOutlineClipboardList className="w-3 h-3" /> {task.project_name || 'No Project'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Avatar name={task.assignee_name || 'Unassigned'} size="sm" />
                            <span className="text-sm font-medium">{task.assignee_name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                            {task.priority || 'Normal'}
                          </span>
                        </td>
                        <td><StatusBadge status={task.status} /></td>
                        <td className="text-muted-foreground font-medium text-sm">{formatDate(task.due_date) || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )
      }

      {/* New Task Modal */}
      <Modal
        isOpen={showNewTask}
        onClose={() => setShowNewTask(false)}
        title="Create New Task"
      >
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <Input
            label="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            placeholder="Enter task title"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="input-label">Project</label>
              <select
                value={taskForm.project_id}
                onChange={(e) => setTaskForm({ ...taskForm, project_id: e.target.value })}
                className="input"
              >
                <option value="">Select project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="input-label">Assign To</label>
              <select
                value={taskForm.assignee_id}
                onChange={(e) => setTaskForm({ ...taskForm, assignee_id: e.target.value })}
                className="input"
              >
                <option value="">Select assignee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
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
            <Input
              label="Due Date"
              type="date"
              value={taskForm.due_date}
              onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="input-label">Description</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="input min-h-[100px] resize-none pt-3"
              placeholder="Describe the task details..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="secondary" onClick={() => setShowNewTask(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting} className="shadow-lg shadow-primary/20">
              {submitting ? 'Creating...' : <><HiOutlinePlus className="w-4 h-4" /> Create Task</>}
            </Button>
          </div>
        </form>
      </Modal>
    </div >
  );
}
