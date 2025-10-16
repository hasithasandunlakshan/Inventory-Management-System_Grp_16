import {
  BarChart3,
  Car,
  FileText,
  Home,
  Package,
  Route,
  Settings,
  ShoppingCart,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
  Brain,
  FileImage,
  Search,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['USER', 'Store Keeper', 'MANAGER', 'ADMIN', 'SUPPLIER'],
  },
  {
    label: 'Products',
    href: '/products',
    icon: Package,
    roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
    children: [
      {
        label: 'All Products',
        href: '/products',
        icon: Package,
        roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
      },
      {
        label: 'Add Product',
        href: '/products/add',
        icon: Package,
        roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
      },
      {
        label: 'Categories',
        href: '/categories',
        icon: Package,
        roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'Suppliers',
    href: '/suppliers',
    icon: Users,
    roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
    children: [
      {
        label: 'Purchase Orders',
        href: '/suppliers/purchase-orders',
        icon: Package,
        roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
      },
      {
        label: 'Suppliers',
        href: '/suppliers/suppliers',
        icon: Users,
        roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
      },
      {
        label: 'Delivery Logs',
        href: '/suppliers/delivery-logs',
        icon: Truck,
        roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
      },
      {
        label: 'Analytics',
        href: '/suppliers/analytics',
        icon: BarChart3,
        roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'Operations',
    href: '/operations',
    icon: Truck,
    roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
    children: [
      {
        label: 'Inventory',
        href: '/operations/inventory',
        icon: Package,
        roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
      },
      {
        label: 'Sale Forecast',
        href: '/operations/sale-forecast',
        icon: TrendingUp,
        roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
      },
      {
        label: 'Returns',
        href: '/operations/returns',
        icon: Truck,
        roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'Sales',
    href: '/sales',
    icon: ShoppingCart,
    roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
    children: [
      {
        label: 'Orders',
        href: '/sales/orders',
        icon: ShoppingCart,
        roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
      },
      {
        label: 'Customers',
        href: '/sales/customers',
        icon: Users,
        roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
      },
      {
        label: 'Reviews',
        href: '/sales/reviews',
        icon: FileText,
        roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['MANAGER', 'ADMIN'],
    children: [
      {
        label: 'Inventory Report',
        href: '/analytics/reports/inventory',
        icon: Package,
        roles: ['MANAGER', 'ADMIN'],
      },
      {
        label: 'Sales Report',
        href: '/analytics/reports/sales',
        icon: TrendingUp,
        roles: ['MANAGER', 'ADMIN'],
      },
      {
        label: 'Orders Report',
        href: '/analytics/reports/orders',
        icon: ShoppingCart,
        roles: ['MANAGER', 'ADMIN'],
      },
      {
        label: 'Logistics Report',
        href: '/analytics/reports/logistics',
        icon: Truck,
        roles: ['MANAGER', 'ADMIN'],
      },
      {
        label: 'Financial Report',
        href: '/analytics/reports/financial',
        icon: BarChart3,
        roles: ['MANAGER', 'ADMIN'],
      },
      {
        label: 'Cost Analysis',
        href: '/analytics/reports/cost-analysis',
        icon: Package,
        roles: ['MANAGER', 'ADMIN'],
      },
      {
        label: 'Profitability Report',
        href: '/analytics/reports/profitability',
        icon: TrendingUp,
        roles: ['MANAGER', 'ADMIN'],
      },
      {
        label: 'Operational Costs',
        href: '/analytics/reports/operational-costs',
        icon: Truck,
        roles: ['MANAGER', 'ADMIN'],
      },
      {
        label: 'Supplier Report',
        href: '/analytics/reports/supplier',
        icon: Users,
        roles: ['MANAGER', 'ADMIN'],
      },
      {
        label: 'Promotions',
        href: '/analytics/promotions',
        icon: BarChart3,
        roles: ['MANAGER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'Logistics',
    href: '/logistics',
    icon: Truck,
    roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
    children: [
      {
        label: 'Shipping',
        href: '/logistics/shipping',
        icon: Truck,
        roles: ['Store Keeper', 'MANAGER', 'ADMIN'],
      },
      {
        label: 'Payments',
        href: '/logistics/payments',
        icon: FileText,
        roles: ['MANAGER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'Driver Management',
    href: '/drivers',
    icon: UserCheck,
    roles: ['MANAGER', 'ADMIN', 'DRIVER'],
    children: [
      {
        label: 'Drivers',
        href: '/drivers',
        icon: UserCheck,
        roles: ['MANAGER', 'ADMIN', 'DRIVER'],
      },
      {
        label: 'Vehicles',
        href: '/vehicles',
        icon: Car,
        roles: ['MANAGER', 'ADMIN', 'DRIVER'],
      },
      {
        label: 'Assignments',
        href: '/assignments',
        icon: Route,
        roles: ['MANAGER', 'ADMIN', 'DRIVER'],
      },
    ],
  },
  {
    label: 'ML Services',
    href: '/ml-services',
    icon: Brain,
    roles: ['MANAGER', 'ADMIN'],
    children: [
      {
        label: 'Document Intelligence',
        href: '/ml-services/document-intelligence',
        icon: FileImage,
        roles: ['MANAGER', 'ADMIN'],
      },
      {
        label: 'AI Search',
        href: '/ml-services/ai-search',
        icon: Search,
        roles: ['MANAGER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['ADMIN'],
  },
];

export function getNavItemsForRole(role: string): NavItem[] {
  const normalizedRole = role.toUpperCase();

  return NAV_ITEMS.filter(item =>
    item.roles.some(r => r.toUpperCase() === normalizedRole)
  ).map(item => ({
    ...item,
    children: item.children?.filter(child =>
      child.roles.some(r => r.toUpperCase() === normalizedRole)
    ),
  }));
}

export function canAccessRoute(route: string, role: string): boolean {
  const normalizedRole = role.toUpperCase();

  // Check direct route access
  const directAccess = NAV_ITEMS.some(
    item =>
      item.href === route &&
      item.roles.some(r => r.toUpperCase() === normalizedRole)
  );

  if (directAccess) return true;

  // Check child route access
  return NAV_ITEMS.some(item =>
    item.children?.some(
      child =>
        child.href === route &&
        child.roles.some(r => r.toUpperCase() === normalizedRole)
    )
  );
}
