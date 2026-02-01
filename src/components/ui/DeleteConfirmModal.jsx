'use client';

import { useEffect, useCallback } from 'react';
import Button from './Button';
import { HiOutlineExclamation, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message, loading }) {
  // Handle Escape key and body scroll
  const handleClose = useCallback(() => {
    if (!loading) onClose();
  }, [loading, onClose]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) handleClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-2xl border border-border/50 w-full max-w-md p-6 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
          disabled={loading}
          aria-label="Close dialog"
          type="button"
        >
          <HiOutlineX className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <HiOutlineExclamation className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 id="delete-modal-title" className="text-xl font-semibold text-foreground mb-2">
            {title || 'Confirm Delete'}
          </h3>
          <p id="delete-modal-description" className="text-muted-foreground">
            {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            className="flex-1"
            loading={loading}
          >
            <HiOutlineTrash className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
