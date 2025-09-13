'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/components/auth/ProtectedRoute';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function ProfileContent() {
  const { user } = useAuth();
  const { permissions } = usePermissions();

  const permissionItems = [
    { key: 'canManageProducts', label: 'Manage Products', icon: CheckCircle },
    {
      key: 'canManageCategories',
      label: 'Manage Categories',
      icon: CheckCircle,
    },
    { key: 'canManageSuppliers', label: 'Manage Suppliers', icon: CheckCircle },
    { key: 'canManageInventory', label: 'Manage Inventory', icon: CheckCircle },
    { key: 'canViewAnalytics', label: 'View Analytics', icon: CheckCircle },
    { key: 'canManageUsers', label: 'Manage Users', icon: CheckCircle },
    { key: 'canManageSettings', label: 'Manage Settings', icon: CheckCircle },
    { key: 'canViewReports', label: 'View Reports', icon: CheckCircle },
    { key: 'canManageOrders', label: 'Manage Orders', icon: CheckCircle },
    { key: 'canManageLogistics', label: 'Manage Logistics', icon: CheckCircle },
    { key: 'canManageFinance', label: 'Manage Finance', icon: CheckCircle },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Link href='/dashboard'>
          <Button variant='outline' size='sm'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Dashboard
          </Button>
        </Link>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>Profile</h1>
          <p className='text-sm text-muted-foreground'>
            Your account details and permissions
          </p>
        </div>
      </div>

      {/* User Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            Personal Information
          </CardTitle>
          <CardDescription>
            Your account details and current role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <User className='h-4 w-4 text-muted-foreground' />
                <div>
                  <span className='text-sm font-medium'>Full Name:</span>
                  <p className='text-sm text-muted-foreground'>
                    {user?.fullName || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <User className='h-4 w-4 text-muted-foreground' />
                <div>
                  <span className='text-sm font-medium'>Username:</span>
                  <p className='text-sm text-muted-foreground'>
                    {user?.username}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Mail className='h-4 w-4 text-muted-foreground' />
                <div>
                  <span className='text-sm font-medium'>Email:</span>
                  <p className='text-sm text-muted-foreground'>{user?.email}</p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Shield className='h-4 w-4 text-muted-foreground' />
                <div>
                  <span className='text-sm font-medium'>Role:</span>
                  <div className='mt-1'>
                    <Badge
                      variant={
                        user?.role === 'ADMIN'
                          ? 'destructive'
                          : user?.role === 'MANAGER'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {user?.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <Phone className='h-4 w-4 text-muted-foreground' />
                <div>
                  <span className='text-sm font-medium'>Phone:</span>
                  <p className='text-sm text-muted-foreground'>
                    {user?.phoneNumber || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Shield className='h-4 w-4 text-muted-foreground' />
                <div>
                  <span className='text-sm font-medium'>Account Status:</span>
                  <div className='mt-1'>
                    <Badge
                      variant={
                        user?.accountStatus === 'ACTIVE'
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {user?.accountStatus || 'Unknown'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Mail className='h-4 w-4 text-muted-foreground' />
                <div>
                  <span className='text-sm font-medium'>Email Verified:</span>
                  <div className='mt-1'>
                    <Badge
                      variant={user?.emailVerified ? 'default' : 'destructive'}
                    >
                      {user?.emailVerified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>
              {user?.formattedAddress && (
                <div className='flex items-center gap-3'>
                  <MapPin className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <span className='text-sm font-medium'>Address:</span>
                    <p className='text-sm text-muted-foreground'>
                      {user.formattedAddress}
                    </p>
                  </div>
                </div>
              )}
              {user?.createdAt && (
                <div className='flex items-center gap-3'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <span className='text-sm font-medium'>Member Since:</span>
                    <p className='text-sm text-muted-foreground'>
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            Your Permissions
          </CardTitle>
          <CardDescription>
            Features and sections you can access based on your role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
            {permissionItems.map(({ key, label, icon }) => {
              const hasPermission =
                permissions[key as keyof typeof permissions];
              return (
                <div
                  key={key}
                  className='flex items-center gap-2 p-2 rounded-lg border'
                >
                  {hasPermission ? (
                    <CheckCircle className='h-4 w-4 text-green-600' />
                  ) : (
                    <XCircle className='h-4 w-4 text-red-600' />
                  )}
                  {icon({ className: 'h-4 w-4 text-gray-500' })}
                  <span
                    className={`text-sm ${hasPermission ? 'text-green-700' : 'text-red-700'}`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-4'>
            <Button variant='outline'>Edit Profile</Button>
            <Button variant='outline'>Change Password</Button>
            <Button variant='outline'>Notification Settings</Button>
            <Button variant='outline'>Privacy Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}
