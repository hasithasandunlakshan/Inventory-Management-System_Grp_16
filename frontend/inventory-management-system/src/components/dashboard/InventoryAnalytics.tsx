'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { BarChart, DonutChart, LineChart } from '@/components/charts';
import { Package } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';

interface InventoryData {
  lowStock: number;
  outOfStock: number;
  inStock: number;
  totalProducts: number;
}

interface StockMovement {
  date: string;
  incoming: number;
  outgoing: number;
  net: number;
  [key: string]: unknown;
}

interface CategoryDistribution {
  category: string;
  count: number;
  value: number;
  [key: string]: unknown;
}

export default function InventoryAnalytics() {
  const [inventoryData, setInventoryData] = useState<InventoryData>({
    lowStock: 0,
    outOfStock: 0,
    inStock: 0,
    totalProducts: 0,
  });
  const [stockMovement, setStockMovement] = useState<StockMovement[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);

        const analytics = await analyticsService.getInventoryAnalytics();

        setInventoryData(analytics.inventoryData);
        setStockMovement(analytics.stockMovement);
        setCategoryData(analytics.categoryData);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Analytics</CardTitle>
          <CardDescription>Comprehensive inventory insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-sm text-muted-foreground'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const stockStatusData = [
    { name: 'In Stock', value: inventoryData.inStock, color: '#10b981' },
    { name: 'Low Stock', value: inventoryData.lowStock, color: '#f59e0b' },
    { name: 'Out of Stock', value: inventoryData.outOfStock, color: '#ef4444' },
  ];

  const categoryChartData = categoryData.map(cat => ({
    name: cat.category,
    count: cat.count,
    value: cat.value,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Package className='h-5 w-5' />
          Inventory Analytics
        </CardTitle>
        <CardDescription>
          Comprehensive inventory insights and trends
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Top Row: Stock Status and Summary Stats */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Stock Status Distribution */}
          <div>
            <h4 className='font-medium text-sm mb-3'>
              Stock Status Distribution
            </h4>
            <div className='h-[300px]'>
              <DonutChart
                data={stockStatusData}
                config={{
                  'In Stock': {
                    label: 'In Stock',
                    color: '#10b981',
                  },
                  'Low Stock': {
                    label: 'Low Stock',
                    color: '#f59e0b',
                  },
                  'Out of Stock': {
                    label: 'Out of Stock',
                    color: '#ef4444',
                  },
                }}
                dataKey='value'
                nameKey='name'
                innerRadius={50}
                outerRadius={100}
              />
            </div>
          </div>

          {/* Summary Stats */}
          <div className='lg:col-span-2'>
            <h4 className='font-medium text-sm mb-3'>Inventory Summary</h4>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 h-[300px]'>
              <div className='flex flex-col items-center justify-center bg-green-50 rounded-lg border border-green-200'>
                <div className='text-4xl font-bold text-green-600 mb-2'>
                  {inventoryData.inStock}
                </div>
                <div className='text-sm text-green-700 font-medium'>
                  In Stock
                </div>
                <div className='text-xs text-green-600 mt-1'>
                  {inventoryData.totalProducts > 0
                    ? `${Math.round((inventoryData.inStock / inventoryData.totalProducts) * 100)}% of total`
                    : '0% of total'}
                </div>
              </div>
              <div className='flex flex-col items-center justify-center bg-red-50 rounded-lg border border-red-200'>
                <div className='text-4xl font-bold text-red-600 mb-2'>
                  {inventoryData.outOfStock}
                </div>
                <div className='text-sm text-red-700 font-medium'>
                  Out of Stock
                </div>
                <div className='text-xs text-red-600 mt-1'>
                  {inventoryData.totalProducts > 0
                    ? `${Math.round((inventoryData.outOfStock / inventoryData.totalProducts) * 100)}% of total`
                    : '0% of total'}
                </div>
              </div>
              <div className='flex flex-col items-center justify-center bg-yellow-50 rounded-lg border border-yellow-200'>
                <div className='text-4xl font-bold text-yellow-600 mb-2'>
                  {inventoryData.lowStock}
                </div>
                <div className='text-sm text-yellow-700 font-medium'>
                  Low Stock
                </div>
                <div className='text-xs text-yellow-600 mt-1'>
                  {inventoryData.totalProducts > 0
                    ? `${Math.round((inventoryData.lowStock / inventoryData.totalProducts) * 100)}% of total`
                    : '0% of total'}
                </div>
              </div>
              <div className='flex flex-col items-center justify-center bg-blue-50 rounded-lg border border-blue-200'>
                <div className='text-4xl font-bold text-blue-600 mb-2'>
                  {inventoryData.totalProducts}
                </div>
                <div className='text-sm text-blue-700 font-medium'>
                  Total Products
                </div>
                <div className='text-xs text-blue-600 mt-1'>All categories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Stock Movement and Category Distribution */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Stock Movement Trend */}
          <div>
            <h4 className='font-medium text-sm mb-3'>
              Stock Movement (7 Days) - Received vs Sold
            </h4>
            <div className='h-[350px]'>
              <LineChart
                data={stockMovement}
                config={{
                  incoming: {
                    label: 'Stock Received',
                    color: 'hsl(var(--chart-1))',
                  },
                  outgoing: {
                    label: 'Stock Sold',
                    color: 'hsl(var(--chart-2))',
                  },
                  net: {
                    label: 'Net Change',
                    color: 'hsl(var(--chart-3))',
                  },
                }}
                dataKey='incoming'
                xAxisKey='date'
                showLegend={true}
                className='h-full'
              />
            </div>
          </div>

          {/* Category Distribution */}
          <div>
            <h4 className='font-medium text-sm mb-3'>Products by Category</h4>
            <div className='h-[350px]'>
              <BarChart
                data={categoryChartData}
                config={{
                  count: {
                    label: 'Product Count',
                    color: 'hsl(var(--chart-1))',
                  },
                }}
                dataKey='count'
                xAxisKey='name'
                orientation='vertical'
                showLegend={false}
                className='h-full'
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
