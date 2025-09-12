"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { revenueService } from "@/services/revenueService";
import { MonthlyRevenueResponse } from "@/types/revenue";

export default function MonthlyRevenueChart() {
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueResponse>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      try {
        const data = await revenueService.getMonthlyRevenue();
        setMonthlyRevenue(data);
      } catch (error) {
        console.error('Error fetching monthly revenue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyRevenue();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Chart</CardTitle>
          <CardDescription>Revenue breakdown by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));
  const totalRevenue = monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0);
  const totalOrders = monthlyRevenue.reduce((sum, month) => sum + month.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue Chart</CardTitle>
        <CardDescription>Revenue breakdown by month (${totalRevenue.toFixed(2)} total, {totalOrders} orders)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {monthlyRevenue.map((monthData) => {
            const percentage = maxRevenue > 0 ? (monthData.revenue / maxRevenue) * 100 : 0;
            return (
              <div key={monthData.month} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {monthData.month.charAt(0) + monthData.month.slice(1).toLowerCase()}
                  </span>
                  <span className="font-medium">
                    ${monthData.revenue.toFixed(2)} ({monthData.count} orders)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
