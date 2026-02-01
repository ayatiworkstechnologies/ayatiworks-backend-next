'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { HiOutlineKey, HiOutlineDeviceMobile, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

export default function SecuritySettingsPage() {
    const { user } = useAuth();
    const toast = useToast();
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

    const toggleVisibility = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // Password form state
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }
        setSaving(true);
        try {
            await api.post('/auth/change-password', {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            toast.success('Password changed successfully');
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            console.error('Password change error:', error);
            toast.error(error.response?.data?.detail || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-xl overflow-hidden">
                <CardHeader title="Change Password" subtitle="Keep your account secure with a strong password" className="bg-muted/10" />
                <CardBody className="p-8">
                    <form onSubmit={handlePasswordChange} className="space-y-5 max-w-lg">
                        <Input
                            label="Current Password"
                            type={showPassword.current ? 'text' : 'password'}
                            value={passwordData.current_password}
                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                            icon={<HiOutlineKey className="w-4 h-4" />}
                            required
                            placeholder="••••••••"
                            suffix={
                                <button type="button" onClick={() => toggleVisibility('current')} className="focus:outline-none">
                                    {showPassword.current ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                                </button>
                            }
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="New Password"
                                type={showPassword.new ? 'text' : 'password'}
                                value={passwordData.new_password}
                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                icon={<HiOutlineKey className="w-4 h-4" />}
                                required
                                minLength={8}
                                placeholder="Min 8 chars"
                                suffix={
                                    <button type="button" onClick={() => toggleVisibility('new')} className="focus:outline-none">
                                        {showPassword.new ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                                    </button>
                                }
                            />
                            <Input
                                label="Confirm Password"
                                type={showPassword.confirm ? 'text' : 'password'}
                                value={passwordData.confirm_password}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                icon={<HiOutlineKey className="w-4 h-4" />}
                                required
                                minLength={8}
                                placeholder="Re-enter password"
                                suffix={
                                    <button type="button" onClick={() => toggleVisibility('confirm')} className="focus:outline-none">
                                        {showPassword.confirm ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                                    </button>
                                }
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit" variant="primary" disabled={saving}>
                                {saving ? 'Updating...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>

            <Card className="border-0 shadow-xl overflow-hidden">
                <CardHeader title="Two-Factor Authentication" subtitle="Add an extra layer of security" className="bg-muted/10" />
                <CardBody className="p-8">
                    <div className="flex items-center justify-between p-4 border border-border/60 rounded-xl bg-muted/5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <HiOutlineDeviceMobile className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground">Authenticator App</h4>
                                <p className="text-sm text-muted-foreground mt-0.5">Secure your account with TOTP (Google Authenticator, Authy)</p>
                            </div>
                        </div>
                        <Button variant="secondary" onClick={() => toast.info('2FA setup coming soon')}>
                            {user?.is_2fa_enabled ? 'Disable' : 'Set Up'}
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
