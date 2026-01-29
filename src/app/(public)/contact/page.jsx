'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Validation Schema
const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    subject: z.string().min(5, 'Subject must be at least 5 characters'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
});

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/public/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to submit');
            }

            Swal.fire({
                icon: 'success',
                title: 'Message Sent!',
                text: 'Thank you for contacting us. We will get back to you soon.',
                confirmButtonColor: '#6366f1',
            });
            reset();
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
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Get in Touch
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FiMail className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Email Us</h3>
                                    <p className="text-slate-600 mt-1">support@enterprise-hrms.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FiPhone className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Call Us</h3>
                                    <p className="text-slate-600 mt-1">+1 (555) 123-4567</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FiMapPin className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Visit Us</h3>
                                    <p className="text-slate-600 mt-1">123 Business Avenue, Tech City, TC 12345</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Your Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register('name')}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'
                                            } focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                        placeholder="John Doe"
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        {...register('email')}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'
                                            } focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        {...register('phone')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-indigo-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register('subject')}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.subject ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'
                                            } focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                        placeholder="How can we help?"
                                    />
                                    {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
                                </div>
                            </div>

                            {/* Message */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    {...register('message')}
                                    rows={5}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.message ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'
                                        } focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none`}
                                    placeholder="Tell us more about your inquiry..."
                                />
                                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="mt-8 w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <FiSend className="w-5 h-5" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
