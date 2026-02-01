'use client';

import React from 'react';

/**
 * LoadingSpinner component with multiple sizes and variants
 * 
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg' | 'xl'} props.size - Spinner size
 * @param {'primary' | 'secondary' | 'white'} props.variant - Color variant
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.label - Accessible label for screen readers
 */
export function LoadingSpinner({
    size = 'md',
    variant = 'primary',
    className = '',
    label = 'Loading...'
}) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
        xl: 'w-16 h-16 border-4',
    };

    const variantClasses = {
        primary: 'border-primary border-t-transparent',
        secondary: 'border-muted-foreground/30 border-t-muted-foreground',
        white: 'border-white/30 border-t-white',
    };

    return (
        <div
            role="status"
            aria-label={label}
            className={`inline-flex items-center justify-center ${className}`}
        >
            <div
                className={`
          rounded-full animate-spin
          ${sizeClasses[size] || sizeClasses.md}
          ${variantClasses[variant] || variantClasses.primary}
        `}
            />
            <span className="sr-only">{label}</span>
        </div>
    );
}

/**
 * Full page loading overlay
 */
export function LoadingOverlay({ message = 'Loading...' }) {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size="xl" variant="primary" />
                <p className="text-muted-foreground font-medium">{message}</p>
            </div>
        </div>
    );
}

/**
 * Inline loading indicator with optional text
 */
export function LoadingInline({ text = 'Loading...', size = 'sm' }) {
    return (
        <div className="inline-flex items-center gap-2 text-muted-foreground">
            <LoadingSpinner size={size} variant="secondary" />
            <span className="text-sm">{text}</span>
        </div>
    );
}

/**
 * Loading button state
 */
export function LoadingButton({ loading, children, ...props }) {
    return (
        <button disabled={loading} {...props}>
            {loading ? (
                <span className="inline-flex items-center gap-2">
                    <LoadingSpinner size="sm" variant="white" />
                    <span>Loading...</span>
                </span>
            ) : children}
        </button>
    );
}

export default LoadingSpinner;
