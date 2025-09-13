'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export default function SuppliersPanel() {
  const suppliers = [
    { name: 'ABC Supplies', onTime: 96, spend: 450000 },
    { name: 'Ceylon Tea Co.', onTime: 92, spend: 285000 },
  ];
  return (
    <Card className='col-span-1'>
      <CardHeader>
        <CardTitle>Suppliers</CardTitle>
        <CardDescription>Performance and spend</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-3 text-sm'>
          {suppliers.map(s => (
            <div key={s.name} className='flex items-center justify-between'>
              <div className='truncate pr-2'>{s.name}</div>
              <div className='text-muted-foreground'>{s.onTime}% on-time</div>
              <div className='font-medium'>LKR {s.spend.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
