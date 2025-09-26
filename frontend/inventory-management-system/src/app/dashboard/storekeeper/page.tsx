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
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Users,
} from 'lucide-react';

export default function StorekeeperDashboard() {
  const { user } = useAuth();

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Storekeeper Dashboard
        </h1>
        <p className='text-sm text-muted-foreground'>
          Welcome back, {user?.fullName || user?.username}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Inventory
            </CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>1,247</div>
            <p className='text-xs text-muted-foreground'>+45 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Low Stock Items
            </CardTitle>
            <AlertTriangle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>23</div>
            <p className='text-xs text-muted-foreground'>Need restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Orders Processed
            </CardTitle>
            <CheckCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>89</div>
            <p className='text-xs text-muted-foreground'>This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Receipts
            </CardTitle>
            <Truck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>12</div>
            <p className='text-xs text-muted-foreground'>Awaiting delivery</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-3 border rounded-lg border-orange-200 bg-orange-50'>
                <div>
                  <p className='font-medium text-orange-800'>Laptop Chargers</p>
                  <p className='text-sm text-orange-600'>Only 3 units left</p>
                </div>
                <Button size='sm' variant='outline'>
                  Restock
                </Button>
              </div>
              <div className='flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50'>
                <div>
                  <p className='font-medium text-red-800'>Office Chairs</p>
                  <p className='text-sm text-red-600'>Out of stock</p>
                </div>
                <Button size='sm' variant='outline'>
                  Order Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common store operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <Button className='w-full justify-start'>
                <Package className='mr-2 h-4 w-4' />
                Manage Inventory
              </Button>
              <Button variant='outline' className='w-full justify-start'>
                <Truck className='mr-2 h-4 w-4' />
                Process Deliveries
              </Button>
              <Button variant='outline' className='w-full justify-start'>
                <BarChart3 className='mr-2 h-4 w-4' />
                View Reports
              </Button>
              <Button variant='outline' className='w-full justify-start'>
                <Users className='mr-2 h-4 w-4' />
                Manage Suppliers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
