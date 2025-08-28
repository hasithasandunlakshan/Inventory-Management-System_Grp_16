'use client';

import { useState } from 'react';
import { Bell, Clock, AlertTriangle, ShoppingCart, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  date: string;
  type?: 'low_stock' | 'order_placed' | 'order_received';
};

const demoNotifications: NotificationItem[] = [
  { id: 'n1', title: 'Order placed', description: 'Order #10245 created', time: '2m ago', date: '2025-08-28', type: 'order_placed' },
  { id: 'n2', title: 'Low stock alert', description: 'Tea Packets - 100g out of stock', time: '15m ago', date: '2025-08-28', type: 'low_stock' },
  { id: 'n3', title: 'Order received', description: 'Order #10212 received at warehouse', time: '1h ago', date: '2025-08-28', type: 'order_received' },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications] = useState<NotificationItem[]>(demoNotifications);

  const getIcon = (type?: NotificationItem['type']) => {
    switch (type) {
      case 'order_placed':
        return <ShoppingCart className="h-4 w-4 text-green-600" />;
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'order_received':
        return <PackageCheck className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white">
              {notifications.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 rounded-md border p-3">
                <div className="mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-sm text-muted-foreground">{n.description}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{n.date} • {n.time}</div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">No notifications</div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-3 flex justify-end">
          <Link href="/notifications" className="text-sm font-medium text-primary hover:underline" onClick={() => setOpen(false)}>
            See all
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}


