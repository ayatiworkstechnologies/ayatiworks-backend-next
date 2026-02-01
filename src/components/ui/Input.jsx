'use client';

import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  required,
  type = 'text',
  placeholder,
  disabled = false,
  className = '',
  wrapperClassName = '',
  icon,
  ...props
}, ref) => {
  return (
    <div className={`input-wrapper ${wrapperClassName}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required"> *</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`input ${error ? 'input-error' : ''} ${icon ? '!pl-10' : ''} ${props.suffix ? '!pr-10' : ''} ${className}`}
          {...props}
        />
        {props.suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {props.suffix}
          </div>
        )}
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
