'use client';

import { useState, useEffect, useRef } from 'react';
import { HiOutlinePencil, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

export default function EditableField({
    icon: Icon,
    label,
    value,
    fieldName,
    editingField,
    editValue,
    saving,
    onEdit,
    onCancel,
    onSave,
    onChange,
    capitalize,
    type = 'text',
    options = [], // [{ label: 'Option 1', value: 'opt1' }]
    className = '',
    placeholder = 'Not set'
}) {
    const isEditing = editingField === fieldName;
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    if (isEditing) {
        return (
            <div className={`flex items-start gap-4 p-3 bg-primary/5 rounded-xl border-2 border-primary/30 shadow-sm ${className}`}>
                {Icon && (
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-primary mb-2 uppercase tracking-wide">{label}</p>
                    <div className="flex gap-2">
                        {type === 'select' ? (
                            <select
                                ref={inputRef}
                                value={editValue}
                                onChange={(e) => onChange(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-w-0"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') onSave();
                                    if (e.key === 'Escape') onCancel();
                                }}
                            >
                                <option value="">Select {label}</option>
                                {options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                ref={inputRef}
                                type={type}
                                value={editValue}
                                onChange={(e) => onChange(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-w-0"
                                placeholder={placeholder}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') onSave();
                                    if (e.key === 'Escape') onCancel();
                                }}
                            />
                        )}

                        <div className="flex gap-1 shrink-0">
                            <button
                                onClick={onSave}
                                disabled={saving}
                                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
                                title="Save"
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <HiOutlineCheck className="w-4 h-4" />
                                )}
                            </button>
                            <button
                                onClick={onCancel}
                                className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                                title="Cancel"
                            >
                                <HiOutlineX className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Display Logic for Select fields to show Label instead of Value
    let displayValue = value;
    if (type === 'select' && options.length > 0) {
        const selectedOption = options.find(opt => String(opt.value) === String(value));
        if (selectedOption) displayValue = selectedOption.label;
    }

    return (
        <div
            onClick={() => onEdit(fieldName, value)}
            className={`flex items-start gap-4 p-3 rounded-xl hover:bg-muted/30 cursor-pointer transition-all group border border-transparent hover:border-border/50 ${className}`}
        >
            {Icon && (
                <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">{label}</p>
                <div className="flex items-center justify-between">
                    <p className={`text-base font-semibold text-foreground truncate ${capitalize ? 'capitalize' : ''}`}>
                        {displayValue || <span className="text-muted-foreground/50 italic">{placeholder}</span>}
                    </p>
                    <HiOutlinePencil className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all ml-2 shrink-0" />
                </div>
            </div>
        </div>
    );
}
