/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Card, CardHeader, CardBody, PageHeader, StatusBadge, Button
} from '@/components/ui';
import {
    HiOutlineCurrencyDollar, HiOutlineDocumentText, HiOutlineUserGroup,
    HiOutlineCheckCircle, HiOutlinePlus, HiOutlineRefresh, HiX,
    HiOutlineSearch, HiOutlineFilter
} from 'react-icons/hi';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Tabs ────────────────────────────────────────────────────────

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`relative px-6 py-3 text-sm font-medium transition-colors duration-200 ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
    >
        {children}
        {active && (
            <motion.div
                layoutId="payrollTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
            />
        )}
    </button>
);

// ─── Metric Card ─────────────────────────────────────────────────

const MetricCard = ({ title, value, icon: Icon, colorClass, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
    >
        <Card className="h-full border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 group">
            <CardBody className="flex items-center gap-5">
                <div className={`p-4 rounded-xl ${colorClass} bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
                </div>
            </CardBody>
        </Card>
    </motion.div>
);

// ─── Generate Modal ──────────────────────────────────────────────

const GenerateModal = ({ onClose, onGenerate }) => {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [loading, setLoading] = useState(false);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onGenerate(month, year);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                <div className="flex justify-between items-center p-6 border-b border-border/50">
                    <h3 className="text-xl font-bold">Generate Payroll</h3>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors">
                        <HiX className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Month</label>
                            <select
                                value={month}
                                onChange={(e) => setMonth(Number(e.target.value))}
                                className="input w-full bg-white/5 border-white/10"
                            >
                                {months.map((m, i) => (
                                    <option key={i} value={i + 1} className="bg-slate-900">{m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Year</label>
                            <select
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="input w-full bg-white/5 border-white/10"
                            >
                                {[2024, 2025, 2026, 2027].map(y => (
                                    <option key={y} value={y} className="bg-slate-900">{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        This will generate payslips for all employees with active salary structures.
                        Employees who already have payslips for this period will be skipped.
                    </p>
                    <div className="flex gap-3 justify-end pt-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Generating...' : 'Generate Payslips'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// ─── Salary Structure Modal ──────────────────────────────────────

const SalaryModal = ({ onClose, onSave, employees }) => {
    const [form, setForm] = useState({
        employee_id: '', basic: '', hra: '', da: '',
        transport_allowance: '', medical_allowance: '', special_allowance: '',
        pf_employee: '', pf_employer: '', esi_employee: '', esi_employer: '',
        professional_tax: '', tds: '',
        effective_from: new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (key, val) => setForm({ ...form, [key]: val });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = { ...form };
        // Convert numeric fields
        ['basic', 'hra', 'da', 'transport_allowance', 'medical_allowance', 'special_allowance',
            'pf_employee', 'pf_employer', 'esi_employee', 'esi_employer', 'professional_tax', 'tds'
        ].forEach(k => {
            payload[k] = parseFloat(payload[k]) || 0;
        });
        payload.employee_id = parseInt(payload.employee_id);
        await onSave(payload);
        setLoading(false);
    };

    const numField = (label, key) => (
        <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            <input type="number" step="0.01" className="input w-full bg-white/5 border-white/10 text-sm"
                value={form[key]} onChange={(e) => handleChange(key, e.target.value)} placeholder="0.00" />
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            >
                <div className="flex justify-between items-center p-6 border-b border-border/50">
                    <h3 className="text-xl font-bold">New Salary Structure</h3>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors">
                        <HiX className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">Employee</label>
                            <select required value={form.employee_id}
                                onChange={(e) => handleChange('employee_id', e.target.value)}
                                className="input w-full bg-white/5 border-white/10">
                                <option value="" className="bg-slate-900">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id} className="bg-slate-900">
                                        {emp.user?.first_name || emp.first_name} {emp.user?.last_name || emp.last_name || ''} ({emp.employee_code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Effective From</label>
                            <input type="date" className="input w-full bg-white/5 border-white/10 text-sm"
                                value={form.effective_from} onChange={(e) => handleChange('effective_from', e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider">Earnings</h4>
                        <div className="grid grid-cols-3 gap-3">
                            {numField('Basic', 'basic')}
                            {numField('HRA', 'hra')}
                            {numField('DA', 'da')}
                            {numField('Transport', 'transport_allowance')}
                            {numField('Medical', 'medical_allowance')}
                            {numField('Special', 'special_allowance')}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-red-400 mb-3 uppercase tracking-wider">Deductions</h4>
                        <div className="grid grid-cols-3 gap-3">
                            {numField('PF (Employee)', 'pf_employee')}
                            {numField('PF (Employer)', 'pf_employer')}
                            {numField('ESI (Employee)', 'esi_employee')}
                            {numField('ESI (Employer)', 'esi_employer')}
                            {numField('Prof. Tax', 'professional_tax')}
                            {numField('TDS', 'tds')}
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-2 border-t border-border/50">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Create Salary Structure'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// ─── Format Helpers ──────────────────────────────────────────────

const fmt = (n) => {
    const num = parseFloat(n) || 0;
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const monthName = (m) => {
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[m] || '';
};

// ═════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════

export default function PayrollPage() {
    const [activeTab, setActiveTab] = useState('payslips');
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);
    const [payslips, setPayslips] = useState([]);
    const [salaryStructures, setSalaryStructures] = useState([]);
    const [employees, setEmployees] = useState([]);

    // Filters
    const now = new Date();
    const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
    const [filterYear, setFilterYear] = useState(now.getFullYear());
    const [filterStatus, setFilterStatus] = useState('');

    // Modals
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showSalaryModal, setShowSalaryModal] = useState(false);

    const toast = useToast();

    useEffect(() => {
        fetchSummary();
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (activeTab === 'payslips') fetchPayslips();
        if (activeTab === 'salary') fetchSalaryStructures();
    }, [activeTab, filterMonth, filterYear, filterStatus]);

    const fetchSummary = async () => {
        try {
            const res = await api.get('/payroll/summary');
            setSummary(res);
        } catch (e) {
            console.error('Summary:', e);
        }
    };

    const fetchPayslips = async () => {
        try {
            setLoading(true);
            const params = { month: filterMonth, year: filterYear };
            if (filterStatus) params.status_filter = filterStatus;
            const res = await api.get('/payroll/payslips', { params });
            setPayslips(res.items || []);
        } catch (e) {
            console.error('Payslips:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchSalaryStructures = async () => {
        try {
            setLoading(true);
            const res = await api.get('/payroll/salary-structures');
            setSalaryStructures(res.items || []);
        } catch (e) {
            console.error('Structures:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees?page_size=200');
            setEmployees(res.items || []);
        } catch (e) {
            console.error('Employees:', e);
        }
    };

    const handleGenerate = async (month, year) => {
        try {
            const res = await api.post('/payroll/payslips/generate', { month, year });
            toast.success(res?.message || 'Payslips generated');
            setShowGenerateModal(false);
            setFilterMonth(month);
            setFilterYear(year);
            fetchPayslips();
            fetchSummary();
        } catch (e) {
            toast.error(e?.response?.data?.detail || 'Generation failed');
        }
    };

    const handleCreateSalary = async (data) => {
        try {
            await api.post('/payroll/salary-structures', data);
            toast.success('Salary structure created');
            setShowSalaryModal(false);
            fetchSalaryStructures();
            fetchSummary();
        } catch (e) {
            toast.error(e?.response?.data?.detail || 'Failed to create');
        }
    };

    const handleApprove = async (slipId, newStatus) => {
        try {
            await api.put(`/payroll/payslips/${slipId}/approve`, { status: newStatus });
            toast.success(`Payslip ${newStatus}`);
            fetchPayslips();
            fetchSummary();
        } catch (e) {
            toast.error(e?.response?.data?.detail || 'Action failed');
        }
    };

    const tabs = [
        { id: 'payslips', label: 'Payslips' },
        { id: 'salary', label: 'Salary Structures' },
    ];

    const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <div className="space-y-8 animate-fade-in-up pb-10">
            <PageHeader
                title="Payroll Management"
                description="Manage salary structures, generate payslips, and track payments"
            >
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setShowSalaryModal(true)}>
                        <HiOutlinePlus className="w-4 h-4 mr-2" /> Salary Structure
                    </Button>
                    <Button variant="primary" onClick={() => setShowGenerateModal(true)}
                        className="shadow-lg shadow-primary/20">
                        <HiOutlineRefresh className="w-4 h-4 mr-2" /> Generate Payroll
                    </Button>
                </div>
            </PageHeader>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <MetricCard title="Employees with Salary" value={summary.total_employees_with_salary}
                        icon={HiOutlineUserGroup} colorClass="bg-blue-500 text-blue-100" delay={0} />
                    <MetricCard title={`Payslips (${monthName(summary.current_month)} ${summary.current_year})`}
                        value={summary.total_payslips}
                        icon={HiOutlineDocumentText} colorClass="bg-purple-500 text-purple-100" delay={0.1} />
                    <MetricCard title="Total Net Pay" value={fmt(summary.total_net)}
                        icon={HiOutlineCurrencyDollar} colorClass="bg-emerald-500 text-emerald-100" delay={0.2} />
                    <MetricCard title="Paid Payslips" value={summary.paid_payslips}
                        icon={HiOutlineCheckCircle} colorClass="bg-amber-500 text-amber-100" delay={0.3} />
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-white/10">
                <div className="flex gap-2">
                    {tabs.map(tab => (
                        <TabButton key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
                            {tab.label}
                        </TabButton>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>

                    {/* ─── PAYSLIPS TAB ─── */}
                    {activeTab === 'payslips' && (
                        <Card className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-md">
                            <CardHeader title="Monthly Payslips">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))}
                                        className="bg-white/5 border border-white/10 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-primary/50">
                                        {months.slice(1).map((m, i) => (
                                            <option key={i} value={i + 1} className="bg-slate-900">{m}</option>
                                        ))}
                                    </select>
                                    <select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))}
                                        className="bg-white/5 border border-white/10 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-primary/50">
                                        {[2024, 2025, 2026, 2027].map(y => (
                                            <option key={y} value={y} className="bg-slate-900">{y}</option>
                                        ))}
                                    </select>
                                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-primary/50">
                                        <option value="" className="bg-slate-900">All Status</option>
                                        <option value="draft" className="bg-slate-900">Draft</option>
                                        <option value="generated" className="bg-slate-900">Generated</option>
                                        <option value="approved" className="bg-slate-900">Approved</option>
                                        <option value="paid" className="bg-slate-900">Paid</option>
                                    </select>
                                </div>
                            </CardHeader>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr className="bg-white/5">
                                            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee</th>
                                            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Period</th>
                                            <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gross</th>
                                            <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deductions</th>
                                            <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net Pay</th>
                                            <th className="text-center p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                            <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loading ? (
                                            <tr><td colSpan="7" className="text-center p-12 text-muted-foreground">Loading...</td></tr>
                                        ) : payslips.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center p-12 text-muted-foreground">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <HiOutlineDocumentText className="w-10 h-10 opacity-40" />
                                                        <p>No payslips for {months[filterMonth]} {filterYear}</p>
                                                        <Button variant="primary" size="sm" onClick={() => setShowGenerateModal(true)}>
                                                            Generate Payroll
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : payslips.map((slip, i) => (
                                            <motion.tr key={slip.id}
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                                className="hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium">{slip.employee_name || 'N/A'}</p>
                                                        <p className="text-xs text-muted-foreground">{slip.employee_code} · {slip.department_name || ''}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-muted-foreground">
                                                    {months[slip.month]} {slip.year}
                                                </td>
                                                <td className="p-4 text-right font-medium text-emerald-400">{fmt(slip.gross)}</td>
                                                <td className="p-4 text-right text-sm text-red-400">{fmt(slip.total_deductions)}</td>
                                                <td className="p-4 text-right font-bold">{fmt(slip.net)}</td>
                                                <td className="p-4 text-center">
                                                    <StatusBadge status={slip.status} />
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        {['draft', 'generated'].includes(slip.status) && (
                                                            <button onClick={() => handleApprove(slip.id, 'approved')}
                                                                className="text-xs px-3 py-1 rounded-md bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                                                                Approve
                                                            </button>
                                                        )}
                                                        {slip.status === 'approved' && (
                                                            <button onClick={() => handleApprove(slip.id, 'paid')}
                                                                className="text-xs px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                                                                Mark Paid
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {/* ─── SALARY STRUCTURES TAB ─── */}
                    {activeTab === 'salary' && (
                        <Card className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-md">
                            <CardHeader title="Salary Structures">
                                <Button variant="secondary" size="sm" onClick={() => setShowSalaryModal(true)}>
                                    <HiOutlinePlus className="w-4 h-4 mr-1" /> Add New
                                </Button>
                            </CardHeader>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr className="bg-white/5">
                                            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee</th>
                                            <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Basic</th>
                                            <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">HRA</th>
                                            <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gross</th>
                                            <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deductions</th>
                                            <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net</th>
                                            <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">CTC</th>
                                            <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Effective</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loading ? (
                                            <tr><td colSpan="8" className="text-center p-12 text-muted-foreground">Loading...</td></tr>
                                        ) : salaryStructures.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="text-center p-12 text-muted-foreground">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <HiOutlineCurrencyDollar className="w-10 h-10 opacity-40" />
                                                        <p>No salary structures configured yet</p>
                                                        <Button variant="primary" size="sm" onClick={() => setShowSalaryModal(true)}>
                                                            Add Salary Structure
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : salaryStructures.map((s, i) => {
                                            const totalDed = parseFloat(s.pf_employee || 0) + parseFloat(s.esi_employee || 0) +
                                                parseFloat(s.professional_tax || 0) + parseFloat(s.tds || 0);
                                            return (
                                                <motion.tr key={s.id}
                                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    className="hover:bg-white/5 transition-colors">
                                                    <td className="p-4">
                                                        <div>
                                                            <p className="font-medium">{s.employee_name || 'N/A'}</p>
                                                            <p className="text-xs text-muted-foreground">{s.employee_code}</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right text-sm">{fmt(s.basic)}</td>
                                                    <td className="p-4 text-right text-sm">{fmt(s.hra)}</td>
                                                    <td className="p-4 text-right font-medium text-emerald-400">{fmt(s.gross_salary)}</td>
                                                    <td className="p-4 text-right text-sm text-red-400">{fmt(totalDed)}</td>
                                                    <td className="p-4 text-right font-bold">{fmt(s.net_salary)}</td>
                                                    <td className="p-4 text-right text-sm text-primary">{fmt(s.ctc)}</td>
                                                    <td className="p-4 text-sm text-muted-foreground">
                                                        {s.effective_from}
                                                        {s.effective_to ? ` → ${s.effective_to}` : ' → Present'}
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {showGenerateModal && (
                    <GenerateModal onClose={() => setShowGenerateModal(false)} onGenerate={handleGenerate} />
                )}
                {showSalaryModal && (
                    <SalaryModal onClose={() => setShowSalaryModal(false)} onSave={handleCreateSalary} employees={employees} />
                )}
            </AnimatePresence>
        </div>
    );
}
