"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SalesOverview() {
  const data = [
    { period: "Jan", revenue: 1250000, orders: 485 },
    { period: "Feb", revenue: 1380000, orders: 520 },
    { period: "Mar", revenue: 1420000, orders: 545 },
  ];
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Recent revenue and orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((d) => (
            <div key={d.period} className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">{d.period}</div>
              <div className="font-medium">LKR {d.revenue.toLocaleString()}</div>
              <div className="text-muted-foreground">{d.orders} orders</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


