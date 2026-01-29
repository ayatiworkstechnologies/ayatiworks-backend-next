'use client';

import { createContext, useContext, useCallback } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const ToastContext = createContext(null);
const MySwal = withReactContent(Swal);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  // Config for Toast
  const ToastMixin = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  const showToast = useCallback((icon, title, timer = 3000) => {
    ToastMixin.fire({
      icon: icon,
      title: title,
      timer: timer
    });
  }, []);

  // Helper for generic alerts
  const showAlert = useCallback((title, text, icon = 'info') => {
    MySwal.fire({
      title: title,
      text: text,
      icon: icon,
      confirmButtonColor: '#3b82f6', // Tailwind blue-500
    });
  }, []);

  // Helper for confirmations
  const showConfirm = useCallback(async (title, text, confirmText = 'Yes, do it!', cancelText = 'Cancel') => {
    const result = await MySwal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', // Tailwind red-500
      cancelButtonColor: '#6b7280', // Tailwind gray-500
      confirmButtonText: confirmText,
      cancelButtonText: cancelText
    });
    return result.isConfirmed;
  }, []);

  const toast = {
    success: (message, duration) => showToast('success', message, duration),
    error: (message, duration) => showToast('error', message, duration),
    warning: (message, duration) => showToast('warning', message, duration),
    info: (message, duration) => showToast('info', message, duration),
    // Expose alerts through the context too
    alert: showAlert,
    confirm: showConfirm
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* ToastContainer is no longer needed as Swal handles the UI */}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
