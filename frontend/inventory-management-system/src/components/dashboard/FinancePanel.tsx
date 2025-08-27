"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function FinancePanel() {
  const metrics = {
    collected: 820000,
    pending: 145000,
    refunds: 32000,
    aov: 2653,
  };
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Finance</CardTitle>
        <CardDescription>Payments and margins</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Collected</span><span className="font-medium">LKR {metrics.collected.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Pending</span><span className="font-medium">LKR {metrics.pending.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Refunds</span><span className="font-medium">LKR {metrics.refunds.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Avg Order Value</span><span className="font-medium">LKR {metrics.aov.toLocaleString()}</span></div>
        </div>
      </CardContent>
    </Card>
  );
}


