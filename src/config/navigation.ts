import { workspaceRoutes } from '@/config/routes';
import { ElementType } from 'react';
import {
  Home,
  List,
  Car,
  Users,
  Tag,
  Wrench,
  ShoppingCart,
  Truck,
  Zap,
  MapPin,
  Megaphone,
  Leaf,
  User,
  Activity,
  Percent,
  Bell,
  Settings,
  FileText,
  CreditCard,
  PiggyBank,
} from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  /** User must have this permission. */
  permission?: string;
  /** User must have at least one of these permissions. */
  permissions?: string[];
  /** Only visible to super admin (`*` permission). */
  superAdminOnly?: boolean;
  /** Optional icon component to display in sidebars. */
  icon?: ElementType;
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

export type MarketingFooterColumn = {
  title: string;
  links: NavItem[];
};

/** @deprecated Use buildMarketingNav() with categories from GET /categories */
export const marketingNav: NavItem[] = [
  { label: 'Vehicles', href: '/vehicles' },
  { label: 'Spare Parts', href: '/spare-parts' },
  { label: 'For Business', href: '/for-business' },
  { label: 'About UZA Mobility', href: '/about' },
];

/** @deprecated Use buildMarketingFooterColumns() with categories from GET /categories */
export const marketingFooterNav: NavItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Pricing', href: '/for-business' },
];

export const accountNav: NavItem[] = [
  { label: 'Overview', href: workspaceRoutes.account, icon: Home },
  { label: 'Orders', href: workspaceRoutes.accountOrders, icon: ShoppingCart },
  {
    label: 'Invoices',
    href: workspaceRoutes.accountInvoices,
    icon: FileText,
  },
  {
    label: 'Payments',
    href: workspaceRoutes.accountPayments,
    icon: CreditCard,
  },
  {
    label: 'Bookings',
    href: workspaceRoutes.accountBookings,
    icon: Car,
  },
  {
    label: 'Financing',
    href: workspaceRoutes.accountFinancing,
    icon: Percent,
  },
  {
    label: 'Igikapu · Wallet',
    href: workspaceRoutes.accountWallet,
    icon: PiggyBank,
  },
  { label: 'Profile', href: workspaceRoutes.accountProfile, icon: User },
  {
    label: 'Notifications',
    href: workspaceRoutes.accountNotifications,
    icon: Bell,
  },
];

export const buyerNavGroups: NavGroup[] = [
  {
    items: [{ label: 'Overview', href: workspaceRoutes.account, icon: Home }],
  },
  {
    label: 'Purchases',
    items: [
      {
        label: 'Orders',
        href: workspaceRoutes.accountOrders,
        icon: ShoppingCart,
      },
      {
        label: 'Invoices',
        href: workspaceRoutes.accountInvoices,
        icon: FileText,
      },
      {
        label: 'Payments',
        href: workspaceRoutes.accountPayments,
        icon: CreditCard,
      },
      {
        label: 'Bookings',
        href: workspaceRoutes.accountBookings,
        icon: Car,
      },
      {
        label: 'Financing',
        href: workspaceRoutes.accountFinancing,
        icon: Percent,
      },
      {
        label: 'Igikapu · Wallet',
        href: workspaceRoutes.accountWallet,
        icon: PiggyBank,
      },
      {
        label: 'Wishlist',
        href: workspaceRoutes.accountWishlist,
        icon: Tag,
      },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile', href: workspaceRoutes.accountProfile, icon: User },
      {
        label: 'Notifications',
        href: workspaceRoutes.accountNotifications,
        icon: Bell,
      },
    ],
  },
];

export const sellerNav: NavItem[] = [
  { label: 'Overview', href: workspaceRoutes.seller, icon: Home },
  { label: 'Listings', href: workspaceRoutes.sellerListings, icon: List },
  { label: 'Parts', href: workspaceRoutes.sellerParts, icon: Wrench },
  { label: 'Profile', href: workspaceRoutes.sellerProfile, icon: User },
];

/** Seller sidebar — same structure as admin nav groups. */
export const sellerNavGroups: NavGroup[] = [
  {
    items: [{ label: 'Overview', href: workspaceRoutes.seller, icon: Home }],
  },
  {
    label: 'Marketplace',
    items: [
      { label: 'Listings', href: workspaceRoutes.sellerListings, icon: List },
      { label: 'Parts', href: workspaceRoutes.sellerParts, icon: Wrench },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile', href: workspaceRoutes.sellerProfile, icon: User },
      {
        label: 'Notifications',
        href: workspaceRoutes.sellerNotifications,
        icon: Bell,
      },
    ],
  },
  {
    label: 'Buying',
    items: [
      {
        label: 'Buyer workspace',
        href: workspaceRoutes.account,
        icon: ShoppingCart,
      },
    ],
  },
  {
    label: 'Charging',
    items: [
      {
        label: 'Operator workspace',
        href: workspaceRoutes.operator,
        icon: Zap,
      },
    ],
  },
];

export const operatorNavGroups: NavGroup[] = [
  {
    items: [{ label: 'Overview', href: workspaceRoutes.operator, icon: Home }],
  },
  {
    label: 'Stations',
    items: [
      {
        label: 'My stations',
        href: workspaceRoutes.operatorStations,
        icon: MapPin,
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        label: 'Operator profile',
        href: workspaceRoutes.operatorProfile,
        icon: User,
      },
      {
        label: 'Notifications',
        href: workspaceRoutes.operatorNotifications,
        icon: Bell,
      },
    ],
  },
];
