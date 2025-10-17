/**
 * Middleware Utility Functions
 * Helper functions for authentication, authorization, and route protection
 */

/**
 * Validate JWT token structure and expiration
 * @param token - JWT token string
 * @returns Validation result with role and expiration status
 */
export function validateToken(token: string): {
  valid: boolean;
  role?: string;
  expired?: boolean;
} {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false };
    }

    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      return { valid: false, expired: true };
    }

    return {
      valid: true,
      role: payload.role || 'USER',
    };
  } catch {
    return { valid: false };
  }
}

/**
 * Check if user has the required role for a route
 * @param userRole - User's current role
 * @param requiredRoles - Array of roles allowed for the route
 * @returns True if user has permission, false otherwise
 */
export function hasRequiredRole(
  userRole: string,
  requiredRoles: string[]
): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Check if a pathname is a public route that doesn't require authentication
 * @param pathname - Request pathname
 * @returns True if route is public, false otherwise
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/contact',
    '/about',
    '/privacy',
    '/terms',
  ];

  return publicRoutes.some(route => pathname.startsWith(route));
}

/**
 * Check if the request should skip middleware processing
 * @param pathname - Request pathname
 * @returns True if middleware should be skipped, false otherwise
 */
export function shouldSkipMiddleware(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  );
}
