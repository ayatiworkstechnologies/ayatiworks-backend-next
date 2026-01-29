'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';
import { FiBriefcase, FiUpload, FiLinkedin, FiGlobe, FiSend, FiX } from 'react-icons/fi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Validation Schema
const careerSchema = z.object({
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(10, 'Please enter a valid phone number'),
    position_applied: z.string().min(2, 'Please specify the position'),
    experience_years: z.string().optional(),
    current_company: z.string().optional(),
    linkedin_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    portfolio_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    cover_letter: z.string().optional(),
});

const positions = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'UI/UX Designer',
    'Product Manager',
    'HR Manager',
    'Sales Executive',
    'Other',
];

export default function CareersPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeError, setResumeError] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(careerSchema),
    });

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        setResumeError('');

        if (file) {
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                setResumeError('Only PDF and Word documents are allowed');
                setResumeFile(null);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setResumeError('File size must be under 5MB');
                setResumeFile(null);
                return;
            }
            setResumeFile(file);
        }
    };

    const removeFile = () => {
        setResumeFile(null);
        setResumeError('');
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // Append form fields
            Object.keys(data).forEach(key => {
                if (data[key]) {
                    formData.append(key, data[key]);
                }
            });

            // Append resume file
            if (resumeFile) {
                formData.append('resume', resumeFile);
            }

            const response = await fetch(`${API_BASE_URL}/public/careers`, {
                method: 'POST',
                body: formData,
                // Note: Don't set Content-Type, let browser set it with boundary for multipart
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to submit application');
            }

            Swal.fire({
                icon: 'success',
                title: 'Application Submitted!',
                text: 'Thank you for your interest. Our HR team will review your application and get back to you.',
                confirmButtonColor: '#6366f1',
            });
            reset();
            setResumeFile(null);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: error.message || 'Something went wrong. Please try again.',
                confirmButtonColor: '#ef4444',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6">
                        <FiBriefcase className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Join Our Team
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        We're always looking for talented individuals to join our growing team. Submit your application below.
                    </p>
                </div>

                {/* Application Form */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
                >
                    <h2 className="text-2xl font-semibold text-slate-900 mb-6">Application Form</h2>

                    {/* Personal Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('first_name')}
                                className={`w-full px-4 py-3 rounded-xl border ${errors.first_name ? 'border-red-300' : 'border-slate-200'
                                    } focus:ring-indigo-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                placeholder="John"
                            />
                            {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('last_name')}
                                className={`w-full px-4 py-3 rounded-xl border ${errors.last_name ? 'border-red-300' : 'border-slate-200'
                                    } focus:ring-indigo-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                placeholder="Doe"
                            />
                            {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                {...register('email')}
                                className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-300' : 'border-slate-200'
                                    } focus:ring-indigo-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                placeholder="john.doe@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('phone')}
                                className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-300' : 'border-slate-200'
                                    } focus:ring-indigo-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                placeholder="+1 (555) 000-0000"
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                        </div>
                    </div>

                    {/* Position Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Position <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('position_applied')}
                                className={`w-full px-4 py-3 rounded-xl border ${errors.position_applied ? 'border-red-300' : 'border-slate-200'
                                    } focus:ring-indigo-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white`}
                            >
                                <option value="">Select Position</option>
                                {positions.map(pos => (
                                    <option key={pos} value={pos}>{pos}</option>
                                ))}
                            </select>
                            {errors.position_applied && <p className="text-red-500 text-sm mt-1">{errors.position_applied.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Experience (Years)
                            </label>
                            <input
                                type="number"
                                {...register('experience_years')}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-indigo-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                placeholder="3"
                                min="0"
                                max="50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Current Company
                            </label>
                            <input
                                {...register('current_company')}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-indigo-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                placeholder="ABC Corp"
                            />
                        </div>
                    </div>

                    {/* Links Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                <FiLinkedin className="text-indigo-600" /> LinkedIn URL
                            </label>
                            <input
                                {...register('linkedin_url')}
                                className={`w-full px-4 py-3 rounded-xl border ${errors.linkedin_url ? 'border-red-300' : 'border-slate-200'
                                    } focus:ring-indigo-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                placeholder="https://linkedin.com/in/johndoe"
                            />
                            {errors.linkedin_url && <p className="text-red-500 text-sm mt-1">{errors.linkedin_url.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                <FiGlobe className="text-purple-600" /> Portfolio URL
                            </label>
                            <input
                                {...register('portfolio_url')}
                                className={`w-full px-4 py-3 rounded-xl border ${errors.portfolio_url ? 'border-red-300' : 'border-slate-200'
                                    } focus:ring-indigo-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                placeholder="https://johndoe.com"
                            />
                            {errors.portfolio_url && <p className="text-red-500 text-sm mt-1">{errors.portfolio_url.message}</p>}
                        </div>
                    </div>

                    {/* Resume Upload */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Resume (PDF, DOC, DOCX - Max 5MB)
                        </label>

                        {!resumeFile ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
                                <FiUpload className="w-8 h-8 text-slate-400 mb-2" />
                                <span className="text-slate-500">Click to upload resume</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                />
                            </label>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <FiUpload className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{resumeFile.name}</p>
                                        <p className="text-sm text-slate-500">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={removeFile}
                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    <FiX className="w-5 h-5 text-red-500" />
                                </button>
                            </div>
                        )}
                        {resumeError && <p className="text-red-500 text-sm mt-1">{resumeError}</p>}
                    </div>

                    {/* Cover Letter */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Cover Letter (Optional)
                        </label>
                        <textarea
                            {...register('cover_letter')}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-indigo-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                            placeholder="Tell us why you'd be a great fit for this role..."
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <FiSend className="w-5 h-5" />
                                Submit Application
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
