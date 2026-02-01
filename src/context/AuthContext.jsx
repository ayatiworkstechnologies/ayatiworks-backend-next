'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Memoize checkAuth to prevent recreation
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await api.get('/auth/me');
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.requires_2fa) {
        return { requires_2fa: true, temp_token: response.temp_token };
      }

      localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }

      setUser(response.user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      throw error;
    }
  }, []);

  const verify2FA = useCallback(async (otp, tempToken) => {
    try {
      const response = await api.post('/auth/login-2fa', { otp, temp_token: tempToken });

      localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }

      setUser(response.user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    }
  }, [router]);

  // Function to refresh user data (e.g., after profile update)
  const refreshUser = useCallback(async () => {
    try {
      const userData = await api.get('/auth/me');
      setUser(userData);
    } catch (error) {
      console.error('Refresh user failed:', error);
    }
  }, []);

  // Memoize context value to prevent object recreation on every render
  const value = useMemo(() => {
    // Defensive coding: Ensure user always has a role object to prevent crashes
    const safeUser = user ? {
      ...user,
      role: user.role || { name: '', code: '' }
    } : null;

    return {
      user: safeUser,
      loading,
      isAuthenticated,
      login,
      verify2FA,
      logout,
      checkAuth,
      refreshUser,
    };
  }, [user, loading, isAuthenticated, login, verify2FA, logout, checkAuth, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
