"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { revenueService } from "@/services/revenueService";
import { StripeStatsResponse } from "@/types/revenue";

export default function FinancePanel() {
  const [stripeStats, setStripeStats] = useState<StripeStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStripeStats = async () => {
      try {
        const data = await revenueService.getStripeStats();
        setStripeStats(data);
      } catch (error) {
        console.error('Error fetching Stripe stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStripeStats();
  }, []);

  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Finance</CardTitle>
          <CardDescription>Payments and margins</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!stripeStats) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Finance</CardTitle>
          <CardDescription>Payments and margins</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Error loading finance data</div>
        </CardContent>
      </Card>
    );
  }

  const avgPaymentValue = stripeStats.total_payments > 0 
    ? stripeStats.total_revenue / stripeStats.total_payments 
    : 0;

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Finance</CardTitle>
        <CardDescription>Payments and margins</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Revenue</span>
            <span className="font-medium">${stripeStats.total_revenue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Payments</span>
            <span className="font-medium">{stripeStats.total_payments}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Refunds</span>
            <span className="font-medium">{stripeStats.total_refunds}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg Payment Value</span>
            <span className="font-medium">${avgPaymentValue.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


