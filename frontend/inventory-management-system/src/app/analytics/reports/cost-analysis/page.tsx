'use client';

import { useState, useEffect, useCallback } from 'react';
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
  costService,
  type InventoryCostResponse,
  type PurchaseOrderStats,
  type CostAnalysisMetrics,
} from '@/lib/services/costService';

// Beautiful Icon Components
const Icons = {
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
  CurrencyDollar: () => (
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
        d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
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

export default function CostAnalysisReportPage() {
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

  const [costLoading, setCostLoading] = useState(true);
  const [, setCostError] = useState<string | null>(null);
  const [inventoryCost, setInventoryCost] =
    useState<InventoryCostResponse | null>(null);
  const [purchaseStats, setPurchaseStats] = useState<PurchaseOrderStats | null>(
    null
  );
  const [costMetrics, setCostMetrics] = useState<CostAnalysisMetrics | null>(
    null
  );

  // Load cost analysis data
  useEffect(() => {
    const loadCostAnalysisData = async () => {
      setCostLoading(true);
      setCostError(null);
      try {
        console.log('💰 Loading cost analysis data from backend...', {
          dateFrom,
          dateTo,
        });
        const [inventoryCostData, purchaseStatsData, costMetricsData] =
          await Promise.all([
            costService.getInventoryCost(dateFrom, dateTo),
            costService.getPurchaseOrderStats(dateFrom, dateTo),
            costService.getCostAnalysisMetrics(dateFrom, dateTo),
          ]);

        console.log('💰 Cost analysis data loaded:', {
          inventoryCostData,
          purchaseStatsData,
          costMetricsData,
        });
        setInventoryCost(inventoryCostData);
        setPurchaseStats(purchaseStatsData);
        setCostMetrics(costMetricsData);
      } catch (err) {
        console.error('❌ Error loading cost analysis data:', err);
        setCostError('Failed to load cost analysis data');
      } finally {
        setCostLoading(false);
      }
    };

    loadCostAnalysisData();
  }, [dateFrom, dateTo]);

  const reloadData = useCallback(async () => {
    setCostLoading(true);
    setCostError(null);
    try {
      console.log('🔄 Reloading cost analysis data...', { dateFrom, dateTo });
      const [inventoryCostData, purchaseStatsData, costMetricsData] =
        await Promise.all([
          costService.getInventoryCost(dateFrom, dateTo),
          costService.getPurchaseOrderStats(dateFrom, dateTo),
          costService.getCostAnalysisMetrics(dateFrom, dateTo),
        ]);

      setInventoryCost(inventoryCostData);
      setPurchaseStats(purchaseStatsData);
      setCostMetrics(costMetricsData);
    } catch (err) {
      console.error('❌ Error reloading cost analysis data:', err);
      setCostError('Failed to reload cost analysis data');
    } finally {
      setCostLoading(false);
    }
  }, [dateFrom, dateTo]);

  return (
    <div className='min-h-screen'>
      {/* Header */}
      <div className='border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Cost Analysis Report
              </h1>
              <p className='mt-2 text-gray-600'>
                Inventory costs, purchase analysis, and cost optimization
                insights
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
        {/* Cost KPIs */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {/* Total Inventory Cost */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Inventory Value
              </CardTitle>
              <Icons.Package />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                $
                {inventoryCost?.totalAvailableInventoryCost
                  ? inventoryCost.totalAvailableInventoryCost.toFixed(2)
                  : '0.00'}
              </div>
              <p className='text-xs text-muted-foreground'>
                {inventoryCost?.totalProductsWithStock || 0} products in stock
              </p>
            </CardContent>
          </Card>

          {/* Purchase Costs */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Purchase Costs
              </CardTitle>
              <Icons.ShoppingCart />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                $
                {purchaseStats?.totalValue
                  ? purchaseStats.totalValue.toFixed(2)
                  : '0.00'}
              </div>
              <p className='text-xs text-muted-foreground'>
                {purchaseStats?.totalOrders || 0} purchase orders
              </p>
            </CardContent>
          </Card>

          {/* Total Costs */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Costs</CardTitle>
              <Icons.CurrencyDollar />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                $
                {costMetrics?.totalCosts
                  ? costMetrics.totalCosts.toFixed(2)
                  : '0.00'}
              </div>
              <p className='text-xs text-muted-foreground'>
                Combined inventory + purchases
              </p>
            </CardContent>
          </Card>

          {/* Cost per Product */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Cost per Product
              </CardTitle>
              <Icons.TrendingUp />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                $
                {costMetrics?.costPerProduct
                  ? costMetrics.costPerProduct.toFixed(2)
                  : '0.00'}
              </div>
              <p className='text-xs text-muted-foreground'>
                Average cost per item
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cost Analysis Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
              <CardDescription>
                Distribution of costs between inventory and purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {costLoading ? (
                <div className='flex items-center justify-center h-40'>
                  <div className='text-sm text-muted-foreground'>
                    Loading cost data...
                  </div>
                </div>
              ) : costMetrics ? (
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium'>Inventory Value</span>
                    <span className='text-sm text-muted-foreground'>
                      $
                      {costMetrics.inventoryCost
                        ? costMetrics.inventoryCost.toFixed(2)
                        : '0.00'}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-500 h-2 rounded-full'
                      style={{
                        width: `${costMetrics.totalCosts && costMetrics.totalCosts > 0 && costMetrics.inventoryCost ? (costMetrics.inventoryCost / costMetrics.totalCosts) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium'>Purchase Costs</span>
                    <span className='text-sm text-muted-foreground'>
                      $
                      {costMetrics.purchaseCosts
                        ? costMetrics.purchaseCosts.toFixed(2)
                        : '0.00'}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-green-500 h-2 rounded-full'
                      style={{
                        width: `${costMetrics.totalCosts && costMetrics.totalCosts > 0 && costMetrics.purchaseCosts ? (costMetrics.purchaseCosts / costMetrics.totalCosts) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className='flex items-center justify-center h-40'>
                  <div className='text-sm text-muted-foreground'>
                    No cost data available
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Purchase Order Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Analysis</CardTitle>
              <CardDescription>
                Purchase order statistics and supplier insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {costLoading ? (
                <div className='flex items-center justify-center h-40'>
                  <div className='text-sm text-muted-foreground'>
                    Loading purchase data...
                  </div>
                </div>
              ) : purchaseStats ? (
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='text-center p-4 border rounded-lg'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {purchaseStats.totalOrders}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Total Orders
                      </div>
                    </div>
                    <div className='text-center p-4 border rounded-lg'>
                      <div className='text-2xl font-bold text-green-600'>
                        ${purchaseStats.averageOrderValue?.toFixed(2) || '0.00'}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Avg Order Value
                      </div>
                    </div>
                  </div>
                  <div className='text-center p-4 border rounded-lg'>
                    <div className='text-2xl font-bold text-purple-600'>
                      ${purchaseStats.totalValue?.toFixed(2) || '0.00'}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Total Purchase Value
                    </div>
                  </div>
                </div>
              ) : (
                <div className='flex items-center justify-center h-40'>
                  <div className='text-sm text-muted-foreground'>
                    No purchase data available
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Cost Analysis Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Cost Analysis</CardTitle>
            <CardDescription>
              Comprehensive cost breakdown and analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {costLoading ? (
              <div className='flex items-center justify-center h-40'>
                <div className='text-sm text-muted-foreground'>
                  Loading cost analysis...
                </div>
              </div>
            ) : costMetrics ? (
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b'>
                      <th className='text-left py-2'>Cost Category</th>
                      <th className='text-right py-2'>Amount</th>
                      <th className='text-right py-2'>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className='border-b'>
                      <td className='py-2'>Inventory Cost</td>
                      <td className='text-right py-2'>
                        ${costMetrics.inventoryCost?.toFixed(2) || '0.00'}
                      </td>
                      <td className='text-right py-2'>
                        {costMetrics.totalCosts &&
                        costMetrics.totalCosts > 0 &&
                        costMetrics.inventoryCost
                          ? (
                              (costMetrics.inventoryCost /
                                costMetrics.totalCosts) *
                              100
                            ).toFixed(1)
                          : '0.0'}
                        %
                      </td>
                    </tr>
                    <tr className='border-b'>
                      <td className='py-2'>Purchase Costs</td>
                      <td className='text-right py-2'>
                        ${costMetrics.purchaseCosts?.toFixed(2) || '0.00'}
                      </td>
                      <td className='text-right py-2'>
                        {costMetrics.totalCosts &&
                        costMetrics.totalCosts > 0 &&
                        costMetrics.purchaseCosts
                          ? (
                              (costMetrics.purchaseCosts /
                                costMetrics.totalCosts) *
                              100
                            ).toFixed(1)
                          : '0.0'}
                        %
                      </td>
                    </tr>
                    <tr className='border-b font-semibold'>
                      <td className='py-2'>Total Costs</td>
                      <td className='text-right py-2'>
                        ${costMetrics.totalCosts?.toFixed(2) || '0.00'}
                      </td>
                      <td className='text-right py-2'>100.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='flex items-center justify-center h-40'>
                <div className='text-sm text-muted-foreground'>
                  No cost analysis data available
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
