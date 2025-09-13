'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function OperationsPanel() {
  const po = [
    { id: 'PO-001', status: 'Pending', supplier: 'ABC Supplies' },
    { id: 'PO-003', status: 'Shipped', supplier: 'Global Imports' },
  ];
  return (
    <Card className='col-span-1'>
      <CardHeader>
        <CardTitle>Operations</CardTitle>
        <CardDescription>Purchase orders and fulfillment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {po.map(o => (
            <div
              key={o.id}
              className='flex items-center justify-between text-sm'
            >
              <div>
                {o.id} — {o.supplier}
              </div>
              <div className='text-muted-foreground'>{o.status}</div>
            </div>
          ))}
        </div>
        <div className='pt-4'>
          <Button variant='outline' className='w-full'>
            View all
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
