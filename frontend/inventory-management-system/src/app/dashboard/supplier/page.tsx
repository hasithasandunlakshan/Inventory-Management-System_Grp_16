'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Package,
  Truck,
  Calendar,
  DollarSign,
  Edit,
  Settings,
} from 'lucide-react';

export default function SupplierDashboard() {
  const { user } = useAuth();

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Supplier Dashboard
        </h1>
        <p className='text-sm text-muted-foreground'>
          Welcome back, {user?.fullName || user?.username}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Orders</CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>12</div>
            <p className='text-xs text-muted-foreground'>+2 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Deliveries
            </CardTitle>
            <Truck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>5</div>
            <p className='text-xs text-muted-foreground'>3 due this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$24,500</div>
            <p className='text-xs text-muted-foreground'>
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Upcoming Orders
            </CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>8</div>
            <p className='text-xs text-muted-foreground'>Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest purchase orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-3 border rounded-lg'>
                <div>
                  <p className='font-medium'>PO-001</p>
                  <p className='text-sm text-muted-foreground'>
                    Electronics • $2,500
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-medium'>Pending</p>
                  <p className='text-xs text-muted-foreground'>Due: Jan 15</p>
                </div>
              </div>
              <div className='flex items-center justify-between p-3 border rounded-lg'>
                <div>
                  <p className='font-medium'>PO-002</p>
                  <p className='text-sm text-muted-foreground'>
                    Office Supplies • $1,200
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-medium'>In Progress</p>
                  <p className='text-xs text-muted-foreground'>Due: Jan 18</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your supplier account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <Button className='w-full justify-start'>
                <Edit className='mr-2 h-4 w-4' />
                Update Profile Information
              </Button>
              <Button variant='outline' className='w-full justify-start'>
                <Package className='mr-2 h-4 w-4' />
                View All Orders
              </Button>
              <Button variant='outline' className='w-full justify-start'>
                <Truck className='mr-2 h-4 w-4' />
                Track Deliveries
              </Button>
              <Button variant='outline' className='w-full justify-start'>
                <Settings className='mr-2 h-4 w-4' />
                Account Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
