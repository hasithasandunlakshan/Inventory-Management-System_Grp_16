"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected) {
      return;
    }

    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      setHasRedirected(true);
      router.push('/login');
      return;
    }

    if (!user?.role) {
      setHasRedirected(true);
      router.push('/access-denied');
      return;
    }

    const role = user.role.toUpperCase();

    // Mark as redirected to prevent loops
    setHasRedirected(true);

    // Redirect based on role using a more reliable method
    const redirectToRole = () => {
      switch (role) {
        case 'ADMIN':
        case 'MANAGER':
          router.replace('/dashboard/manager');
          break;
        case 'SUPPLIER':
          router.replace('/dashboard/supplier');
          break;
        case 'STORE KEEPER':
        case 'STOREKEEPER':
          router.replace('/dashboard/storekeeper');
          break;
        case 'USER':
        default:
          router.replace('/access-denied');
          break;
      }
    };

    // Use setTimeout to ensure the redirect happens after state updates
    setTimeout(redirectToRole, 100);
  }, [user, isAuthenticated, isLoading, router, hasRedirected]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Redirecting to your dashboard...</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {(() => {
            if (isLoading) return 'Loading...';
            if (user?.role) return `Role: ${user.role}`;
            return 'Checking authentication...';
          })()}
        </p>
      </div>
    </div>
  );
}


