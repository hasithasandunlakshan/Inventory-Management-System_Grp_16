'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function InventoryHealth() {
  const lowStock = [
    { name: 'Coconut Oil - 1L', qty: 25 },
    { name: 'Tea Packets - 100g', qty: 0 },
    { name: 'Sugar - 1kg', qty: 500 },
  ];
  return (
    <Card className='col-span-1'>
      <CardHeader>
        <CardTitle>Inventory Health</CardTitle>
        <CardDescription>Low/out-of-stock and overstock</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {lowStock.map(i => (
            <div
              key={i.name}
              className='flex items-center justify-between text-sm'
            >
              <div className='truncate pr-2'>{i.name}</div>
              <Badge variant={i.qty === 0 ? 'destructive' : 'secondary'}>
                {i.qty === 0 ? 'Out of stock' : `${i.qty} units`}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
