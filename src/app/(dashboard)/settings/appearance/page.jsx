'use client';

import { Card, CardHeader, CardBody } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { HiOutlineSun, HiOutlineMoon, HiOutlineCheckCircle } from 'react-icons/hi';

export default function AppearanceSettingsPage() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Card className="border-0 shadow-xl overflow-hidden">
            <CardHeader title="Appearance" subtitle="Customize the look and feel" className="bg-muted/10" />
            <CardBody className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        className={`group relative p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-border/80'}`}
                        onClick={() => theme === 'dark' && toggleTheme()}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><HiOutlineSun className="w-5 h-5" /></div>
                            <span className="font-bold text-foreground">Light Mode</span>
                        </div>
                        <div className="h-20 bg-gray-100 rounded-lg w-full border border-gray-200"></div>
                        {theme === 'light' && (
                            <div className="absolute top-4 right-4 text-primary"><HiOutlineCheckCircle className="w-6 h-6" /></div>
                        )}
                    </button>

                    <button
                        className={`group relative p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-border/80'}`}
                        onClick={() => theme === 'light' && toggleTheme()}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-gray-800 text-yellow-400 rounded-lg"><HiOutlineMoon className="w-5 h-5" /></div>
                            <span className="font-bold text-foreground">Dark Mode</span>
                        </div>
                        <div className="h-20 bg-gray-900 rounded-lg w-full border border-gray-700"></div>
                        {theme === 'dark' && (
                            <div className="absolute top-4 right-4 text-primary"><HiOutlineCheckCircle className="w-6 h-6" /></div>
                        )}
                    </button>
                </div>
            </CardBody>
        </Card>
    );
}
