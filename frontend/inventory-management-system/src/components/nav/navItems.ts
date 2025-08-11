import {
  LayoutDashboard,
  Package,
  PlusSquare,
  Tag,
  ShoppingCart,
  Users,
  Factory,
  Boxes,
  BarChart3,
  BadgePercent,
  MessageSquare,
  Settings,
  RotateCcw,
  Truck,
  CreditCard,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import type { ComponentType } from 'react';

export type NavItem = {
  href?: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  children?: NavItem[];
};

export const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    label: 'Products',
    icon: Package,
    children: [
      { href: '/products', label: 'All Products', icon: Package },
      { href: '/products/add', label: 'Add Product', icon: PlusSquare },
    ]
  },
  { href: '/categories', label: 'Categories', icon: Tag },
  {
    label: 'Sales',
    icon: ShoppingCart,
    children: [
      { href: '/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/customers', label: 'Customers', icon: Users },
      { href: '/reviews', label: 'Reviews', icon: MessageSquare },
    ]
  },
  {
    label: 'Operations',
    icon: Factory,
    children: [
      { href: '/suppliers', label: 'Suppliers', icon: Factory },
      { href: '/inventory', label: 'Inventory', icon: Boxes },
      { href: '/returns', label: 'Returns', icon: RotateCcw },
    ]
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    children: [
      { href: '/reports', label: 'Reports', icon: BarChart3 },
      { href: '/promotions', label: 'Promotions', icon: BadgePercent },
    ]
  },
  {
    label: 'Shipping & Payments',
    icon: Truck,
    children: [
      { href: '/shipping', label: 'Shipping', icon: Truck },
      { href: '/payments', label: 'Payments', icon: CreditCard },
    ]
  },
  { href: '/settings', label: 'Settings', icon: Settings },
];


