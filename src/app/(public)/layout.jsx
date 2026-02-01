'use client';

import Link from 'next/link';

export default function PublicLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">A</span>
                            </div>
                            <span className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Ayatiworks
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-8">
                            <Link href="/" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">
                                Home
                            </Link>
                            <Link href="/contact" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">
                                Contact
                            </Link>
                            <Link href="/careers" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">
                                Careers
                            </Link>
                            <Link
                                href="/login"
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                            >
                                Login
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">A</span>
                                </div>
                                <span className="text-xl font-semibold text-white">Ayatiworks</span>
                            </div>
                            <p className="text-slate-400 max-w-md">
                                Modern business solution for HR management, project tracking, and business operations.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact Us</Link></li>
                                <li><Link href="/careers" className="hover:text-indigo-400 transition-colors">Careers</Link></li>
                                <li><Link href="/login" className="hover:text-indigo-400 transition-colors">Employee Login</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2">
                                <li><Link href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                                <li><Link href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
                        © {new Date().getFullYear()} Ayatiworks. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
