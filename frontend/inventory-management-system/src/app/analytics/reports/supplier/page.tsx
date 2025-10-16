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

import {
  supplierService,
  type StatsSummaryDTO,
} from '@/lib/services/supplierService';

// Beautiful Icon Components
const Icons = {
  Building: () => (
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
        d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
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
  Package: () => (
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
        d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
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

export default function SupplierReportPage() {
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

  const [supplierLoading, setSupplierLoading] = useState(true);
  const [supplierError, setSupplierError] = useState<string | null>(null);
  const [supplierAnalytics, setSupplierAnalytics] = useState<StatsSummaryDTO | null>(null);

  // Load supplier analytics data
  useEffect(() => {
    const loadSupplierAnalytics = async () => {
      setSupplierLoading(true);
      setSupplierError(null);
      try {
        console.log('🏢 Loading supplier analytics data from backend...', { dateFrom, dateTo });
        const analytics = await supplierService.getPurchaseOrderStats({ dateFrom, dateTo });
        console.log('🏢 Supplier analytics data loaded:', analytics);
        setSupplierAnalytics(analytics);
      } catch (err) {
        console.error('❌ Error loading supplier analytics data:', err);
        setSupplierError('Failed to load supplier analytics data');
      } finally {
        setSupplierLoading(false);
      }
    };

    loadSupplierAnalytics();
  }, [dateFrom, dateTo]);

  const reloadData = useCallback(async () => {
    setSupplierLoading(true);
    setSupplierError(null);
    try {
      console.log('🔄 Reloading supplier analytics data...', { dateFrom, dateTo });
      const analytics = await supplierService.getPurchaseOrderStats({ dateFrom, dateTo });
      setSupplierAnalytics(analytics);
    } catch (err) {
      console.error('❌ Error reloading supplier analytics data:', err);
      setSupplierError('Failed to reload supplier analytics data');
    } finally {
      setSupplierLoading(false);
    }
  }, [dateFrom, dateTo]);

  return (
    <div className='min-h-screen'>
      {/* Header */}
      <div className='border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Supplier Report</h1>
              <p className='mt-2 text-gray-600'>
                Supplier performance, purchase orders, and spending analysis
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
        {supplierLoading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
              <p className='text-muted-foreground'>
                Loading supplier analytics...
              </p>
            </div>
          </div>
        ) : supplierError ? (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='text-red-500 mb-4'>❌</div>
              <p className='text-red-600 font-medium'>
                Failed to load supplier data
              </p>
              <p className='text-sm text-muted-foreground mt-2'>
                {supplierError}
              </p>
            </div>
          </div>
        ) : supplierAnalytics ? (
          <div className='space-y-6'>
            {/* Key Metrics */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-muted-foreground'>
                        Total Orders
                      </p>
                      <p className='text-2xl font-bold'>
                        {supplierAnalytics.count || 0}
                      </p>
                    </div>
                    <div className='h-8 w-8 text-muted-foreground'>
                      <Icons.ShoppingCart />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-muted-foreground'>
                        Total Value
                      </p>
                      <p className='text-2xl font-bold'>
                        $
                        {(
                          supplierAnalytics.total || 0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className='h-8 w-8 text-muted-foreground'>
                      <Icons.CreditCard />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-muted-foreground'>
                        Avg Order Value
                      </p>
                      <p className='text-2xl font-bold'>
                        $
                        {supplierAnalytics.count > 0 
                          ? (supplierAnalytics.total / supplierAnalytics.count).toLocaleString()
                          : 0}
                      </p>
                    </div>
                    <div className='h-8 w-8 text-muted-foreground'>
                      <Icons.TrendingUp />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-muted-foreground'>
                        Completed Orders
                      </p>
                      <p className='text-2xl font-bold'>
                        {supplierAnalytics.byStatusCounts?.COMPLETED || 0}
                      </p>
                    </div>
                    <div className='h-8 w-8 text-muted-foreground'>
                      <Icons.Package />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>
                  Breakdown of purchase orders by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-3 gap-4 items-end h-40 border border-gray-200 p-4 bg-gray-50 rounded-lg'>
                  {[
                    {
                      status: 'Pending',
                      count: supplierAnalytics.byStatusCounts?.PENDING || 0,
                      color: 'bg-yellow-500',
                    },
                    {
                      status: 'Completed',
                      count: supplierAnalytics.byStatusCounts?.COMPLETED || 0,
                      color: 'bg-green-500',
                    },
                    {
                      status: 'Cancelled',
                      count: supplierAnalytics.byStatusCounts?.CANCELLED || 0,
                      color: 'bg-red-500',
                    },
                  ].map(({ status, count, color }) => {
                    const maxCount = Math.max(
                      supplierAnalytics.byStatusCounts?.PENDING || 0,
                      supplierAnalytics.byStatusCounts?.COMPLETED || 0,
                      supplierAnalytics.byStatusCounts?.CANCELLED || 0
                    );
                    const height =
                      maxCount > 0
                        ? Math.max(
                            8,
                            Math.round((count / maxCount) * 100)
                          )
                        : 8;
                    return (
                      <div
                        key={status}
                        className='flex flex-col items-center h-full'
                      >
                        <div
                          className={`w-full ${color} rounded min-h-[8px] border border-gray-400`}
                          style={{ height: `${height}%` }}
                          title={`${status}: ${count} orders`}
                        ></div>
                        <div className='text-xs text-center mt-2'>
                          <div className='font-medium'>{count}</div>
                          <div className='text-muted-foreground'>
                            {status}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Supplier Performance Metrics */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Order Trends</CardTitle>
                  <CardDescription>
                    Monthly purchase order trends and patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>Total Orders</span>
                      <span className='text-sm text-muted-foreground'>
                        {supplierAnalytics.count || 0} orders
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>Total Value</span>
                      <span className='text-sm text-muted-foreground'>
                        ${(supplierAnalytics.total || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>Average Order Value</span>
                      <span className='text-sm text-muted-foreground'>
                        ${supplierAnalytics.count > 0 
                          ? (supplierAnalytics.total / supplierAnalytics.count).toLocaleString()
                          : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spending Analysis</CardTitle>
                  <CardDescription>
                    Total spending and average order value trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>Total Spending</span>
                      <span className='text-sm text-muted-foreground'>
                        ${(supplierAnalytics.total || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>Average Order Value</span>
                      <span className='text-sm text-muted-foreground'>
                        ${supplierAnalytics.count > 0 
                          ? (supplierAnalytics.total / supplierAnalytics.count).toLocaleString()
                          : 0}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>Completion Rate</span>
                      <span className='text-sm text-muted-foreground'>
                        {supplierAnalytics.count > 0
                          ? ((supplierAnalytics.byStatusCounts?.COMPLETED || 0) / supplierAnalytics.count * 100).toFixed(1)
                          : '0.0'}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Supplier Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Supplier Performance Insights</CardTitle>
                <CardDescription>
                  Key insights and recommendations for supplier management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='p-4 border rounded-lg bg-blue-50'>
                    <h4 className='font-semibold text-blue-900 mb-2'>Order Completion Rate</h4>
                    <p className='text-sm text-blue-800'>
                      Current completion rate: {supplierAnalytics.count > 0
                        ? ((supplierAnalytics.byStatusCounts?.COMPLETED || 0) / supplierAnalytics.count * 100).toFixed(1)
                        : '0.0'}%
                      {supplierAnalytics.count > 0 && ((supplierAnalytics.byStatusCounts?.COMPLETED || 0) / supplierAnalytics.count * 100) < 80
                        ? '. Consider reviewing supplier performance and delivery timelines.'
                        : '. Good supplier performance!'}
                    </p>
                  </div>
                  <div className='p-4 border rounded-lg bg-green-50'>
                    <h4 className='font-semibold text-green-900 mb-2'>Spending Optimization</h4>
                    <p className='text-sm text-green-800'>
                      Total spending: ${(supplierAnalytics.total || 0).toLocaleString()}
                      {supplierAnalytics.count > 0 && (supplierAnalytics.total / supplierAnalytics.count) > 1000
                        ? '. Consider negotiating bulk discounts with suppliers.'
                        : '. Current spending levels are reasonable.'}
                    </p>
                  </div>
                  <div className='p-4 border rounded-lg bg-purple-50'>
                    <h4 className='font-semibold text-purple-900 mb-2'>Order Volume Trends</h4>
                    <p className='text-sm text-purple-800'>
                      Current order status breakdown: {supplierAnalytics.byStatusCounts?.PENDING || 0} pending, {supplierAnalytics.byStatusCounts?.COMPLETED || 0} completed, {supplierAnalytics.byStatusCounts?.CANCELLED || 0} cancelled. Monitor order fulfillment patterns for optimization opportunities.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='text-muted-foreground mb-4'>📊</div>
              <p className='text-muted-foreground'>
                No supplier analytics data available
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
