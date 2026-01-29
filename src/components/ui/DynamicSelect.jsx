'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

// Dynamic Select component that fetches options from API
export default function DynamicSelect({
  label,
  name,
  value,
  onChange,
  apiEndpoint,
  valueKey = 'id',
  labelKey = 'name',
  placeholder = 'Select...',
  required = false,
  error = null,
  className = '',
  disabled = false,
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await api.get(apiEndpoint);
        setOptions(response.items || response || []);
      } catch (err) {
        console.error(`Error fetching ${apiEndpoint}:`, err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    if (apiEndpoint) {
      fetchOptions();
    } else {
      setLoading(false);
    }
  }, [apiEndpoint]);

  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled || loading}
        className={`input ${error ? 'input-error' : ''} ${className}`}
      >
        <option value="">
          {loading ? 'Loading...' : placeholder}
        </option>
        {options.map((option) => (
          <option key={option[valueKey]} value={option[valueKey]}>
            {option[labelKey]}
          </option>
        ))}
      </select>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
