'use client';

import { useRouter } from 'next/navigation';
import { Shield, Home, ArrowLeft } from 'lucide-react';

export default function AccessDenied() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Animated Shield Icon */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
                        <div className="relative bg-gradient-to-br from-red-500 to-red-700 p-6 rounded-full">
                            <Shield className="h-16 w-16 text-white" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
                    <h1 className="text-3xl font-bold text-white text-center mb-4">
                        Access Denied
                    </h1>

                    <p className="text-gray-300 text-center mb-6">
                        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                    </p>

                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                        <p className="text-sm text-red-300 text-center">
                            <strong>Required:</strong> Proper role permissions
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => router.back()}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 border border-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </button>

                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg"
                        >
                            <Home className="h-4 w-4" />
                            Dashboard
                        </button>
                    </div>

                    {/* Help Text */}
                    <p className="text-xs text-gray-400 text-center mt-6">
                        Need help? Contact support at{' '}
                        <a href="mailto:support@company.com" className="text-purple-400 hover:text-purple-300 underline">
                            support@company.com
                        </a>
                    </p>
                </div>

                {/* Footer Note */}
                <p className="text-xs text-gray-500 text-center mt-6">
                    Error Code: 403 Forbidden
                </p>
            </div>
        </div>
    );
}
