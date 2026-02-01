'use client';

import { Avatar } from '@/components/ui';
import { HiOutlineMail, HiOutlinePhone, HiOutlineBriefcase, HiOutlineLocationMarker, HiOutlineCalendar, HiOutlineIdentification } from 'react-icons/hi';

/**
 * ProfileCard - A premium employee profile card component
 * 
 * @param {Object} props
 * @param {Object} props.employee - Employee data object
 * @param {Object} props.user - User data (first_name, last_name, email, phone, avatar)
 * @param {string} props.designation - Job title
 * @param {string} props.department - Department name
 * @param {string} props.employeeCode - Employee ID code
 * @param {string} props.status - Employment status (active, probation, etc.)
 * @param {string} props.joiningDate - Date of joining
 * @param {React.ReactNode} props.actions - Action buttons
 * @param {boolean} props.compact - Compact mode for list views
 */
export default function ProfileCard({
    user,
    designation,
    department,
    employeeCode,
    status,
    joiningDate,
    location,
    actions,
    compact = false,
    className = '',
}) {
    const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Unknown';

    // Status colors
    const getStatusColor = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'active') return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
        if (s === 'probation') return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        if (s === 'notice_period') return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
        if (s === 'terminated' || s === 'resigned') return 'bg-red-500/10 text-red-600 border-red-500/20';
        return 'bg-primary/10 text-primary border-primary/20';
    };

    if (compact) {
        return (
            <div className={`flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all ${className}`}>
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-br from-primary to-indigo-600 rounded-xl opacity-50 blur" />
                    <Avatar name={fullName} src={user?.avatar} size="md" className="relative ring-2 ring-background" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{fullName}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                        {designation || 'N/A'} • {department || 'N/A'}
                    </p>
                </div>
                {status && (
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${getStatusColor(status)}`}>
                        {status.replace('_', ' ')}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className={`bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden ${className}`}>
            {/* Gradient Header */}
            <div className="h-24 bg-gradient-to-r from-primary/20 via-indigo-500/20 to-purple-500/20 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 to-transparent" />
            </div>

            {/* Profile Content */}
            <div className="relative px-6 pb-6">
                {/* Avatar - overlapping header */}
                <div className="absolute -top-12 left-6">
                    <div className="relative group">
                        <div className="absolute -inset-1.5 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl opacity-75 group-hover:opacity-100 blur transition-all" />
                        <Avatar
                            name={fullName}
                            src={user?.avatar}
                            size="xl"
                            className="relative w-24 h-24 ring-4 ring-background rounded-2xl text-2xl"
                        />
                    </div>
                </div>

                {/* Actions - top right */}
                {actions && (
                    <div className="absolute top-4 right-4 flex gap-2">
                        {actions}
                    </div>
                )}

                {/* Profile Info */}
                <div className="pt-16">
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-foreground">{fullName}</h2>
                        {status && (
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${getStatusColor(status)}`}>
                                {status.replace('_', ' ')}
                            </span>
                        )}
                    </div>

                    <p className="text-muted-foreground flex items-center gap-2">
                        <HiOutlineBriefcase className="w-4 h-4" />
                        <span>{designation || 'N/A'}</span>
                        <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                        <span>{department || 'N/A'}</span>
                    </p>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {user?.email && (
                            <InfoChip icon={HiOutlineMail} label="Email" value={user.email} truncate />
                        )}
                        {user?.phone && (
                            <InfoChip icon={HiOutlinePhone} label="Phone" value={user.phone} />
                        )}
                        {employeeCode && (
                            <InfoChip icon={HiOutlineIdentification} label="Employee ID" value={employeeCode} />
                        )}
                        {joiningDate && (
                            <InfoChip icon={HiOutlineCalendar} label="Joined" value={new Date(joiningDate).toLocaleDateString()} />
                        )}
                        {location && (
                            <InfoChip icon={HiOutlineLocationMarker} label="Location" value={location} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoChip({ icon: Icon, label, value, truncate }) {
    return (
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/30">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className={`text-sm font-semibold text-foreground ${truncate ? 'truncate' : ''}`} title={value}>{value}</p>
            </div>
        </div>
    );
}
