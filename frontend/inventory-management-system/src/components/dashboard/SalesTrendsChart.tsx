'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { LineChart, BarChart, AreaChart } from '@/components/charts';
import { TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
  [key: string]: unknown;
}

interface TopProducts {
  product: string;
  sales: number;
  revenue: number;
  [key: string]: unknown;
}

export default function SalesTrendsChart() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProducts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);

        const analytics = await analyticsService.getSalesAnalytics();

        setSalesData(analytics.dailyData);
        setTopProducts(analytics.topProducts);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Trends</CardTitle>
          <CardDescription>
            Revenue and sales performance analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-sm text-muted-foreground'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0);
  const totalCustomers = salesData.reduce((sum, day) => sum + day.customers, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <TrendingUp className='h-5 w-5' />
          Sales Trends
        </CardTitle>
        <CardDescription>
          Revenue and sales performance analysis
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Key Metrics */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='text-center p-3 bg-green-50 rounded-lg border border-green-200'>
            <DollarSign className='h-4 w-4 mx-auto mb-1 text-green-600' />
            <div className='text-lg font-bold text-green-700'>
              ${totalRevenue.toLocaleString()}
            </div>
            <div className='text-xs text-green-600'>Total Revenue</div>
          </div>
          <div className='text-center p-3 bg-blue-50 rounded-lg border border-blue-200'>
            <ShoppingCart className='h-4 w-4 mx-auto mb-1 text-blue-600' />
            <div className='text-lg font-bold text-blue-700'>{totalOrders}</div>
            <div className='text-xs text-blue-600'>Total Orders</div>
          </div>
          <div className='text-center p-3 bg-purple-50 rounded-lg border border-purple-200'>
            <Users className='h-4 w-4 mx-auto mb-1 text-purple-600' />
            <div className='text-lg font-bold text-purple-700'>
              {totalCustomers}
            </div>
            <div className='text-xs text-purple-600'>Customers</div>
          </div>
          <div className='text-center p-3 bg-orange-50 rounded-lg border border-orange-200'>
            <TrendingUp className='h-4 w-4 mx-auto mb-1 text-orange-600' />
            <div className='text-lg font-bold text-orange-700'>
              ${avgOrderValue.toFixed(0)}
            </div>
            <div className='text-xs text-orange-600'>Avg Order Value</div>
          </div>
        </div>

        {/* Charts Row - Full Width Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Revenue Trend */}
          <div className='lg:col-span-2'>
            <h4 className='font-medium text-sm mb-3'>Daily Revenue Trend</h4>
            <div className='h-[300px]'>
              <AreaChart
                data={salesData}
                config={{
                  revenue: {
                    label: 'Revenue',
                    color: 'hsl(var(--chart-1))',
                  },
                }}
                dataKey='revenue'
                xAxisKey='date'
                className='h-full'
              />
            </div>
          </div>

          {/* Customer Acquisition & Orders */}
          <div>
            <h4 className='font-medium text-sm mb-3'>
              Customer Acquisition & Orders
            </h4>
            <div className='h-[300px]'>
              <LineChart
                data={salesData}
                config={{
                  orders: {
                    label: 'Total Orders',
                    color: 'hsl(var(--chart-1))',
                  },
                  customers: {
                    label: 'New Customers',
                    color: 'hsl(var(--chart-2))',
                  },
                  avgOrderValue: {
                    label: 'Avg Order Value',
                    color: 'hsl(var(--chart-3))',
                  },
                }}
                dataKey='orders'
                xAxisKey='date'
                showLegend={true}
                className='h-full'
              />
            </div>
            <div className='mt-2 text-xs text-muted-foreground'>
              <div className='flex justify-between'>
                <span>
                  Orders per Customer:{' '}
                  {(totalOrders / totalCustomers).toFixed(1)}
                </span>
                <span>
                  Growth Rate:{' '}
                  {totalCustomers > 0
                    ? (
                        totalCustomers / Math.max(1, totalCustomers - 1) -
                        1 * 100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products - Full Width */}
        <div>
          <h4 className='font-medium text-sm mb-3'>Top Selling Products</h4>
          <div className='h-[250px]'>
            <BarChart
              data={topProducts}
              config={{
                sales: {
                  label: 'Units Sold',
                  color: 'hsl(var(--chart-1))',
                },
              }}
              dataKey='sales'
              xAxisKey='product'
              orientation='horizontal'
              showLegend={false}
              className='h-full'
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
