'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
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

import { orderService } from '@/lib/services/orderService';
import { revenueService } from '@/services/revenueService';
import type {
  TodayRevenueResponse,
  MonthlyRevenueResponse,
  StripeStatsResponse,
} from '@/types/revenue';

// Beautiful Icon Components
const Icons = {
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
  CheckCircle: () => (
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
        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      />
    </svg>
  ),
  DocumentReport: () => (
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
        d='M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      />
    </svg>
  ),
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
  XCircle: () => (
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
        d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
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

export default function SalesReportPage() {
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

  const [salesLoading, setSalesLoading] = useState(true);
  const [, setSalesError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<unknown[]>([]);
  const [allOrders, setAllOrders] = useState<unknown[]>([]);
  const [todayRevenue, setTodayRevenue] = useState<TodayRevenueResponse | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueResponse>([]);
  const [, setStripeStats] = useState<StripeStatsResponse | null>(null);

  // Load sales data
  useEffect(() => {
    const loadSalesData = async () => {
      setSalesLoading(true);
      setSalesError(null);
      try {
        console.log('💰 Loading sales data from backend...', { dateFrom, dateTo });
        const [orders, todayRev, monthlyRev, stripe] = await Promise.all([
          orderService.getAllOrders(dateFrom, dateTo),
          revenueService.getTodayRevenue(dateFrom, dateTo),
          revenueService.getMonthlyRevenue(dateFrom, dateTo),
          revenueService.getStripeStats(dateFrom, dateTo),
        ]);
        
        console.log('💰 Sales data loaded:', { orders, todayRev, monthlyRev, stripe });
        const ordersArray = orders.orders || [];
        setRecentOrders(ordersArray.slice(0, 10));
        setAllOrders(ordersArray);
        setTodayRevenue(todayRev);
        setMonthlyRevenue(monthlyRev);
        setStripeStats(stripe);
      } catch (err) {
        console.error('❌ Error loading sales data:', err);
        setSalesError('Failed to load sales data');
      } finally {
        setSalesLoading(false);
      }
    };

    loadSalesData();
  }, [dateFrom, dateTo]);

  const reloadData = useCallback(async () => {
    setSalesLoading(true);
    setSalesError(null);
    try {
      console.log('🔄 Reloading sales data...', { dateFrom, dateTo });
      const [orders, todayRev, monthlyRev, stripe] = await Promise.all([
        orderService.getAllOrders(dateFrom, dateTo),
        revenueService.getTodayRevenue(dateFrom, dateTo),
        revenueService.getMonthlyRevenue(dateFrom, dateTo),
        revenueService.getStripeStats(dateFrom, dateTo),
      ]);
      
      const ordersArray = orders.orders || [];
      setRecentOrders(ordersArray.slice(0, 10));
      setAllOrders(ordersArray);
      setTodayRevenue(todayRev);
      setMonthlyRevenue(monthlyRev);
      setStripeStats(stripe);
    } catch (err) {
      console.error('❌ Error reloading sales data:', err);
      setSalesError('Failed to reload sales data');
    } finally {
      setSalesLoading(false);
    }
  }, [dateFrom, dateTo]);

  const salesKpis = useMemo(() => {
    const totalOrders = allOrders.length;
    const confirmed = allOrders.filter(o => o.status === 'CONFIRMED').length;
    const processed = allOrders.filter(o => o.status === 'PROCESSED').length;
    const refunds = allOrders.filter(o => o.status === 'REFUNDED').length;
    const todaysRevenue = todayRevenue?.revenue || 0;
    const aov = totalOrders > 0 ? allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / totalOrders : 0;
    
    return {
      totalOrders,
      confirmed,
      processed,
      refunds,
      todaysRevenue,
      aov,
    };
  }, [allOrders, todayRevenue]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allOrders.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return counts;
  }, [allOrders]);

  const statusMax = useMemo(() => {
    return Math.max(...Object.values(statusCounts), 1);
  }, [statusCounts]);

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
              <h1 className='text-3xl font-bold text-gray-900'>Sales Report</h1>
              <p className='mt-2 text-gray-600'>
                Revenue, orders, and sales performance analysis
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
        {/* KPI Row */}
        <div className='grid grid-cols-1 md:grid-cols-6 gap-4 mb-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Orders
              </CardTitle>
              <Icons.ShoppingCart />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {salesLoading ? '—' : salesKpis.totalOrders}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Confirmed
              </CardTitle>
              <Icons.CheckCircle />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {salesLoading ? '—' : salesKpis.confirmed}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Processed
              </CardTitle>
              <Icons.DocumentReport />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {salesLoading ? '—' : salesKpis.processed}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Today Revenue
              </CardTitle>
              <Icons.CurrencyDollar />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {salesLoading
                  ? '—'
                  : (salesKpis.todaysRevenue || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Refunds
              </CardTitle>
              <Icons.XCircle />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {salesLoading ? '—' : salesKpis.refunds}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Avg Order Value
              </CardTitle>
              <Icons.TrendingUp />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {salesLoading
                  ? '—'
                  : salesKpis.aov.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Revenue by Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-sm text-gray-600 mb-2'>
                Chart Container (h-40 with border)
              </div>
              <div className='grid grid-cols-12 gap-2 items-end h-40 border border-gray-200 p-2 bg-gray-50'>
                {!salesLoading &&
                monthlyRevenue &&
                monthlyRevenue.length > 0 ? (
                  monthlyRevenue.map((m, idx) => {
                    const height = Math.min(
                      100,
                      Math.max(
                        8,
                        Math.round(
                          ((m.revenue || 0) / monthlyMaxRevenue) *
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
                          title={`${m.month}: $${m.revenue?.toFixed(2) || 0}`}
                        />
                        <div className='text-[10px] mt-1 truncate'>
                          {m.month?.slice(0, 3)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className='col-span-12 text-center text-sm text-muted-foreground'>
                    {salesLoading
                      ? 'Loading...'
                      : 'No revenue data'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Orders by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-sm text-gray-600 mb-2'>
                Status Chart Container (h-40 with border)
              </div>
              <div className='grid grid-cols-4 gap-4 items-end h-40 border border-gray-200 p-2 bg-gray-50'>
                {[
                  'CONFIRMED',
                  'PROCESSED',
                  'SHIPPED',
                  'CANCELLED',
                ].map(status => {
                  const value = statusCounts[status] || 0;
                  const pct = Math.min(
                    100,
                    Math.max(
                      8,
                      Math.round((value / statusMax) * 100)
                    )
                  );
                  console.log(`📊 Status bar ${status}:`, {
                    value,
                    pct,
                    statusMax,
                  });
                  return (
                    <div
                      key={status}
                      className='flex flex-col items-center h-full'
                    >
                      <div className='w-full bg-foreground/10 rounded h-full flex items-end'>
                        <div
                          className='w-full bg-foreground rounded min-h-[8px] border border-gray-400'
                          style={{ height: `${pct}%` }}
                          title={`${status}: ${value}`}
                        />
                      </div>
                      <div className='text-xs text-center mt-2'>
                        {status.slice(0, 3)}
                      </div>
                      <div className='text-xs text-center'>
                        {value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                      Order ID
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                      Customer
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                      Amount
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {(salesLoading ? [] : recentOrders).map(order => (
                    <tr
                      key={order.orderId}
                      className='hover:bg-muted/30'
                    >
                      <td className='px-6 py-4 text-sm font-medium'>
                        {order.orderId}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        {order.customerName || 'N/A'}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          order.status === 'PROCESSED' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        ${order.totalAmount?.toFixed(2) || '0.00'}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {!salesLoading && recentOrders.length === 0 && (
                    <tr>
                      <td
                        className='px-6 py-6 text-sm text-muted-foreground'
                        colSpan={5}
                      >
                        No recent orders
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
