"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AlertsTasks() {
  const alerts = [
    { type: "Low Stock", detail: "Tea Packets - 100g is out of stock" },
    { type: "Payment Pending", detail: "Invoice INV-1024 is overdue" },
  ];
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Alerts & Tasks</CardTitle>
        <CardDescription>What needs your attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-start justify-between">
              <div>
                <div className="font-medium">{a.type}</div>
                <div className="text-muted-foreground">{a.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


