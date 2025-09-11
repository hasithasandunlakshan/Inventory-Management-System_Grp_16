import { 
  Home, 
  Users, 
  Package, 
  BarChart3, 
  Settings, 
  Truck, 
  ShoppingCart,
  FileText,
  Shield,
  UserCheck
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: any;
  roles: string[];
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["USER", "Store Keeper", "MANAGER", "ADMIN", "SUPPLIER"],
  },
  {
    label: "Products",
    href: "/products",
    icon: Package,
    roles: ["Store Keeper", "MANAGER", "ADMIN"],
    children: [
      {
        label: "All Products",
        href: "/products",
        icon: Package,
        roles: ["Store Keeper", "MANAGER", "ADMIN"],
      },
      {
        label: "Add Product",
        href: "/products/add",
        icon: Package,
        roles: ["Store Keeper", "MANAGER", "ADMIN"],
      },
      {
        label: "Categories",
        href: "/categories",
        icon: Package,
        roles: ["Store Keeper", "MANAGER", "ADMIN"],
      },
    ],
  },
  {
    label: "Operations",
    href: "/operations",
    icon: Truck,
    roles: ["Store Keeper", "MANAGER", "ADMIN"],
    children: [
      {
        label: "Suppliers",
        href: "/operations/suppliers",
        icon: Users,
        roles: ["Store Keeper", "MANAGER", "ADMIN"],
      },
      {
        label: "Inventory",
        href: "/operations/inventory",
        icon: Package,
        roles: ["Store Keeper", "MANAGER", "ADMIN"],
      },
      {
        label: "Returns",
        href: "/operations/returns",
        icon: Truck,
        roles: ["Store Keeper", "MANAGER", "ADMIN"],
      },
    ],
  },
  {
    label: "Sales",
    href: "/sales",
    icon: ShoppingCart,
    roles: ["Store Keeper", "MANAGER", "ADMIN"],
    children: [
      {
        label: "Orders",
        href: "/sales/orders",
        icon: ShoppingCart,
        roles: ["Store Keeper", "MANAGER", "ADMIN"],
      },
      {
        label: "Customers",
        href: "/sales/customers",
        icon: Users,
        roles: ["Store Keeper", "MANAGER", "ADMIN"],
      },
      {
        label: "Reviews",
        href: "/sales/reviews",
        icon: FileText,
        roles: ["Store Keeper", "MANAGER", "ADMIN"],
      },
    ],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    roles: ["MANAGER", "ADMIN"],
    children: [
      {
        label: "Reports",
        href: "/analytics/reports",
        icon: BarChart3,
        roles: ["MANAGER", "ADMIN"],
      },
      {
        label: "Promotions",
        href: "/analytics/promotions",
        icon: BarChart3,
        roles: ["MANAGER", "ADMIN"],
      },
    ],
  },
  {
    label: "Logistics",
    href: "/logistics",
    icon: Truck,
    roles: ["Store Keeper", "MANAGER", "ADMIN"],
    children: [
      {
        label: "Shipping",
        href: "/logistics/shipping",
        icon: Truck,
        roles: ["Store Keeper", "MANAGER", "ADMIN"],
      },
      {
        label: "Payments",
        href: "/logistics/payments",
        icon: FileText,
        roles: ["MANAGER", "ADMIN"],
      },
    ],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["ADMIN"],
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
    )
  }));
}

export function canAccessRoute(route: string, role: string): boolean {
  const normalizedRole = role.toUpperCase();
  
  // Check direct route access
  const directAccess = NAV_ITEMS.some(item => 
    item.href === route && item.roles.some(r => r.toUpperCase() === normalizedRole)
  );
  
  if (directAccess) return true;
  
  // Check child route access
  return NAV_ITEMS.some(item => 
    item.children?.some(child => 
      child.href === route && child.roles.some(r => r.toUpperCase() === normalizedRole)
    )
  );
}
