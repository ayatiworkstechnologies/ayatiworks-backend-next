export default function PageHeader({ title, description, children, className = '' }) {
    return (
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    {title}
                </h1>
                {description && (
                    <p className="text-muted-foreground mt-1 font-medium">
                        {description}
                    </p>
                )}
            </div>
            {children && (
                <div className="flex flex-wrap items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    );
}
