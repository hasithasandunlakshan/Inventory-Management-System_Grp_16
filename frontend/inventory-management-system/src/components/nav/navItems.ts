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
      { href: '/sales/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/sales/customers', label: 'Customers', icon: Users },
      { href: '/sales/reviews', label: 'Reviews', icon: MessageSquare },
    ]
  },
  {
    label: 'Operations',
    icon: Factory,
    children: [
      { href: '/operations/suppliers', label: 'Suppliers', icon: Factory },
      { href: '/operations/inventory', label: 'Inventory', icon: Boxes },
      { href: '/operations/returns', label: 'Returns', icon: RotateCcw },
    ]
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    children: [
      { href: '/analytics/reports', label: 'Reports', icon: BarChart3 },
      { href: '/analytics/promotions', label: 'Promotions', icon: BadgePercent },
    ]
  },
  {
    label: 'Logistics',
    icon: Truck,
    children: [
      { href: '/logistics/shipping', label: 'Shipping', icon: Truck },
      { href: '/logistics/payments', label: 'Payments', icon: CreditCard },
    ]
  },
  { href: '/settings', label: 'Settings', icon: Settings },
];


