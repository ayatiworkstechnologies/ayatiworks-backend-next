'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiOutlineHome, HiOutlineChevronRight } from 'react-icons/hi';

/**
 * Breadcrumb component for navigation
 * Automatically generates breadcrumbs based on current path
 */
export const Breadcrumb = ({ items = [], className = '' }) => {
    const pathname = usePathname();

    // Auto-generate breadcrumbs from pathname if items not provided
    const generateBreadcrumbs = () => {
        if (items.length > 0) return items;

        const segments = pathname.split('/').filter(Boolean);
        const breadcrumbs = [];

        let currentPath = '';
        segments.forEach((segment, index) => {
            // Skip the dashboard route group
            if (segment === '(dashboard)') return;

            currentPath += `/${segment}`;

            // Format segment for display
            const label = segment
                .replace(/-/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase());

            breadcrumbs.push({
                label,
                href: currentPath,
                isLast: index === segments.length - 1
            });
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    if (breadcrumbs.length === 0) return null;

    return (
        <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
            {/* Home link */}
            <Link
                href="/dashboard"
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
                <HiOutlineHome className="w-4 h-4" />
            </Link>

            {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                    <HiOutlineChevronRight className="w-4 h-4 text-muted-foreground/50 mx-1" />
                    {crumb.isLast ? (
                        <span className="font-medium text-foreground">
                            {crumb.label}
                        </span>
                    ) : (
                        <Link
                            href={crumb.href}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {crumb.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
};

/**
 * PageHeader with Breadcrumb
 * Combines page title, description, and breadcrumb navigation
 */
export const PageHeader = ({
    title,
    description,
    icon,
    iconBg = 'bg-primary/10',
    iconColor = 'text-primary',
    children,
    showBreadcrumb = true,
    breadcrumbItems = [],
    className = ''
}) => {
    return (
        <div className={`space-y-4 ${className}`}>
            {showBreadcrumb && <Breadcrumb items={breadcrumbItems} />}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {icon && (
                        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center ${iconColor}`}>
                            {icon}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                        {description && (
                            <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
                        )}
                    </div>
                </div>

                {children && (
                    <div className="flex items-center gap-3">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Breadcrumb;
