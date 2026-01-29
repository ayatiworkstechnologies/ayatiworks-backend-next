'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardBody, StatCard, StatusBadge, Avatar } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';
import {
  HiOutlinePlus, HiOutlineCalendar, HiOutlineHeart, HiOutlineStar,
  HiOutlineGift, HiOutlineX, HiOutlineCheckCircle, HiOutlineClock, HiCheckCircle,
  HiOutlineCheck, HiOutlineBan
} from 'react-icons/hi';

export default function LeavesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const searchParams = useSearchParams();

  // Check if user can approve leaves
  const canApprove = user?.role?.code?.toLowerCase() === 'admin' ||
    user?.role?.code?.toLowerCase() === 'super_admin' ||
    user?.role?.code?.toLowerCase() === 'manager' ||
    user?.permissions?.includes('leave.approve');

  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  // Initialize from URL query or default to 'my'
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return (tabParam === 'approvals' && canApprove) ? 'approvals' : 'my';
  });
  const [cancellingId, setCancellingId] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchLeaveData = useCallback(async () => {
    try {
      setLoading(true);
      const [leavesRes, balancesRes] = await Promise.all([
        api.get('/leaves/my-leaves').catch(() => ({ items: [] })),
        api.get('/leaves/my-balance').catch(() => []),
      ]);
      setLeaves(leavesRes?.items || []);
      setBalances(balancesRes || []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast?.error?.('Failed to fetch leave data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchPendingApprovals = useCallback(async () => {
    if (!canApprove) return;
    try {
      setApprovalsLoading(true);
      const res = await api.get('/leaves/pending-approvals');
      setPendingApprovals(res || []);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      toast?.error?.('Failed to fetch pending approvals');
    } finally {
      setApprovalsLoading(false);
    }
  }, [canApprove, toast]);

  useEffect(() => {
    fetchLeaveData();
  }, [fetchLeaveData]);

  useEffect(() => {
    if (activeTab === 'approvals' && canApprove) {
      fetchPendingApprovals();
    }
  }, [activeTab, canApprove, fetchPendingApprovals]);

  const handleCancelLeave = async (leaveId) => {
    const { value: reason } = await Swal.fire({
      title: 'Cancel Leave Request',
      input: 'textarea',
      inputLabel: 'Please provide a reason for cancellation:',
      inputPlaceholder: 'Enter your reason here...',
      showCancelButton: true,
      confirmButtonText: 'Cancel Leave',
      confirmButtonColor: '#ef4444',
      inputValidator: (value) => {
        if (!value?.trim()) return 'Reason is required!';
      }
    });

    if (!reason) return;

    try {
      setCancellingId(leaveId);
      await api.post(`/leaves/${leaveId}/cancel`, { reason: reason.trim() });
      toast?.success?.('Leave cancelled successfully');
      fetchLeaveData();
    } catch (error) {
      console.error('Error cancelling leave:', error);
      toast?.error?.(error.message || 'Failed to cancel leave');
    } finally {
      setCancellingId(null);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    const result = await Swal.fire({
      title: 'Approve Leave?',
      text: 'This will approve the leave request and update attendance records.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve',
      confirmButtonColor: '#10b981',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      setProcessingId(leaveId);
      await api.post(`/leaves/${leaveId}/approve`, { status: 'approved', remarks: 'Approved by manager' });
      toast?.success?.('Leave approved successfully!');
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error approving leave:', error);
      toast?.error?.(error.message || 'Failed to approve leave');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectLeave = async (leaveId) => {
    const { value: remarks } = await Swal.fire({
      title: 'Reject Leave Request',
      input: 'textarea',
      inputLabel: 'Provide a reason for rejection:',
      inputPlaceholder: 'Enter rejection reason...',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      confirmButtonColor: '#ef4444',
      inputValidator: (value) => {
        if (!value?.trim()) return 'Rejection reason is required!';
      }
    });

    if (!remarks) return;

    try {
      setProcessingId(leaveId);
      await api.post(`/leaves/${leaveId}/approve`, { status: 'rejected', remarks: remarks.trim() });
      toast?.success?.('Leave rejected');
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error rejecting leave:', error);
      toast?.error?.(error.message || 'Failed to reject leave');
    } finally {
      setProcessingId(null);
    }
  };

  const getLeaveIcon = (type) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('sick')) return HiOutlineHeart;
    if (typeLower.includes('casual')) return HiOutlineCalendar;
    if (typeLower.includes('earned') || typeLower.includes('privilege')) return HiOutlineStar;
    return HiOutlineGift;
  };

  const getLeaveColor = (type) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('sick')) return 'green';
    if (typeLower.includes('casual')) return 'blue';
    if (typeLower.includes('earned')) return 'purple';
    return 'orange';
  };

  const getLightColor = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
      purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
      orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
    };
    return colors[color] || 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const filteredLeaves = leaves.filter(l => {
    if (activeTab === 'pending') return l.status === 'pending';
    if (activeTab === 'history') return l.status !== 'pending';
    return true; // 'my' shows all
  });

  const tabs = [
    { id: 'my', label: 'All Requests' },
    { id: 'pending', label: 'Pending' },
    { id: 'history', label: 'History' },
  ];

  // Add approvals tab for admins/managers
  if (canApprove) {
    tabs.push({ id: 'approvals', label: `Approvals (${pendingApprovals.length})` });
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Leave Management</h1>
          <p className="text-muted-foreground mt-1">Apply for leaves and track balance</p>
        </div>
        <Link href="/leaves/apply">
          <Button variant="primary" className="shadow-lg shadow-primary/20">
            <HiOutlinePlus className="w-5 h-5" /> Apply Leave
          </Button>
        </Link>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="h-32 bg-muted/20 rounded-2xl animate-pulse" />)
        ) : balances.length > 0 ? (
          balances.map((balance, index) => {
            const Icon = getLeaveIcon(balance.leave_type_name);
            const color = getLeaveColor(balance.leave_type_name);
            return (
              <Card key={balance.leave_type_id || index} className="overflow-hidden border-0 shadow-lg relative group hover:-translate-y-1 transition-transform">
                <div className={`absolute inset-0 opacity-10 ${getLightColor(color)}`}></div>
                <CardBody className="p-6 relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">{balance.leave_type_name || 'Leave'}</p>
                      <p className="text-4xl font-bold mt-2 text-foreground">{balance.available ?? 0}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs font-medium text-muted-foreground">
                        <span className="bg-background/50 px-2 py-0.5 rounded-md border border-border/50">{balance.used ?? 0} Used</span>
                        <span className="bg-background/50 px-2 py-0.5 rounded-md border border-border/50">{balance.allocated ?? 0} Total</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${getLightColor(color)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })
        ) : (
          <div className="col-span-4 p-8 text-center text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border/50">
            No leave balances found.
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex p-1 space-x-1 bg-muted/30 rounded-xl w-fit border border-border/40">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conditional Content Based on Tab */}
      {activeTab === 'approvals' && canApprove ? (
        /* Admin Approvals Tab */
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardHeader title="Pending Leave Approvals" icon={<HiOutlineCheckCircle className="w-5 h-5" />} />
          <div className="table-container border-0 bg-transparent">
            {approvalsLoading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : pendingApprovals.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HiCheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">No pending leave requests to approve.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Duration</th>
                    <th>Days</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.map((leave) => (
                    <tr key={leave.id} className="hover:bg-muted/20 transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={leave.employee_name} size="sm" />
                          <span className="font-semibold text-foreground">{leave.employee_name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-8 rounded-full`} style={{ backgroundColor: leave.leave_type_color || '#3B82F6' }} />
                          <span className="font-medium">{leave.leave_type_name || 'Leave'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium">{formatDate(leave.from_date)}</span>
                          <span className="text-xs text-muted-foreground">to {formatDate(leave.to_date)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center justify-center min-w-[30px] h-7 bg-muted/50 text-foreground text-xs font-bold rounded-lg border border-border/50">
                          {leave.days}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            onClick={() => handleApproveLeave(leave.id)}
                            disabled={processingId === leave.id}
                          >
                            {processingId === leave.id ? (
                              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <><HiOutlineCheck className="w-4 h-4 mr-1" /> Approve</>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            onClick={() => handleRejectLeave(leave.id)}
                            disabled={processingId === leave.id}
                          >
                            <HiOutlineBan className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      ) : (
        /* My Leaves Table */
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="table-container border-0 bg-transparent">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : filteredLeaves.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HiOutlineCalendar className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">No Requests Found</h3>
                <p className="text-muted-foreground">No leave requests match the selected filter.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th className="w-[25%]">Leave Type</th>
                    <th>Duration</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-muted/20 transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-10 rounded-full`} style={{ backgroundColor: leave.leave_type_color || '#3B82F6' }} />
                          <div>
                            <span className="font-semibold text-foreground block">{leave.leave_type_name || 'Leave'}</span>
                            <span className="text-xs text-muted-foreground">{leave.reason || 'No reason provided'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium">{formatDate(leave.from_date)}</span>
                          <span className="text-xs text-muted-foreground">to {formatDate(leave.to_date)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center justify-center min-w-[30px] h-7 bg-muted/50 text-foreground text-xs font-bold rounded-lg border border-border/50">
                          {leave.days}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={leave.status} />
                          {leave.status === 'approved' && (
                            <div className="group relative">
                              <HiCheckCircle className="w-5 h-5 text-emerald-500 cursor-help" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-border">
                                Synced with Attendance
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-right">
                        {leave.status === 'pending' && (
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                              onClick={() => handleCancelLeave(leave.id)}
                              disabled={cancellingId === leave.id}
                            >
                              {cancellingId === leave.id ? (
                                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                              ) : (
                                <HiOutlineX className="w-4 h-4 mr-2" />
                              )}
                              Cancel Request
                            </Button>
                          </div>
                        )}
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
  );
}
