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
  CreditCard
} from 'lucide-react';
import type { ComponentType } from 'react';

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/products/add', label: 'Add Product', icon: PlusSquare },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/suppliers', label: 'Suppliers', icon: Factory },
  { href: '/inventory', label: 'Inventory', icon: Boxes },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/promotions', label: 'Promotions', icon: BadgePercent },
  { href: '/reviews', label: 'Reviews', icon: MessageSquare },
  { href: '/returns', label: 'Returns', icon: RotateCcw },
  { href: '/shipping', label: 'Shipping', icon: Truck },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];


