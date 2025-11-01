import { NavItem } from '@/types';

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Collections',
    url: '/dashboard/bidding',
    icon: 'bidding',
    isActive: false,
    shortcut: ['c', 'c'],
    items: [] // Empty array as there are no child items
  },
  {
    title: 'Account',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'billing',
    isActive: true,

    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'Billing',
        url: '/dashboard/billing',
        icon: 'billing',
        shortcut: ['b', 'b']
      }
    ]
  }
];
