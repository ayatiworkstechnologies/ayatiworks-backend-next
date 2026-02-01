'use client';

import api from '@/lib/api';

export default function Avatar({
  src,
  name,
  size = 'md',
  className = ''
}) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative flex items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br from-primary to-indigo-600 text-white font-bold ${sizes[size] || sizes.md} ${className}`}>
      {src ? (
        <img
          src={api.getMediaUrl(src)}
          alt={name || 'Avatar'}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
