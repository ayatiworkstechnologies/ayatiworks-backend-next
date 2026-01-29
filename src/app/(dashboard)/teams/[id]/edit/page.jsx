'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi';

export default function EditTeamPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);

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
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        try {
            const [teamRes, deptRes, empRes] = await Promise.all([
                api.get(`/teams/${params.id}`),
                api.get('/organizations/departments?page_size=100'),
                api.get('/employees?page_size=100')
            ]);

            setDepartments(deptRes.items || []);
            setEmployees(empRes.items || []);

            setFormData({
                name: teamRes.name || '',
                code: teamRes.code || '',
                team_type: teamRes.team_type || '',
                department_id: teamRes.department_id || '',
                team_lead_id: teamRes.team_lead_id || '',
                max_members: teamRes.max_members || '',
                description: teamRes.description || '',
                is_active: teamRes.is_active !== undefined ? teamRes.is_active : true
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load team data');
            router.push('/teams');
        } finally {
            setLoading(false);
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
            payload.department_id = payload.department_id ? parseInt(payload.department_id) : null;
            payload.team_lead_id = payload.team_lead_id ? parseInt(payload.team_lead_id) : null;
            payload.max_members = payload.max_members ? parseInt(payload.max_members) : null;

            await api.put(`/teams/${params.id}`, payload);
            toast.success('Team updated successfully');
            router.push(`/teams/${params.id}`);
        } catch (error) {
            toast.error(error.response?.data?.detail || error.message || 'Failed to update team');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div>
                <Link href={`/teams/${params.id}`} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-2">
                    <HiOutlineArrowLeft className="w-4 h-4" /> Back to Team Details
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Team</h1>
                <p className="text-muted-foreground mt-1">Update team information</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <Card>
                    <CardHeader title="Team Details" />
                    <CardBody className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="space-y-1">
                                <label className="input-label">Team Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                        if (errors.name) setErrors({ ...errors, name: null });
                                    }}
                                    className={`input ${errors.name ? 'input-error' : ''}`}
                                />
                                {errors.name && <p className="error-message">{errors.name}</p>}
                            </div>

                            {/* Code */}
                            <div className="space-y-1">
                                <label className="input-label">
                                    Team Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className={`input font-mono ${errors.code ? 'input-error' : ''}`}
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
                    <Link href={`/teams/${params.id}`}>
                        <Button variant="secondary" type="button">Cancel</Button>
                    </Link>
                    <Button variant="primary" type="submit" loading={saving}>
                        <HiOutlineCheck className="w-4 h-4" /> Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
