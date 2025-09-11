"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useRedirectByRole() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth to load

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!user?.role) {
      router.push('/access-denied');
      return;
    }

    const role = user.role.toUpperCase();
    
    // Redirect based on role
    switch (role) {
      case 'ADMIN':
      case 'MANAGER':
        router.push('/dashboard/manager');
        break;
      case 'SUPPLIER':
        router.push('/dashboard/supplier');
        break;
      case 'STORE KEEPER':
      case 'STOREKEEPER':
        router.push('/dashboard/storekeeper');
        break;
      case 'USER':
      default:
        router.push('/access-denied');
        break;
    }
  }, [user, isAuthenticated, isLoading, router]);
}

export function getDashboardPathByRole(role: string): string {
  const normalizedRole = role.toUpperCase();
  
  switch (normalizedRole) {
    case 'ADMIN':
    case 'MANAGER':
      return '/dashboard/manager';
    case 'SUPPLIER':
      return '/dashboard/supplier';
    case 'STORE KEEPER':
    case 'STOREKEEPER':
      return '/dashboard/storekeeper';
    case 'USER':
    default:
      return '/access-denied';
  }
}
