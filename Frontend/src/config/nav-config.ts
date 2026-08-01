import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Executive',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        shortcut: ['d', 'd'],
        items: []
      },
    ]
  },
  {
    label: 'CRM',
    items: [
      {
        title: 'Customers',
        url: '/dashboard/customers',
        icon: 'teams',
        shortcut: ['c', 'c'],
        items: []
      },
      {
        title: 'Customer Groups',
        url: '/admin/customers',
        icon: 'teams',
        items: []
      },
      {
        title: 'Workspaces',
        url: '/dashboard/workspaces',
        icon: 'workspace',
        items: []
      },
      {
        title: 'Users',
        url: '/dashboard/users',
        icon: 'user',
        shortcut: ['u', 'u'],
        items: []
      },
    ]
  },
  {
    label: 'Billing',
    items: [
      {
        title: 'Invoices',
        url: '/dashboard/invoices',
        icon: 'billing',
        items: []
      },
      {
        title: 'Payments',
        url: '/dashboard/billing',
        icon: 'creditCard',
        items: []
      },
      {
        title: 'Tariffs',
        url: '/admin/tariffs',
        icon: 'adjustments',
        items: []
      },
    ]
  },
  {
    label: 'Meters',
    items: [
      {
        title: 'Meters',
        url: '/dashboard/meters',
        icon: 'code',
        items: []
      },
      {
        title: 'Meter Types',
        url: '/admin/meter-settings',
        icon: 'fileTypeDoc',
        items: []
      },
    ]
  },
  {
    label: 'Readings',
    items: [
      {
        title: 'Readings',
        url: '/dashboard/readings',
        icon: 'trendingDown',
        items: []
      },
      {
        title: 'Manual Reading',
        url: '/admin/readings',
        icon: 'edit',
        items: []
      },
    ]
  },
  {
    label: 'Operations',
    items: [
      {
        title: 'Operations',
        url: '/admin/operations',
        icon: 'settings',
        items: []
      },
      {
        title: 'Work Orders',
        url: '/admin/tasks',
        icon: 'clipboard',
        items: []
      },
    ]
  },
  {
    label: 'Reports',
    items: [
      {
        title: 'Reports',
        url: '/admin/reports',
        icon: 'fileTypePdf',
        items: []
      },
      {
        title: 'Financial Reports',
        url: '/admin/reporting',
        icon: 'trendingUp',
        items: []
      },
      {
        title: 'Consumption Reports',
        url: '/admin/reporting',
        icon: 'chart',
        items: []
      },
    ]
  },
  {
    label: 'Monitoring',
    items: [
      {
        title: 'Monitoring',
        url: '/admin/monitoring',
        icon: 'monitor',
        items: []
      },
      {
        title: 'Alerts',
        url: '/admin/alerts',
        icon: 'bell',
        items: []
      },
    ]
  },
  {
    label: 'Account',
    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'profile',
        shortcut: ['m', 'm'],
        items: []
      },
      {
        title: 'Notifications',
        url: '/dashboard/notifications',
        icon: 'notification',
        shortcut: ['n', 'n'],
        items: []
      },
      {
        title: 'Settings',
        url: '/dashboard/settings',
        icon: 'settings',
        items: []
      },
    ]
  },
  {
    label: 'Starter (preserved)',
    items: [
      {
        title: 'Kanban',
        url: '/dashboard/kanban',
        icon: 'kanban',
        shortcut: ['k', 'k'],
        items: []
      },
      {
        title: 'Chat',
        url: '/dashboard/chat',
        icon: 'chat',
        shortcut: ['c', 'c'],
        items: []
      },
      {
        title: 'Product',
        url: '/dashboard/product',
        icon: 'product',
        shortcut: ['p', 'p'],
        items: []
      },
      {
        title: 'Exclusive',
        url: '/dashboard/exclusive',
        icon: 'exclusive',
        shortcut: ['e', 'e'],
        items: []
      },
      {
        title: 'Forms',
        url: '#',
        icon: 'forms',
        items: [
          { title: 'Basic Form', url: '/dashboard/forms/basic', icon: 'forms', shortcut: ['f', 'f'] },
          { title: 'Multi-Step Form', url: '/dashboard/forms/multi-step', icon: 'forms' },
          { title: 'Sheet & Dialog', url: '/dashboard/forms/sheet-form', icon: 'forms' },
          { title: 'Advanced Patterns', url: '/dashboard/forms/advanced', icon: 'forms' },
        ]
      },
      {
        title: 'React Query',
        url: '/dashboard/react-query',
        icon: 'code',
        items: []
      },
      {
        title: 'Icons',
        url: '/dashboard/elements/icons',
        icon: 'palette',
        items: []
      },
    ]
  }
];


