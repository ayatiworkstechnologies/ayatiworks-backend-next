'use client';

import { useState, useRef } from 'react';
import { HiOutlinePhotograph, HiOutlineUpload, HiOutlineLink, HiOutlineX, HiOutlineCheck } from 'react-icons/hi';
import api from '@/lib/api';

/**
 * ImageUpload Component
 * Provides file upload and URL input options for images
 */
export default function ImageUpload({
    value,
    onChange,
    altValue = '',
    onAltChange,
    label = 'Image',
    placeholder = 'Enter image URL or upload...',
    showPreview = true,
    previewHeight = '160px'
}) {
    const [mode, setMode] = useState('url'); // 'url' or 'upload'
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (file) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload JPEG, PNG, GIF, or WebP images only');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setError('');
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await api.upload('/uploads/images', formData);

            if (result.url) {
                onChange(result.url);
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleInputChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFileSelect(file);
    };

    const clearImage = () => {
        onChange('');
        setError('');
    };

    return (
        <div className="space-y-3">
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-foreground">{label}</label>
            )}

            {/* Mode Toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden w-fit">
                <button
                    type="button"
                    onClick={() => setMode('url')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${mode === 'url'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:bg-muted'
                        }`}
                >
                    <HiOutlineLink className="w-4 h-4" /> URL
                </button>
                <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${mode === 'upload'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:bg-muted'
                        }`}
                >
                    <HiOutlineUpload className="w-4 h-4" /> Upload
                </button>
            </div>

            {/* URL Input */}
            {mode === 'url' && (
                <div className="relative">
                    <input
                        type="url"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    {value && (
                        <button
                            type="button"
                            onClick={clearImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <HiOutlineX className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* File Upload */}
            {mode === 'upload' && (
                <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                        } ${uploading ? 'opacity-75 cursor-wait' : ''}`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleInputChange}
                        className="hidden"
                    />

                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="text-sm text-muted-foreground">Uploading...</span>
                        </div>
                    ) : value ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                            <HiOutlineCheck className="w-6 h-6" />
                            <span className="text-sm font-medium">Image uploaded</span>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); clearImage(); }}
                                className="ml-2 p-1 rounded hover:bg-muted"
                            >
                                <HiOutlineX className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <HiOutlinePhotograph className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, WebP (max 5MB)</p>
                        </>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            {/* Alt Text Input */}
            {value && onAltChange && (
                <div className="mt-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Alt Text (Accessibility)</label>
                    <input
                        type="text"
                        value={altValue}
                        onChange={(e) => onAltChange(e.target.value)}
                        placeholder="Describe the image for screen readers..."
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
            )}

            {/* Image Preview */}
            {showPreview && value && (
                <div className="relative rounded-xl overflow-hidden bg-muted" style={{ maxHeight: previewHeight }}>
                    <img
                        src={api.getMediaUrl(value)}
                        alt={altValue || "Preview"}
                        className="w-full h-full object-contain"
                        onError={() => setError('Failed to load image preview')}
                    />
                    <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                        <HiOutlineX className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
