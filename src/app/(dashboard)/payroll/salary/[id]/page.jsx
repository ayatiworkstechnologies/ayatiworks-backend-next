'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Card, CardHeader, CardBody, PageHeader, Button
} from '@/components/ui';
import {
    HiOutlineArrowLeft, HiOutlineSave
} from 'react-icons/hi';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { motion } from 'framer-motion';

const fmt = (n) => {
    const num = parseFloat(n) || 0;
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function SalaryDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const toast = useToast();
    const [structure, setStructure] = useState(null);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchStructure();
    }, [id]);

    const fetchStructure = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/payroll/salary-structures/${id}`);
            setStructure(res);
            setForm({
                basic: res.basic || 0,
                hra: res.hra || 0,
                da: res.da || 0,
                transport_allowance: res.transport_allowance || 0,
                medical_allowance: res.medical_allowance || 0,
                special_allowance: res.special_allowance || 0,
                pf_employee: res.pf_employee || 0,
                pf_employer: res.pf_employer || 0,
                esi_employee: res.esi_employee || 0,
                esi_employer: res.esi_employer || 0,
                professional_tax: res.professional_tax || 0,
                tds: res.tds || 0,
                effective_from: res.effective_from || '',
                effective_to: res.effective_to || '',
            });
        } catch (e) {
            toast.error('Failed to load salary structure');
            router.push('/payroll');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, val) => {
        setForm({ ...form, [key]: val });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form };
            ['basic', 'hra', 'da', 'transport_allowance', 'medical_allowance', 'special_allowance',
                'pf_employee', 'pf_employer', 'esi_employee', 'esi_employer', 'professional_tax', 'tds'
            ].forEach(k => { payload[k] = parseFloat(payload[k]) || 0; });
            if (!payload.effective_to) delete payload.effective_to;

            await api.put(`/payroll/salary-structures/${id}`, payload);
            toast.success('Salary structure updated');
            fetchStructure();
        } catch (e) {
            toast.error(e?.response?.data?.detail || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    // Calculate live totals
    const gross = ['basic', 'hra', 'da', 'transport_allowance', 'medical_allowance', 'special_allowance']
        .reduce((sum, k) => sum + (parseFloat(form[k]) || 0), 0);
    const empDeductions = ['pf_employee', 'esi_employee', 'professional_tax', 'tds']
        .reduce((sum, k) => sum + (parseFloat(form[k]) || 0), 0);
    const net = gross - empDeductions;
    const ctc = gross + (parseFloat(form.pf_employer) || 0) + (parseFloat(form.esi_employer) || 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (!structure) return null;

    const numField = (label, key) => (
        <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            <input type="number" step="0.01" className="input w-full bg-white/5 border-white/10 text-sm"
                value={form[key] || ''} onChange={(e) => handleChange(key, e.target.value)} />
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in-up pb-10 max-w-4xl mx-auto">
            <PageHeader
                title="Edit Salary Structure"
                description={`${structure.employee_name || 'N/A'} (${structure.employee_code || ''})`}
            >
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => router.push('/payroll')}>
                        <HiOutlineArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                </div>
            </PageHeader>

            {/* Live Totals */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Card className="border-emerald-500/30 bg-emerald-500/5 backdrop-blur-md">
                        <CardBody className="text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Gross Salary</p>
                            <p className="text-2xl font-bold text-emerald-400 mt-1">{fmt(gross)}</p>
                        </CardBody>
                    </Card>
                    <Card className="border-primary/30 bg-primary/5 backdrop-blur-md">
                        <CardBody className="text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Net Salary</p>
                            <p className="text-2xl font-bold text-primary mt-1">{fmt(net)}</p>
                        </CardBody>
                    </Card>
                    <Card className="border-amber-500/30 bg-amber-500/5 backdrop-blur-md">
                        <CardBody className="text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">CTC</p>
                            <p className="text-2xl font-bold text-amber-400 mt-1">{fmt(ctc)}</p>
                        </CardBody>
                    </Card>
                </div>
            </motion.div>

            <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Earnings */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="h-full border-white/10 bg-white/5 backdrop-blur-md">
                            <CardHeader title="Earnings" />
                            <CardBody className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {numField('Basic', 'basic')}
                                    {numField('HRA', 'hra')}
                                    {numField('DA', 'da')}
                                    {numField('Transport', 'transport_allowance')}
                                    {numField('Medical', 'medical_allowance')}
                                    {numField('Special', 'special_allowance')}
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>

                    {/* Deductions */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="h-full border-white/10 bg-white/5 backdrop-blur-md">
                            <CardHeader title="Deductions" />
                            <CardBody className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {numField('PF (Employee)', 'pf_employee')}
                                    {numField('PF (Employer)', 'pf_employer')}
                                    {numField('ESI (Employee)', 'esi_employee')}
                                    {numField('ESI (Employer)', 'esi_employer')}
                                    {numField('Prof. Tax', 'professional_tax')}
                                    {numField('TDS', 'tds')}
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                </div>

                {/* Dates & Save */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="mt-6">
                    <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                        <CardBody>
                            <div className="flex items-end gap-4 flex-wrap">
                                <div className="space-y-1 flex-1 min-w-[200px]">
                                    <label className="text-xs font-medium text-muted-foreground">Effective From</label>
                                    <input type="date" className="input w-full bg-white/5 border-white/10"
                                        value={form.effective_from} onChange={(e) => handleChange('effective_from', e.target.value)} />
                                </div>
                                <div className="space-y-1 flex-1 min-w-[200px]">
                                    <label className="text-xs font-medium text-muted-foreground">Effective To (optional)</label>
                                    <input type="date" className="input w-full bg-white/5 border-white/10"
                                        value={form.effective_to} onChange={(e) => handleChange('effective_to', e.target.value)} />
                                </div>
                                <Button type="submit" variant="primary" disabled={saving}
                                    className="shadow-lg shadow-primary/20 min-w-[160px]">
                                    <HiOutlineSave className="w-4 h-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            </form>
        </div>
    );
}
