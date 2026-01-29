import React from 'react';

/**
 * Skeleton Loader component for loading states
 * Provides animated placeholder UI while content is loading
 */
export const Skeleton = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
    ...props
}) => {
    const baseClass = 'animate-pulse bg-muted/50 rounded';

    const variantClasses = {
        rectangular: 'rounded-lg',
        circular: 'rounded-full',
        text: 'rounded h-4',
    };

    const style = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%'),
    };

    return (
        <div
            className={`${baseClass} ${variantClasses[variant]} ${className}`}
            style={style}
            {...props}
        />
    );
};

/**
 * Card Skeleton - for card loading states
 */
export const CardSkeleton = ({ className = '' }) => {
    return (
        <div className={`card p-6 ${className}`}>
            <div className="space-y-4">
                <Skeleton height="24px" width="60%" />
                <Skeleton height="16px" width="100%" />
                <Skeleton height="16px" width="90%" />
                <Skeleton height="16px" width="80%" />
            </div>
        </div>
    );
};

/**
 * Table Skeleton - for table loading states
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        {Array(columns).fill(0).map((_, i) => (
                            <th key={i}>
                                <Skeleton height="20px" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array(rows).fill(0).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            {Array(columns).fill(0).map((_, colIndex) => (
                                <td key={colIndex}>
                                    <Skeleton height="16px" />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

/**
 * Stat Card Skeleton - for dashboard stat cards
 */
export const StatCardSkeleton = () => {
    return (
        <div className="card">
            <div className="stat-card">
                <Skeleton variant="circular" width="48px" height="48px" />
                <div className="stat-content flex-1">
                    <Skeleton height="32px" width="80px" className="mb-2" />
                    <Skeleton height="16px" width="120px" />
                </div>
            </div>
        </div>
    );
};

/**
 * List Item Skeleton - for list loading states
 */
export const ListItemSkeleton = () => {
    return (
        <div className="flex items-center gap-4 p-4">
            <Skeleton variant="circular" width="40px" height="40px" />
            <div className="flex-1 space-y-2">
                <Skeleton height="20px" width="60%" />
                <Skeleton height="16px" width="40%" />
            </div>
            <Skeleton height="36px" width="100px" />
        </div>
    );
};

export default Skeleton;
