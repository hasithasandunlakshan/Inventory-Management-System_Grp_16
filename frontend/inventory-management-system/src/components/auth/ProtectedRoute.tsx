'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  readonly children: React.ReactNode;
  readonly requiredRoles?: string[];
  readonly fallback?: React.ReactNode;
  readonly redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  fallback,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.push(redirectTo);
      return;
    }

    // Check specific role requirements
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => 
        user.role === role || user.role.includes(role)
      );
      
      if (!hasRequiredRole) {
        setAccessDenied(true);
        return;
      }
    }

    setAccessDenied(false);
  }, [isAuthenticated, user, isLoading, requiredRoles, router, redirectTo]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return fallback || <LoadingScreen />;
  }

  if (accessDenied) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <Lock className="h-4 w-4" />
            <AlertDescription className="space-y-4">
              <div>
                <h3 className="font-semibold">Access Denied</h3>
                <p className="text-sm">
                  You don't have permission to access this page. 
                  Required role: {requiredRoles.join(' or ')}
                </p>
                <p className="text-sm text-muted-foreground">
                  Your current role: {user.role}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.back()}
                >
                  Go Back
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/dashboard')}
                >
                  Dashboard
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Higher-order component for protecting routes
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requiredRoles?: string[];
    fallback?: React.ReactNode;
    redirectTo?: string;
  } = {}
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Hook for checking permissions
 */
export function usePermissions() {
  const { user } = useAuth();
  
  if (!user) {
    return {
      hasRole: () => false,
      hasAnyRole: () => false,
      permissions: {}
    };
  }

  const hasRole = (role: string) => user.role === role || user.role.includes(role);
  
  const hasAnyRole = (roles: string[]) => roles.some(role => hasRole(role));

  const permissions = {
    canViewDashboard: true,
    canManageProducts: hasAnyRole(['Store Keeper', 'MANAGER', 'ADMIN']),
    canManageCategories: hasAnyRole(['Store Keeper', 'MANAGER', 'ADMIN']),
    canManageSuppliers: hasAnyRole(['Store Keeper', 'MANAGER', 'ADMIN']),
    canManageInventory: hasAnyRole(['Store Keeper', 'MANAGER', 'ADMIN']),
    canViewAnalytics: hasAnyRole(['MANAGER', 'ADMIN']),
    canManageUsers: hasAnyRole(['ADMIN']),
    canManageSettings: hasAnyRole(['ADMIN']),
    canViewReports: hasAnyRole(['MANAGER', 'ADMIN']),
    canManageOrders: hasAnyRole(['Store Keeper', 'MANAGER', 'ADMIN']),
    canManageLogistics: hasAnyRole(['Store Keeper', 'MANAGER', 'ADMIN']),
    canManageFinance: hasAnyRole(['MANAGER', 'ADMIN']),
  };

  return {
    hasRole,
    hasAnyRole,
    permissions
  };
}