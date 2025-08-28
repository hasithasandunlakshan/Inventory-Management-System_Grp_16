"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Clock, Filter, ShoppingCart, PackageCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  date: string;
  type: "low_stock" | "order_placed" | "order_received";
};

const allNotifications: NotificationItem[] = [
  { id: 'n1', title: 'Order placed', description: 'Order #10245 created', time: '2m ago', date: '2025-08-28', type: 'order_placed' },
  { id: 'n2', title: 'Low stock alert', description: 'Tea Packets - 100g out of stock', time: '15m ago', date: '2025-08-28', type: 'low_stock' },
  { id: 'n3', title: 'Order received', description: 'Order #10212 received at warehouse', time: '1h ago', date: '2025-08-28', type: 'order_received' },
  { id: 'n4', title: 'Low stock alert', description: 'Coconut Oil - 1L below threshold', time: '3h ago', date: '2025-08-27', type: 'low_stock' },
  { id: 'n5', title: 'Order placed', description: 'Order #10213 created', time: '5h ago', date: '2025-08-27', type: 'order_placed' },
];

export default function NotificationsPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | NotificationItem["type"]>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return allNotifications.filter(n => {
      const matchesType = type === "all" || n.type === type;
      const matchesQuery = `${n.title} ${n.description}`.toLowerCase().includes(query.toLowerCase());
      const fromOk = !dateFrom || n.date >= dateFrom;
      const toOk = !dateTo || n.date <= dateTo;
      return matchesType && matchesQuery && fromOk && toOk;
    });
  }, [query, type, dateFrom, dateTo]);

  const getIcon = (t: NotificationItem["type"]) => {
    switch (t) {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">All Notifications</h1>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Filter className="h-4 w-4" /> Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-1">
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="order_placed">Order Placed</SelectItem>
                <SelectItem value="order_received">Order Received</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="date-from" className="text-xs text-muted-foreground">From</label>
            <input id="date-from" type="date" className="w-full border rounded-md px-3 py-2 text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="date-to" className="text-xs text-muted-foreground">To</label>
            <input id="date-to" type="date" className="w-full border rounded-md px-3 py-2 text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="sm:col-span-1">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notifications..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[65vh]">
            <div className="p-4 space-y-3">
              {filtered.map((n) => (
                <div key={n.id} className="flex items-start gap-3 rounded-md border p-3">
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{n.title}</div>
                    <div className="text-sm text-muted-foreground">{n.description}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{n.date} • {n.time}</div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-14">No notifications found</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}


