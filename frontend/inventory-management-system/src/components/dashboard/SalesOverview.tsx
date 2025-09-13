'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { revenueService } from '@/services/revenueService';
import { MonthlyRevenueResponse } from '@/types/revenue';

export default function SalesOverview() {
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueResponse>(
    []
  );
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
      <Card className='col-span-1'>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Monthly revenue and orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-sm text-muted-foreground'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  // Filter out months with zero revenue for a cleaner display
  const recentMonthsWithRevenue = monthlyRevenue
    .filter(month => month.revenue > 0)
    .slice(-6); // Show last 6 months with revenue

  // If no months have revenue, show the last 3 months anyway
  const displayData =
    recentMonthsWithRevenue.length > 0
      ? recentMonthsWithRevenue
      : monthlyRevenue.slice(-3);

  return (
    <Card className='col-span-1'>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Monthly revenue and orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {displayData.map(monthData => (
            <div
              key={monthData.month}
              className='flex items-center justify-between text-sm'
            >
              <div className='text-muted-foreground'>
                {monthData.month.charAt(0) +
                  monthData.month.slice(1).toLowerCase()}
              </div>
              <div className='font-medium'>${monthData.revenue.toFixed(2)}</div>
              <div className='text-muted-foreground'>
                {monthData.count} orders
              </div>
            </div>
          ))}
          {displayData.length === 0 && (
            <div className='text-sm text-muted-foreground'>
              No revenue data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
