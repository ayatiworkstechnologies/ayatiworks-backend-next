'use client';

import api from '@/lib/api';

export default function Avatar({
  src,
  name,
  size = 'md',
  className = ''
}) {
  const sizes = {
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
    xl: 'avatar-xl',
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
    <div className={`avatar ${sizes[size]} ${className}`}>
      {src ? (
        <img src={api.getMediaUrl(src)} alt={name || 'Avatar'} />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
