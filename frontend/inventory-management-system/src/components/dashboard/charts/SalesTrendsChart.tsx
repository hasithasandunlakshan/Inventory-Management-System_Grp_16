'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export default function SalesTrendsChart() {
  const { filters, getDateRange } = useFilters();
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [trendPercentage, setTrendPercentage] = useState(0);

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const { startDate, endDate } = getDateRange();

        // Simulate data based on filters
        const mockData = generateMockSalesData(
          new Date(startDate),
          new Date(endDate)
        );
        setSalesData(mockData);

        // Calculate trend
        if (mockData.length > 1) {
          const recent = mockData
            .slice(-3)
            .reduce((sum, item) => sum + item.revenue, 0);
          const previous =
            mockData
              .slice(0, -3)
              .reduce((sum, item) => sum + item.revenue, 0) || 1;
          const change = ((recent - previous) / previous) * 100;

          setTrendPercentage(Math.abs(change));
          if (change > 5) setTrend('up');
          else if (change < -5) setTrend('down');
          else setTrend('stable');
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [filters, getDateRange]);

  const generateMockSalesData = (
    startDate: Date,
    endDate: Date
  ): SalesData[] => {
    const data: SalesData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const baseRevenue = 1400;
      const variance = (Math.random() - 0.5) * 400;

      data.push({
        date: currentDate.toISOString().split('T')[0],
        revenue: Math.max(0, baseRevenue + variance),
        orders: Math.floor(Math.random() * 20) + 5,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className='w-4 h-4 text-green-500' />;
      case 'down':
        return <TrendingDown className='w-4 h-4 text-red-500' />;
      default:
        return <Minus className='w-4 h-4 text-gray-500' />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center h-64'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
  const avgDaily = salesData.length ? totalRevenue / salesData.length : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          Sales Trends
          <div className='flex items-center gap-1'>
            {getTrendIcon()}
            <span className={`text-sm ${getTrendColor()}`}>
              {trendPercentage.toFixed(1)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {/* Summary Stats */}
          <div className='grid grid-cols-3 gap-4 text-center'>
            <div>
              <p className='text-2xl font-bold text-blue-600'>
                ${totalRevenue.toLocaleString()}
              </p>
              <p className='text-sm text-gray-500'>Total Revenue</p>
            </div>
            <div>
              <p className='text-2xl font-bold text-green-600'>{totalOrders}</p>
              <p className='text-sm text-gray-500'>Total Orders</p>
            </div>
            <div>
              <p className='text-2xl font-bold text-purple-600'>
                ${avgDaily.toFixed(0)}
              </p>
              <p className='text-sm text-gray-500'>Avg Daily</p>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-gray-700'>Daily Revenue</h4>
            <div className='flex items-end gap-1 h-32'>
              {salesData.slice(-10).map((item, index) => {
                const height =
                  (item.revenue / Math.max(...salesData.map(d => d.revenue))) *
                  100;
                return (
                  <div
                    key={`${item.date}-${index}`}
                    className='flex-1 flex flex-col items-center'
                  >
                    <div
                      className='w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors'
                      style={{ height: `${height}%` }}
                      title={`${item.date}: $${item.revenue.toFixed(0)}`}
                    ></div>
                    <span className='text-xs text-gray-500 mt-1'>
                      {item.date.split('-')[2]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter Info */}
          <div className='text-xs text-gray-500 flex justify-between'>
            <span>All Warehouses</span>
            <span>Range: {filters.timeRange}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
