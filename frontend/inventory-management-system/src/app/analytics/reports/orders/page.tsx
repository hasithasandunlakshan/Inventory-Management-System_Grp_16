'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

import { orderService, type Order } from '@/lib/services/orderService';

// Beautiful Icon Components
const Icons = {
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
  Truck: () => (
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
        d='M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z'
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
  Clock: () => (
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
        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
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

export default function OrdersReportPage() {
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
          to: today.toISOString().split('T')[0],
        };
      case 'weekly':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return {
          from: weekStart.toISOString().split('T')[0],
          to: weekEnd.toISOString().split('T')[0],
        };
      case 'monthly':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
          from: monthStart.toISOString().split('T')[0],
          to: monthEnd.toISOString().split('T')[0],
        };
      case 'yearly':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearEnd = new Date(today.getFullYear(), 11, 31);
        return {
          from: yearStart.toISOString().split('T')[0],
          to: yearEnd.toISOString().split('T')[0],
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

  const [ordersLoading, setOrdersLoading] = useState(true);
  const [, setOrdersError] = useState<string | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  // Load orders data
  useEffect(() => {
    const loadOrdersData = async () => {
      setOrdersLoading(true);
      setOrdersError(null);
      try {
        console.log('📦 Loading orders data from backend...', {
          dateFrom,
          dateTo,
        });
        const orders = await orderService.getAllOrders(dateFrom, dateTo);
        console.log('📦 Orders data loaded:', orders);
        const ordersArray = orders.orders || [];
        setAllOrders(ordersArray);
      } catch (err) {
        console.error('❌ Error loading orders data:', err);
        setOrdersError('Failed to load orders data');
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrdersData();
  }, [dateFrom, dateTo]);

  const reloadData = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      console.log('🔄 Reloading orders data...', { dateFrom, dateTo });
      const orders = await orderService.getAllOrders(dateFrom, dateTo);
      const ordersArray = orders.orders || [];
      setAllOrders(ordersArray);
    } catch (err) {
      console.error('❌ Error reloading orders data:', err);
      setOrdersError('Failed to reload orders data');
    } finally {
      setOrdersLoading(false);
    }
  }, [dateFrom, dateTo]);

  const ordersKpis = useMemo(() => {
    const totalOrders = allOrders.length;
    const confirmed = allOrders.filter(
      (o: Order) => o.status === 'CONFIRMED'
    ).length;
    const processed = allOrders.filter(
      (o: Order) => o.status === 'PROCESSED'
    ).length;
    const shipped = allOrders.filter(
      (o: Order) => o.status === 'SHIPPED'
    ).length;
    const cancelled = allOrders.filter(
      (o: Order) => o.status === 'CANCELLED'
    ).length;
    const pending = allOrders.filter(
      (o: Order) => o.status === 'PENDING'
    ).length;
    const totalRevenue = allOrders.reduce(
      (sum, o: Order) => sum + (o.totalAmount || 0),
      0
    );
    const avgOrderValue =
      totalOrders > 0 ? (totalRevenue as number) / totalOrders : 0;

    return {
      totalOrders,
      confirmed,
      processed,
      shipped,
      cancelled,
      pending,
      totalRevenue,
      avgOrderValue,
    };
  }, [allOrders]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allOrders.forEach((order: Order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return counts;
  }, [allOrders]);

  const statusMax = useMemo(() => {
    return Math.max(...Object.values(statusCounts), 1);
  }, [statusCounts]);

  const filteredOrders = useMemo(() => {
    const from = new Date(dateFrom).getTime();
    const to = new Date(dateTo).getTime();
    return allOrders.filter((order: Order) => {
      const orderDate = new Date(order.createdAt || order.orderDate).getTime();
      return (
        (!Number.isNaN(from) ? orderDate >= from : true) &&
        (!Number.isNaN(to) ? orderDate <= to : true)
      );
    });
  }, [allOrders, dateFrom, dateTo]);

  return (
    <div className='min-h-screen'>
      {/* Header */}
      <div className='border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Orders Report
              </h1>
              <p className='mt-2 text-gray-600'>
                Order processing and fulfillment analysis
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
                    onChange={e => setDateFrom(e.target.value)}
                    className='w-40'
                  />
                  <span>to</span>
                  <Input
                    type='date'
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
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
        <div className='grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Orders
              </CardTitle>
              <Icons.ShoppingCart />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {ordersLoading ? '—' : ordersKpis.totalOrders}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Confirmed</CardTitle>
              <Icons.CheckCircle />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {ordersLoading ? '—' : ordersKpis.confirmed}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Processed</CardTitle>
              <Icons.DocumentReport />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {ordersLoading ? '—' : ordersKpis.processed}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Shipped</CardTitle>
              <Icons.Truck />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-600'>
                {ordersLoading ? '—' : ordersKpis.shipped}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Cancelled</CardTitle>
              <Icons.XCircle />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {ordersLoading ? '—' : ordersKpis.cancelled}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Pending</CardTitle>
              <Icons.Clock />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-orange-600'>
                {ordersLoading ? '—' : ordersKpis.pending}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Stats */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold'>
                $
                {ordersLoading
                  ? '—'
                  : (ordersKpis.totalRevenue as number).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Average Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold'>
                ${ordersLoading ? '—' : ordersKpis.avgOrderValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders by Status Chart */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='text-base'>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-sm text-gray-600 mb-2'>
              Status Chart Container (h-40 with border)
            </div>
            <div className='grid grid-cols-6 gap-4 items-end h-40 border border-gray-200 p-2 bg-gray-50'>
              {[
                'PENDING',
                'CONFIRMED',
                'PROCESSED',
                'SHIPPED',
                'CANCELLED',
                'REFUNDED',
              ].map(status => {
                const value = statusCounts[status] || 0;
                const pct = Math.min(
                  100,
                  Math.max(8, Math.round((value / statusMax) * 100))
                );
                const color =
                  status === 'CONFIRMED'
                    ? 'bg-green-500'
                    : status === 'PROCESSED'
                      ? 'bg-blue-500'
                      : status === 'SHIPPED'
                        ? 'bg-purple-500'
                        : status === 'CANCELLED'
                          ? 'bg-red-500'
                          : status === 'PENDING'
                            ? 'bg-orange-500'
                            : 'bg-gray-500';
                return (
                  <div
                    key={status}
                    className='flex flex-col items-center h-full'
                  >
                    <div className='w-full bg-foreground/10 rounded h-full flex items-end'>
                      <div
                        className={`w-full ${color} rounded min-h-[8px] border border-gray-400`}
                        style={{ height: `${pct}%` }}
                        title={`${status}: ${value} orders`}
                      />
                    </div>
                    <div className='text-xs text-center mt-2'>
                      {status.slice(0, 3)}
                    </div>
                    <div className='text-xs text-center'>{value}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>
              All Orders ({filteredOrders.length})
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
                      Items
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {(ordersLoading ? [] : filteredOrders).map(order => (
                    <tr key={order.orderId} className='hover:bg-muted/30'>
                      <td className='px-6 py-4 text-sm font-medium'>
                        {order.orderId}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        {order.customerName || 'N/A'}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            order.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'PROCESSED'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'SHIPPED'
                                  ? 'bg-purple-100 text-purple-800'
                                  : order.status === 'CANCELLED'
                                    ? 'bg-red-100 text-red-800'
                                    : order.status === 'PENDING'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        ${order.totalAmount?.toFixed(2) || '0.00'}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        {(order as { items?: unknown[] }).items?.length || 0}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {!ordersLoading && filteredOrders.length === 0 && (
                    <tr>
                      <td
                        className='px-6 py-6 text-sm text-muted-foreground'
                        colSpan={6}
                      >
                        No orders found
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
