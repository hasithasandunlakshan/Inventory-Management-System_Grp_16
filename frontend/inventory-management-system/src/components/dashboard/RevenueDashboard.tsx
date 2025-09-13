'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { revenueService } from '@/services/revenueService';
import {
  TodayRevenueResponse,
  MonthlyRevenueResponse,
  StripeStatsResponse,
} from '@/types/revenue';
import {
  formatCurrency,
  formatMonth,
  getCurrentMonth,
} from '@/utils/revenueUtils';

export default function RevenueDashboard() {
  const [todayRevenue, setTodayRevenue] = useState<TodayRevenueResponse | null>(
    null
  );
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueResponse>(
    []
  );
  const [stripeStats, setStripeStats] = useState<StripeStatsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllRevenueData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [todayData, monthlyData, stripeData] = await Promise.all([
        revenueService.getTodayRevenue(),
        revenueService.getMonthlyRevenue(),
        revenueService.getStripeStats(),
      ]);

      setTodayRevenue(todayData);
      setMonthlyRevenue(monthlyData);
      setStripeStats(stripeData);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setError('Failed to load revenue data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRevenueData();
  }, []);

  if (loading) {
    return (
      <Card className='col-span-full'>
        <CardHeader>
          <CardTitle>Revenue Dashboard</CardTitle>
          <CardDescription>Complete revenue overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-sm text-muted-foreground'>
            Loading revenue data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='col-span-full'>
        <CardHeader>
          <CardTitle>Revenue Dashboard</CardTitle>
          <CardDescription>Complete revenue overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='text-sm text-red-600'>{error}</div>
            <Button onClick={fetchAllRevenueData} variant='outline' size='sm'>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentMonth = getCurrentMonth(monthlyRevenue);
  const yearToDateRevenue = monthlyRevenue.reduce(
    (sum, month) => sum + month.revenue,
    0
  );
  const yearToDateOrders = monthlyRevenue.reduce(
    (sum, month) => sum + month.count,
    0
  );

  return (
    <Card className='col-span-full'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>Revenue Dashboard</CardTitle>
          <CardDescription>
            Complete revenue overview and analytics
          </CardDescription>
        </div>
        <Button
          onClick={fetchAllRevenueData}
          variant='outline'
          size='sm'
          disabled={loading}
        >
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {/* Today's Performance */}
          <div className='space-y-2'>
            <h4 className='font-medium text-sm'>Today's Performance</h4>
            <div className='space-y-1'>
              <div className='text-2xl font-bold'>
                {formatCurrency(
                  todayRevenue?.revenue || 0,
                  todayRevenue?.currency
                )}
              </div>
              <div className='text-sm text-muted-foreground'>
                {todayRevenue?.count || 0} orders today
              </div>
            </div>
          </div>

          {/* Current Month */}
          <div className='space-y-2'>
            <h4 className='font-medium text-sm'>This Month</h4>
            <div className='space-y-1'>
              <div className='text-2xl font-bold'>
                {formatCurrency(
                  currentMonth?.revenue || 0,
                  currentMonth?.currency
                )}
              </div>
              <div className='text-sm text-muted-foreground'>
                {currentMonth?.count || 0} orders this month
              </div>
            </div>
          </div>

          {/* Year to Date */}
          <div className='space-y-2'>
            <h4 className='font-medium text-sm'>Year to Date</h4>
            <div className='space-y-1'>
              <div className='text-2xl font-bold'>
                ${yearToDateRevenue.toFixed(2)}
              </div>
              <div className='text-sm text-muted-foreground'>
                {yearToDateOrders} orders total
              </div>
            </div>
          </div>

          {/* Stripe Stats */}
          <div className='space-y-2'>
            <h4 className='font-medium text-sm'>Payment Stats</h4>
            <div className='space-y-1'>
              <div className='text-2xl font-bold'>
                ${stripeStats?.total_revenue.toFixed(2) || '0.00'}
              </div>
              <div className='text-sm text-muted-foreground'>
                {stripeStats?.total_payments || 0} payments,{' '}
                {stripeStats?.total_refunds || 0} refunds
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className='mt-6'>
          <h4 className='font-medium text-sm mb-3'>Monthly Revenue Trend</h4>
          <div className='space-y-2'>
            {monthlyRevenue.slice(-6).map(monthData => {
              const maxRevenue = Math.max(
                ...monthlyRevenue.map(m => m.revenue)
              );
              const percentage =
                maxRevenue > 0 ? (monthData.revenue / maxRevenue) * 100 : 0;

              return (
                <div key={monthData.month} className='space-y-1'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>
                      {formatMonth(monthData.month)}
                    </span>
                    <span className='font-medium'>
                      {formatCurrency(monthData.revenue, monthData.currency)} (
                      {monthData.count} orders)
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-1.5'>
                    <div
                      className='bg-blue-600 h-1.5 rounded-full transition-all duration-300'
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
