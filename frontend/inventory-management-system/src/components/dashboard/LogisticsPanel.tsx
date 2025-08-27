"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LogisticsPanel() {
  const deliveries = [
    { date: "2025-01-25", delivered: 48, avgTime: 2.2, success: 97.9 },
    { date: "2025-01-20", delivered: 52, avgTime: 2.8, success: 92.3 },
  ];
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Logistics</CardTitle>
        <CardDescription>Recent delivery performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          {deliveries.map((d) => (
            <div key={d.date} className="flex items-center justify-between">
              <div className="text-muted-foreground">{new Date(d.date).toLocaleDateString()}</div>
              <div>{d.delivered} delivered</div>
              <div className="text-muted-foreground">{d.avgTime}h • {d.success}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


