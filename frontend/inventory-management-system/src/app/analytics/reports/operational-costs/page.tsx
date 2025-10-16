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
  profitabilityService,
  type LogisticsCostAnalysis,
  type OperationalEfficiencyMetrics,
} from '@/lib/services/profitabilityService';

// Beautiful Icon Components
const Icons = {
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

export default function OperationalCostsReportPage() {
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

  const [operationalLoading, setOperationalLoading] = useState(true);
  const [operationalError, setOperationalError] = useState<string | null>(null);
  const [logisticsCostAnalysis, setLogisticsCostAnalysis] = useState<LogisticsCostAnalysis | null>(null);
  const [operationalEfficiency, setOperationalEfficiency] = useState<OperationalEfficiencyMetrics | null>(null);

  // Load operational costs data
  useEffect(() => {
    const loadOperationalCostsData = async () => {
      setOperationalLoading(true);
      setOperationalError(null);
      try {
        console.log('🚚 Loading operational costs data from backend...', { dateFrom, dateTo });
        const [logisticsCost, operational] = await Promise.all([
          profitabilityService.getLogisticsCostAnalysis(dateFrom, dateTo),
          profitabilityService.getOperationalEfficiencyMetrics(dateFrom, dateTo),
        ]);
        
        console.log('🚚 Operational costs data loaded:', { logisticsCost, operational });
        setLogisticsCostAnalysis(logisticsCost);
        setOperationalEfficiency(operational);
      } catch (err) {
        console.error('❌ Error loading operational costs data:', err);
        setOperationalError('Failed to load operational costs data');
      } finally {
        setOperationalLoading(false);
      }
    };

    loadOperationalCostsData();
  }, [dateFrom, dateTo]);

  const reloadData = useCallback(async () => {
    setOperationalLoading(true);
    setOperationalError(null);
    try {
      console.log('🔄 Reloading operational costs data...', { dateFrom, dateTo });
      const [logisticsCost, operational] = await Promise.all([
        profitabilityService.getLogisticsCostAnalysis(dateFrom, dateTo),
        profitabilityService.getOperationalEfficiencyMetrics(dateFrom, dateTo),
      ]);
      
      setLogisticsCostAnalysis(logisticsCost);
      setOperationalEfficiency(operational);
    } catch (err) {
      console.error('❌ Error reloading operational costs data:', err);
      setOperationalError('Failed to reload operational costs data');
    } finally {
      setOperationalLoading(false);
    }
  }, [dateFrom, dateTo]);

  return (
    <div className='min-h-screen'>
      {/* Header */}
      <div className='border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Operational Costs Report</h1>
              <p className='mt-2 text-gray-600'>
                Logistics costs, delivery analysis, and operational efficiency metrics
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
        {/* Operational Cost KPIs */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {/* Total Logistics Cost */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Logistics Cost
              </CardTitle>
              <Icons.Truck />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                $
                {logisticsCostAnalysis?.totalLogisticsCost
                  ? logisticsCostAnalysis.totalLogisticsCost.toFixed(2)
                  : '0.00'}
              </div>
              <p className='text-xs text-muted-foreground'>
                {logisticsCostAnalysis?.efficiencyScore
                  ? logisticsCostAnalysis.efficiencyScore.toFixed(1)
                  : '0.0'}
                % efficiency
              </p>
            </CardContent>
          </Card>

          {/* Delivery Costs */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Delivery Costs
              </CardTitle>
              <Icons.Package />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                $
                {logisticsCostAnalysis?.deliveryCosts
                  ? logisticsCostAnalysis.deliveryCosts.toFixed(2)
                  : '0.00'}
              </div>
              <p className='text-xs text-muted-foreground'>
                $
                {logisticsCostAnalysis?.costPerDelivery
                  ? logisticsCostAnalysis.costPerDelivery.toFixed(2)
                  : '0.00'}{' '}
                per delivery
              </p>
            </CardContent>
          </Card>

          {/* Vehicle Costs */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Vehicle Costs
              </CardTitle>
              <Icons.Truck />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                $
                {logisticsCostAnalysis?.vehicleCosts
                  ? logisticsCostAnalysis.vehicleCosts.toFixed(2)
                  : '0.00'}
              </div>
              <p className='text-xs text-muted-foreground'>
                Fleet maintenance & fuel
              </p>
            </CardContent>
          </Card>

          {/* Driver Costs */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Driver Costs
              </CardTitle>
              <Icons.TrendingUp />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                $
                {logisticsCostAnalysis?.driverCosts
                  ? logisticsCostAnalysis.driverCosts.toFixed(2)
                  : '0.00'}
              </div>
              <p className='text-xs text-muted-foreground'>
                Wages & benefits
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Operational Efficiency Metrics */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Logistics Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Logistics Cost Breakdown</CardTitle>
              <CardDescription>
                Distribution of operational costs across different categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {operationalLoading ? (
                <div className='flex items-center justify-center h-40'>
                  <div className='text-sm text-muted-foreground'>
                    Loading logistics data...
                  </div>
                </div>
              ) : logisticsCostAnalysis ? (
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium'>
                      Delivery Costs
                    </span>
                    <span className='text-sm text-muted-foreground'>
                      $
                      {logisticsCostAnalysis.deliveryCosts
                        ? logisticsCostAnalysis.deliveryCosts.toFixed(2)
                        : '0.00'}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-500 h-2 rounded-full'
                      style={{
                        width: `${
                          logisticsCostAnalysis.totalLogisticsCost &&
                          logisticsCostAnalysis.totalLogisticsCost > 0 &&
                          logisticsCostAnalysis.deliveryCosts
                            ? (logisticsCostAnalysis.deliveryCosts /
                                logisticsCostAnalysis.totalLogisticsCost) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium'>
                      Vehicle Costs
                    </span>
                    <span className='text-sm text-muted-foreground'>
                      $
                      {logisticsCostAnalysis.vehicleCosts
                        ? logisticsCostAnalysis.vehicleCosts.toFixed(2)
                        : '0.00'}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-green-500 h-2 rounded-full'
                      style={{
                        width: `${
                          logisticsCostAnalysis.totalLogisticsCost &&
                          logisticsCostAnalysis.totalLogisticsCost > 0 &&
                          logisticsCostAnalysis.vehicleCosts
                            ? (logisticsCostAnalysis.vehicleCosts /
                                logisticsCostAnalysis.totalLogisticsCost) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium'>
                      Driver Costs
                    </span>
                    <span className='text-sm text-muted-foreground'>
                      $
                      {logisticsCostAnalysis.driverCosts
                        ? logisticsCostAnalysis.driverCosts.toFixed(2)
                        : '0.00'}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-purple-500 h-2 rounded-full'
                      style={{
                        width: `${
                          logisticsCostAnalysis.totalLogisticsCost &&
                          logisticsCostAnalysis.totalLogisticsCost > 0 &&
                          logisticsCostAnalysis.driverCosts
                            ? (logisticsCostAnalysis.driverCosts /
                                logisticsCostAnalysis.totalLogisticsCost) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className='flex items-center justify-center h-40'>
                  <div className='text-sm text-muted-foreground'>
                    No logistics cost data available
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Operational Efficiency Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Operational Efficiency Metrics</CardTitle>
              <CardDescription>
                Key performance indicators for operational efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              {operationalLoading ? (
                <div className='flex items-center justify-center h-40'>
                  <div className='text-sm text-muted-foreground'>
                    Loading efficiency data...
                  </div>
                </div>
              ) : operationalEfficiency ? (
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='text-center p-4 border rounded-lg'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {operationalEfficiency.orderFulfillmentRate?.toFixed(1) || '0.0'}%
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Order Fulfillment Rate
                      </div>
                    </div>
                    <div className='text-center p-4 border rounded-lg'>
                      <div className='text-2xl font-bold text-green-600'>
                        {operationalEfficiency.inventoryTurnover?.toFixed(1) || '0.0'}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Inventory Turnover
                      </div>
                    </div>
                  </div>
                  <div className='text-center p-4 border rounded-lg'>
                    <div className='text-2xl font-bold text-purple-600'>
                      {operationalEfficiency.customerSatisfactionScore?.toFixed(1) || '0.0'}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Customer Satisfaction Score
                    </div>
                  </div>
                  <div className='text-center p-4 border rounded-lg'>
                    <div className='text-2xl font-bold text-orange-600'>
                      {operationalEfficiency.operationalCostRatio?.toFixed(1) || '0.0'}%
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Operational Cost Ratio
                    </div>
                  </div>
                </div>
              ) : (
                <div className='flex items-center justify-center h-40'>
                  <div className='text-sm text-muted-foreground'>
                    No efficiency data available
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cost Optimization Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Optimization Recommendations</CardTitle>
            <CardDescription>
              Suggestions for improving operational efficiency and reducing costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='p-4 border rounded-lg bg-blue-50'>
                <h4 className='font-semibold text-blue-900 mb-2'>Delivery Optimization</h4>
                <p className='text-sm text-blue-800'>
                  Consider consolidating delivery routes to reduce fuel costs and improve efficiency.
                  Current cost per delivery: ${logisticsCostAnalysis?.costPerDelivery?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className='p-4 border rounded-lg bg-green-50'>
                <h4 className='font-semibold text-green-900 mb-2'>Vehicle Utilization</h4>
                <p className='text-sm text-green-800'>
                  Optimize vehicle utilization to reduce maintenance costs and improve fleet efficiency.
                  Current efficiency score: {logisticsCostAnalysis?.efficiencyScore?.toFixed(1) || '0.0'}%
                </p>
              </div>
              <div className='p-4 border rounded-lg bg-purple-50'>
                <h4 className='font-semibold text-purple-900 mb-2'>Driver Performance</h4>
                <p className='text-sm text-purple-800'>
                  Implement driver performance tracking to optimize routes and reduce operational costs.
                  Focus on training and efficiency improvements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
