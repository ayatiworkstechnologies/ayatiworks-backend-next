'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePermission } from '@/hooks/usePermission';
import { navigationContext, filterNavigationGroups } from '@/lib/navigationConfig';
import { Avatar } from '@/components/ui';
import {
  HiOutlineChevronLeft, HiOutlineChevronRight
} from 'react-icons/hi';

// Memoized MenuItem component to prevent unnecessary re-renders
const MenuItem = memo(({ item, pathname, collapsed, onMouseEnter, onMouseLeave }) => {
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const Icon = item.iconComponent; // Use pre-imported icon component from config

  return (
    <li
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        href={item.href}
        className={`
          relative flex items-center rounded-xl transition-all duration-300 group overflow-hidden
          ${collapsed ? 'justify-center p-3' : 'px-4 py-3 gap-3'}
          ${isActive
            ? 'bg-primary/10 text-primary shadow-inner'
            : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground'}

        `}
      >
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
        )}

        {Icon && <Icon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground group-hover:scale-105'}`} />}

        {!collapsed && (
          <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis flex-1 relative z-10">
            {item.title}
          </span>
        )}

        {item.badge && (
          collapsed ? (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900 animate-pulse" />
          ) : (
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${isActive ? 'bg-primary/20 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-transparent'}`}>
              {item.badge}
            </span>
          )
        )}
      </Link>
    </li>
  );
});

MenuItem.displayName = 'MenuItem';

function Sidebar({ collapsed, onToggle, className = '' }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { hasPermission, hasAnyPermission } = usePermission();
  const [hoveredItem, setHoveredItem] = useState(null);

  // Filter navigation groups based on user permissions
  const visibleItems = useMemo(() => {
    if (!user) return [];
    // Get user role logic here if needed, or pass user.role.name
    const userRole = user.role?.name;
    return filterNavigationGroups(navigationContext, hasPermission, hasAnyPermission, userRole);
  }, [user, hasPermission, hasAnyPermission]);

  // Memoize event handlers
  const handleMouseEnter = useCallback((e, label) => {
    if (!collapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredItem({ label, top: rect.top });
  }, [collapsed]);

  const handleMouseLeave = useCallback(() => {
    setHoveredItem(null);
  }, []);

  return (
    <aside
      className={`
        flex flex-col h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-white/20 dark:border-white/10 shadow-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] relative z-50
        ${className}
      `}
    >
      {/* 1. Header Section */}
      <div className="flex-shrink-0 h-20 flex items-center justify-center border-b border-border/40 relative z-10 px-3">
        <Link href="/dashboard" className={`flex items-center overflow-hidden w-full group ${collapsed ? 'justify-center' : 'px-4 gap-3'}`}>
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-300">
            <span className="font-bold text-lg font-heading">A</span>
          </div>
          <div className={`flex flex-col flex-1 transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 ml-1'}`}>
            <span className="font-bold text-foreground text-lg leading-tight font-heading">Ayatiworks</span>
            <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">Workspace</span>
          </div>
        </Link>
      </div>

      {/* 2. Scrollable Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-border/50 py-4 space-y-6">
        {visibleItems.map((group, index) => (
          <div key={group.group || index}>
            {/* Group Header */}
            {!collapsed && group.group && (
              <h3 className="px-7 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest opacity-80">
                {group.group}
              </h3>
            )}

            {/* Group Items */}
            <ul className="space-y-1 px-3">
              {group.items.map((item) => (
                <MenuItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  collapsed={collapsed}
                  onMouseEnter={(e) => handleMouseEnter(e, item.title)}
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Floating Tooltip Portal */}
      {hoveredItem && collapsed && (
        <div
          className="fixed left-[84px] z-[60] bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl animate-in fade-in slide-in-from-left-2 pointer-events-none"
          style={{ top: hoveredItem.top + 8 }}
        >
          {hoveredItem.label}
          {/* Arrow pointing left */}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}

      {/* 3. Footer Section - User Profile */}
      <div className="border-t border-border/40 p-3 bg-muted/20 z-10 backdrop-blur-md">
        <div className={`flex items-center gap-3 mb-2 rounded-xl transition-all hover:scale-[1.02] cursor-pointer ${collapsed ? 'p-2 justify-center' : 'px-4 py-3 bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 shadow-sm hover:border-primary/20 hover:shadow-md'}`}>
          <Avatar
            name={`${user?.first_name || 'User'} ${user?.last_name || ''}`}
            src={user?.avatar}
            size="sm"
            className="ring-2 ring-background shadow-lg"
          />

          {!collapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-bold text-foreground truncate">{user?.first_name || 'User'} {user?.last_name}</p>
              <p className="text-[10px] text-primary font-semibold uppercase tracking-wider truncate">{user?.role?.name || 'Member'}</p>
            </div>
          )}
        </div>

        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2.5 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all gap-2 group"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <HiOutlineChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" /> : <HiOutlineChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />}
          {!collapsed && <span className="text-xs font-bold uppercase tracking-wider">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

// Wrap with memo to prevent unnecessary re-renders
export default memo(Sidebar);
