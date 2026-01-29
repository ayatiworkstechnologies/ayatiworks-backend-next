'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi';

// Helper function from our previous task
const generateCodeFromName = (name) => {
    if (!name) return '';
    const cleaned = name.trim().replace(/[^a-zA-Z\s]/g, '');
    const words = cleaned.split(/\s+/).filter(word => word.length > 0);

    if (words.length === 0) return '';
    if (words.length === 1) return words[0].substring(0, 4).toUpperCase();

    // For teams like "Web Team" -> "WEB" or "WT"? Let's stick to initials for consistency
    // But strictly 2 words -> First 2 + First 2? or First 3 + First 3?
    // Let's use the same logic as departments: initials up to 4
    const initials = words.slice(0, 4).map(word => word[0]).join('');
    return initials.toUpperCase();
};

export default function CreateTeamPage() {
    const { user } = useAuth();
    const router = useRouter();
    const toast = useToast();

    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]); // For team lead

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        team_type: '',
        department_id: '',
        team_lead_id: '',
        max_members: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const depts = await api.get('/organizations/departments?page_size=100');
            setDepartments(depts.items || []);

            const emps = await api.get('/employees?page_size=100');
            setEmployees(emps.items || []);
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Team name is required';
        if (!formData.code.trim()) newErrors.code = 'Team code is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix validation errors');
            return;
        }

        setSaving(true);
        try {
            const payload = { ...formData };

            // Handle integers and nulls
            payload.company_id = user?.company_id;
            payload.department_id = payload.department_id ? parseInt(payload.department_id) : null;
            payload.team_lead_id = payload.team_lead_id ? parseInt(payload.team_lead_id) : null;
            payload.max_members = payload.max_members ? parseInt(payload.max_members) : null;

            await api.post('/teams', payload);
            toast.success('Team created successfully');
            router.push('/teams');
        } catch (error) {
            toast.error(error.response?.data?.detail || error.message || 'Failed to create team');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div>
                <Link href="/teams" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-2">
                    <HiOutlineArrowLeft className="w-4 h-4" /> Back to Teams
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Team</h1>
                <p className="text-muted-foreground mt-1">Add a new cross-functional team</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <Card>
                    <CardHeader title="Team Details" />
                    <CardBody className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name (Auto-generates Code) */}
                            <div className="space-y-1">
                                <label className="input-label">Team Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => {
                                        const newName = e.target.value;
                                        setFormData(prev => {
                                            const newData = { ...prev, name: newName };
                                            // Auto-generate if code is empty or matches auto-gen
                                            if (!prev.code || prev.code === generateCodeFromName(prev.name)) {
                                                newData.code = generateCodeFromName(newName);
                                            }
                                            return newData;
                                        });
                                        if (errors.name) setErrors({ ...errors, name: null });
                                    }}
                                    className={`input ${errors.name ? 'input-error' : ''}`}
                                    placeholder="e.g. Social Media Team"
                                />
                                {errors.name && <p className="error-message">{errors.name}</p>}
                            </div>

                            {/* Code */}
                            <div className="space-y-1">
                                <label className="input-label">
                                    Team Code <span className="text-red-500">*</span>
                                    <span className="text-xs text-muted-foreground ml-2 font-normal">(Auto-generated)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className={`input font-mono ${errors.code ? 'input-error' : ''}`}
                                    placeholder="e.g. SMT"
                                />
                                {errors.code && <p className="error-message">{errors.code}</p>}
                            </div>

                            {/* Team Type */}
                            <div className="space-y-1">
                                <label className="input-label">Team Type</label>
                                <select
                                    value={formData.team_type}
                                    onChange={(e) => setFormData({ ...formData, team_type: e.target.value })}
                                    className="input"
                                >
                                    <option value="">Select Type...</option>
                                    <option value="web">Web Development</option>
                                    <option value="social_media">Social Media</option>
                                    <option value="content">Content Creation</option>
                                    <option value="video">Video Production</option>
                                    <option value="design">Graphic Design</option>
                                    <option value="hr">HR & Recruitment</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="sales">Sales</option>
                                    <option value="support">Customer Support</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Department */}
                            <div className="space-y-1">
                                <label className="input-label">Parent Department</label>
                                <select
                                    value={formData.department_id}
                                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                    className="input"
                                >
                                    <option value="">None (Independent)</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Team Lead */}
                            <div className="space-y-1">
                                <label className="input-label">Team Lead</label>
                                <select
                                    value={formData.team_lead_id}
                                    onChange={(e) => setFormData({ ...formData, team_lead_id: e.target.value })}
                                    className="input"
                                >
                                    <option value="">Select Team Lead...</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.user_id || ''}>
                                            {emp.first_name} {emp.last_name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground">Select user account associated with employee</p>
                            </div>

                            {/* Max Members */}
                            <div className="space-y-1">
                                <label className="input-label">Max Members</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.max_members}
                                    onChange={(e) => setFormData({ ...formData, max_members: e.target.value })}
                                    className="input"
                                    placeholder="Optional limit"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                            <label className="input-label">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input min-h-[100px]"
                                placeholder="Describe the team's purpose and responsibilities..."
                            />
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                Active Team
                            </label>
                        </div>

                    </CardBody>
                </Card>

                <div className="flex justify-end gap-3 mt-6">
                    <Link href="/teams">
                        <Button variant="secondary" type="button">Cancel</Button>
                    </Link>
                    <Button variant="primary" type="submit" loading={saving}>
                        <HiOutlineCheck className="w-4 h-4" /> Create Team
                    </Button>
                </div>
            </form>
        </div>
    );
}
