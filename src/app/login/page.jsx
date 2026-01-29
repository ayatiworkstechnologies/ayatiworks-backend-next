'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff,
  HiOutlineSun, HiOutlineMoon
} from 'react-icons/hi';

export default function LoginPage() {
  const router = useRouter();
  const { login, verify2FA } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [step, setStep] = useState('login'); // 'login' or '2fa'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
  });

  const isDarkMode = theme === 'dark';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      if (result.requires_2fa) {
        setStep('2fa');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await verify2FA(formData.otp);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      {/* Absolute Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/50 shadow-sm transition-all duration-200"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-primary relative overflow-hidden items-center justify-center p-12">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/10 rounded-full blur-3xl" />

        <div className="max-w-lg text-primary-foreground relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-bold font-heading shadow-xl border border-white/10">
              E
            </div>
            <div className="h-10 w-px bg-white/20" />
            <span className="text-sm font-medium tracking-wider uppercase opacity-80">Enterprise Workspace</span>
          </div>

          <h1 className="text-5xl font-bold font-heading mb-6 leading-tight">
            Manage your<br />organization with confidence.
          </h1>
          <p className="text-lg opacity-90 mb-10 leading-relaxed font-light">
            Streamline your HR operations with our comprehensive management platform. 
            Track attendance, manage projects, and analyze performance in real-time.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '👥', label: 'Employee Hub' },
              { icon: '⏰', label: 'Time Tracking' },
              { icon: '📊', label: 'Analytics' },
              { icon: '🛡️', label: 'Secure Access' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:bg-white/15 transition-colors">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-lg">{item.icon}</div>
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
            <div className="lg:hidden w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-6 shadow-xl shadow-primary/20 font-heading">
              E
            </div>
            <h1 className="text-3xl font-bold font-heading text-foreground mb-2">
              {step === 'login' ? 'Welcome back' : 'Verify Identity'}
            </h1>
            <p className="text-muted-foreground">
              {step === 'login' 
                ? 'Sign in to access your dashboard' 
                : 'Enter the verification code sent to your device'
              }
            </p>
          </div>

          <Card className="border-border/50 shadow-xl shadow-primary/5">
            <CardBody className="p-8">
              {step === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-5">
                  {error && (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm flex items-center gap-3 border border-destructive/20">
                      <span>⚠️</span> {error}
                    </div>
                  )}

                  <Input
                    label="Work Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    icon={<HiOutlineMail className="w-5 h-5" />}
                    required
                    className="bg-background"
                  />

                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      icon={<HiOutlineLockClosed className="w-5 h-5" />}
                      required
                      className="bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-input text-primary focus:ring-primary/20 transition-all cursor-pointer" />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
                    </label>
                    <Link href="/forgot-password" className="text-primary hover:text-primary/80 font-medium transition-colors">
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" variant="primary" className="w-full text-base py-6 shadow-lg shadow-primary/25" loading={loading}>
                    Sign In
                  </Button>
                  
                  {/* Sign Up Removed as requested */}
                </form>
              ) : (
                <form onSubmit={handle2FA} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm border border-destructive/20">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-center gap-3">
                    {[...Array(6)].map((_, i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        className="w-12 h-14 text-center text-xl font-bold bg-background border border-input rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/20"
                        placeholder="•"
                        onKeyUp={(e) => {
                          if (e.target.value && e.target.nextElementSibling) {
                            e.target.nextElementSibling.focus();
                          }
                          if (e.key === 'Backspace' && !e.target.value && e.target.previousElementSibling) {
                            e.target.previousElementSibling.focus();
                          }
                          const allInputs = e.target.parentElement.querySelectorAll('input');
                          const otp = Array.from(allInputs).map(input => input.value).join('');
                          setFormData(prev => ({ ...prev, otp }));
                        }}
                      />
                    ))}
                  </div>

                  <Button type="submit" variant="primary" className="w-full py-6 text-base" loading={loading}>
                    Verify Access
                  </Button>

                  <button 
                    type="button"
                    onClick={() => setStep('login')}
                    className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <span>←</span> Back to login
                  </button>
                </form>
              )}
            </CardBody>
          </Card>
          
          <p className="mt-8 text-center text-xs text-muted-foreground">
            © 2026 Enterprise HRMS. Secured by Industry Standard Encryption.
          </p>
        </div>
      </div>
    </div>
  );
}
