'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/nav/Sidebar';
import MobileMenuButton from '@/components/nav/MobileMenuButton';

type AppShellProps = Readonly<{
  children: React.ReactNode;
}>;

export default function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // Do not render sidebar on login route
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // While auth state is loading, avoid flicker
  if (isLoading) {
    return (
      <div className='min-h-dvh flex items-center justify-center text-sm text-muted-foreground'>
        Loading...
      </div>
    );
  }

  // For protected routes, middleware handles redirects. If unauthenticated here, render nothing.
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className='min-h-dvh overflow-hidden'>
      <Sidebar title='Inventory' />
      <main className='md:ml-60 p-2 md:p-4 overflow-hidden'>
        <MobileMenuButton />
        {children}
      </main>
    </div>
  );
}
