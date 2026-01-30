'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardBody, StatCard, StatusBadge, Avatar, PageHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import {
  HiOutlineClock, HiOutlineCalendar, HiOutlineCheckCircle, HiOutlineChartBar,
  HiOutlineOfficeBuilding, HiOutlineHome, HiOutlineGlobe, HiOutlineExclamation,
  HiOutlineLogin, HiOutlineLogout, HiOutlineUserGroup, HiOutlineSearch, HiOutlineFilter
} from 'react-icons/hi';

export default function AttendancePage() {
  const { user } = useAuth();
  const toast = useToast();

  const isAdmin =
    ['admin', 'manager', 'super_admin'].includes(user?.role?.code?.toLowerCase()) ||
    user?.permissions?.includes('attendance.view_all');

  // Tab State
  const [activeTab, setActiveTab] = useState('my_attendance'); // 'my_attendance' | 'overall'

  // My Attendance State
  const [myAttendance, setMyAttendance] = useState(null);
  const [myHistory, setMyHistory] = useState([]);
  const [myLoading, setMyLoading] = useState(true);
  const [workMode, setWorkMode] = useState('office');
  const [myStats, setMyStats] = useState({ present_days: 0, total_working_hours: 0, wfh_days: 0, total_days: 22, late_days: 0 });

  // Live timer state
  const [elapsedTime, setElapsedTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [timerActive, setTimerActive] = useState(false);

  // Admin Overall Attendance State
  const [adminAttendance, setAdminAttendance] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminPagination, setAdminPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [adminFilters, setAdminFilters] = useState({
    from_date: new Date().toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0],
    status: '',
    search: '', // Not directly supported by backend yet, but good to have in UI structure
  });

  // Employee Detail Modal State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [employeeDetail, setEmployeeDetail] = useState({ stats: null, history: [] });
  const [detailLoading, setDetailLoading] = useState(false);

  // --- My Attendance Logic ---

  useEffect(() => {
    if (activeTab === 'my_attendance') {
      fetchMyData();
    }
  }, [activeTab]);

  // Live timer effect
  useEffect(() => {
    let interval;
    if (myAttendance?.check_in && !myAttendance?.check_out) {
      setTimerActive(true);
      const updateTimer = () => {
        const checkInTime = new Date(myAttendance.check_in).getTime();
        const now = Date.now();
        const diff = Math.floor((now - checkInTime) / 1000);
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setElapsedTime({ hours, minutes, seconds });
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setTimerActive(false);
      if (myAttendance?.working_hours) {
        const totalMinutes = Math.round(myAttendance.working_hours * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        setElapsedTime({ hours, minutes, seconds: 0 });
      }
    }
    return () => clearInterval(interval);
  }, [myAttendance]);

  const fetchMyData = async () => {
    try {
      setMyLoading(true);
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = today.toISOString().split('T')[0];

      const [todayRes, historyData, summaryData] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance/my-history?from_date=' + firstDay + '&to_date=' + lastDay),
        api.get(`/attendance/my-summary?from_date=${firstDay}&to_date=${lastDay}`)
      ]);
      setMyAttendance(todayRes);
      setMyHistory(historyData || []);
      setMyStats(summaryData || { present_days: 0, total_working_hours: 0, wfh_days: 0, total_days: 0, late_days: 0 });
    } catch (error) {
      console.error('Error fetching my attendance:', error);
      setMyHistory([]);
    } finally {
      setMyLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setMyLoading(true);
      await api.post('/attendance/check-in', { work_mode: workMode });
      toast.success('Checked in successfully!');
      fetchMyData();
    } catch (error) {
      toast.error(error.message || 'Failed to check in');
      setMyLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setMyLoading(true);
      await api.post('/attendance/check-out', {});
      toast.success('Checked out successfully!');
      fetchMyData();
    } catch (error) {
      toast.error(error.message || 'Failed to check out');
      setMyLoading(false);
    }
  };


  // --- Admin Overall Attendance Logic ---

  const fetchAdminData = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setAdminLoading(true);
      const params = new URLSearchParams({
        page: adminPagination.page,
        page_size: 20,
        from_date: adminFilters.from_date,
        to_date: adminFilters.to_date,
      });

      if (adminFilters.status) params.append('status', adminFilters.status);

      // Fetch both list and stats in parallel
      const [listRes, statsRes] = await Promise.all([
        api.get(`/attendance?${params}`),
        api.get(`/attendance/stats?from_date=${adminFilters.from_date}&to_date=${adminFilters.to_date}`)
      ]);

      setAdminAttendance(listRes.items || []);
      setAdminPagination(prev => ({ ...prev, total: listRes.total, pages: listRes.pages }));
      setAdminStats(statsRes);
    } catch (error) {
      console.error('Error fetching all attendance:', error);
      toast.error('Failed to fetch attendance records');
    } finally {
      setAdminLoading(false);
    }
  }, [isAdmin, adminPagination.page, adminFilters, toast]);

  useEffect(() => {
    if (activeTab === 'overall' && isAdmin) {
      fetchAdminData();
    }
  }, [activeTab, isAdmin, fetchAdminData]);

  const handleAdminFilterChange = (e) => {
    const { name, value } = e.target;
    setAdminFilters(prev => ({ ...prev, [name]: value }));
    setAdminPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  // --- Render Helpers ---

  const formatTime = (val) => val.toString().padStart(2, '0');
  const targetHours = 9;
  const currentHours = elapsedTime.hours + (elapsedTime.minutes / 60);
  const progressPercent = Math.min((currentHours / targetHours) * 100, 100);

  const workModes = [
    { id: 'office', label: 'Office', icon: HiOutlineOfficeBuilding },
    { id: 'wfh', label: 'Work from Home', icon: HiOutlineHome },
    { id: 'remote', label: 'Remote', icon: HiOutlineGlobe },
  ];

  const handleRowClick = async (employee) => {
    setSelectedEmployee(employee);
    setDetailModalOpen(true);
    fetchEmployeeDetails(employee.employee_id);
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      setDetailLoading(true);
      // Use admin filters dates or default to current month if needed
      const fromDate = adminFilters.from_date;
      const toDate = adminFilters.to_date;

      const [summaryRes, historyRes] = await Promise.all([
        api.get(`/attendance/employee/${employeeId}/summary?from_date=${fromDate}&to_date=${toDate}`),
        api.get(`/attendance/employee/${employeeId}/history?from_date=${fromDate}&to_date=${toDate}`)
      ]);

      setEmployeeDetail({ stats: summaryRes, history: historyRes });
    } catch (error) {
      console.error("Error fetching employee details:", error);
      toast.error("Failed to load employee details");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header & Tabs */}
      {/* Header & Tabs */}
      <PageHeader
        title="Attendance"
        description="Track your work hours and attendance history"
      >
        {isAdmin && (
          <div className="flex bg-muted/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('my_attendance')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'my_attendance' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              My Attendance
            </button>
            <button
              onClick={() => setActiveTab('overall')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overall' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Overall Records
            </button>
          </div>
        )}
      </PageHeader>

      {/* My Attendance Tab */}
      {activeTab === 'my_attendance' && (
        <div className="space-y-6 animate-fade-in">
          {/* Check-in/Out Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader title="Today's Status" icon={<HiOutlineClock className="w-5 h-5" />} />
              <CardBody className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner 
                    ${myAttendance?.status === 'on_leave' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                      myAttendance?.check_in && !myAttendance?.check_out ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        'bg-muted text-muted-foreground'}`}>
                    {myAttendance?.status === 'on_leave' ? <HiOutlineCalendar /> : <HiOutlineClock />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {myAttendance?.status === 'on_leave' ? 'On Leave' :
                        myAttendance?.check_in && !myAttendance?.check_out ? 'Currently Working' :
                          myAttendance?.check_out ? 'Checked Out' : 'Not Checked In'}
                    </h3>
                    <p className="text-muted-foreground">
                      {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {timerActive && (
                      <div className="mt-2 text-2xl font-mono font-bold text-primary animate-pulse">
                        {formatTime(elapsedTime.hours)}:{formatTime(elapsedTime.minutes)}:{formatTime(elapsedTime.seconds)}
                      </div>
                    )}
                    {myAttendance?.status === 'on_leave' && myAttendance?.notes && (
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-1 font-medium">{myAttendance.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  {myAttendance?.status === 'on_leave' ? (
                    <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800">
                      <p className="text-amber-700 dark:text-amber-400 font-medium">🌴 You are on leave today</p>
                      <p className="text-xs text-muted-foreground mt-1">Enjoy your day off!</p>
                    </div>
                  ) : !myAttendance?.check_in ? (
                    <>
                      <div className="grid grid-cols-3 gap-2 bg-muted/50 p-1 rounded-lg">
                        {workModes.map(mode => (
                          <button
                            key={mode.id}
                            onClick={() => setWorkMode(mode.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-md text-xs transition-all ${workMode === mode.id ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:bg-background/50'}`}
                            title={mode.label}
                          >
                            <mode.icon className="w-5 h-5 mb-1" />
                            {mode.label}
                          </button>
                        ))}
                      </div>
                      <Button onClick={handleCheckIn} loading={myLoading} variant="primary" className="w-full shadow-lg shadow-primary/20 py-4 text-lg">
                        <HiOutlineLogin className="w-6 h-6 mr-2" /> Check In
                      </Button>
                    </>
                  ) : !myAttendance?.check_out ? (
                    <Button onClick={handleCheckOut} loading={myLoading} variant="danger" className="w-full shadow-lg shadow-red-500/20 py-4 text-lg">
                      <HiOutlineLogout className="w-6 h-6 mr-2" /> Check Out
                    </Button>
                  ) : (
                    <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800">
                      <p className="text-emerald-700 dark:text-emerald-400 font-medium">✨ Day Complete!</p>
                      <p className="text-xs text-muted-foreground mt-1">Total: {myAttendance.working_hours?.toFixed(1) || 0} hrs</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* My Stats */}
            <div className="space-y-4">
              <StatCard icon={<HiOutlineCheckCircle className="w-5 h-5" />} iconColor="blue" value={myStats.present_days || 0} label="Days Present" description="This Month" />
              <StatCard icon={<HiOutlineClock className="w-5 h-5" />} iconColor="green" value={`${Math.round(myStats.total_working_hours || 0)}h`} label="Total Hours" description="This Month" />
              <StatCard icon={<HiOutlineExclamation className="w-5 h-5" />} iconColor="orange" value={myStats.late_days || 0} label="Late Check-ins" description="This Month" />
            </div>
          </div>

          {/* My History */}
          <Card>
            <CardHeader title="My Attendance History" icon={<HiOutlineCalendar className="w-5 h-5" />} />
            <div className="table-container border-0 bg-transparent">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Work Mode</th>
                    <th>Status</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {myHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-muted/10">
                      <td className="font-medium text-foreground">{record.date}</td>
                      <td className="font-mono text-xs">{record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td className="font-mono text-xs">{record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium capitalize
                              ${record.work_mode === 'wfh' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                            record.work_mode === 'remote' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                          {record.work_mode === 'wfh' ? 'WFH' : record.work_mode}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={record.status} />
                          {record.is_late && <span title="Late" className="w-2 h-2 rounded-full bg-amber-500"></span>}
                        </div>
                      </td>
                      <td className="font-bold">{record.working_hours ? record.working_hours.toFixed(1) : '-'}</td>
                    </tr>
                  ))}
                  {myHistory.length === 0 && (
                    <tr><td colSpan="6" className="text-center py-8 text-muted-foreground">No history available for this month.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'overall' && isAdmin && (
        <div className="space-y-6 animate-fade-in">
          {/* Analytics Dashboard */}
          {adminStats && (
            // ... (existing adminStats render) ...
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<HiOutlineUserGroup className="w-6 h-6" />}
                iconColor="blue"
                value={adminStats.total_active_employees}
                label="Active Employees"
                description="Total eligible staff"
              />
              <StatCard
                icon={<HiOutlineCheckCircle className="w-6 h-6" />}
                iconColor="green"
                value={`${adminStats.total_present} (${adminStats.total_active_employees > 0 ? Math.round((adminStats.total_present / adminStats.total_active_employees) * 100) : 0}%)`}
                label="Present"
                description="Checked in today/range"
              />
              <StatCard
                icon={<HiOutlineExclamation className="w-6 h-6" />}
                iconColor="orange"
                value={adminStats.total_late}
                label="Late Arrivals"
                description="Checked in after grace period"
              />
              <StatCard
                icon={<HiOutlineHome className="w-6 h-6" />}
                iconColor="purple"
                value={adminStats.total_wfh}
                label="Working Remote"
                description="WFH / Remote mode"
              />
            </div>
          )}

          {/* Filters */}
          <Card>
            {/* ... (existing filters render) ... */}
            <CardHeader title="Filter Records" icon={<HiOutlineFilter className="w-5 h-5 text-muted-foreground" />} />
            <CardBody className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">From Date</label>
                <input type="date" name="from_date" value={adminFilters.from_date} onChange={handleAdminFilterChange} className="input" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">To Date</label>
                <input type="date" name="to_date" value={adminFilters.to_date} onChange={handleAdminFilterChange} className="input" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Status</label>
                <select name="status" value={adminFilters.status} onChange={handleAdminFilterChange} className="input">
                  <option value="">All Statuses</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="half_day">Half Day</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button variant="primary" className="w-full" onClick={fetchAdminData} loading={adminLoading}>
                  <HiOutlineSearch className="w-4 h-4 mr-2" /> Apply Filters
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Overall Table */}
          <Card>
            <div className="table-container border-0 bg-transparent">
              {adminLoading && adminAttendance.length === 0 ? (
                <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
              ) : adminAttendance.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <HiOutlineUserGroup className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No attendance records found for the selected criteria.</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Work Mode</th>
                      <th>Status</th>
                      <th>Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminAttendance.map((record) => (
                      <tr
                        key={record.id}
                        className="hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(record)}
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar name={record.employee_name} size="sm" />
                            <div>
                              <p className="font-medium text-foreground">{record.employee_name}</p>
                              <p className="text-xs text-muted-foreground">{record.employee_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-sm text-muted-foreground font-mono">
                          {record.date}
                        </td>
                        <td className="font-mono text-sm">
                          {record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="font-mono text-sm">
                          {record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium capitalize
                                                ${record.work_mode === 'wfh' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              record.work_mode === 'remote' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                            {record.work_mode === 'wfh' ? 'WFH' : record.work_mode}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={record.status} />
                            {record.is_late && (
                              <span title="Late" className="w-2 h-2 rounded-full bg-amber-500"></span>
                            )}
                          </div>
                        </td>
                        <td className="font-mono text-sm font-medium">
                          {record.working_hours ? `${record.working_hours.toFixed(1)}h` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination (existing) */}
            {adminPagination.pages > 1 && (
              <div className="p-4 border-t border-border/50 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Page {adminPagination.page} of {adminPagination.pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={adminPagination.page === 1}
                    onClick={() => setAdminPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={adminPagination.page === adminPagination.pages}
                    onClick={() => setAdminPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl bg-background rounded-2xl shadow-xl border border-border flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Avatar name={selectedEmployee.employee_name} size="sm" />
                  {selectedEmployee.employee_name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedEmployee.employee_code} • Attendance Details
                </p>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
                <div className="flex justify-center p-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Summary Stats */}
                  {employeeDetail.stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Present</div>
                        <div className="text-2xl font-bold text-foreground">{employeeDetail.stats.present_days} <span className="text-sm font-normal text-muted-foreground">/ {employeeDetail.stats.total_days} days</span></div>
                      </div>
                      <div className="p-4 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-800">
                        <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Total Hours</div>
                        <div className="text-2xl font-bold text-foreground">{Math.round(employeeDetail.stats.total_working_hours)}h</div>
                      </div>
                      <div className="p-4 rounded-xl bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800">
                        <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">Late Days</div>
                        <div className="text-2xl font-bold text-foreground">{employeeDetail.stats.late_days}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800">
                        <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">WFH</div>
                        <div className="text-2xl font-bold text-foreground">{employeeDetail.stats.wfh_days}</div>
                      </div>
                    </div>
                  )}

                  {/* History Table */}
                  <div>
                    <h3 className="font-bold text-foreground mb-4">History ({adminFilters.from_date} to {adminFilters.to_date})</h3>
                    <div className="border border-border/50 rounded-xl overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
                          <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Check In</th>
                            <th className="px-4 py-3">Check Out</th>
                            <th className="px-4 py-3">Hours</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {employeeDetail.history.map((record) => (
                            <tr key={record.id} className="hover:bg-muted/20">
                              <td className="px-4 py-3 font-medium text-foreground">{record.date}</td>
                              <td className="px-4 py-3 font-mono text-xs">{record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                              <td className="px-4 py-3 font-mono text-xs">{record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                              <td className="px-4 py-3 font-bold">{record.working_hours ? record.working_hours.toFixed(1) : '-'}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded textxs font-medium capitalize bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`}>
                                    {record.status}
                                  </span>
                                  {record.is_late && <span className="w-2 h-2 rounded-full bg-amber-500" title="Late"></span>}
                                </div>
                              </td>
                            </tr>
                          ))}
                          {employeeDetail.history.length === 0 && (
                            <tr>
                              <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">No records found for this period.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
              <Button variant="secondary" onClick={() => setDetailModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
