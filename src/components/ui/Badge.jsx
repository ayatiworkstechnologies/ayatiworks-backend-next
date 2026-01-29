'use client';

export default function Badge({ 
  children, 
  variant = 'primary',
  dot = false,
  className = '' 
}) {
  const variants = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    secondary: 'badge-secondary',
  };

  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {dot && (
        <span 
          className="w-1.5 h-1.5 rounded-full" 
          style={{ backgroundColor: 'currentColor' }}
        />
      )}
      {children}
    </span>
  );
}

// Status badge specifically for common statuses
export function StatusBadge({ status }) {
  const statusConfig = {
    // Employee Status
    active: { label: 'Active', variant: 'success' },
    inactive: { label: 'Inactive', variant: 'secondary' },
    on_leave: { label: 'On Leave', variant: 'warning' },
    probation: { label: 'Probation', variant: 'primary' },
    terminated: { label: 'Terminated', variant: 'danger' },
    resigned: { label: 'Resigned', variant: 'secondary' },
    
    // Task Status
    todo: { label: 'To Do', variant: 'secondary' },
    in_progress: { label: 'In Progress', variant: 'primary' },
    in_review: { label: 'In Review', variant: 'warning' },
    done: { label: 'Done', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'danger' },
    
    // Leave Status
    pending: { label: 'Pending', variant: 'warning' },
    approved: { label: 'Approved', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'danger' },
    
    // Attendance
    present: { label: 'Present', variant: 'success' },
    absent: { label: 'Absent', variant: 'danger' },
    late: { label: 'Late', variant: 'warning' },
    half_day: { label: 'Half Day', variant: 'warning' },
    
    // Invoice
    draft: { label: 'Draft', variant: 'secondary' },
    sent: { label: 'Sent', variant: 'primary' },
    paid: { label: 'Paid', variant: 'success' },
    overdue: { label: 'Overdue', variant: 'danger' },
    
    // Project
    planned: { label: 'Planned', variant: 'secondary' },
    completed: { label: 'Completed', variant: 'success' },
    on_hold: { label: 'On Hold', variant: 'warning' },
  };

  const config = statusConfig[status?.toLowerCase()] || { 
    label: status || 'Unknown', 
    variant: 'secondary' 
  };

  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}
