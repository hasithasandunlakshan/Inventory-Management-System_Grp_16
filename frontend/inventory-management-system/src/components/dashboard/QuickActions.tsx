'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function QuickActions() {
  return (
    <Card className='col-span-1'>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline'>Add Product</Button>
          <Button variant='outline'>New Purchase Order</Button>
          <Button variant='outline'>Start Promotion</Button>
          <Button variant='outline'>Process Refund</Button>
        </div>
      </CardContent>
    </Card>
  );
}
