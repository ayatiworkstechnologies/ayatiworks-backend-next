'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody, StatCard, StatusBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import {
  HiOutlineDocumentReport, HiOutlineChartPie, HiOutlineUsers,
  HiOutlineCalendar, HiOutlineBriefcase, HiOutlineCurrencyDollar,
  HiOutlineClock, HiOutlineDownload, HiOutlineEye
} from 'react-icons/hi';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('this_month');

  const reportTypes = [
    { id: 'attendance', title: 'Attendance Report', icon: HiOutlineClock, description: 'Employee attendance statistics', color: 'blue' },
    { id: 'leave', title: 'Leave Report', icon: HiOutlineCalendar, description: 'Leave utilization and trends', color: 'green' },
    { id: 'project', title: 'Project Report', icon: HiOutlineBriefcase, description: 'Project progress and timelines', color: 'purple' },
    { id: 'timesheet', title: 'Timesheet Report', icon: HiOutlineChartPie, description: 'Hours logged and billing', color: 'orange' },
    { id: 'employee', title: 'Employee Report', icon: HiOutlineUsers, description: 'Workforce analytics', color: 'blue' },
    { id: 'payroll', title: 'Payroll Report', icon: HiOutlineCurrencyDollar, description: 'Salary and compensation', color: 'green' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and view system reports</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="px-4 py-2 rounded-xl border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
          <Button variant="primary" className="shadow-lg shadow-primary/20">
            <HiOutlineDownload className="w-5 h-5" /> Export All
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<HiOutlineUsers className="w-6 h-6" />} iconColor="blue" value="156" label="Total Employees" />
        <StatCard icon={<HiOutlineCalendar className="w-6 h-6" />} iconColor="green" value="94.5%" label="Attendance Rate" />
        <StatCard icon={<HiOutlineBriefcase className="w-6 h-6" />} iconColor="purple" value="12" label="Active Projects" />
        <StatCard icon={<HiOutlineCurrencyDollar className="w-6 h-6" />} iconColor="orange" value="$125K" label="Monthly Revenue" />
      </div>

      {/* Available Reports */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <HiOutlineDocumentReport className="w-5 h-5 text-primary" /> Available Reports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} className="group hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer">
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${report.color}-500/10 text-${report.color}-600 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{report.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6 pt-4 border-t border-border/30">
                    <Button variant="secondary" size="sm" className="flex-1">
                      <HiOutlineEye className="w-4 h-4" /> View
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                      <HiOutlineDownload className="w-4 h-4" />
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
              {[
                { name: 'January Attendance Report', type: 'Attendance', range: 'Jan 1-31, 2026', date: 'Jan 17, 2026', status: 'completed' },
                { name: 'Q4 2025 Project Summary', type: 'Project', range: 'Oct-Dec 2025', date: 'Jan 15, 2026', status: 'archived' },
                { name: 'Employee Leave Analysis', type: 'Leave', range: 'Year 2025', date: 'Jan 10, 2026', status: 'completed' },
              ].map((report, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="font-medium text-foreground">{report.name}</td>
                  <td>
                    <StatusBadge status={report.type.toLowerCase()} />
                  </td>
                  <td className="text-muted-foreground text-sm">{report.range}</td>
                  <td className="text-muted-foreground text-sm">{report.date}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View"><HiOutlineEye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Download"><HiOutlineDownload className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
