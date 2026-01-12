/**
 * Route Configuration
 *
 * Centralized route definitions with navigation metadata.
 */

import {
  Camera,
  Briefcase,
  Lightbulb,
  Palette,
  Music,
  Settings,
  User,
  type LucideIcon
} from 'lucide-react';

export interface NavItem {
  /** Unique identifier */
  id: string;
  /** Route path */
  path: string;
  /** Full label for desktop */
  label: string;
  /** Short label for mobile (optional) */
  shortLabel?: string;
  /** Icon component */
  icon: LucideIcon;
  /** Notification badge (number or dot indicator) */
  badge?: number | 'dot';
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Tooltip text (shown on hover, especially for disabled items) */
  tooltip?: string;
  /** Requires wallet connection */
  requiredAuth?: boolean;
  /** Nested child routes (not shown in main nav) */
  children?: Omit<NavItem, 'children'>[];
}

/**
 * Main navigation items
 */
export const NAV_ITEMS: NavItem[] = [
  {
    id: 'gallery',
    path: '/gallery',
    label: 'Gallery',
    shortLabel: 'Gallery',
    icon: Camera,
    children: [
      { id: 'gallery-all', path: '/gallery', label: 'All NFTs', icon: Camera },
      { id: 'gallery-favorites', path: '/gallery/favorites', label: 'Favorites', icon: Camera },
      { id: 'gallery-nft', path: '/gallery/:nftId', label: 'NFT Detail', icon: Camera },
    ]
  },
  {
    id: 'generator',
    path: '/generator',
    label: 'Generator',
    shortLabel: 'Gen',
    icon: Palette,
  },
  {
    id: 'bigpulp',
    path: '/bigpulp',
    label: 'BigPulp',
    shortLabel: 'BigPulp',
    icon: Lightbulb,
  },
  {
    id: 'treasury',
    path: '/treasury',
    label: 'Treasury',
    shortLabel: 'Treasury',
    icon: Briefcase,
    requiredAuth: true,
  },
  {
    id: 'media',
    path: '/media',
    label: 'Media Hub',
    shortLabel: 'Media',
    icon: Music,
  },
  {
    id: 'settings',
    path: '/settings',
    label: 'Settings',
    shortLabel: 'More',
    icon: Settings,
    children: [
      { id: 'settings-profile', path: '/settings/profile', label: 'Profile', icon: Settings },
      { id: 'settings-theme', path: '/settings/theme', label: 'Theme', icon: Settings },
      { id: 'settings-about', path: '/settings/about', label: 'About', icon: Settings },
    ]
  },
  {
    id: 'account',
    path: '/account',
    label: 'Account',
    shortLabel: 'Account',
    icon: User,
    disabled: true,
    tooltip: 'Soon',
  },
];

/**
 * Default route to redirect to
 */
export const DEFAULT_ROUTE = '/gallery';

/**
 * Get nav item by path
 */
export function getNavItemByPath(path: string): NavItem | undefined {
  return NAV_ITEMS.find(item => {
    if (item.path === path) return true;
    // Check if path starts with item path (for nested routes)
    return path.startsWith(item.path + '/');
  });
}

/**
 * Get nav item by ID
 */
export function getNavItemById(id: string): NavItem | undefined {
  return NAV_ITEMS.find(item => item.id === id);
}

/**
 * Check if a path matches a nav item (including children)
 */
export function isPathActive(itemPath: string, currentPath: string): boolean {
  if (itemPath === currentPath) return true;
  // For index routes, exact match only
  if (itemPath === '/') return currentPath === '/';
  // Check if current path is a child of the item path
  return currentPath.startsWith(itemPath + '/') || currentPath === itemPath;
}
