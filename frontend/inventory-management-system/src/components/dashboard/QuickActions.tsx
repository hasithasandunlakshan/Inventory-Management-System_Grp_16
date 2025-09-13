'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function QuickActions() {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <Card className='col-span-1'>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-2'>
          <Button 
            variant='outline' 
            onClick={() => handleNavigation('/dashboard/products/add')}
            className='h-12'
          >
            Add Product
          </Button>
          <Button 
            variant='outline' 
            onClick={() => handleNavigation('/dashboard/purchase-orders/new')}
            className='h-12'
          >
            New Purchase Order
          </Button>
          <Button 
            variant='outline' 
            onClick={() => handleNavigation('/dashboard/promotions/new')}
            className='h-12'
          >
            Start Promotion
          </Button>
          <Button 
            variant='outline' 
            onClick={() => handleNavigation('/dashboard/manager/refunds/process')}
            className='h-12'
          >
            Process Refund
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
