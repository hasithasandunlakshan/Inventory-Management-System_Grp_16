/**
 * Route Permissions Configuration
 * Defines which roles can access which routes
 */

/**
 * Role-based route permissions mapping
 * Key: Route path
 * Value: Array of roles allowed to access the route
 */
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Dashboard routes
  '/dashboard': ['USER', 'Store Keeper', 'MANAGER', 'ADMIN', 'SUPPLIER'],
  '/dashboard/manager': ['MANAGER', 'ADMIN'],
  '/dashboard/supplier': ['SUPPLIER'],
  '/dashboard/storekeeper': ['Store Keeper', 'MANAGER', 'ADMIN'],

  // User routes
  '/profile': ['USER', 'Store Keeper', 'MANAGER', 'ADMIN', 'SUPPLIER'],
  '/access-denied': ['USER', 'Store Keeper', 'MANAGER', 'ADMIN', 'SUPPLIER'],

  // Product management
  '/products': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/products/add': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/categories': ['Store Keeper', 'MANAGER', 'ADMIN'],

  // Operations
  '/operations/inventory': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/operations/returns': ['Store Keeper', 'MANAGER', 'ADMIN'],

  // Analytics
  '/analytics': ['MANAGER', 'ADMIN'],
  '/analytics/reports': ['MANAGER', 'ADMIN'],
  '/analytics/promotions': ['MANAGER', 'ADMIN'],

  // Logistics
  '/logistics': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/logistics/shipping': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/logistics/payments': ['MANAGER', 'ADMIN'],

  // Sales
  '/sales/orders': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/sales/customers': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/sales/reviews': ['Store Keeper', 'MANAGER', 'ADMIN'],

  // Settings
  '/settings': ['ADMIN'],
};

/**
 * Find matching route permission for a given pathname
 * Checks for exact match first, then prefix match
 * @param pathname - Request pathname
 * @returns Array of required roles or null if no permission defined
 */
export function findRoutePermission(pathname: string): string[] | null {
  // Find exact match first
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname];
  }

  // Find prefix match (for nested routes)
  for (const route in ROUTE_PERMISSIONS) {
    if (pathname.startsWith(route)) {
      return ROUTE_PERMISSIONS[route];
    }
  }

  return null;
}
