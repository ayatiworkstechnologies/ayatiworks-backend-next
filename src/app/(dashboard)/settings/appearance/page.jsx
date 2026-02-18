'use client';

import { Card, CardBody } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { HiOutlineSun, HiOutlineMoon, HiOutlineCheckCircle, HiOutlineDesktopComputer } from 'react-icons/hi';

export default function AppearanceSettingsPage() {
    const { theme, toggleTheme, setTheme } = useTheme();

    const themes = [
        {
            id: 'light',
            label: 'Light',
            desc: 'Clean and bright interface',
            icon: HiOutlineSun,
            iconBg: 'bg-amber-100 text-amber-600',
            preview: {
                bg: 'bg-gray-50',
                sidebar: 'bg-white',
                header: 'bg-white',
                content: 'bg-gray-100',
                accent: 'bg-blue-500',
                text: 'bg-gray-300',
                textSm: 'bg-gray-200',
            }
        },
        {
            id: 'dark',
            label: 'Dark',
            desc: 'Easy on the eyes at night',
            icon: HiOutlineMoon,
            iconBg: 'bg-indigo-900/50 text-indigo-300',
            preview: {
                bg: 'bg-gray-900',
                sidebar: 'bg-gray-800',
                header: 'bg-gray-800',
                content: 'bg-gray-850',
                accent: 'bg-indigo-500',
                text: 'bg-gray-600',
                textSm: 'bg-gray-700',
            }
        },
    ];

    const handleThemeChange = (id) => {
        if (setTheme) {
            setTheme(id);
        } else if (theme !== id) {
            toggleTheme();
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Theme Selection */}
            <Card className="border-0 shadow-xl overflow-hidden">
                <div className="p-5 bg-muted/20 border-b border-border/50">
                    <h3 className="text-lg font-bold text-foreground">Theme</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Choose how the interface looks to you</p>
                </div>
                <CardBody className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {themes.map(t => {
                            const Icon = t.icon;
                            const isActive = theme === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => handleThemeChange(t.id)}
                                    className={`group relative rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden ${isActive
                                        ? 'border-primary ring-4 ring-primary/15 shadow-lg shadow-primary/10'
                                        : 'border-border/50 hover:border-border hover:shadow-md'
                                        }`}
                                >
                                    {/* Mini Preview */}
                                    <div className={`${t.preview.bg} p-3 h-36`}>
                                        <div className="flex gap-2 h-full rounded-lg overflow-hidden shadow-sm">
                                            {/* Mini Sidebar */}
                                            <div className={`${t.preview.sidebar} w-12 rounded-lg p-1.5 space-y-1.5 flex-shrink-0`}>
                                                <div className={`w-full h-1.5 rounded ${t.preview.accent}`} />
                                                <div className={`w-full h-1 rounded ${t.preview.text}`} />
                                                <div className={`w-full h-1 rounded ${t.preview.textSm}`} />
                                                <div className={`w-full h-1 rounded ${t.preview.textSm}`} />
                                                <div className={`w-3/4 h-1 rounded ${t.preview.textSm}`} />
                                            </div>
                                            {/* Mini Content */}
                                            <div className="flex-1 space-y-2">
                                                {/* Mini Header */}
                                                <div className={`${t.preview.header} rounded-lg p-1.5 flex items-center justify-between`}>
                                                    <div className={`w-12 h-1.5 rounded ${t.preview.text}`} />
                                                    <div className={`w-4 h-4 rounded-full ${t.preview.textSm}`} />
                                                </div>
                                                {/* Mini Cards */}
                                                <div className="grid grid-cols-3 gap-1.5">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className={`${t.preview.header} rounded-lg p-1.5`}>
                                                            <div className={`w-full h-1 rounded mb-1 ${t.preview.accent} opacity-60`} />
                                                            <div className={`w-3/4 h-0.5 rounded ${t.preview.textSm}`} />
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Mini Table */}
                                                <div className={`${t.preview.header} rounded-lg p-1.5 space-y-1`}>
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="flex gap-1">
                                                            <div className={`flex-1 h-0.5 rounded ${t.preview.textSm}`} />
                                                            <div className={`w-6 h-0.5 rounded ${t.preview.text}`} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Label */}
                                    <div className={`p-4 flex items-center gap-3 border-t ${isActive ? 'border-primary/20 bg-primary/5' : 'border-border/30'}`}>
                                        <div className={`w-9 h-9 rounded-xl ${t.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-bold text-foreground text-sm">{t.label}</span>
                                            <p className="text-xs text-muted-foreground">{t.desc}</p>
                                        </div>
                                        {isActive && (
                                            <div className="text-primary animate-fade-in-up">
                                                <HiOutlineCheckCircle className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </CardBody>
            </Card>

            {/* Accent Colors */}
            <Card className="border-0 shadow-xl overflow-hidden">
                <div className="p-5 bg-muted/20 border-b border-border/50">
                    <h3 className="text-lg font-bold text-foreground">Accent Color</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Choose your preferred brand accent</p>
                </div>
                <CardBody className="p-6">
                    <div className="flex flex-wrap gap-3">
                        {[
                            { name: 'Blue', color: 'bg-blue-500', ring: 'ring-blue-500/30' },
                            { name: 'Indigo', color: 'bg-indigo-500', ring: 'ring-indigo-500/30' },
                            { name: 'Violet', color: 'bg-violet-500', ring: 'ring-violet-500/30' },
                            { name: 'Rose', color: 'bg-rose-500', ring: 'ring-rose-500/30' },
                            { name: 'Emerald', color: 'bg-emerald-500', ring: 'ring-emerald-500/30' },
                            { name: 'Amber', color: 'bg-amber-500', ring: 'ring-amber-500/30' },
                            { name: 'Cyan', color: 'bg-cyan-500', ring: 'ring-cyan-500/30' },
                        ].map(c => (
                            <button
                                key={c.name}
                                className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-muted/30 transition-colors`}
                                title={c.name}
                                onClick={() => { /* Future: accent color switching */ }}
                            >
                                <div className={`w-10 h-10 rounded-xl ${c.color} shadow-lg group-hover:scale-110 ring-2 ring-transparent group-hover:${c.ring} transition-all duration-200`} />
                                <span className="text-[10px] font-medium text-muted-foreground">{c.name}</span>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground/60 mt-4 italic">Accent color customization coming soon</p>
                </CardBody>
            </Card>
        </div>
    );
}
