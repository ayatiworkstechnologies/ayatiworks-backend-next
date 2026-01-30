'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Badge, PageHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
    HiOutlineClock, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
    HiOutlineRefresh, HiOutlineSearch
} from 'react-icons/hi';
import Swal from 'sweetalert2';

export default function ShiftsPage() {
    const toast = useToast();
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        start_time: '09:00',
        end_time: '18:00',
        break_start: '13:00',
        break_end: '14:00',
        break_duration: 60,
        working_hours: 8,
        min_working_hours: 4,
        grace_period_in: 15,
        grace_period_out: 15,
        ot_enabled: false,
        weekends: ['saturday', 'sunday'],
        is_flexible: false,
        is_active: true
    });

    useEffect(() => {
        fetchShifts();
    }, []);

    const fetchShifts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;

            const response = await api.get('/shifts', { params });
            setShifts(response.items || response || []);
        } catch (error) {
            console.error('Error fetching shifts:', error);
            toast.error('Failed to load shifts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingShift(null);
        setFormData({
            name: '',
            code: '',
            start_time: '09:00',
            end_time: '18:00',
            break_start: '13:00',
            break_end: '14:00',
            break_duration: 60,
            working_hours: 8,
            min_working_hours: 4,
            grace_period_in: 15,
            grace_period_out: 15,
            ot_enabled: false,
            weekends: ['saturday', 'sunday'],
            is_flexible: false,
            is_active: true
        });
        setShowModal(true);
    };

    const handleEdit = (shift) => {
        setEditingShift(shift);
        // Format times to HH:MM for input type="time"
        const formatTime = (t) => t ? t.substring(0, 5) : '';

        setFormData({
            ...shift,
            start_time: formatTime(shift.start_time),
            end_time: formatTime(shift.end_time),
            break_start: formatTime(shift.break_start),
            break_end: formatTime(shift.break_end),
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Shift?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Delete',
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/shifts/${id}`);
                toast.success('Shift deleted successfully');
                fetchShifts();
            } catch (error) {
                toast.error('Failed to delete shift');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Prepare data - ensure times include seconds if backend needs it, 
            // but usually HH:MM:00 is fine standard
            const payload = { ...formData };

            // Ensure times are HH:MM:SS
            const ensureSeconds = (t) => t && t.length === 5 ? `${t}:00` : t;
            payload.start_time = ensureSeconds(payload.start_time);
            payload.end_time = ensureSeconds(payload.end_time);
            payload.break_start = ensureSeconds(payload.break_start);
            payload.break_end = ensureSeconds(payload.break_end);

            if (editingShift) {
                await api.put(`/shifts/${editingShift.id}`, payload);
                toast.success('Shift updated successfully');
            } else {
                await api.post('/shifts', payload);
                toast.success('Shift created successfully');
            }
            setShowModal(false);
            fetchShifts();
        } catch (error) {
            console.error('Error saving shift:', error);
            toast.error(editingShift ? 'Failed to update shift' : 'Failed to create shift');
        } finally {
            setSaving(false);
        }
    };

    const handleWeekendToggle = (day) => {
        const current = formData.weekends || [];
        if (current.includes(day)) {
            setFormData({ ...formData, weekends: current.filter(d => d !== day) });
        } else {
            setFormData({ ...formData, weekends: [...current, day] });
        }
    };

    const daysOfWeek = [
        { id: 'monday', label: 'Mon' },
        { id: 'tuesday', label: 'Tue' },
        { id: 'wednesday', label: 'Wed' },
        { id: 'thursday', label: 'Thu' },
        { id: 'friday', label: 'Fri' },
        { id: 'saturday', label: 'Sat' },
        { id: 'sunday', label: 'Sun' },
    ];

    return (
        <div className="space-y-6 animate-fade-in-up">
            <PageHeader
                title="Shift Management"
                description="Manage work shifts and timings"
                icon={<HiOutlineClock className="w-6 h-6" />}
            >
                <Button variant="primary" onClick={handleCreate}>
                    <HiOutlinePlus className="w-4 h-4 mr-2" /> Add Shift
                </Button>
            </PageHeader>

            <Card>
                <div className="flex items-center gap-4 p-4 border-b border-border">
                    <div className="relative flex-1 max-w-sm">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search shifts..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchShifts()}
                        />
                    </div>
                    <Button variant="secondary" onClick={fetchShifts} title="Refresh">
                        <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Timings</th>
                                <th>Draft / Hours</th>
                                <th>Break</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8">Loading...</td>
                                </tr>
                            ) : shifts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-muted-foreground">No shifts found</td>
                                </tr>
                            ) : (
                                shifts.map(shift => (
                                    <tr key={shift.id}>
                                        <td className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{shift.name}</span>
                                                <span className="text-xs text-muted-foreground">{shift.code}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{shift.start_time?.substring(0, 5)}</span>
                                                <span className="text-muted-foreground">-</span>
                                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{shift.end_time?.substring(0, 5)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-sm">
                                                {shift.working_hours} hrs
                                                {shift.min_working_hours && (
                                                    <span className="text-xs text-muted-foreground ml-1">(Min: {shift.min_working_hours})</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-sm text-muted-foreground">
                                                {shift.break_duration} mins
                                            </div>
                                        </td>
                                        <td>
                                            <Badge variant={shift.is_active ? 'success' : 'secondary'}>
                                                {shift.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" className="btn-icon" onClick={() => handleEdit(shift)}>
                                                    <HiOutlinePencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" className="btn-icon text-destructive hover:bg-destructive/10" onClick={() => handleDelete(shift.id)}>
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingShift ? 'Edit Shift' : 'Create Shift'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Shift Name"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Input
                            label="Shift Code"
                            required
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                        <h4 className="col-span-2 font-medium text-sm">Timings</h4>
                        <Input
                            type="time"
                            label="Start Time"
                            required
                            value={formData.start_time}
                            onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                        />
                        <Input
                            type="time"
                            label="End Time"
                            required
                            value={formData.end_time}
                            onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            type="time"
                            label="Break Start"
                            value={formData.break_start}
                            onChange={e => setFormData({ ...formData, break_start: e.target.value })}
                        />
                        <Input
                            type="time"
                            label="Break End"
                            value={formData.break_end}
                            onChange={e => setFormData({ ...formData, break_end: e.target.value })}
                        />
                        <Input
                            type="number"
                            label="Duration (mins)"
                            value={formData.break_duration}
                            onChange={e => setFormData({ ...formData, break_duration: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Off Days</label>
                        <div className="flex flex-wrap gap-2">
                            {daysOfWeek.map(day => (
                                <button
                                    key={day.id}
                                    type="button"
                                    onClick={() => handleWeekendToggle(day.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${formData.weekends?.includes(day.id)
                                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                                            : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 border p-3 rounded-lg">
                            <input
                                type="checkbox"
                                id="ot_enabled"
                                checked={formData.ot_enabled}
                                onChange={e => setFormData({ ...formData, ot_enabled: e.target.checked })}
                                className="w-4 h-4 rounded text-primary"
                            />
                            <label htmlFor="ot_enabled" className="text-sm font-medium cursor-pointer">Enable Overtime</label>
                        </div>

                        <div className="flex items-center gap-2 border p-3 rounded-lg">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-4 h-4 rounded text-primary"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">Is Active</label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button variant="secondary" onClick={() => setShowModal(false)} type="button">Cancel</Button>
                        <Button variant="primary" type="submit" disabled={saving}>
                            {saving ? 'Saving...' : (editingShift ? 'Update Shift' : 'Create Shift')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
