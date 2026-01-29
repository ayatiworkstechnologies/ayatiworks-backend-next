'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { HiOutlineMail, HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlinePaperAirplane } from 'react-icons/hi';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Please enter your email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Please enter a valid email'); return; }
    
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
      toast.error(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">E</div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-600 mt-2">Enter your email and we&apos;ll send you a reset link</p>
        </div>

        <Card>
          <CardBody className="p-6">
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineCheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Check your email</h3>
                <p className="text-gray-600 mb-6">We&apos;ve sent a password reset link to<br /><strong>{email}</strong></p>
                <Link href="/login"><Button variant="primary" className="w-full"><HiOutlineArrowLeft className="w-4 h-4" /> Back to Login</Button></Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

                <div className="input-wrapper">
                  <label className="input-label">Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="input pl-10" />
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full" loading={loading}>
                  <HiOutlinePaperAirplane className="w-5 h-5" /> Send Reset Link
                </Button>

                <div className="text-center text-sm">
                  <Link href="/login" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700">
                    <HiOutlineArrowLeft className="w-4 h-4" /> Back to Login
                  </Link>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
