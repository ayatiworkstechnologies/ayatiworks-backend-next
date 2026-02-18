'use client';

import { useState, useMemo } from 'react';
import { Card, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
    HiOutlineKey, HiOutlineDeviceMobile, HiOutlineEye, HiOutlineEyeOff,
    HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineDesktopComputer,
    HiOutlineGlobe, HiOutlineCheck
} from 'react-icons/hi';

export default function SecuritySettingsPage() {
    const { user } = useAuth();
    const toast = useToast();
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

    const toggleVisibility = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    // Password strength calculation
    const passwordStrength = useMemo(() => {
        const p = passwordData.new_password;
        if (!p) return { score: 0, label: '', color: '', width: '0%' };
        let score = 0;
        if (p.length >= 8) score++;
        if (p.length >= 12) score++;
        if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
        if (/\d/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;

        const levels = [
            { label: 'Very Weak', color: 'bg-red-500', width: '20%' },
            { label: 'Weak', color: 'bg-orange-500', width: '40%' },
            { label: 'Fair', color: 'bg-yellow-500', width: '60%' },
            { label: 'Strong', color: 'bg-emerald-500', width: '80%' },
            { label: 'Very Strong', color: 'bg-green-500', width: '100%' },
        ];

        const idx = Math.min(score, 5) - 1;
        return { score, ...levels[Math.max(idx, 0)] };
    }, [passwordData.new_password]);

    const passwordMatch = passwordData.new_password && passwordData.confirm_password &&
        passwordData.new_password === passwordData.confirm_password;

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwordData.new_password.length < 8) {
            toast.error('Password must be at least 8 characters');
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

    const strengthCriteria = [
        { met: passwordData.new_password.length >= 8, label: 'At least 8 characters' },
        { met: /[A-Z]/.test(passwordData.new_password), label: 'One uppercase letter' },
        { met: /[a-z]/.test(passwordData.new_password), label: 'One lowercase letter' },
        { met: /\d/.test(passwordData.new_password), label: 'One number' },
        { met: /[^A-Za-z0-9]/.test(passwordData.new_password), label: 'One special character' },
    ];

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Password Change */}
            <Card className="border-0 shadow-xl overflow-hidden">
                <div className="p-5 bg-muted/20 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                            <HiOutlineKey className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Change Password</h3>
                            <p className="text-sm text-muted-foreground">Keep your account secure with a strong password</p>
                        </div>
                    </div>
                </div>
                <CardBody className="p-6">
                    <form onSubmit={handlePasswordChange} className="max-w-lg space-y-5">
                        {/* Current Password */}
                        <div>
                            <Input
                                label="Current Password"
                                type={showPassword.current ? 'text' : 'password'}
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                icon={<HiOutlineLockClosed className="w-4 h-4" />}
                                required
                                placeholder="••••••••"
                                suffix={
                                    <button type="button" onClick={() => toggleVisibility('current')} className="focus:outline-none text-muted-foreground hover:text-foreground transition-colors">
                                        {showPassword.current ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                                    </button>
                                }
                            />
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <Input
                                label="New Password"
                                type={showPassword.new ? 'text' : 'password'}
                                value={passwordData.new_password}
                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                icon={<HiOutlineKey className="w-4 h-4" />}
                                required
                                minLength={8}
                                placeholder="Create a strong password"
                                suffix={
                                    <button type="button" onClick={() => toggleVisibility('new')} className="focus:outline-none text-muted-foreground hover:text-foreground transition-colors">
                                        {showPassword.new ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                                    </button>
                                }
                            />

                            {/* Strength Meter */}
                            {passwordData.new_password && (
                                <div className="space-y-2 animate-fade-in-up">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${passwordStrength.color} transition-all duration-500 ease-out`}
                                                style={{ width: passwordStrength.width }}
                                            />
                                        </div>
                                        <span className={`text-xs font-semibold ${passwordStrength.color?.replace('bg-', 'text-')}`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                        {strengthCriteria.map((c, i) => (
                                            <div key={i} className="flex items-center gap-1.5 text-[11px]">
                                                <HiOutlineCheck className={`w-3 h-3 ${c.met ? 'text-emerald-500' : 'text-muted-foreground/30'}`} />
                                                <span className={c.met ? 'text-foreground' : 'text-muted-foreground/50'}>{c.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <Input
                                label="Confirm New Password"
                                type={showPassword.confirm ? 'text' : 'password'}
                                value={passwordData.confirm_password}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                icon={<HiOutlineKey className="w-4 h-4" />}
                                required
                                minLength={8}
                                placeholder="Re-enter new password"
                                suffix={
                                    <button type="button" onClick={() => toggleVisibility('confirm')} className="focus:outline-none text-muted-foreground hover:text-foreground transition-colors">
                                        {showPassword.confirm ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                                    </button>
                                }
                            />
                            {passwordData.confirm_password && (
                                <p className={`text-xs mt-1 ${passwordMatch ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {passwordMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" variant="primary" disabled={saving || !passwordMatch}>
                                <HiOutlineShieldCheck className="w-4 h-4 mr-2" />
                                {saving ? 'Updating...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>

            {/* Two-Factor Authentication */}
            <Card className="border-0 shadow-xl overflow-hidden">
                <div className="p-5 bg-muted/20 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                            <HiOutlineDeviceMobile className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Two-Factor Authentication</h3>
                            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                        </div>
                    </div>
                </div>
                <CardBody className="p-6">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/5 hover:bg-muted/10 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                <HiOutlineDeviceMobile className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground">Authenticator App</h4>
                                <p className="text-sm text-muted-foreground mt-0.5">Use Google Authenticator or Authy for TOTP codes</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${user?.is_2fa_enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                                {user?.is_2fa_enabled ? '✓ Active' : 'Inactive'}
                            </span>
                            <Button variant="secondary" onClick={() => toast.info('2FA setup coming soon')}>
                                {user?.is_2fa_enabled ? 'Manage' : 'Set Up'}
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Active Sessions */}
            <Card className="border-0 shadow-xl overflow-hidden">
                <div className="p-5 bg-muted/20 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                            <HiOutlineDesktopComputer className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Active Sessions</h3>
                            <p className="text-sm text-muted-foreground">Manage devices where you're logged in</p>
                        </div>
                    </div>
                </div>
                <CardBody className="p-6">
                    <div className="space-y-3">
                        {/* Current Session */}
                        <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <HiOutlineDesktopComputer className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-foreground text-sm">Current Session</h4>
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">This device</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        <HiOutlineGlobe className="w-3 h-3 inline mr-1" />
                                        Last active: Now
                                    </p>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground/60 text-center italic pt-2">Session management coming soon</p>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
