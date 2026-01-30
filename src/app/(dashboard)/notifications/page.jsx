'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlineBell, HiOutlineCheck, HiOutlineCheckCircle, HiOutlineTrash,
  HiOutlineInformationCircle, HiOutlineExclamation, HiOutlineXCircle,
  HiOutlineRefresh
} from 'react-icons/hi';

export default function NotificationsPage() {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.items || response || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast?.error?.('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast?.error?.('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    setMarkingAllRead(true);
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast?.success?.('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast?.error?.('Failed to mark all as read');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const deleteNotification = async (id, e) => {
    e?.stopPropagation();
    setDeletingId(id);
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast?.success?.('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast?.error?.('Failed to delete notification');
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      success: <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />,
      info: <HiOutlineInformationCircle className="w-5 h-5 text-blue-500" />,
      warning: <HiOutlineExclamation className="w-5 h-5 text-amber-500" />,
      error: <HiOutlineXCircle className="w-5 h-5 text-rose-500" />,
    };
    return icons[type] || <HiOutlineBell className="w-5 h-5 text-gray-500" />;
  };

  const getTypeColors = (type) => {
    const colors = {
      success: 'bg-emerald-50 dark:bg-emerald-500/10 ring-emerald-500/20',
      info: 'bg-blue-50 dark:bg-blue-500/10 ring-blue-500/20',
      warning: 'bg-amber-50 dark:bg-amber-500/10 ring-amber-500/20',
      error: 'bg-rose-50 dark:bg-rose-500/10 ring-rose-500/20',
    };
    return colors[type] || 'bg-gray-50 dark:bg-gray-500/10 ring-gray-500/20';
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter(n => !n.is_read)
      : notifications.filter(n => n.is_read);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  // Loading skeleton
  const NotificationSkeleton = () => (
    <div className="p-4 flex items-start gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-muted/30" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted/30 rounded w-3/4" />
        <div className="h-3 bg-muted/20 rounded w-1/2" />
      </div>
      <div className="w-16 h-3 bg-muted/20 rounded" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <HiOutlineBell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
            <p className="text-muted-foreground text-sm">
              {loading ? 'Loading...' : unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up! 🎉'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchNotifications} disabled={loading}>
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {unreadCount > 0 && (
            <Button variant="secondary" onClick={markAllAsRead} disabled={markingAllRead}>
              <HiOutlineCheck className="w-4 h-4" />
              {markingAllRead ? 'Marking...' : 'Mark all read'}
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1 space-x-1 bg-muted/30 rounded-xl w-fit border border-border/40">
        {[
          { id: 'all', label: 'All', count: notifications.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          { id: 'read', label: 'Read', count: notifications.length - unreadCount },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${filter === tab.id
                ? 'bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            onClick={() => setFilter(tab.id)}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === tab.id ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'
                }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <CardBody className="p-0">
          {loading ? (
            <div className="divide-y divide-border/30">
              {Array(5).fill(0).map((_, i) => <NotificationSkeleton key={i} />)}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 px-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                <HiOutlineBell className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">No notifications</h3>
              <p className="text-muted-foreground text-sm">
                {filter === 'unread' ? "You're all caught up!" : 'No notifications to display'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group p-4 flex items-start gap-4 transition-all duration-200 hover:bg-muted/20 ${!notification.is_read ? 'bg-primary/5' : ''
                    }`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ring-1 ${getTypeColors(notification.type)}`}>
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={(e) => !notification.is_read && markAsRead(notification.id, e)}>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-medium text-sm leading-tight ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.is_read && (
                      <button
                        onClick={(e) => markAsRead(notification.id, e)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                        title="Mark as read"
                      >
                        <HiOutlineCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => deleteNotification(notification.id, e)}
                      disabled={deletingId === notification.id}
                      className="p-2 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === notification.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HiOutlineTrash className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Unread indicator */}
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
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

