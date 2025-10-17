'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Award,
  BarChart3,
} from 'lucide-react';
import { analyticsService } from '@/lib/services/analyticsService';
import type { SalesAnalytics } from '@/lib/services/analyticsService';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Color scheme
const CustomerColors = {
  brandBlue: '#2A7CC7',
  brandDark: '#072033ff',
  brandMedium: '#245e91ff',
  accentBlue: '#6366F1',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  success: '#059669',
  successBg: '#D1FAE5',
  warning: '#F59E0B',
  error: '#EF4444',
  bgCard: '#FFFFFF',
  borderDefault: '#E2E8F0',
};

export default function SalesTab() {
  const [salesData, setSalesData] = useState<SalesAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await analyticsService.getSalesAnalytics();
      setSalesData(data);
    } catch (err) {
      setError('Failed to load sales data');
      console.error('Error loading sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[1, 2, 3, 4].map(i => (
          <Card
            key={i}
            style={{
              backgroundColor: CustomerColors.bgCard,
              border: `1px solid ${CustomerColors.borderDefault}`,
            }}
          >
            <CardHeader className='pb-2'>
              <div className='animate-pulse bg-gray-200 h-4 w-24 rounded'></div>
            </CardHeader>
            <CardContent>
              <div className='animate-pulse bg-gray-200 h-8 w-16 rounded'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !salesData) {
    return (
      <Card
        style={{
          backgroundColor: CustomerColors.bgCard,
          border: `1px solid ${CustomerColors.borderDefault}`,
        }}
      >
        <CardContent className='p-6'>
          <div className='text-center text-red-600'>
            <TrendingUp className='mx-auto h-12 w-12 mb-4' />
            <p>{error || 'No sales data available'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Sales Metrics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card
          style={{
            backgroundColor: CustomerColors.bgCard,
            border: `1px solid ${CustomerColors.borderDefault}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            background: `linear-gradient(135deg, ${CustomerColors.bgCard} 0%, ${CustomerColors.successBg} 100%)`,
          }}
        >
          <CardHeader className='pb-2'>
            <CardTitle
              className='text-sm font-medium flex items-center'
              style={{ color: CustomerColors.textSecondary }}
            >
              <DollarSign
                className='h-4 w-4 mr-2'
                style={{ color: CustomerColors.success }}
              />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className='text-3xl font-bold'
              style={{ color: CustomerColors.brandDark }}
            >
              ${salesData.totalRevenue.toLocaleString()}
            </div>
            <p
              className='text-xs mt-1'
              style={{ color: CustomerColors.textSecondary }}
            >
              Total sales revenue
            </p>
          </CardContent>
        </Card>

        <Card
          style={{
            backgroundColor: CustomerColors.bgCard,
            border: `1px solid ${CustomerColors.borderDefault}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardHeader className='pb-2'>
            <CardTitle
              className='text-sm font-medium flex items-center'
              style={{ color: CustomerColors.textSecondary }}
            >
              <ShoppingCart
                className='h-4 w-4 mr-2'
                style={{ color: CustomerColors.brandBlue }}
              />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className='text-3xl font-bold'
              style={{ color: CustomerColors.brandDark }}
            >
              {salesData.totalOrders.toLocaleString()}
            </div>
            <p
              className='text-xs mt-1'
              style={{ color: CustomerColors.textSecondary }}
            >
              Orders processed
            </p>
          </CardContent>
        </Card>

        <Card
          style={{
            backgroundColor: CustomerColors.bgCard,
            border: `1px solid ${CustomerColors.borderDefault}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardHeader className='pb-2'>
            <CardTitle
              className='text-sm font-medium flex items-center'
              style={{ color: CustomerColors.textSecondary }}
            >
              <Users
                className='h-4 w-4 mr-2'
                style={{ color: CustomerColors.accentBlue }}
              />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className='text-3xl font-bold'
              style={{ color: CustomerColors.brandDark }}
            >
              {salesData.totalCustomers.toLocaleString()}
            </div>
            <p
              className='text-xs mt-1'
              style={{ color: CustomerColors.textSecondary }}
            >
              Unique customers
            </p>
          </CardContent>
        </Card>

        <Card
          style={{
            backgroundColor: CustomerColors.bgCard,
            border: `1px solid ${CustomerColors.borderDefault}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            background: `linear-gradient(135deg, ${CustomerColors.bgCard} 0%, #E0E7FF 100%)`,
          }}
        >
          <CardHeader className='pb-2'>
            <CardTitle
              className='text-sm font-medium flex items-center'
              style={{ color: CustomerColors.textSecondary }}
            >
              <TrendingUp
                className='h-4 w-4 mr-2'
                style={{ color: CustomerColors.success }}
              />
              Avg Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className='text-3xl font-bold'
              style={{ color: CustomerColors.success }}
            >
              ${salesData.avgOrderValue.toLocaleString()}
            </div>
            <p
              className='text-xs mt-1'
              style={{ color: CustomerColors.textSecondary }}
            >
              Average per order
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Daily Revenue Area Chart */}
        <Card
          style={{
            backgroundColor: CustomerColors.bgCard,
            border: `1px solid ${CustomerColors.borderDefault}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardHeader>
            <CardTitle
              className='flex items-center'
              style={{ color: CustomerColors.brandDark }}
            >
              <BarChart3
                className='h-5 w-5 mr-2'
                style={{ color: CustomerColors.brandBlue }}
              />
              Daily Revenue Trend (7 Days)
            </CardTitle>
            <p
              className='text-sm'
              style={{ color: CustomerColors.textSecondary }}
            >
              Revenue performance over the last week
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: 'Revenue',
                  color: CustomerColors.brandBlue,
                },
              }}
              className='h-[300px]'
            >
              <AreaChart data={salesData.dailyData}>
                <defs>
                  <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor={CustomerColors.brandBlue}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor={CustomerColors.brandBlue}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke={CustomerColors.borderDefault}
                />
                <XAxis
                  dataKey='date'
                  tickFormatter={value =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                  stroke={CustomerColors.textSecondary}
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke={CustomerColors.textSecondary}
                  style={{ fontSize: '12px' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type='monotone'
                  dataKey='revenue'
                  stroke={CustomerColors.brandBlue}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill='url(#colorRevenue)'
                  name='Revenue ($)'
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Daily Orders Bar Chart */}
        <Card
          style={{
            backgroundColor: CustomerColors.bgCard,
            border: `1px solid ${CustomerColors.borderDefault}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardHeader>
            <CardTitle
              className='flex items-center'
              style={{ color: CustomerColors.brandDark }}
            >
              <ShoppingCart
                className='h-5 w-5 mr-2'
                style={{ color: CustomerColors.brandBlue }}
              />
              Daily Orders (7 Days)
            </CardTitle>
            <p
              className='text-sm'
              style={{ color: CustomerColors.textSecondary }}
            >
              Order volume trends
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                orders: {
                  label: 'Orders',
                  color: CustomerColors.accentBlue,
                },
              }}
              className='h-[300px]'
            >
              <BarChart data={salesData.dailyData}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke={CustomerColors.borderDefault}
                />
                <XAxis
                  dataKey='date'
                  tickFormatter={value =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                  stroke={CustomerColors.textSecondary}
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke={CustomerColors.textSecondary}
                  style={{ fontSize: '12px' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey='orders'
                  fill={CustomerColors.accentBlue}
                  radius={[8, 8, 0, 0]}
                  name='Orders'
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card
        style={{
          backgroundColor: CustomerColors.bgCard,
          border: `1px solid ${CustomerColors.borderDefault}`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardHeader>
          <CardTitle
            className='flex items-center'
            style={{ color: CustomerColors.brandDark }}
          >
            <Award
              className='h-5 w-5 mr-2'
              style={{ color: CustomerColors.brandBlue }}
            />
            Top Performing Products
          </CardTitle>
          <p
            className='text-sm'
            style={{ color: CustomerColors.textSecondary }}
          >
            Best selling products by volume and revenue
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: CustomerColors.borderDefault }}>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Rank
                </TableHead>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Product Name
                </TableHead>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Units Sold
                </TableHead>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Revenue
                </TableHead>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Performance
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.topProducts.slice(0, 5).map((product, index) => (
                <TableRow
                  key={product.product}
                  style={{ borderColor: CustomerColors.borderDefault }}
                >
                  <TableCell>
                    <div
                      className='flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold'
                      style={{
                        backgroundColor:
                          index === 0
                            ? '#FFD700'
                            : index === 1
                              ? '#C0C0C0'
                              : index === 2
                                ? '#CD7F32'
                                : CustomerColors.brandBlue,
                        color: 'white',
                      }}
                    >
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell
                    className='font-medium'
                    style={{ color: CustomerColors.textPrimary }}
                  >
                    {product.product}
                  </TableCell>
                  <TableCell>
                    <Badge
                      style={{
                        backgroundColor: CustomerColors.successBg,
                        color: CustomerColors.success,
                      }}
                    >
                      {product.sales} units
                    </Badge>
                  </TableCell>
                  <TableCell
                    className='font-semibold'
                    style={{ color: CustomerColors.brandDark }}
                  >
                    ${product.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center'>
                      <div
                        className='h-2 rounded-full mr-2'
                        style={{
                          width: `${(product.sales / salesData.topProducts[0].sales) * 100}%`,
                          backgroundColor: CustomerColors.brandBlue,
                          minWidth: '20px',
                        }}
                      />
                      <span
                        className='text-xs'
                        style={{ color: CustomerColors.textSecondary }}
                      >
                        {Math.round(
                          (product.sales / salesData.topProducts[0].sales) * 100
                        )}
                        %
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Daily Performance Table */}
      <Card
        style={{
          backgroundColor: CustomerColors.bgCard,
          border: `1px solid ${CustomerColors.borderDefault}`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: CustomerColors.brandDark }}>
            Daily Performance Breakdown
          </CardTitle>
          <p
            className='text-sm'
            style={{ color: CustomerColors.textSecondary }}
          >
            Detailed metrics for the last 7 days
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: CustomerColors.borderDefault }}>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Date
                </TableHead>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Revenue
                </TableHead>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Orders
                </TableHead>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Customers
                </TableHead>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Avg Order Value
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.dailyData.map(day => (
                <TableRow
                  key={day.date}
                  style={{ borderColor: CustomerColors.borderDefault }}
                >
                  <TableCell
                    className='font-medium'
                    style={{ color: CustomerColors.textPrimary }}
                  >
                    {new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell
                    className='font-semibold'
                    style={{ color: CustomerColors.success }}
                  >
                    ${day.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='outline'
                      style={{
                        borderColor: CustomerColors.brandBlue,
                        color: CustomerColors.brandBlue,
                      }}
                    >
                      {day.orders}
                    </Badge>
                  </TableCell>
                  <TableCell style={{ color: CustomerColors.textPrimary }}>
                    {day.customers}
                  </TableCell>
                  <TableCell
                    className='font-medium'
                    style={{ color: CustomerColors.brandDark }}
                  >
                    ${day.avgOrderValue.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
