'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Avatar } from '@/components/ui';
import { useClickOutside } from '@/hooks/useClickOutside';
import {
  HiOutlineMenu, HiOutlineSearch, HiOutlineBell, HiOutlineCog,
  HiOutlineUser, HiOutlineLogout, HiOutlineMoon, HiOutlineSun,
  HiOutlineChevronDown, HiOutlineClock
} from 'react-icons/hi';

function Header({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Derive isDarkMode boolean for logic
  const isDarkMode = theme === 'dark';

  // Memoize static notifications (in real app, this would come from props/context)
  const notifications = useMemo(() => [
    { id: 1, title: 'Leave Request Approved', time: '2 hours ago', unread: true },
    { id: 2, title: 'New Task Assigned', time: '5 hours ago', unread: true },
    { id: 3, title: 'Meeting Reminder', time: 'Yesterday', unread: false },
  ], []);

  // Memoize unread count calculation
  const unreadCount = useMemo(() =>
    notifications.filter(n => n.unread).length,
    [notifications]
  );

  // Memoize event handlers to prevent recreation
  const handleMenuToggle = useCallback(() => {
    if (onMenuToggle) onMenuToggle();
  }, [onMenuToggle]);

  const handleToggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
    setShowUserMenu(false);
  }, []);

  const handleToggleUserMenu = useCallback(() => {
    setShowUserMenu(prev => !prev);
    setShowNotifications(false);
  }, []);

  const handleCloseNotifications = useCallback(() => {
    setShowNotifications(false);
  }, []);

  const handleCloseUserMenu = useCallback(() => {
    setShowUserMenu(false);
  }, []);

  // Click-outside handlers
  const notificationsRef = useClickOutside(handleCloseNotifications);
  const userMenuRef = useClickOutside(handleCloseUserMenu);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-20 px-6 backdrop-blur-xl bg-background/80 border-b border-border/50 transition-all duration-300">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Toggle */}
        <button
          onClick={handleMenuToggle}
          className="md:hidden p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
          aria-label="Open navigation menu"
          aria-expanded="false"
        >
          <HiOutlineMenu className="w-6 h-6" />
        </button>

        {/* Search */}
        <div className="hidden sm:flex items-center gap-3 bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border/50 rounded-2xl px-4 py-2.5 flex-1 max-w-md transition-all duration-300 focus-within:bg-background focus-within:border-primary/30 focus-within:shadow-lg focus-within:shadow-primary/10 group">
          <HiOutlineSearch className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent border-none outline-none text-sm flex-1 placeholder-muted-foreground text-foreground"
          />
          <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted/50 border border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            ⌘ K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50/10 rounded-xl transition-all duration-200"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={handleToggleNotifications}
            className={`relative p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200 ${showNotifications ? 'text-primary bg-primary/10' : ''}`}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            aria-expanded={showNotifications}
            aria-haspopup="true"
          >
            <HiOutlineBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" aria-hidden="true" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-card rounded-2xl shadow-xl shadow-black/10 border border-border/50 overflow-hidden animation-fade-in-up z-50">
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <button className="text-xs font-medium text-primary hover:text-primary/80" aria-label="Mark all notifications as read">Mark all read</button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer border-b border-border/30 last:border-0 transition-colors ${notification.unread ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <p className="text-sm font-medium text-foreground leading-snug">{notification.title}</p>
                      {notification.unread && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5"></span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <HiOutlineClock className="w-3.5 h-3.5" />
                      {notification.time}
                    </p>
                  </div>
                ))}
              </div>
              <Link href="/notifications" className="block p-3 text-center text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors border-t border-border/30">
                View All Notifications
              </Link>
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-border/50 mx-1" />

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={handleToggleUserMenu}
            className={`flex items-center gap-3 p-1.5 pl-3 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted/50 transition-all duration-200 ${showUserMenu ? 'bg-muted/50 border-border/50' : ''}`}
            aria-label="Open user menu"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <div className={`hidden md:flex flex-col items-end mr-1 transition-opacity ${showUserMenu ? 'opacity-100' : 'opacity-80'}`}>
              <span className="text-sm font-bold text-foreground leading-none">{user?.first_name || 'User'} {user?.last_name || ''}</span>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">{user?.role?.name || 'Member'}</span>
            </div>
            <Avatar
              name={`${user?.first_name || 'User'} ${user?.last_name || ''}`}
              src={user?.avatar}
              size="sm"
              className="ring-2 ring-background shadow-lg"
            />
            <HiOutlineChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-200 hidden md:block ${showUserMenu ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden animate-scale-in z-50">
              {/* User Info Header */}
              <div className="p-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={`${user?.first_name || 'User'} ${user?.last_name || ''}`}
                    src={user?.avatar}
                    size="md"
                    className="ring-2 ring-primary/20 shadow-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{user?.first_name || 'User'} {user?.last_name || ''}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold text-primary bg-primary/10 rounded-full uppercase">{user?.role?.name || 'Member'}</span>
                  </div>
                </div>
              </div>

              <div className="p-2 space-y-0.5">
                <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors">
                  <HiOutlineUser className="w-4.5 h-4.5" />
                  My Profile
                </Link>
                <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors">
                  <HiOutlineCog className="w-4.5 h-4.5" />
                  Settings
                </Link>
              </div>
              <div className="h-px bg-border/50 mx-2" />
              <div className="p-2">
                <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors" aria-label="Sign out">
                  <HiOutlineLogout className="w-4.5 h-4.5" aria-hidden="true" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Wrap with memo to prevent unnecessary re-renders
export default memo(Header);
