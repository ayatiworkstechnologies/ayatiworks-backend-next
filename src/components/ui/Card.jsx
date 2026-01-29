'use client';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div 
      className={`glass-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', title, action }) {
  return (
    <div className={`card-header ${className}`}>
      {title ? (
        <>
          <h3 className="card-title">{title}</h3>
          {action}
        </>
      ) : (
        children
      )}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={`card-body ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`card-footer ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ 
  icon, 
  iconColor = 'blue', 
  value, 
  label, 
  trend, 
  trendUp = true,
  className = '' 
}) {
  const iconColorClasses = {
    blue: 'stat-icon-blue',
    green: 'stat-icon-green',
    purple: 'stat-icon-purple',
    orange: 'stat-icon-orange',
  };

  return (
    <Card className={`stat-card ${className}`}>
      <div className={`stat-icon ${iconColorClasses[iconColor]}`}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {trend && (
          <div className={`text-xs mt-1 ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>
    </Card>
  );
}
