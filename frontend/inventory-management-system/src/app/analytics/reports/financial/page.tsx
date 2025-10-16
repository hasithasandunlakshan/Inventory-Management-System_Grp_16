'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { revenueService } from '@/services/revenueService';
import type {
  TodayRevenueResponse,
  MonthlyRevenueResponse,
  StripeStatsResponse,
} from '@/types/revenue';

// Beautiful Icon Components
const Icons = {
  CurrencyDollar: () => (
    <svg
      className='w-6 h-6'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
      />
    </svg>
  ),
  TrendingUp: () => (
    <svg
      className='w-6 h-6'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
      />
    </svg>
  ),
  CreditCard: () => (
    <svg
      className='w-6 h-6'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
      />
    </svg>
  ),
  ShoppingCart: () => (
    <svg
      className='w-6 h-6'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01'
      />
    </svg>
  ),
  Refresh: () => (
    <svg
      className='w-4 h-4'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
      />
    </svg>
  ),
};

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export default function FinancialReportPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-12-31');

  // Time frame filter logic
  const getTimeFrameDates = (range: TimeRange) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'daily':
        return {
          from: today.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0]
        };
      case 'weekly':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return {
          from: weekStart.toISOString().split('T')[0],
          to: weekEnd.toISOString().split('T')[0]
        };
      case 'monthly':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
          from: monthStart.toISOString().split('T')[0],
          to: monthEnd.toISOString().split('T')[0]
        };
      case 'yearly':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearEnd = new Date(today.getFullYear(), 11, 31);
        return {
          from: yearStart.toISOString().split('T')[0],
          to: yearEnd.toISOString().split('T')[0]
        };
      default:
        return { from: dateFrom, to: dateTo };
    }
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    if (range !== 'custom') {
      const dates = getTimeFrameDates(range);
      setDateFrom(dates.from);
      setDateTo(dates.to);
    }
  };

  const [financialLoading, setFinancialLoading] = useState(true);
  const [financialError, setFinancialError] = useState<string | null>(null);
  const [todayRevenue, setTodayRevenue] = useState<TodayRevenueResponse | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueResponse>([]);
  const [stripeStats, setStripeStats] = useState<StripeStatsResponse | null>(null);

  // Load financial data
  useEffect(() => {
    const loadFinancialData = async () => {
      setFinancialLoading(true);
      setFinancialError(null);
      try {
        console.log('💰 Loading financial data from backend...', { dateFrom, dateTo });
        const [todayRev, monthlyRev, stripe] = await Promise.all([
          revenueService.getTodayRevenue(dateFrom, dateTo),
          revenueService.getMonthlyRevenue(dateFrom, dateTo),
          revenueService.getStripeStats(dateFrom, dateTo),
        ]);
        
        console.log('💰 Financial data loaded:', { todayRev, monthlyRev, stripe });
        setTodayRevenue(todayRev);
        setMonthlyRevenue(monthlyRev);
        setStripeStats(stripe);
      } catch (err) {
        console.error('❌ Error loading financial data:', err);
        setFinancialError('Failed to load financial data');
      } finally {
        setFinancialLoading(false);
      }
    };

    loadFinancialData();
  }, [dateFrom, dateTo]);

  const reloadData = useCallback(async () => {
    setFinancialLoading(true);
    setFinancialError(null);
    try {
      console.log('🔄 Reloading financial data...', { dateFrom, dateTo });
      const [todayRev, monthlyRev, stripe] = await Promise.all([
        revenueService.getTodayRevenue(dateFrom, dateTo),
        revenueService.getMonthlyRevenue(dateFrom, dateTo),
        revenueService.getStripeStats(dateFrom, dateTo),
      ]);
      
      setTodayRevenue(todayRev);
      setMonthlyRevenue(monthlyRev);
      setStripeStats(stripe);
    } catch (err) {
      console.error('❌ Error reloading financial data:', err);
      setFinancialError('Failed to reload financial data');
    } finally {
      setFinancialLoading(false);
    }
  }, [dateFrom, dateTo]);

  const monthlyMaxRevenue = useMemo(() => {
    return Math.max(...monthlyRevenue.map(m => m.revenue || 0), 1);
  }, [monthlyRevenue]);

  return (
    <div className='min-h-screen'>
      {/* Header */}
      <div className='border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Financial Report</h1>
              <p className='mt-2 text-gray-600'>
                Revenue analytics, trends, and financial performance insights
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2'>
                <Label htmlFor='timeRange'>Time Range:</Label>
                <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                  <SelectTrigger className='w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='daily'>Daily</SelectItem>
                    <SelectItem value='weekly'>Weekly</SelectItem>
                    <SelectItem value='monthly'>Monthly</SelectItem>
                    <SelectItem value='yearly'>Yearly</SelectItem>
                    <SelectItem value='custom'>Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {timeRange === 'custom' && (
                <div className='flex items-center space-x-2'>
                  <Input
                    type='date'
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className='w-40'
                  />
                  <span>to</span>
                  <Input
                    type='date'
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className='w-40'
                  />
                </div>
              )}
              <Button onClick={reloadData} variant='outline'>
                <Icons.Refresh />
                <span className='ml-2'>Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Revenue KPIs */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {/* Today's Revenue */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Today&apos;s Revenue
              </CardTitle>
              <Icons.CurrencyDollar />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                ${todayRevenue?.revenue?.toFixed(2) || '0.00'}
              </div>
              <p className='text-xs text-muted-foreground'>
                {todayRevenue?.count || 0} transactions
              </p>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Revenue
              </CardTitle>
              <Icons.TrendingUp />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                ${stripeStats?.total_revenue?.toFixed(2) || '0.00'}
              </div>
              <p className='text-xs text-muted-foreground'>
                {stripeStats?.total_payments || 0} total payments
              </p>
            </CardContent>
          </Card>

          {/* Refunds */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Refunds
              </CardTitle>
              <Icons.CreditCard />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {stripeStats?.total_refunds || 0}
              </div>
              <p className='text-xs text-muted-foreground'>
                Total refunded transactions
              </p>
            </CardContent>
          </Card>

          {/* Average Order Value */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Avg Order Value
              </CardTitle>
              <Icons.ShoppingCart />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                $
                {stripeStats?.total_payments &&
                stripeStats.total_payments > 0
                  ? (
                      stripeStats.total_revenue /
                      stripeStats.total_payments
                    ).toFixed(2)
                  : '0.00'}
              </div>
              <p className='text-xs text-muted-foreground'>
                Per transaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Growth Analysis */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Revenue Growth Analysis</CardTitle>
            <CardDescription>
              Month-over-month revenue growth and trend analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyRevenue && monthlyRevenue.length > 1 ? (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {monthlyRevenue.slice(0, 3).map((month, idx) => {
                  const prevMonth = monthlyRevenue[idx + 1];
                  const growth =
                    prevMonth && prevMonth.revenue > 0
                      ? ((month.revenue - prevMonth.revenue) /
                          prevMonth.revenue) *
                        100
                      : 0;
                  return (
                    <div
                      key={idx}
                      className='text-center p-4 border rounded-lg'
                    >
                      <div className='text-sm font-medium text-muted-foreground'>
                        {month.month}
                      </div>
                      <div className='text-2xl font-bold'>
                        ${month.revenue?.toFixed(2) || '0.00'}
                      </div>
                      <div
                        className={`text-sm ${growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-muted-foreground'}`}
                      >
                        {growth > 0 ? '+' : ''}
                        {growth.toFixed(1)}% vs previous
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                Insufficient data for growth analysis
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Charts Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Monthly Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
              <CardDescription>
                Revenue breakdown by month for the current year
              </CardDescription>
            </CardHeader>
            <CardContent>
              {financialLoading ? (
                <div className='flex items-center justify-center h-40'>
                  <div className='text-sm text-muted-foreground'>
                    Loading revenue data...
                  </div>
                </div>
              ) : monthlyRevenue && monthlyRevenue.length > 0 ? (
                <div className='space-y-4'>
                  <div className='grid grid-cols-12 gap-2 items-end h-40'>
                    {monthlyRevenue.map((month, idx) => {
                      const height = Math.min(
                        100,
                        Math.max(
                          8,
                          Math.round(
                            ((month.revenue || 0) /
                              monthlyMaxRevenue) *
                              100
                          )
                        )
                      );
                      return (
                        <div
                          key={idx}
                          className='flex flex-col items-center h-full'
                        >
                          <div
                            className='w-full bg-blue-500 rounded min-h-[8px] border border-blue-600'
                            style={{ height: `${height}%` }}
                            title={`${month.month}: $${month.revenue?.toFixed(2) || 0}`}
                          />
                          <div className='text-[10px] mt-1 truncate'>
                            {month.month?.slice(0, 3)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  No revenue data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Summary</CardTitle>
              <CardDescription>
                Detailed monthly revenue breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {financialLoading ? (
                <div className='flex items-center justify-center h-40'>
                  <div className='text-sm text-muted-foreground'>
                    Loading revenue data...
                  </div>
                </div>
              ) : monthlyRevenue && monthlyRevenue.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b'>
                        <th className='text-left py-2'>Month</th>
                        <th className='text-right py-2'>Revenue</th>
                        <th className='text-right py-2'>Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyRevenue.map((month, idx) => {
                        const prevMonth = monthlyRevenue[idx + 1];
                        const growth =
                          prevMonth && prevMonth.revenue > 0
                            ? ((month.revenue - prevMonth.revenue) /
                                prevMonth.revenue) *
                              100
                            : 0;
                        return (
                          <tr key={idx} className='border-b'>
                            <td className='py-2'>{month.month}</td>
                            <td className='text-right py-2'>
                              ${month.revenue?.toFixed(2) || '0.00'}
                            </td>
                            <td className={`text-right py-2 ${growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                              {growth > 0 ? '+' : ''}
                              {growth.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  No revenue data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
