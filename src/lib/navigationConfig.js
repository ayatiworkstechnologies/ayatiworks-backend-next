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
  HiOutlineDocumentText,
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
        title: 'My Profile',
        href: '/profile',
        iconComponent: HiOutlineUsers,
        permission: 'employee.view',
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
        anyRole: ['Super Admin', 'Admin', 'HR Manager', 'Manager'],
      },
      {
        title: 'Enquiries',
        href: '/enquiries',
        iconComponent: HiOutlineClipboardList,
        anyRole: ['Super Admin', 'Admin', 'HR Manager', 'Manager'],
      },
    ]
  },
  {
    group: 'Content',
    items: [
      {
        title: 'Blogs',
        href: '/blogs',
        iconComponent: HiOutlineDocumentText,
        anyRole: ['Super Admin', 'Admin', 'Manager'],
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
        title: 'Shifts',
        href: '/shifts',
        iconComponent: HiOutlineClock,
        permission: 'shift.view',
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
        anyPermission: ['project.view', 'project.view_all', 'project.view_own'],
      },
      {
        title: 'Tasks',
        href: '/tasks',
        iconComponent: HiOutlineClipboardList,
        anyPermission: ['task.view', 'task.view_all'],
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
    group: 'CRM',
    items: [
      {
        title: 'Clients',
        href: '/clients',
        iconComponent: HiOutlineBriefcase,
        anyPermission: ['client.view', 'client.view_own'],
      },
      {
        title: 'Leads',
        href: '/leads',
        iconComponent: HiOutlineUserGroup,
        permission: 'lead.view',
      },
      {
        title: 'Meta Ads',
        href: '/meta-ads',
        iconComponent: HiOutlineChartBar,
        permission: 'meta.view',
      },
    ]
  },
  {
    group: 'Finance',
    items: [
      {
        title: 'Payroll',
        href: '/payroll',
        iconComponent: HiOutlineCurrencyDollar,
        anyPermission: ['payroll.view', 'payroll.view_all'],
      },
      {
        title: 'Invoices',
        href: '/invoices',
        iconComponent: HiOutlineCurrencyDollar,
        anyPermission: ['invoice.view', 'invoice.view_own'],
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
