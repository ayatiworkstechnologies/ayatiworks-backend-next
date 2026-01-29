import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineClock,
  HiOutlineClipboardList,
  HiOutlineFolder,
  HiOutlineCalendar,
  HiOutlineClipboardCheck,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineCollection,
  HiOutlineBadgeCheck,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineShieldCheck,
  HiOutlineBell,
} from 'react-icons/hi';

/**
 * Navigation configuration with grouped structure
 */

export const navigationContext = [
  {
    group: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        iconComponent: HiOutlineHome,
        permission: 'dashboard.view',
      },
      {
        title: 'Notifications',
        href: '/notifications',
        iconComponent: HiOutlineBell,
      },
    ]
  },
  {
    group: 'Recruitment',
    items: [
      {
        title: 'Applications',
        href: '/applications',
        iconComponent: HiOutlineBriefcase,
        anyRole: ['Super Admin', 'Admin', 'HR', 'Manager'],
      },
      {
        title: 'Enquiries',
        href: '/enquiries',
        iconComponent: HiOutlineClipboardList,
        anyRole: ['Super Admin', 'Admin', 'HR', 'Manager'],
      },
    ]
  },
  {
    group: 'HR Management',
    items: [
      {
        title: 'Employees',
        href: '/employees',
        iconComponent: HiOutlineUsers,
        permission: 'employee.view_all',
      },
      {
        title: 'Attendance',
        href: '/attendance',
        iconComponent: HiOutlineClock,
        anyPermission: ['attendance.view', 'attendance.view_all'],
      },
      {
        title: 'Leaves',
        href: '/leaves',
        iconComponent: HiOutlineCalendar,
        anyPermission: ['leave.view', 'leave.view_all'],
      },
    ]
  },
  {
    group: 'Work Management',
    items: [
      {
        title: 'Projects',
        href: '/projects',
        iconComponent: HiOutlineFolder,
        anyPermission: ['project.view', 'project.view_all'],
      },
      {
        title: 'Tasks',
        href: '/tasks',
        iconComponent: HiOutlineClipboardList,
        anyPermission: ['task.view', 'task.view_all'],
      },
    ]
  },
  {
    group: 'Finance',
    items: [
      {
        title: 'Clients',
        href: '/clients',
        iconComponent: HiOutlineBriefcase,
        anyPermission: ['client.view', 'client.view_own'],
      },
    ]
  },
  {
    group: 'Organization',
    items: [
      {
        title: 'Users',
        href: '/users',
        iconComponent: HiOutlineUserGroup,
        permission: 'user.view',
      },
      {
        title: 'Companies',
        href: '/companies',
        iconComponent: HiOutlineOfficeBuilding,
        permission: 'company.view',
      },
      {
        title: 'Branches',
        href: '/branches',
        iconComponent: HiOutlineLocationMarker,
        permission: 'branch.view',
      },
      {
        title: 'Departments',
        href: '/departments',
        iconComponent: HiOutlineCollection,
        permission: 'department.view',
      },
      {
        title: 'Designations',
        href: '/designations',
        iconComponent: HiOutlineBadgeCheck,
        permission: 'designation.view',
      },
      {
        title: 'Teams',
        href: '/teams',
        iconComponent: HiOutlineUserGroup,
        permission: 'team.view',
      },
    ]
  },
  {
    group: 'System',
    items: [
      {
        title: 'Roles & Perms',
        href: '/roles',
        iconComponent: HiOutlineShieldCheck,
        permission: 'role.view',
      },
      {
        title: 'Settings',
        href: '/settings',
        iconComponent: HiOutlineCog,
        permission: 'settings.view',
      },
    ]
  }
];

// Ensure backward compatibility if needed, though we should update usage
export const navigationItems = navigationContext.flatMap(group => group.items);

/**
 * Filter navigation groups based on user permissions and roles
 */
export function filterNavigationGroups(groups, hasPermission, hasAnyPermission, userRole = null) {
  return groups.map(group => {
    const filteredItems = group.items.filter(item => {
      // Role-based check
      if (item.anyRole) {
        if (!userRole) return false;
        return item.anyRole.map(r => r.toLowerCase()).includes(userRole.toLowerCase());
      }

      // No permission required
      if (!item.permission && !item.anyPermission) return true;

      // Single permission
      if (item.permission && hasPermission(item.permission)) return true;

      // Any permission
      if (item.anyPermission && hasAnyPermission(item.anyPermission)) return true;

      return false;
    });

    return {
      ...group,
      items: filteredItems
    };
  }).filter(group => group.items.length > 0);
}
