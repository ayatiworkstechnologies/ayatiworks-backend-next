'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineUserAdd,
  HiOutlineUsers, HiOutlineChartBar, HiOutlineClock, HiOutlineTrendingUp
} from 'react-icons/hi';

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', password: '', confirm_password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the validation errors'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', { first_name: formData.first_name, last_name: formData.last_name, email: formData.email, password: formData.password });
      toast.success('Account created successfully! Please login.');
      router.push('/login?registered=true');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">E</div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Get started with Enterprise HRMS</p>
          </div>

          <Card>
            <CardBody className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="input-wrapper">
                    <label className="input-label">First Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="John" className={`input pl-10 ${errors.first_name ? 'input-error' : ''}`} />
                    </div>
                    {errors.first_name && <p className="error-message">{errors.first_name}</p>}
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label">Last Name</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Smith" className="input" />
                  </div>
                </div>

                <div className="input-wrapper">
                  <label className="input-label">Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@company.com" className={`input pl-10 ${errors.email ? 'input-error' : ''}`} />
                  </div>
                  {errors.email && <p className="error-message">{errors.email}</p>}
                </div>

                <div className="input-wrapper">
                  <label className="input-label">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a strong password" className={`input pl-10 ${errors.password ? 'input-error' : ''}`} />
                  </div>
                  {errors.password && <p className="error-message">{errors.password}</p>}
                </div>

                <div className="input-wrapper">
                  <label className="input-label">Confirm Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} placeholder="Confirm your password" className={`input pl-10 ${errors.confirm_password ? 'input-error' : ''}`} />
                  </div>
                  {errors.confirm_password && <p className="error-message">{errors.confirm_password}</p>}
                </div>

                <Button type="submit" variant="primary" className="w-full" loading={loading}>
                  <HiOutlineUserAdd className="w-5 h-5" /> Create Account
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{' '}<Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign In</Link>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800 p-12 items-center justify-center">
        <div className="max-w-lg text-white">
          <h2 className="text-4xl font-bold mb-6">Streamline Your Workforce Management</h2>
          <p className="text-lg opacity-90 mb-8">Join thousands of companies using Enterprise HRMS to manage employees, track attendance, handle leaves, and boost productivity.</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur">
              <HiOutlineUsers className="w-8 h-8 mb-2" /><div className="font-semibold">Employee Management</div><p className="text-sm opacity-75">Complete employee lifecycle</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur">
              <HiOutlineChartBar className="w-8 h-8 mb-2" /><div className="font-semibold">Analytics</div><p className="text-sm opacity-75">Real-time insights</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur">
              <HiOutlineClock className="w-8 h-8 mb-2" /><div className="font-semibold">Attendance</div><p className="text-sm opacity-75">Track time effortlessly</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur">
              <HiOutlineTrendingUp className="w-8 h-8 mb-2" /><div className="font-semibold">Projects</div><p className="text-sm opacity-75">Manage deliverables</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
