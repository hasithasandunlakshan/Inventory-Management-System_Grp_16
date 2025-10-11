'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { discountService } from '@/lib/services/discountService';
import { Discount, DiscountUsageAnalytics } from '@/lib/types/discount';
import { format, subDays } from 'date-fns';
import {
  BarChart3,
  Calendar as CalendarIcon,
  DollarSign,
  Download,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DiscountAnalyticsProps {
  discount: Discount;
  onClose: () => void;
}

export default function DiscountAnalytics({
  discount,
  onClose,
}: DiscountAnalyticsProps) {
  const [analytics, setAnalytics] = useState<DiscountUsageAnalytics | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (discount.id) {
      fetchAnalytics();
    }
  }, [discount.id, startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await discountService.getDiscountUsageAnalytics(
        discount.id!,
        startDate,
        endDate
      );
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Prepare chart data
  const usageChartData =
    analytics?.usageByDate.map(item => ({
      date: formatDate(item.date),
      usageCount: item.usageCount,
      totalDiscount: item.totalDiscount,
    })) || [];

  // Colors for charts
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        <span className='ml-3'>Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-12'>
        <div className='text-red-600 mb-4'>{error}</div>
        <Button onClick={fetchAnalytics} variant='outline'>
          Retry
        </Button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className='text-center py-12'>
        <BarChart3 className='mx-auto h-12 w-12 text-muted-foreground' />
        <h3 className='mt-4 text-lg font-semibold'>No Analytics Data</h3>
        <p className='mt-2 text-muted-foreground'>
          No usage data available for the selected period.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-start'>
        <div>
          <h2 className='text-2xl font-bold'>Analytics Dashboard</h2>
          <p className='text-muted-foreground'>
            Usage statistics for discount code:{' '}
            <code className='bg-gray-100 px-2 py-1 rounded text-sm'>
              {discount.discountCode}
            </code>
          </p>
        </div>
        <Button variant='outline' size='sm'>
          <Download className='mr-2 h-4 w-4' />
          Export Report
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <CalendarIcon className='mr-2 h-5 w-5' />
            Date Range Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center space-x-4'>
            <div className='grid w-full max-w-sm items-center gap-1.5'>
              <Label htmlFor='startDate'>Start Date</Label>
              <Input
                type='date'
                id='startDate'
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className='grid w-full max-w-sm items-center gap-1.5'>
              <Label htmlFor='endDate'>End Date</Label>
              <Input
                type='date'
                id='endDate'
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={fetchAnalytics} className='mt-6'>
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Usage</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{analytics.totalUsages}</div>
            <p className='text-xs text-muted-foreground'>
              times used in selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Unique Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{analytics.uniqueUsers}</div>
            <p className='text-xs text-muted-foreground'>different customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Savings</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(analytics.totalDiscountAmount)}
            </div>
            <p className='text-xs text-muted-foreground'>
              total discount given
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Avg per Order</CardTitle>
            <BarChart3 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(analytics.avgDiscountPerOrder)}
            </div>
            <p className='text-xs text-muted-foreground'>
              average discount amount
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trend</CardTitle>
          <CardDescription>
            Daily usage count and discount amounts over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={usageChartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis yAxisId='left' />
                <YAxis yAxisId='right' orientation='right' />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'usageCount'
                      ? value
                      : formatCurrency(Number(value)),
                    name === 'usageCount' ? 'Usage Count' : 'Total Discount',
                  ]}
                />
                <Legend />
                <Bar
                  yAxisId='left'
                  dataKey='usageCount'
                  fill='#3B82F6'
                  name='Usage Count'
                />
                <Line
                  yAxisId='right'
                  type='monotone'
                  dataKey='totalDiscount'
                  stroke='#10B981'
                  strokeWidth={2}
                  name='Total Discount ($)'
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Usage Distribution */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Daily Usage Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage Distribution</CardTitle>
            <CardDescription>Usage count by day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={usageChartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='usageCount' fill='#3B82F6' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Users Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Users</CardTitle>
            <CardDescription>Users with highest usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={analytics.topUsers.map((user, index) => ({
                      name: `User ${user.userId}`,
                      value: user.usageCount,
                      fill: colors[index % colors.length],
                    }))}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {analytics.topUsers.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Users Detail</CardTitle>
          <CardDescription>
            Detailed breakdown of users with highest discount usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Usage Count</TableHead>
                  <TableHead>Total Discount</TableHead>
                  <TableHead>Avg per Use</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topUsers.map((user, index) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        #{index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className='font-medium'>
                      User {user.userId}
                    </TableCell>
                    <TableCell>{user.usageCount} times</TableCell>
                    <TableCell>{formatCurrency(user.totalDiscount)}</TableCell>
                    <TableCell>
                      {formatCurrency(user.totalDiscount / user.usageCount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {analytics.topUsers.length === 0 && (
            <div className='text-center py-8 text-muted-foreground'>
              No user data available for the selected period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discount Details Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Details</CardTitle>
          <CardDescription>
            Summary of the discount configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Discount Type
              </Label>
              <p className='font-semibold'>{discount.type.replace('_', ' ')}</p>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Discount Value
              </Label>
              <p className='font-semibold'>
                {discount.isPercentage
                  ? `${discount.discountValue}%`
                  : formatCurrency(discount.discountValue)}
              </p>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Min Order Amount
              </Label>
              <p className='font-semibold'>
                {discount.minOrderAmount
                  ? formatCurrency(discount.minOrderAmount)
                  : 'No minimum'}
              </p>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Status
              </Label>
              <Badge
                className={
                  discount.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }
              >
                {discount.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Close Button */}
      <div className='flex justify-end'>
        <Button onClick={onClose} variant='outline'>
          Close Analytics
        </Button>
      </div>
    </div>
  );
}
