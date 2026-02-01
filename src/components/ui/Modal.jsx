'use client';

import { useEffect, useRef, useCallback } from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  preventFormSubmitClose = true,
}) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Handle close with proper cleanup
  const handleClose = useCallback(() => {
    if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
    onClose();
  }, [onClose]);

  // Close on Escape key and handle focus trap
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') handleClose();
    };

    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      // Focus the modal for accessibility
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  // Prevent form submission from closing modal
  const handleFormSubmit = useCallback((e) => {
    if (preventFormSubmitClose) {
      e.stopPropagation();
    }
  }, [preventFormSubmitClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={closeOnBackdrop ? handleClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`modal ${sizes[size]} bg-card rounded-2xl shadow-2xl border border-border/50 w-full transform transition-all animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleFormSubmit}
      >
        <div className="modal-header flex items-center justify-between p-5 border-b border-border/50">
          <h2 id="modal-title" className="modal-title text-lg font-semibold text-foreground">{title}</h2>
          <button
            className="modal-close p-2 hover:bg-muted/50 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            onClick={handleClose}
            aria-label="Close modal"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body p-5 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="modal-footer flex items-center justify-end gap-3 p-5 border-t border-border/50 bg-muted/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Confirmation Modal
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </button>
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Loading...' : confirmText}
          </button>
        </>
      }
    >
      <p className="text-[var(--text-secondary)]">{message}</p>
    </Modal>
  );
}
