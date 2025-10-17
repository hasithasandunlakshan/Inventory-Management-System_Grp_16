'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Car, Package, TrendingUp, Activity, Clock } from 'lucide-react';
import { logisticsService } from '@/lib/services/logisticsService';
import type { LogisticsMetrics } from '@/lib/services/logisticsService';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
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
  warningBg: '#FEF3C7',
  error: '#EF4444',
  bgCard: '#FFFFFF',
  borderDefault: '#E2E8F0',
};

export default function LogisticsTab() {
  const [logisticsData, setLogisticsData] = useState<LogisticsMetrics | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLogisticsData();
  }, []);

  const loadLogisticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await logisticsService.getLogisticsMetrics();
      setLogisticsData(data);
    } catch (err) {
      setError('Failed to load logistics data');
      console.error('Error loading logistics data:', err);
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

  if (error || !logisticsData) {
    return (
      <Card
        style={{
          backgroundColor: CustomerColors.bgCard,
          border: `1px solid ${CustomerColors.borderDefault}`,
        }}
      >
        <CardContent className='p-6'>
          <div className='text-center text-red-600'>
            <Truck className='mx-auto h-12 w-12 mb-4' />
            <p>{error || 'No logistics data available'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const performanceData = [
    {
      metric: 'Delivery Success',
      value: Math.round(logisticsData.deliverySuccessRate * 100),
    },
    {
      metric: 'Driver Utilization',
      value: Math.round(logisticsData.driverUtilization * 100),
    },
    {
      metric: 'Vehicle Utilization',
      value: Math.round(logisticsData.vehicleUtilization * 100),
    },
    {
      metric: 'Inventory Turnover',
      value: Math.min(Math.round(logisticsData.inventoryTurnover * 10), 100),
    },
  ];

  const utilizationData = [
    {
      name: 'Driver Utilization',
      value: Math.round(logisticsData.driverUtilization * 100),
      color: CustomerColors.brandBlue,
    },
    {
      name: 'Vehicle Utilization',
      value: Math.round(logisticsData.vehicleUtilization * 100),
      color: CustomerColors.accentBlue,
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Logistics Metrics Cards */}
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
              <Truck
                className='h-4 w-4 mr-2'
                style={{ color: CustomerColors.success }}
              />
              Delivery Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className='text-3xl font-bold'
              style={{ color: CustomerColors.success }}
            >
              {Math.round(logisticsData.deliverySuccessRate * 100)}%
            </div>
            <p
              className='text-xs mt-1'
              style={{ color: CustomerColors.textSecondary }}
            >
              Successful deliveries
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
              <Package
                className='h-4 w-4 mr-2'
                style={{ color: CustomerColors.brandBlue }}
              />
              Total Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className='text-3xl font-bold'
              style={{ color: CustomerColors.brandDark }}
            >
              {logisticsData.totalDeliveries.toLocaleString()}
            </div>
            <p
              className='text-xs mt-1'
              style={{ color: CustomerColors.textSecondary }}
            >
              All-time deliveries
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
              <TrendingUp
                className='h-4 w-4 mr-2'
                style={{ color: CustomerColors.brandBlue }}
              />
              Driver Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className='text-3xl font-bold'
              style={{ color: CustomerColors.brandBlue }}
            >
              {Math.round(logisticsData.driverUtilization * 100)}%
            </div>
            <p
              className='text-xs mt-1'
              style={{ color: CustomerColors.textSecondary }}
            >
              Driver efficiency
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
              <Car
                className='h-4 w-4 mr-2'
                style={{ color: CustomerColors.accentBlue }}
              />
              Vehicle Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className='text-3xl font-bold'
              style={{ color: CustomerColors.accentBlue }}
            >
              {Math.round(logisticsData.vehicleUtilization * 100)}%
            </div>
            <p
              className='text-xs mt-1'
              style={{ color: CustomerColors.textSecondary }}
            >
              Fleet efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Performance Radar Chart */}
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
              <Activity
                className='h-5 w-5 mr-2'
                style={{ color: CustomerColors.brandBlue }}
              />
              Performance Overview
            </CardTitle>
            <p
              className='text-sm'
              style={{ color: CustomerColors.textSecondary }}
            >
              Key logistics metrics at a glance
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <RadarChart data={performanceData}>
                <PolarGrid stroke={CustomerColors.borderDefault} />
                <PolarAngleAxis
                  dataKey='metric'
                  tick={{ fill: CustomerColors.textPrimary, fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: CustomerColors.textSecondary, fontSize: 10 }}
                />
                <Radar
                  name='Performance'
                  dataKey='value'
                  stroke={CustomerColors.brandBlue}
                  fill={CustomerColors.brandBlue}
                  fillOpacity={0.6}
                />
                <ChartTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Utilization Bar Chart */}
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
              <TrendingUp
                className='h-5 w-5 mr-2'
                style={{ color: CustomerColors.brandBlue }}
              />
              Resource Utilization
            </CardTitle>
            <p
              className='text-sm'
              style={{ color: CustomerColors.textSecondary }}
            >
              Driver and vehicle efficiency comparison
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: 'Utilization %',
                  color: CustomerColors.brandBlue,
                },
              }}
              className='h-[300px]'
            >
              <BarChart data={utilizationData} layout='vertical'>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke={CustomerColors.borderDefault}
                />
                <XAxis
                  type='number'
                  domain={[0, 100]}
                  stroke={CustomerColors.textSecondary}
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  type='category'
                  dataKey='name'
                  stroke={CustomerColors.textSecondary}
                  style={{ fontSize: '12px' }}
                  width={150}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey='value' radius={[0, 8, 8, 0]} name='Utilization %'>
                  {utilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics Table */}
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
            <Activity
              className='h-5 w-5 mr-2'
              style={{ color: CustomerColors.brandBlue }}
            />
            Detailed Performance Metrics
          </CardTitle>
          <p
            className='text-sm'
            style={{ color: CustomerColors.textSecondary }}
          >
            Comprehensive logistics performance indicators
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: CustomerColors.borderDefault }}>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Metric
                </TableHead>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Value
                </TableHead>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Status
                </TableHead>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Performance
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow style={{ borderColor: CustomerColors.borderDefault }}>
                <TableCell
                  className='font-medium'
                  style={{ color: CustomerColors.textPrimary }}
                >
                  <div className='flex items-center'>
                    <Truck
                      className='h-4 w-4 mr-2'
                      style={{ color: CustomerColors.success }}
                    />
                    Delivery Success Rate
                  </div>
                </TableCell>
                <TableCell
                  className='text-lg font-semibold'
                  style={{ color: CustomerColors.success }}
                >
                  {Math.round(logisticsData.deliverySuccessRate * 100)}%
                </TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor:
                        logisticsData.deliverySuccessRate > 0.9
                          ? CustomerColors.successBg
                          : CustomerColors.warningBg,
                      color:
                        logisticsData.deliverySuccessRate > 0.9
                          ? CustomerColors.success
                          : CustomerColors.warning,
                    }}
                  >
                    {logisticsData.deliverySuccessRate > 0.9
                      ? 'Excellent'
                      : 'Good'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className='flex items-center'>
                    <div
                      className='h-2 rounded-full mr-2'
                      style={{
                        width: `${logisticsData.deliverySuccessRate * 100}%`,
                        backgroundColor: CustomerColors.success,
                        minWidth: '20px',
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>

              <TableRow style={{ borderColor: CustomerColors.borderDefault }}>
                <TableCell
                  className='font-medium'
                  style={{ color: CustomerColors.textPrimary }}
                >
                  <div className='flex items-center'>
                    <Clock
                      className='h-4 w-4 mr-2'
                      style={{ color: CustomerColors.brandBlue }}
                    />
                    Average Delivery Time
                  </div>
                </TableCell>
                <TableCell
                  className='text-lg font-semibold'
                  style={{ color: CustomerColors.brandDark }}
                >
                  {logisticsData.averageDeliveryTime.toFixed(1)} hrs
                </TableCell>
                <TableCell>
                  <Badge
                    variant='outline'
                    style={{
                      borderColor: CustomerColors.brandBlue,
                      color: CustomerColors.brandBlue,
                    }}
                  >
                    Normal
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className='text-xs'
                    style={{ color: CustomerColors.textSecondary }}
                  >
                    Within target range
                  </span>
                </TableCell>
              </TableRow>

              <TableRow style={{ borderColor: CustomerColors.borderDefault }}>
                <TableCell
                  className='font-medium'
                  style={{ color: CustomerColors.textPrimary }}
                >
                  <div className='flex items-center'>
                    <TrendingUp
                      className='h-4 w-4 mr-2'
                      style={{ color: CustomerColors.brandBlue }}
                    />
                    Driver Utilization
                  </div>
                </TableCell>
                <TableCell
                  className='text-lg font-semibold'
                  style={{ color: CustomerColors.brandBlue }}
                >
                  {Math.round(logisticsData.driverUtilization * 100)}%
                </TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor:
                        logisticsData.driverUtilization > 0.8
                          ? CustomerColors.successBg
                          : CustomerColors.warningBg,
                      color:
                        logisticsData.driverUtilization > 0.8
                          ? CustomerColors.success
                          : CustomerColors.warning,
                    }}
                  >
                    {logisticsData.driverUtilization > 0.8
                      ? 'High'
                      : 'Moderate'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className='flex items-center'>
                    <div
                      className='h-2 rounded-full mr-2'
                      style={{
                        width: `${logisticsData.driverUtilization * 100}%`,
                        backgroundColor: CustomerColors.brandBlue,
                        minWidth: '20px',
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>

              <TableRow style={{ borderColor: CustomerColors.borderDefault }}>
                <TableCell
                  className='font-medium'
                  style={{ color: CustomerColors.textPrimary }}
                >
                  <div className='flex items-center'>
                    <Car
                      className='h-4 w-4 mr-2'
                      style={{ color: CustomerColors.accentBlue }}
                    />
                    Vehicle Utilization
                  </div>
                </TableCell>
                <TableCell
                  className='text-lg font-semibold'
                  style={{ color: CustomerColors.accentBlue }}
                >
                  {Math.round(logisticsData.vehicleUtilization * 100)}%
                </TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor:
                        logisticsData.vehicleUtilization > 0.8
                          ? CustomerColors.successBg
                          : CustomerColors.warningBg,
                      color:
                        logisticsData.vehicleUtilization > 0.8
                          ? CustomerColors.success
                          : CustomerColors.warning,
                    }}
                  >
                    {logisticsData.vehicleUtilization > 0.8
                      ? 'High'
                      : 'Moderate'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className='flex items-center'>
                    <div
                      className='h-2 rounded-full mr-2'
                      style={{
                        width: `${logisticsData.vehicleUtilization * 100}%`,
                        backgroundColor: CustomerColors.accentBlue,
                        minWidth: '20px',
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>

              <TableRow style={{ borderColor: CustomerColors.borderDefault }}>
                <TableCell
                  className='font-medium'
                  style={{ color: CustomerColors.textPrimary }}
                >
                  <div className='flex items-center'>
                    <Clock
                      className='h-4 w-4 mr-2'
                      style={{ color: CustomerColors.brandMedium }}
                    />
                    Order Processing Time
                  </div>
                </TableCell>
                <TableCell
                  className='text-lg font-semibold'
                  style={{ color: CustomerColors.brandDark }}
                >
                  {logisticsData.orderProcessingTime.toFixed(1)} hrs
                </TableCell>
                <TableCell>
                  <Badge
                    variant='outline'
                    style={{
                      borderColor: CustomerColors.brandMedium,
                      color: CustomerColors.brandMedium,
                    }}
                  >
                    Efficient
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className='text-xs'
                    style={{ color: CustomerColors.textSecondary }}
                  >
                    Fast processing
                  </span>
                </TableCell>
              </TableRow>

              <TableRow style={{ borderColor: CustomerColors.borderDefault }}>
                <TableCell
                  className='font-medium'
                  style={{ color: CustomerColors.textPrimary }}
                >
                  <div className='flex items-center'>
                    <Package
                      className='h-4 w-4 mr-2'
                      style={{ color: CustomerColors.success }}
                    />
                    Inventory Turnover
                  </div>
                </TableCell>
                <TableCell
                  className='text-lg font-semibold'
                  style={{ color: CustomerColors.success }}
                >
                  {logisticsData.inventoryTurnover.toFixed(1)}x
                </TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor: CustomerColors.successBg,
                      color: CustomerColors.success,
                    }}
                  >
                    Healthy
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className='text-xs'
                    style={{ color: CustomerColors.textSecondary }}
                  >
                    Good inventory flow
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
