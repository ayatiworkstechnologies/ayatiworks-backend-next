import React, { forwardRef } from 'react';

/**
 * FormInput component with built-in validation support
 * Use with react-hook-form for best results
 */
export const FormInput = forwardRef(({
    label,
    error,
    helperText,
    required = false,
    className = '',
    id,
    ...props
}, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-foreground"
                >
                    {label}
                    {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
                </label>
            )}

            <input
                ref={ref}
                id={inputId}
                className={`input w-full ${error ? 'border-destructive focus-visible:ring-destructive/50' : ''}`}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                {...props}
            />

            {error && (
                <p
                    id={`${inputId}-error`}
                    className="text-sm text-destructive flex items-center gap-1"
                    role="alert"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p
                    id={`${inputId}-helper`}
                    className="text-sm text-muted-foreground"
                >
                    {helperText}
                </p>
            )}
        </div>
    );
});

FormInput.displayName = 'FormInput';

/**
 * FormSelect component with validation support
 */
export const FormSelect = forwardRef(({
    label,
    error,
    helperText,
    required = false,
    className = '',
    options = [],
    placeholder = 'Select an option',
    id,
    ...props
}, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-sm font-medium text-foreground"
                >
                    {label}
                    {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
                </label>
            )}

            <select
                ref={ref}
                id={selectId}
                className={`input w-full ${error ? 'border-destructive focus-visible:ring-destructive/50' : ''}`}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            {error && (
                <p
                    id={`${selectId}-error`}
                    className="text-sm text-destructive flex items-center gap-1"
                    role="alert"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p
                    id={`${selectId}-helper`}
                    className="text-sm text-muted-foreground"
                >
                    {helperText}
                </p>
            )}
        </div>
    );
});

FormSelect.displayName = 'FormSelect';

/**
 * FormTextarea component with validation support
 */
export const FormTextarea = forwardRef(({
    label,
    error,
    helperText,
    required = false,
    className = '',
    rows = 4,
    id,
    ...props
}, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label
                    htmlFor={textareaId}
                    className="block text-sm font-medium text-foreground"
                >
                    {label}
                    {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
                </label>
            )}

            <textarea
                ref={ref}
                id={textareaId}
                rows={rows}
                className={`input w-full resize-y ${error ? 'border-destructive focus-visible:ring-destructive/50' : ''}`}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
                {...props}
            />

            {error && (
                <p
                    id={`${textareaId}-error`}
                    className="text-sm text-destructive flex items-center gap-1"
                    role="alert"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p
                    id={`${textareaId}-helper`}
                    className="text-sm text-muted-foreground"
                >
                    {helperText}
                </p>
            )}
        </div>
    );
});

FormTextarea.displayName = 'FormTextarea';

export default { FormInput, FormSelect, FormTextarea };
