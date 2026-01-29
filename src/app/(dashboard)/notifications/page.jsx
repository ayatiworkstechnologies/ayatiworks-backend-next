'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.items || response || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const getTypeIcon = (type) => {
    const icons = {
      success: '✅',
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
    };
    return icons[type] || 'ℹ️';
  };

  const getTypeBgColor = (type) => {
    const colors = {
      success: 'bg-green-50',
      info: 'bg-blue-50',
      warning: 'bg-yellow-50',
      error: 'bg-red-50',
    };
    return colors[type] || 'bg-gray-50';
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications.filter(n => n.is_read);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={markAllAsRead}>
            ✓ Mark all as read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'unread', 'read'].map((f) => (
          <button
            key={f}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-[var(--primary-50)] text-[var(--primary-600)]'
                : 'hover:bg-[var(--surface-hover)]'
            }`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'unread' && unreadCount > 0 && (
              <span className="ml-2 bg-[var(--primary-500)] text-white text-xs px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔔</div>
              <h3 className="empty-state-title">No notifications</h3>
              <p className="empty-state-description">
                {filter === 'unread' ? 'You have no unread notifications' : 'You have no notifications yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 flex items-start gap-4 cursor-pointer transition-colors hover:bg-[var(--surface-hover)] ${
                    !notification.is_read ? 'bg-[var(--primary-50)]' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getTypeBgColor(notification.type)}`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-medium ${!notification.is_read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-[var(--primary-500)] rounded-full mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
