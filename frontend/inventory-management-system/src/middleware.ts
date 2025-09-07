import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/contact',
  '/about',
  '/privacy',
  '/terms'
];

// Role-based route permissions
const ROUTE_PERMISSIONS: Record<string, string[]> = {

  '/dashboard': ['USER', 'Store Keeper', 'MANAGER', 'ADMIN', 'SUPPLIER'],
  '/dashboard/manager': ['MANAGER', 'ADMIN'],
  '/dashboard/supplier': ['SUPPLIER'],
  '/dashboard/storekeeper': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/profile': ['USER', 'Store Keeper', 'MANAGER', 'ADMIN', 'SUPPLIER'],
  '/access-denied': ['USER', 'Store Keeper', 'MANAGER', 'ADMIN', 'SUPPLIER'],

  '/products': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/products/add': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/categories': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/operations/suppliers': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/operations/inventory': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/operations/returns': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/analytics': ['MANAGER', 'ADMIN'],
  '/analytics/reports': ['MANAGER', 'ADMIN'],
  '/analytics/promotions': ['MANAGER', 'ADMIN'],
  '/logistics': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/logistics/shipping': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/logistics/payments': ['MANAGER', 'ADMIN'],
  '/sales/orders': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/sales/customers': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/sales/reviews': ['Store Keeper', 'MANAGER', 'ADMIN'],
  '/settings': ['ADMIN'],
};

// Helper function to check if user has required role
function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

// Helper function to find matching route permission
function findRoutePermission(pathname: string): string[] | null {
  // Find exact match first
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname];
  }
  
  // Find prefix match
  for (const route in ROUTE_PERMISSIONS) {
    if (pathname.startsWith(route)) {
      return ROUTE_PERMISSIONS[route];
    }
  }
  
  return null;
}

// Helper function to validate JWT token
function validateToken(token: string): { valid: boolean; role?: string; expired?: boolean } {
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
    
    // Debug: Log the payload to see what's in the token
    console.log('🔐 Middleware: JWT payload:', {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat
    });
    
    return { 
      valid: true, 
      role: payload.role || 'USER' 
    };
  } catch (error) {
    console.error('🔐 Middleware: Token validation error:', error);
    return { valid: false };
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('inventory_auth_token')?.value;
  console.log('🔐 Middleware: Processing request for', pathname, 'with token:', !!token);

  // If no token, redirect to login
  if (!token) {
    console.log('🔐 Middleware: No token found, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token
  const tokenValidation = validateToken(token);
  console.log('🔐 Middleware: Token validation result:', tokenValidation);
  
  if (!tokenValidation.valid) {
    console.log('🔐 Middleware: Token invalid, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    if (tokenValidation.expired) {
      loginUrl.searchParams.set('expired', 'true');
    }
    return NextResponse.redirect(loginUrl);
  }

  const userRole = tokenValidation.role!;
  console.log('🔐 Middleware: User role extracted:', userRole);

  // Check route permissions
  const requiredRoles = findRoutePermission(pathname);
  
  if (requiredRoles && !hasRequiredRole(userRole, requiredRoles)) {
    // User doesn't have permission for this route
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Add user info to headers for use in components
  const response = NextResponse.next();
  response.headers.set('X-User-Role', userRole);
  response.headers.set('X-User-Authenticated', 'true');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
