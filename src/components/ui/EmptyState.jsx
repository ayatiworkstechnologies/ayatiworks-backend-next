import React from 'react';
import Link from 'next/link';
import Button from './Button';

/**
 * Empty State component for displaying when lists/data are empty
 * Provides helpful messaging and actions to guide users
 */
export const EmptyState = ({
    icon,
    title,
    description,
    action,
    actionLabel,
    actionHref,
    className = '',
    size = 'default',
}) => {
    const sizes = {
        small: 'py-8',
        default: 'py-12',
        large: 'py-16',
    };

    return (
        <div className={`flex flex-col items-center justify-center text-center ${sizes[size]} ${className}`}>
            {/* Icon or Illustration */}
            {icon && (
                <div className="mb-4 text-muted-foreground">
                    {icon}
                </div>
            )}

            {/* Title */}
            {title && (
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    {title}
                </h3>
            )}

            {/* Description */}
            {description && (
                <p className="text-sm text-muted-foreground max-w-md mb-6">
                    {description}
                </p>
            )}

            {/* Action Button */}
            {(action || actionHref) && (
                <div>
                    {actionHref ? (
                        <Link href={actionHref}>
                            <Button variant="primary">
                                {actionLabel || 'Get Started'}
                            </Button>
                        </Link>
                    ) : (
                        <Button variant="primary" onClick={action}>
                            {actionLabel || 'Get Started'}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * Empty List - for empty data lists
 */
export const EmptyList = ({
    entityName = 'items',
    createLabel,
    createHref,
    onCreate,
}) => {
    return (
        <EmptyState
            icon={
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
            }
            title={`No ${entityName} yet`}
            description={`You haven't created any ${entityName} yet. Get started by creating your first one.`}
            actionLabel={createLabel || `Create ${entityName}`}
            actionHref={createHref}
            action={onCreate}
        />
    );
};

/**
 * No Search Results
 */
export const NoSearchResults = ({
    searchTerm,
    onClear,
}) => {
    return (
        <EmptyState
            icon={
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            }
            title="No results found"
            description={searchTerm ? `No results found for "${searchTerm}". Try adjusting your search criteria.` : 'No results match your search criteria.'}
            actionLabel="Clear Filters"
            action={onClear}
        />
    );
};

/**
 * No Data Available
 */
export const NoData = ({
    title = 'No data available',
    description = 'There is no data to display at this time.',
}) => {
    return (
        <EmptyState
            icon={
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            }
            title={title}
            description={description}
        />
    );
};

/**
 * Access Denied
 */
export const AccessDenied = ({
    message = "You don't have permission to access this resource.",
}) => {
    return (
        <EmptyState
            icon={
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
            }
            title="Access Denied"
            description={message}
            actionLabel="Go Back"
            action={() => window.history.back()}
        />
    );
};

/**
 * Error State
 */
export const ErrorState = ({
    title = 'Something went wrong',
    message = 'An unexpected error occurred. Please try again.',
    onRetry,
}) => {
    return (
        <EmptyState
            icon={
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            }
            title={title}
            description={message}
            actionLabel="Try Again"
            action={onRetry}
        />
    );
};

/**
 * Coming Soon
 */
export const ComingSoon = ({
    feature = 'This feature',
}) => {
    return (
        <EmptyState
            icon={
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            }
            title="Coming Soon"
            description={`${feature} is currently under development and will be available soon.`}
        />
    );
};

/**
 * Maintenance Mode
 */
export const MaintenanceMode = () => {
    return (
        <EmptyState
            size="large"
            icon={
                <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            }
            title="Under Maintenance"
            description="We're currently performing scheduled maintenance. We'll be back shortly."
        />
    );
};

export default EmptyState;
