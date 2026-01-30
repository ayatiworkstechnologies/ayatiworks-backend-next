'use client';

import { useEffect, useRef, useState } from 'react';
import {
    HiOutlinePhotograph, HiOutlineLink, HiOutlineCode,
    HiOutlineTrash, HiOutlineUpload, HiOutlineX
} from 'react-icons/hi';
import {
    FaBold, FaItalic, FaUnderline, FaStrikethrough,
    FaListUl, FaListOl,
    FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify,
    FaUndo, FaRedo, FaHeading, FaParagraph, FaMinus, FaQuoteLeft
} from 'react-icons/fa';
import { BiHeading } from 'react-icons/bi';
import api from '@/lib/api';

// Rich Text Editor Component with Image Upload
export default function RichTextEditor({ value, onChange, placeholder, minHeight = '200px' }) {
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showHeadingMenu, setShowHeadingMenu] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const execCommand = (command, cmdValue = null) => {
        // Focus editor first
        editorRef.current?.focus();

        // Execute the command
        document.execCommand(command, false, cmdValue);

        // Trigger onChange after command
        setTimeout(() => {
            if (onChange) {
                onChange(editorRef.current?.innerHTML || '');
            }
        }, 10);
    };

    // Format block helper - more reliable for headings
    const formatBlock = (tag) => {
        editorRef.current?.focus();
        document.execCommand('formatBlock', false, tag);
        setShowHeadingMenu(false);
        setTimeout(() => {
            if (onChange) {
                onChange(editorRef.current?.innerHTML || '');
            }
        }, 10);
    };

    const handleInput = () => {
        if (onChange) {
            onChange(editorRef.current?.innerHTML || '');
        }
    };

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            if (value === '' || value === null) {
                if (editorRef.current.innerHTML !== '') editorRef.current.innerHTML = '';
            } else {
                editorRef.current.innerHTML = value;
            }
        }
    }, [value]);

    // Handle file upload
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setUploadError('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Image must be less than 5MB');
            return;
        }

        setUploading(true);
        setUploadError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.upload('/uploads/images', formData);

            if (response?.url) {
                setImageUrl(response.url);
                setImageAlt(file.name.split('.')[0]);
            } else {
                setUploadError('Upload failed - no URL returned');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadError(error.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    // Insert image into editor
    const insertImage = () => {
        if (!imageUrl) return;

        const imgHtml = `<img src="${imageUrl}" alt="${imageAlt || 'Image'}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0;" />`;

        editorRef.current?.focus();
        document.execCommand('insertHTML', false, imgHtml);

        if (onChange) {
            onChange(editorRef.current?.innerHTML || '');
        }

        setShowImageModal(false);
        setImageUrl('');
        setImageAlt('');
        setUploadError('');
    };

    // Handle paste in editor (for pasting images)
    const handlePaste = async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    setShowImageModal(true);
                    setUploading(true);
                    try {
                        const formData = new FormData();
                        formData.append('file', file);
                        const response = await api.upload('/uploads/images', formData);
                        if (response?.url) {
                            setImageUrl(response.url);
                            setImageAlt('Pasted image');
                        }
                    } catch (error) {
                        setUploadError('Failed to upload pasted image');
                    } finally {
                        setUploading(false);
                    }
                }
                break;
            }
        }
    };

    // Toolbar Button Helper
    const ToolbarBtn = ({ icon: Icon, onClick, title, active = false, className = '' }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-2 rounded-lg transition-all duration-200 ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground hover:text-foreground'} ${className}`}
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    // Heading options
    const headingOptions = [
        { tag: 'h1', label: 'Heading 1', size: 'text-2xl font-bold' },
        { tag: 'h2', label: 'Heading 2', size: 'text-xl font-bold' },
        { tag: 'h3', label: 'Heading 3', size: 'text-lg font-semibold' },
        { tag: 'h4', label: 'Heading 4', size: 'text-base font-semibold' },
        { tag: 'p', label: 'Paragraph', size: 'text-sm' },
    ];

    return (
        <div className="border border-input rounded-xl overflow-hidden bg-background/50 focus-within:ring-2 focus-within:ring-primary/20 shadow-sm transition-shadow">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 p-2 bg-muted/40 border-b border-input">

                {/* Undo/Redo */}
                <div className="flex gap-0.5">
                    <ToolbarBtn icon={FaUndo} onClick={() => execCommand('undo')} title="Undo (Ctrl+Z)" />
                    <ToolbarBtn icon={FaRedo} onClick={() => execCommand('redo')} title="Redo (Ctrl+Y)" />
                </div>
                <div className="w-px h-6 bg-border mx-1.5" />

                {/* Headings Dropdown */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowHeadingMenu(!showHeadingMenu)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium transition-colors"
                        title="Headings"
                    >
                        <BiHeading className="w-4 h-4" />
                        <span className="hidden sm:inline">Heading</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showHeadingMenu && (
                        <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-xl shadow-xl z-50 py-1 min-w-[150px] animate-in fade-in slide-in-from-top-2 duration-200">
                            {headingOptions.map((opt) => (
                                <button
                                    key={opt.tag}
                                    type="button"
                                    onClick={() => formatBlock(opt.tag)}
                                    className={`w-full text-left px-4 py-2 hover:bg-muted transition-colors ${opt.size}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="w-px h-6 bg-border mx-1.5" />

                {/* Text Formatting */}
                <div className="flex gap-0.5">
                    <ToolbarBtn icon={FaBold} onClick={() => execCommand('bold')} title="Bold (Ctrl+B)" />
                    <ToolbarBtn icon={FaItalic} onClick={() => execCommand('italic')} title="Italic (Ctrl+I)" />
                    <ToolbarBtn icon={FaUnderline} onClick={() => execCommand('underline')} title="Underline (Ctrl+U)" />
                    <ToolbarBtn icon={FaStrikethrough} onClick={() => execCommand('strikeThrough')} title="Strikethrough" />
                </div>
                <div className="w-px h-6 bg-border mx-1.5" />

                {/* Alignment - Hidden on mobile */}
                <div className="gap-0.5 hidden md:flex">
                    <ToolbarBtn icon={FaAlignLeft} onClick={() => execCommand('justifyLeft')} title="Align Left" />
                    <ToolbarBtn icon={FaAlignCenter} onClick={() => execCommand('justifyCenter')} title="Align Center" />
                    <ToolbarBtn icon={FaAlignRight} onClick={() => execCommand('justifyRight')} title="Align Right" />
                    <ToolbarBtn icon={FaAlignJustify} onClick={() => execCommand('justifyFull')} title="Justify" />
                </div>
                <div className="w-px h-6 bg-border mx-1.5 hidden md:block" />

                {/* Lists */}
                <div className="flex gap-0.5">
                    <ToolbarBtn icon={FaListUl} onClick={() => execCommand('insertUnorderedList')} title="Bullet List" />
                    <ToolbarBtn icon={FaListOl} onClick={() => execCommand('insertOrderedList')} title="Numbered List" />
                </div>
                <div className="w-px h-6 bg-border mx-1.5" />

                {/* Insert Elements */}
                <div className="flex gap-0.5">
                    <ToolbarBtn icon={HiOutlineLink} onClick={() => {
                        const url = prompt('Enter link URL:');
                        if (url) execCommand('createLink', url);
                    }} title="Insert Link" />
                    <ToolbarBtn icon={HiOutlinePhotograph} onClick={() => setShowImageModal(true)} title="Insert Image" />
                    <ToolbarBtn icon={FaQuoteLeft} onClick={() => formatBlock('blockquote')} title="Quote" />
                    <ToolbarBtn icon={HiOutlineCode} onClick={() => formatBlock('pre')} title="Code Block" />
                    <ToolbarBtn icon={FaMinus} onClick={() => execCommand('insertHorizontalRule')} title="Horizontal Line" />
                </div>

                <div className="flex-1" />

                {/* Clear Formatting */}
                <ToolbarBtn
                    icon={HiOutlineTrash}
                    onClick={() => execCommand('removeFormat')}
                    title="Clear Formatting"
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                />
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                onClick={() => setShowHeadingMenu(false)}
                className="p-4 focus:outline-none prose prose-sm dark:prose-invert max-w-none
                           prose-headings:mt-4 prose-headings:mb-2 
                           prose-h1:text-3xl prose-h1:font-bold
                           prose-h2:text-2xl prose-h2:font-bold
                           prose-h3:text-xl prose-h3:font-semibold
                           prose-h4:text-lg prose-h4:font-medium
                           prose-p:my-2 
                           prose-ul:my-2 prose-ul:list-disc prose-ul:pl-6
                           prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-6
                           prose-li:my-1
                           prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4
                           prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg
                           prose-img:rounded-lg prose-img:shadow-md prose-img:my-4
                           prose-a:text-primary prose-a:underline"
                style={{ minHeight }}
                data-placeholder={placeholder}
                suppressContentEditableWarning
            />

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
            />

            {/* Image Insert Modal */}
            {showImageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="text-lg font-semibold">Insert Image</h3>
                            <button
                                onClick={() => {
                                    setShowImageModal(false);
                                    setImageUrl('');
                                    setImageAlt('');
                                    setUploadError('');
                                }}
                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 space-y-4">
                            {/* Upload Zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
                            >
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span className="text-sm text-muted-foreground">Uploading...</span>
                                    </div>
                                ) : (
                                    <>
                                        <HiOutlineUpload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-sm font-medium">Click to upload image</p>
                                        <p className="text-xs text-muted-foreground mt-1">or drag and drop (max 5MB)</p>
                                    </>
                                )}
                            </div>

                            {/* Error Message */}
                            {uploadError && (
                                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                                    {uploadError}
                                </p>
                            )}

                            {/* Divider */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-xs text-muted-foreground">or paste URL</span>
                                <div className="flex-1 h-px bg-border" />
                            </div>

                            {/* URL Input */}
                            <div className="space-y-3">
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                                <input
                                    type="text"
                                    value={imageAlt}
                                    onChange={(e) => setImageAlt(e.target.value)}
                                    placeholder="Alt text (optional)"
                                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>

                            {/* Image Preview */}
                            {imageUrl && (
                                <div className="rounded-lg overflow-hidden bg-muted/50 p-2">
                                    <img
                                        src={api.getMediaUrl(imageUrl)}
                                        alt={imageAlt || 'Preview'}
                                        className="max-h-40 mx-auto rounded-lg object-contain"
                                        onError={() => setUploadError('Failed to load image preview')}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-4 border-t border-border bg-muted/20">
                            <button
                                onClick={() => {
                                    setShowImageModal(false);
                                    setImageUrl('');
                                    setImageAlt('');
                                    setUploadError('');
                                }}
                                className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={insertImage}
                                disabled={!imageUrl}
                                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Insert Image
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                [contentEditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                    display: block;
                }
                [contentEditable] ul { list-style-type: disc !important; padding-left: 1.5rem !important; }
                [contentEditable] ol { list-style-type: decimal !important; padding-left: 1.5rem !important; }
                [contentEditable] li { margin: 0.25rem 0 !important; }
                [contentEditable] blockquote { 
                    border-left: 4px solid hsl(var(--primary)) !important; 
                    padding-left: 1rem !important; 
                    margin: 1rem 0 !important;
                    font-style: italic !important;
                }
                [contentEditable] pre {
                    background: hsl(var(--muted)) !important;
                    padding: 1rem !important;
                    border-radius: 0.5rem !important;
                    font-family: monospace !important;
                    overflow-x: auto !important;
                }
                [contentEditable] h1 { font-size: 1.875rem !important; font-weight: 700 !important; margin: 1rem 0 0.5rem !important; }
                [contentEditable] h2 { font-size: 1.5rem !important; font-weight: 700 !important; margin: 1rem 0 0.5rem !important; }
                [contentEditable] h3 { font-size: 1.25rem !important; font-weight: 600 !important; margin: 0.75rem 0 0.5rem !important; }
                [contentEditable] h4 { font-size: 1.125rem !important; font-weight: 500 !important; margin: 0.75rem 0 0.5rem !important; }
            `}} />
        </div>
    );
}
