import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isPublicRoute,
  validateToken,
  findRoutePermission,
  hasRequiredRole,
  shouldSkipMiddleware,
} from './lib/utils/middleware';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and Next.js internals
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  // Check if it's a public route
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('inventory_auth_token')?.value;

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token
  const tokenValidation = validateToken(token);

  if (!tokenValidation.valid) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    if (tokenValidation.expired) {
      loginUrl.searchParams.set('expired', 'true');
    }
    return NextResponse.redirect(loginUrl);
  }

  const userRole = tokenValidation.role!;

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
