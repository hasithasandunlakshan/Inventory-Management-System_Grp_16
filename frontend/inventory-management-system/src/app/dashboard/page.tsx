'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='w-full max-w-4xl mx-auto'>
        <div className='text-center mb-8'>
          <div className='flex items-center justify-center space-x-3 mb-4'></div>
          <Skeleton className='h-6 w-64 mx-auto mb-2' />
          <Skeleton className='h-4 w-48 mx-auto' />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className='bg-card border-border card-shadow'>
              <CardHeader className='pb-2'>
                <Skeleton className='h-4 w-24' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-8 w-16' />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Card className='bg-card border-border card-shadow'>
            <CardHeader>
              <Skeleton className='h-6 w-32' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-64 w-full' />
            </CardContent>
          </Card>

          <Card className='bg-card border-border card-shadow'>
            <CardHeader>
              <Skeleton className='h-6 w-32' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-64 w-full' />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
