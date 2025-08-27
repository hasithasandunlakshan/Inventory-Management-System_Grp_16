"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function KpiCards() {
  const kpis = [
    { label: "Revenue", value: "LKR 1,420,000" },
    { label: "Orders", value: "545" },
    { label: "Inventory Value", value: "LKR 197,500" },
    { label: "Low-Stock", value: "12" },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


