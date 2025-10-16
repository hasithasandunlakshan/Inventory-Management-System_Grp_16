'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Users, Truck, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SuppliersPage() {
  const features = [
    {
      title: 'Purchase Orders',
      description: 'Manage and track purchase orders with suppliers',
      icon: Package,
      href: '/suppliers/purchase-orders',
      color: 'bg-blue-500',
    },
    {
      title: 'Suppliers Directory',
      description: 'View and manage supplier information and contacts',
      icon: Users,
      href: '/suppliers/suppliers',
      color: 'bg-green-500',
    },
    {
      title: 'Delivery Logs',
      description: 'Monitor shipment status and delivery progress',
      icon: Truck,
      href: '/suppliers/delivery-logs',
      color: 'bg-purple-500',
    },
    {
      title: 'Analytics',
      description: 'Insights and analytics for supplier management',
      icon: BarChart3,
      href: '/suppliers/analytics',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Suppliers</h1>
        <p className='text-muted-foreground'>
          Manage suppliers, purchase orders, and delivery logistics
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {features.map((feature) => (
          <Card key={feature.title} className='hover:shadow-md transition-shadow'>
            <CardHeader>
              <div className='flex items-center gap-3'>
                <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                  <feature.icon className='h-6 w-6' />
                </div>
                <CardTitle className='text-lg'>{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={feature.href}>
                <Button className='w-full' variant='outline'>
                  Access
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Suppliers</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>Loading...</div>
            <p className='text-xs text-muted-foreground'>
              Active suppliers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Purchase Orders</CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>Loading...</div>
            <p className='text-xs text-muted-foreground'>
              This month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Deliveries</CardTitle>
            <Truck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>Loading...</div>
            <p className='text-xs text-muted-foreground'>
              This week
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
