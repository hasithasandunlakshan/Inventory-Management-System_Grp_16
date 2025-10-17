'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { BarChart, LineChart } from '@/components/charts';
import { Truck, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { analyticsService } from '@/lib/services/analyticsService';

interface SupplierData {
  name: string;
  orders: number;
  onTimeDelivery: number;
  qualityScore: number;
  totalValue: number;
  avgDeliveryTime: number;
}

interface DeliveryTrend {
  month: string;
  onTime: number;
  late: number;
  total: number;
}

export default function SupplierPerformanceChart() {
  const [supplierData, setSupplierData] = useState<SupplierData[]>([]);
  const [deliveryTrend, setDeliveryTrend] = useState<DeliveryTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        setLoading(true);

        const analytics = await analyticsService.getSupplierAnalytics();

        setSupplierData(analytics.supplierPerformance);
        setDeliveryTrend(analytics.deliveryTrend);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supplier Performance</CardTitle>
          <CardDescription>
            Supplier analytics and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-sm text-muted-foreground'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const totalOrders = supplierData.reduce(
    (sum, supplier) => sum + supplier.orders,
    0
  );
  const totalOnTime = supplierData.reduce(
    (sum, supplier) => sum + supplier.onTimeDelivery,
    0
  );
  const onTimeRate = (totalOnTime / totalOrders) * 100;
  const avgQualityScore =
    supplierData.reduce((sum, supplier) => sum + supplier.qualityScore, 0) /
    supplierData.length;

  const performanceData = supplierData.map(supplier => ({
    name: supplier.name,
    onTimeRate: (supplier.onTimeDelivery / supplier.orders) * 100,
    qualityScore: supplier.qualityScore,
    orders: supplier.orders,
  }));

  const deliveryTrendData = deliveryTrend.map(month => ({
    month: month.month,
    onTime: month.onTime,
    late: month.late,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Truck className='h-5 w-5' />
          Supplier Performance
        </CardTitle>
        <CardDescription>
          Supplier analytics and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Key Metrics */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='text-center p-3 bg-muted/50 rounded-lg'>
            <CheckCircle className='h-4 w-4 mx-auto mb-1 text-green-600' />
            <div className='text-lg font-bold'>{onTimeRate.toFixed(1)}%</div>
            <div className='text-xs text-muted-foreground'>On-Time Rate</div>
          </div>
          <div className='text-center p-3 bg-muted/50 rounded-lg'>
            <Clock className='h-4 w-4 mx-auto mb-1 text-blue-600' />
            <div className='text-lg font-bold'>{totalOrders}</div>
            <div className='text-xs text-muted-foreground'>Total Orders</div>
          </div>
          <div className='text-center p-3 bg-muted/50 rounded-lg'>
            <AlertCircle className='h-4 w-4 mx-auto mb-1 text-purple-600' />
            <div className='text-lg font-bold'>
              {avgQualityScore.toFixed(1)}
            </div>
            <div className='text-xs text-muted-foreground'>
              Avg Quality Score
            </div>
          </div>
          <div className='text-center p-3 bg-muted/50 rounded-lg'>
            <Truck className='h-4 w-4 mx-auto mb-1 text-orange-600' />
            <div className='text-lg font-bold'>{supplierData.length}</div>
            <div className='text-xs text-muted-foreground'>
              Active Suppliers
            </div>
          </div>
        </div>

        {/* Charts Row - Horizontal Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* On-Time Delivery Rate by Supplier */}
          <div>
            <h4 className='font-medium text-sm mb-3'>
              On-Time Delivery Rate by Supplier
            </h4>
            <div className='h-[300px]'>
              <BarChart
                data={performanceData}
                config={{
                  onTimeRate: {
                    label: 'On-Time Rate (%)',
                    color: 'hsl(var(--chart-1))',
                  },
                }}
                dataKey='onTimeRate'
                xAxisKey='name'
                orientation='vertical'
                showLegend={false}
                className='h-full'
              />
            </div>
          </div>

          {/* Delivery Performance Trend */}
          <div>
            <h4 className='font-medium text-sm mb-3'>
              Delivery Performance Trend
            </h4>
            <div className='h-[300px]'>
              <LineChart
                data={deliveryTrendData}
                config={{
                  onTime: {
                    label: 'On-Time Deliveries',
                    color: 'hsl(var(--chart-1))',
                  },
                  late: {
                    label: 'Late Deliveries',
                    color: 'hsl(var(--chart-2))',
                  },
                }}
                dataKey='onTime'
                xAxisKey='month'
                showLegend={true}
                className='h-full'
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
