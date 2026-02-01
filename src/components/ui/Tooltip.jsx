'use client';

import React, { useState, useRef, useEffect } from 'react';

/**
 * Accessible Tooltip component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Trigger element
 * @param {string} props.content - Tooltip text content
 * @param {'top' | 'bottom' | 'left' | 'right'} props.position - Tooltip position
 * @param {number} props.delay - Delay before showing (ms)
 * 
 * @example
 * <Tooltip content="Delete this item">
 *   <button><TrashIcon /></button>
 * </Tooltip>
 */
export function Tooltip({
    children,
    content,
    position = 'top',
    delay = 200,
    className = ''
}) {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef(null);
    const tooltipRef = useRef(null);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent',
    };

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    const handleFocus = () => {
        setIsVisible(true);
    };

    const handleBlur = () => {
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    if (!content) return children;

    return (
        <div
            className={`relative inline-flex ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            {children}

            {isVisible && (
                <div
                    ref={tooltipRef}
                    role="tooltip"
                    className={`
            absolute z-50 px-2.5 py-1.5
            bg-gray-900 text-white text-xs font-medium
            rounded-lg shadow-lg
            whitespace-nowrap
            animate-fade-in
            ${positionClasses[position]}
          `}
                >
                    {content}
                    {/* Arrow */}
                    <div
                        className={`
              absolute w-0 h-0
              border-4
              ${arrowClasses[position]}
            `}
                    />
                </div>
            )}
        </div>
    );
}

export default Tooltip;
