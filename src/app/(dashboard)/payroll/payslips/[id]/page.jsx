'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Card, CardHeader, CardBody, PageHeader, StatusBadge, Button
} from '@/components/ui';
import {
    HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineCurrencyDollar,
    HiOutlinePrinter
} from 'react-icons/hi';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { motion } from 'framer-motion';

const fmt = (n) => {
    const num = parseFloat(n) || 0;
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const DetailRow = ({ label, value, highlight, deduction }) => (
    <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`text-sm font-medium ${deduction ? 'text-red-400' : highlight ? 'text-emerald-400 font-bold text-base' : ''}`}>
            {fmt(value)}
        </span>
    </div>
);

export default function PayslipDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const toast = useToast();
    const [slip, setSlip] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayslip();
    }, [id]);

    const fetchPayslip = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/payroll/payslips/${id}`);
            setSlip(res);
        } catch (e) {
            toast.error('Failed to load payslip');
            router.push('/payroll');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (newStatus) => {
        try {
            await api.put(`/payroll/payslips/${id}/approve`, { status: newStatus });
            toast.success(`Payslip ${newStatus}`);
            fetchPayslip();
        } catch (e) {
            toast.error(e?.response?.data?.detail || 'Action failed');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse text-muted-foreground">Loading payslip...</div>
            </div>
        );
    }

    if (!slip) return null;

    return (
        <div className="space-y-8 animate-fade-in-up pb-10 max-w-4xl mx-auto">
            <PageHeader
                title={`Payslip — ${months[slip.month]} ${slip.year}`}
                description={`${slip.employee_name || 'N/A'} (${slip.employee_code || ''})`}
            >
                <div className="flex gap-3 items-center">
                    <StatusBadge status={slip.status} />
                    {['draft', 'generated'].includes(slip.status) && (
                        <Button variant="primary" onClick={() => handleApprove('approved')}>
                            <HiOutlineCheckCircle className="w-4 h-4 mr-2" /> Approve
                        </Button>
                    )}
                    {slip.status === 'approved' && (
                        <Button variant="primary" onClick={() => handleApprove('paid')}>
                            <HiOutlineCurrencyDollar className="w-4 h-4 mr-2" /> Mark Paid
                        </Button>
                    )}
                    <Button variant="secondary" onClick={() => window.print()}>
                        <HiOutlinePrinter className="w-4 h-4 mr-2" /> Print
                    </Button>
                    <Button variant="ghost" onClick={() => router.push('/payroll')}>
                        <HiOutlineArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                </div>
            </PageHeader>

            {/* Working Days Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                    <CardHeader title="Attendance Summary" />
                    <CardBody>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                            <div className="space-y-1">
                                <p className="text-2xl font-bold">{slip.total_days}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Days</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-2xl font-bold">{slip.working_days}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Working Days</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-2xl font-bold text-emerald-400">{slip.present_days}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Present</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-2xl font-bold text-amber-400">{slip.leave_days}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Leaves</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-2xl font-bold text-red-400">{slip.lop_days}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">LOP Days</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            {/* Earnings & Deductions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="h-full border-white/10 bg-white/5 backdrop-blur-md">
                        <CardHeader title="Earnings" />
                        <CardBody className="space-y-0">
                            <DetailRow label="Basic Salary" value={slip.basic} />
                            <DetailRow label="HRA" value={slip.hra} />
                            <DetailRow label="DA" value={slip.da} />
                            <DetailRow label="Transport Allowance" value={slip.transport} />
                            <DetailRow label="Medical Allowance" value={slip.medical} />
                            <DetailRow label="Special Allowance" value={slip.special} />
                            {parseFloat(slip.overtime) > 0 && <DetailRow label="Overtime" value={slip.overtime} />}
                            {parseFloat(slip.bonus) > 0 && <DetailRow label="Bonus" value={slip.bonus} />}
                            <div className="pt-3 mt-3 border-t border-white/10">
                                <DetailRow label="Gross Salary" value={slip.gross} highlight />
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="h-full border-white/10 bg-white/5 backdrop-blur-md">
                        <CardHeader title="Deductions" />
                        <CardBody className="space-y-0">
                            <DetailRow label="Provident Fund" value={slip.pf} deduction />
                            <DetailRow label="ESI" value={slip.esi} deduction />
                            <DetailRow label="Professional Tax" value={slip.professional_tax} deduction />
                            <DetailRow label="TDS" value={slip.tds} deduction />
                            {parseFloat(slip.lop_deduction) > 0 && (
                                <DetailRow label="LOP Deduction" value={slip.lop_deduction} deduction />
                            )}
                            <div className="pt-3 mt-3 border-t border-white/10">
                                <DetailRow label="Total Deductions" value={slip.total_deductions} deduction />
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            </div>

            {/* Net Pay */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="border-primary/30 bg-primary/5 backdrop-blur-md">
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Net Pay</p>
                                <p className="text-4xl font-bold text-primary mt-1">{fmt(slip.net)}</p>
                            </div>
                            {slip.payment_date && (
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground uppercase">Paid on</p>
                                    <p className="font-medium">{slip.payment_date}</p>
                                    {slip.payment_method && (
                                        <p className="text-sm text-muted-foreground">{slip.payment_method}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </motion.div>
        </div>
    );
}
