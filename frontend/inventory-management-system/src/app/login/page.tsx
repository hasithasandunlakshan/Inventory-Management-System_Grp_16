'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to role-specific dashboard
      const roleBasedRedirect = getRoleBasedRedirect(user.role);
      router.push(redirectTo || roleBasedRedirect);
    }
  }, [isAuthenticated, user, router, redirectTo]);

  const getRoleBasedRedirect = (role: string) => {
    switch (role) {
      case 'MANAGER':
        return '/dashboard/manager';
      case 'ADMIN':
        return '/dashboard/admin';
      case 'Store Keeper':
        return '/dashboard/store-keeper';
      default:
        return '/dashboard';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await login(loginData.username, loginData.password);

      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        // Get user role from the login result or wait for auth context to update
        setTimeout(() => {
          const roleBasedRedirect = getRoleBasedRedirect(user?.role || '');
          router.push(redirectTo || roleBasedRedirect);
        }, 100);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className='min-h-screen flex'>
      {/* Left Column - Login Form */}
      <div className='flex-1 flex items-center justify-center bg-white px-8'>
        <div className='w-full max-w-md space-y-8'>
          {/* Logo */}
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-brand-gradient rounded-full flex items-center justify-center shadow-lg'>
              <span className='text-white font-bold text-lg'>S</span>
            </div>
            <span className='text-3xl font-bold text-foreground'>
              Shop Mind
            </span>
          </div>

          {/* Login Form */}
          <div className='space-y-8'>
            <div className='text-center'>
              <h1 className='text-4xl font-bold text-foreground mb-3'>
                Welcome Back
              </h1>
              <p className='text-lg text-muted-foreground'>
                Sign in to your Shop Mind account
              </p>
            </div>

            <form onSubmit={handleLogin} className='space-y-6'>
              <div className='space-y-3'>
                <Label
                  htmlFor='username'
                  className='text-sm font-semibold text-foreground'
                >
                  Username
                </Label>
                <Input
                  id='username'
                  type='text'
                  value={loginData.username}
                  onChange={e => handleInputChange('username', e.target.value)}
                  required
                  placeholder='Enter your username'
                  className='h-14 text-lg border-2 border-muted-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200'
                />
              </div>

              <div className='space-y-3'>
                <Label
                  htmlFor='password'
                  className='text-sm font-semibold text-foreground'
                >
                  Password
                </Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={e =>
                      handleInputChange('password', e.target.value)
                    }
                    required
                    placeholder='Enter your password'
                    className='h-14 text-lg border-2 border-muted-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl pr-14 transition-all duration-200'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-muted/50 rounded-lg'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className='h-5 w-5 text-muted-foreground' />
                    ) : (
                      <Eye className='h-5 w-5 text-muted-foreground' />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type='submit'
                className='w-full h-14 bg-brand-gradient hover:opacity-90 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200'
                disabled={loading}
              >
                {loading && <Loader2 className='mr-2 h-5 w-5 animate-spin' />}
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {error && (
              <Alert variant='destructive' className='mt-4'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <div className='space-y-4'>
                <div className='flex items-center justify-center space-x-2 text-success'>
                  <CheckCircle className='h-5 w-5' />
                  <span className='font-medium'>Login successful!</span>
                </div>
                <div className='space-y-3'>
                  <Skeleton className='h-4 w-48 mx-auto' />
                  <Skeleton className='h-4 w-32 mx-auto' />
                  <Skeleton className='h-4 w-40 mx-auto' />
                </div>
              </div>
            )}

            {!success && (
              <div className='text-center text-sm text-muted-foreground'>
                <p>
                  Having trouble?{' '}
                  <Link
                    href='/contact'
                    className='text-primary hover:text-primary/80 font-medium'
                  >
                    Contact support
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Promotional Content */}
      <div className='hidden lg:flex lg:flex-1 bg-brand-gradient relative overflow-hidden'>
        {/* Background Pattern */}
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-10 left-10 w-4 h-4 bg-white rounded-sm'></div>
          <div className='absolute top-20 left-32 w-3 h-3 bg-white rounded-sm'></div>
          <div className='absolute top-32 left-16 w-2 h-2 bg-white rounded-sm'></div>
          <div className='absolute top-40 left-40 w-3 h-3 bg-white rounded-sm'></div>
          <div className='absolute top-60 left-20 w-2 h-2 bg-white rounded-sm'></div>
          <div className='absolute top-80 left-36 w-4 h-4 bg-white rounded-sm'></div>
        </div>

        <div className='relative z-10 flex flex-col justify-center px-12 py-16'>
          {/* Analytics Card */}
          <div className='bg-white/95 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-xl'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-foreground'>
                Analytics
              </h3>
              <div className='flex space-x-2'>
                <button className='px-3 py-1 text-xs bg-primary text-white rounded-full'>
                  Weekly
                </button>
                <button className='px-3 py-1 text-xs text-muted-foreground rounded-full'>
                  Monthly
                </button>
                <button className='px-3 py-1 text-xs text-muted-foreground rounded-full'>
                  Yearly
                </button>
              </div>
            </div>
            <div className='h-32 flex items-end space-x-2'>
              <div className='flex-1 bg-primary/20 rounded-t h-16'></div>
              <div className='flex-1 bg-primary/30 rounded-t h-20'></div>
              <div className='flex-1 bg-primary/40 rounded-t h-24'></div>
              <div className='flex-1 bg-primary/50 rounded-t h-28'></div>
            </div>
            <div className='flex justify-between text-xs text-muted-foreground mt-2'>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
            </div>
          </div>

          {/* Donut Chart Card */}
          <div className='bg-white/95 backdrop-blur-sm rounded-xl p-6 w-48 shadow-xl'>
            <div className='flex items-center justify-center mb-4'>
              <div className='relative w-20 h-20'>
                <div className='absolute inset-0 rounded-full border-8 border-muted'></div>
                <div className='absolute inset-0 rounded-full border-8 border-primary border-r-transparent transform -rotate-45'></div>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <span className='text-sm font-semibold text-foreground'>
                    42%
                  </span>
                </div>
              </div>
            </div>
            <p className='text-center text-sm text-muted-foreground'>
              Total 42%
            </p>
          </div>

          {/* Promotional Text */}
          <div className='mt-12'>
            <h2 className='text-4xl font-bold text-white mb-6 leading-tight'>
              Very simple way you can engage
            </h2>
            <p className='text-white/90 text-lg leading-relaxed'>
              Welcome to Shop Mind Inventory Management System! Efficiently
              track and manage your inventory with ease.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='text-center'>
            <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
            <p className='text-gray-600'>Loading...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
