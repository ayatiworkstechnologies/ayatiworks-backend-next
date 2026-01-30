'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardBody, StatCard, StatusBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlineDocumentReport, HiOutlineChartPie, HiOutlineUsers,
  HiOutlineCalendar, HiOutlineBriefcase, HiOutlineCurrencyDollar,
  HiOutlineClock, HiOutlineDownload, HiOutlineEye, HiOutlineRefresh,
  HiOutlinePlus, HiOutlineCheckCircle, HiOutlineExclamationCircle
} from 'react-icons/hi';

export default function ReportsPage() {
  const toast = useToast();
  const [dateRange, setDateRange] = useState('this_month');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [customDateRange, setCustomDateRange] = useState({ from: '', to: '' });
  const [recentReports, setRecentReports] = useState([]);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats');
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Load recent reports from localStorage
    const saved = localStorage.getItem('recentReports');
    if (saved) {
      setRecentReports(JSON.parse(saved));
    }
  }, [fetchStats]);

  const reportTypes = [
    { id: 'attendance', title: 'Attendance Report', icon: HiOutlineClock, description: 'Employee attendance statistics', color: 'blue', bgClass: 'bg-blue-500/10 text-blue-600' },
    { id: 'leave', title: 'Leave Report', icon: HiOutlineCalendar, description: 'Leave utilization and trends', color: 'green', bgClass: 'bg-emerald-500/10 text-emerald-600' },
    { id: 'project', title: 'Project Report', icon: HiOutlineBriefcase, description: 'Project progress and timelines', color: 'purple', bgClass: 'bg-purple-500/10 text-purple-600' },
    { id: 'timesheet', title: 'Timesheet Report', icon: HiOutlineChartPie, description: 'Hours logged and billing', color: 'orange', bgClass: 'bg-orange-500/10 text-orange-600' },
    { id: 'employee', title: 'Employee Report', icon: HiOutlineUsers, description: 'Workforce analytics', color: 'cyan', bgClass: 'bg-cyan-500/10 text-cyan-600' },
    { id: 'payroll', title: 'Payroll Report', icon: HiOutlineCurrencyDollar, description: 'Salary and compensation', color: 'pink', bgClass: 'bg-pink-500/10 text-pink-600' },
  ];

  const getDateRangeLabel = (range) => {
    const labels = {
      today: 'Today',
      this_week: 'This Week',
      this_month: 'This Month',
      last_month: 'Last Month',
      this_quarter: 'This Quarter',
      this_year: 'This Year',
      custom: 'Custom Range'
    };
    return labels[range] || range;
  };

  const handleGenerateReport = async () => {
    if (!selectedReportType) return;

    setGeneratingReport(selectedReportType.id);
    setShowGenerateModal(false);

    try {
      // Simulate report generation (in real app, call backend API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newReport = {
        id: Date.now(),
        name: `${selectedReportType.title} - ${getDateRangeLabel(dateRange)}`,
        type: selectedReportType.id,
        range: getDateRangeLabel(dateRange),
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'completed'
      };

      const updatedReports = [newReport, ...recentReports.slice(0, 9)];
      setRecentReports(updatedReports);
      localStorage.setItem('recentReports', JSON.stringify(updatedReports));

      toast?.success?.(`${selectedReportType.title} generated successfully!`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast?.error?.('Failed to generate report');
    } finally {
      setGeneratingReport(null);
      setSelectedReportType(null);
    }
  };

  const generateCSV = (report) => {
    // Generate realistic mock data based on report type
    let headers = [];
    let rows = [];

    switch (report.type) {
      case 'attendance':
        headers = ['Employee ID', 'Name', 'Date', 'Status', 'Check In', 'Check Out', 'Total Hours'];
        rows = Array(10).fill(0).map((_, i) => [
          `EMP${100 + i}`,
          `Employee ${i + 1}`,
          new Date().toLocaleDateString(),
          Math.random() > 0.1 ? 'Present' : 'Absent',
          '09:00 AM',
          '06:00 PM',
          '9.0'
        ]);
        break;
      case 'leave':
        headers = ['Employee ID', 'Name', 'Leave Type', 'From Date', 'To Date', 'Reason', 'Status'];
        rows = Array(5).fill(0).map((_, i) => [
          `EMP${100 + i}`,
          `Employee ${i + 1}`,
          ['Sick Leave', 'Casual Leave', 'Earned Leave'][Math.floor(Math.random() * 3)],
          new Date().toLocaleDateString(),
          new Date(Date.now() + 86400000).toLocaleDateString(),
          'Personal reason',
          'Approved'
        ]);
        break;
      case 'employee':
        headers = ['Employee ID', 'Name', 'Department', 'Designation', 'Joining Date', 'Status'];
        rows = Array(10).fill(0).map((_, i) => [
          `EMP${100 + i}`,
          `Employee ${i + 1}`,
          ['IT', 'HR', 'Sales', 'Marketing'][Math.floor(Math.random() * 4)],
          ['Developer', 'Manager', 'Executive'][Math.floor(Math.random() * 3)],
          new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
          'Active'
        ]);
        break;
      default:
        headers = ['ID', 'Name', 'Date', 'Value'];
        rows = Array(5).fill(0).map((_, i) => [i + 1, `Item ${i + 1}`, new Date().toLocaleDateString(), Math.floor(Math.random() * 100)]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadReport = (report) => {
    try {
      toast.info(`Generating ${report.name}...`);
      const csvContent = generateCSV(report);
      const filename = `${report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;

      downloadCSV(csvContent, filename);
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report');
    }
  };

  const handleViewReport = (report) => {
    toast?.info?.(`Viewing ${report.name}...`);
  };

  const openGenerateModal = (report) => {
    setSelectedReportType(report);
    setShowGenerateModal(true);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <HiOutlineDocumentReport className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports</h1>
            <p className="text-muted-foreground text-sm">Generate and view system reports</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="px-4 py-2.5 rounded-xl border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_year">This Year</option>
          </select>
          <Button variant="ghost" size="sm" onClick={fetchStats} disabled={loading}>
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="h-28 bg-muted/20 rounded-2xl animate-pulse" />)
        ) : (
          <>
            <StatCard icon={<HiOutlineUsers className="w-6 h-6" />} iconColor="blue" value={stats?.total_employees || 0} label="Total Employees" />
            <StatCard icon={<HiOutlineCalendar className="w-6 h-6" />} iconColor="green" value={`${stats?.attendance_rate || 0}%`} label="Attendance Rate" />
            <StatCard icon={<HiOutlineBriefcase className="w-6 h-6" />} iconColor="purple" value={stats?.active_projects || 0} label="Active Projects" />
            <StatCard icon={<HiOutlineCurrencyDollar className="w-6 h-6" />} iconColor="orange" value={stats?.total_revenue ? `$${(stats.total_revenue / 1000).toFixed(0)}K` : '$0'} label="Monthly Revenue" />
          </>
        )}
      </div>

      {/* Available Reports */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <HiOutlineDocumentReport className="w-5 h-5 text-primary" /> Available Reports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const isGenerating = generatingReport === report.id;
            return (
              <Card key={report.id} className="group hover:ring-2 hover:ring-primary/20 transition-all border-0 shadow-lg overflow-hidden">
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${report.bgClass} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{report.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6 pt-4 border-t border-border/30">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => openGenerateModal(report)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <HiOutlinePlus className="w-4 h-4" /> Generate
                        </>
                      )}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Reports Table */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <CardHeader title="Recent Reports" subtitle="History of generated reports" className="bg-muted/10" />
        <div className="table-container border-0 bg-transparent">
          {recentReports.length === 0 ? (
            <div className="py-16 px-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                <HiOutlineDocumentReport className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">No reports generated</h3>
              <p className="text-muted-foreground text-sm">Generate your first report using the options above</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th className="w-[30%]">Report Name</th>
                  <th>Type</th>
                  <th>Date Range</th>
                  <th>Generated On</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr key={report.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500" />
                        {report.name}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={report.type} />
                    </td>
                    <td className="text-muted-foreground text-sm">{report.range}</td>
                    <td className="text-muted-foreground text-sm">{report.date}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:text-primary hover:bg-primary/10"
                          title="View"
                          onClick={() => handleViewReport(report)}
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:text-emerald-600 hover:bg-emerald-50"
                          title="Download"
                          onClick={() => handleDownloadReport(report)}
                        >
                          <HiOutlineDownload className="w-4 h-4" />
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

      {/* Generate Report Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title={`Generate ${selectedReportType?.title || 'Report'}`}
      >
        <div className="space-y-6">
          <div className="p-4 bg-muted/20 rounded-xl border border-border/50">
            <div className="flex items-center gap-4">
              {selectedReportType && (
                <>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedReportType.bgClass}`}>
                    <selectedReportType.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{selectedReportType.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedReportType.description}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="this_quarter">This Quarter</option>
                <option value="this_year">This Year</option>
              </select>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <div className="flex items-start gap-2">
                <HiOutlineExclamationCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  The report will include data for <strong>{getDateRangeLabel(dateRange)}</strong>.
                  This may take a few moments depending on the data volume.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleGenerateReport} className="shadow-lg shadow-primary/20">
              <HiOutlineDocumentReport className="w-4 h-4" /> Generate Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

