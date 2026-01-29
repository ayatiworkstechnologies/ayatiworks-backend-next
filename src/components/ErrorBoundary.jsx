'use client';

import { Component } from 'react';

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Prevents entire app crashes and provides fallback UI
 */
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console (in production, you'd send to an error tracking service)
        console.error('Error caught by boundary:', error, errorInfo);

        this.setState({
            error,
            errorInfo
        });

        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full">
                        <div className="card p-8 text-center">
                            {/* Error Icon */}
                            <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-destructive"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>

                            {/* Error Title */}
                            <h1 className="text-2xl font-bold text-foreground mb-2">
                                Something went wrong
                            </h1>

                            {/* Error Description */}
                            <p className="text-muted-foreground mb-6">
                                We encountered an unexpected error. Don&apos;t worry, your data is safe.
                            </p>

                            {/* Development Error Details */}
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mb-6 text-left">
                                    <summary className="text-sm font-medium text-destructive cursor-pointer mb-2">
                                        Error Details (Development Only)
                                    </summary>
                                    <div className="p-4 bg-destructive/5 rounded-lg text-xs font-mono text-left overflow-auto max-h-40">
                                        <p className="text-destructive font-semibold mb-2">
                                            {this.state.error.toString()}
                                        </p>
                                        {this.state.errorInfo && (
                                            <pre className="text-muted-foreground whitespace-pre-wrap">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        )}
                                    </div>
                                </details>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={this.handleReset}
                                    className="btn btn-primary"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => window.location.href = '/dashboard'}
                                    className="btn btn-secondary"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
