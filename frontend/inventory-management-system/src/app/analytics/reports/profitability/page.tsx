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
  profitabilityService,
  type GrossProfitAnalysis,
  type DiscountImpactAnalysis,
  type OrderProfitability,
  type LogisticsCostAnalysis,
  type OperationalEfficiencyMetrics,
} from '@/lib/services/profitabilityService';

// Beautiful Icon Components
const Icons = {
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

export default function ProfitabilityReportPage() {
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

  const [profitabilityLoading, setProfitabilityLoading] = useState(true);
  const [, setProfitabilityError] = useState<string | null>(null);
  const [grossProfitAnalysis, setGrossProfitAnalysis] =
    useState<GrossProfitAnalysis | null>(null);
  const [discountImpactAnalysis, setDiscountImpactAnalysis] =
    useState<DiscountImpactAnalysis | null>(null);
  const [orderProfitability, setOrderProfitability] =
    useState<OrderProfitability | null>(null);
  const [, setLogisticsCostAnalysis] = useState<LogisticsCostAnalysis | null>(
    null
  );
  const [operationalEfficiency, setOperationalEfficiency] =
    useState<OperationalEfficiencyMetrics | null>(null);

  // Load profitability analysis data
  useEffect(() => {
    const loadProfitabilityAnalysis = async () => {
      setProfitabilityLoading(true);
      setProfitabilityError(null);
      try {
        console.log('💰 Loading profitability analysis data from backend...', {
          dateFrom,
          dateTo,
        });
        const [
          grossProfit,
          discountImpact,
          orderProfit,
          logisticsCost,
          operational,
        ] = await Promise.all([
          profitabilityService.getGrossProfitAnalysis(),
          profitabilityService.getDiscountImpactAnalysis(),
          profitabilityService.getOrderProfitability(),
          profitabilityService.getLogisticsCostAnalysis(),
          profitabilityService.getOperationalEfficiencyMetrics(),
        ]);

        console.log('💰 Profitability analysis data loaded:', {
          grossProfit,
          discountImpact,
          orderProfit,
          logisticsCost,
          operational,
        });
        setGrossProfitAnalysis(grossProfit);
        setDiscountImpactAnalysis(discountImpact);
        setOrderProfitability(orderProfit);
        setLogisticsCostAnalysis(logisticsCost);
        setOperationalEfficiency(operational);
      } catch (err) {
        console.error('❌ Error loading profitability analysis data:', err);
        setProfitabilityError('Failed to load profitability analysis data');
      } finally {
        setProfitabilityLoading(false);
      }
    };

    loadProfitabilityAnalysis();
  }, [dateFrom, dateTo]);

  const reloadData = useCallback(async () => {
    setProfitabilityLoading(true);
    setProfitabilityError(null);
    try {
      console.log('🔄 Reloading profitability analysis data...', {
        dateFrom,
        dateTo,
      });
      const [
        grossProfit,
        discountImpact,
        orderProfit,
        logisticsCost,
        operational,
      ] = await Promise.all([
        profitabilityService.getGrossProfitAnalysis(),
        profitabilityService.getDiscountImpactAnalysis(),
        profitabilityService.getOrderProfitability(),
        profitabilityService.getLogisticsCostAnalysis(),
        profitabilityService.getOperationalEfficiencyMetrics(),
      ]);

      setGrossProfitAnalysis(grossProfit);
      setDiscountImpactAnalysis(discountImpact);
      setOrderProfitability(orderProfit);
      setLogisticsCostAnalysis(logisticsCost);
      setOperationalEfficiency(operational);
    } catch (err) {
      console.error('❌ Error reloading profitability analysis data:', err);
      setProfitabilityError('Failed to reload profitability analysis data');
    } finally {
      setProfitabilityLoading(false);
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
                Profitability Report
              </h1>
              <p className='mt-2 text-gray-600'>
                Gross profit analysis, discount impact, and order profitability
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
        {/* Profitability KPIs */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {/* Gross Profit */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Gross Profit
              </CardTitle>
              <Icons.TrendingUp />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                $
                {grossProfitAnalysis?.grossProfit
                  ? grossProfitAnalysis.grossProfit.toFixed(2)
                  : '0.00'}
              </div>
              <p className='text-xs text-muted-foreground'>
                {grossProfitAnalysis?.grossProfitMargin
                  ? grossProfitAnalysis.grossProfitMargin.toFixed(1)
                  : '0.0'}
                % margin
              </p>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Revenue
              </CardTitle>
              <Icons.CurrencyDollar />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                $
                {grossProfitAnalysis?.totalRevenue
                  ? grossProfitAnalysis.totalRevenue.toFixed(2)
                  : '0.00'}
              </div>
              <p className='text-xs text-muted-foreground'>
                {grossProfitAnalysis?.revenueGrowth
                  ? (grossProfitAnalysis.revenueGrowth > 0 ? '+' : '') +
                    grossProfitAnalysis.revenueGrowth.toFixed(1) +
                    '%'
                  : '0.0%'}{' '}
                growth
              </p>
            </CardContent>
          </Card>

          {/* Cost of Goods Sold */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>COGS</CardTitle>
              <Icons.Package />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                $
                {grossProfitAnalysis?.totalCostOfGoodsSold
                  ? grossProfitAnalysis.totalCostOfGoodsSold.toFixed(2)
                  : '0.00'}
              </div>
              <p className='text-xs text-muted-foreground'>
                {grossProfitAnalysis?.costGrowth
                  ? (grossProfitAnalysis.costGrowth > 0 ? '+' : '') +
                    grossProfitAnalysis.costGrowth.toFixed(1) +
                    '%'
                  : '0.0%'}{' '}
                change
              </p>
            </CardContent>
          </Card>

          {/* Discount Impact */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Discount Impact
              </CardTitle>
              <Icons.CreditCard />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-orange-600'>
                $
                {discountImpactAnalysis?.totalDiscountsGiven
                  ? discountImpactAnalysis.totalDiscountsGiven.toFixed(2)
                  : '0.00'}
              </div>
              <p className='text-xs text-muted-foreground'>
                {discountImpactAnalysis?.discountPercentage
                  ? discountImpactAnalysis.discountPercentage.toFixed(1)
                  : '0.0'}
                % of revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Profitability Analysis Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Gross Profit Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Gross Profit Analysis</CardTitle>
              <CardDescription>
                Revenue vs. Cost of Goods Sold breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profitabilityLoading ? (
                <div className='flex items-center justify-center h-40'>
                  <div className='text-sm text-muted-foreground'>
                    Loading profitability data...
                  </div>
                </div>
              ) : grossProfitAnalysis ? (
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium'>Revenue</span>
                    <span className='text-sm text-muted-foreground'>
                      $
                      {grossProfitAnalysis.totalRevenue
                        ? grossProfitAnalysis.totalRevenue.toFixed(2)
                        : '0.00'}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-green-500 h-2 rounded-full'
                      style={{
                        width: `${grossProfitAnalysis.totalRevenue && grossProfitAnalysis.totalRevenue > 0 ? 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium'>
                      Cost of Goods Sold
                    </span>
                    <span className='text-sm text-muted-foreground'>
                      $
                      {grossProfitAnalysis.totalCostOfGoodsSold
                        ? grossProfitAnalysis.totalCostOfGoodsSold.toFixed(2)
                        : '0.00'}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-red-500 h-2 rounded-full'
                      style={{
                        width: `${grossProfitAnalysis.totalRevenue && grossProfitAnalysis.totalRevenue > 0 && grossProfitAnalysis.totalCostOfGoodsSold ? (grossProfitAnalysis.totalCostOfGoodsSold / grossProfitAnalysis.totalRevenue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium'>Gross Profit</span>
                    <span className='text-sm text-muted-foreground'>
                      $
                      {grossProfitAnalysis.grossProfit
                        ? grossProfitAnalysis.grossProfit.toFixed(2)
                        : '0.00'}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-500 h-2 rounded-full'
                      style={{
                        width: `${grossProfitAnalysis.totalRevenue && grossProfitAnalysis.totalRevenue > 0 && grossProfitAnalysis.grossProfit ? (grossProfitAnalysis.grossProfit / grossProfitAnalysis.totalRevenue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className='flex items-center justify-center h-40'>
                  <div className='text-sm text-muted-foreground'>
                    No profitability data available
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Discount Impact Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Impact Analysis</CardTitle>
              <CardDescription>
                Impact of discounts on revenue and profitability
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profitabilityLoading ? (
                <div className='flex items-center justify-center h-40'>
                  <div className='text-sm text-muted-foreground'>
                    Loading discount data...
                  </div>
                </div>
              ) : discountImpactAnalysis ? (
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='text-center p-4 border rounded-lg'>
                      <div className='text-2xl font-bold text-orange-600'>
                        $
                        {discountImpactAnalysis.totalDiscountsGiven?.toFixed(
                          2
                        ) || '0.00'}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Total Discounts
                      </div>
                    </div>
                    <div className='text-center p-4 border rounded-lg'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {discountImpactAnalysis.discountPercentage?.toFixed(
                          1
                        ) || '0.0'}
                        %
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Discount Rate
                      </div>
                    </div>
                  </div>
                  <div className='text-center p-4 border rounded-lg'>
                    <div className='text-2xl font-bold text-green-600'>
                      ${discountImpactAnalysis.netRevenue?.toFixed(2) || '0.00'}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Revenue with Discounts
                    </div>
                  </div>
                </div>
              ) : (
                <div className='flex items-center justify-center h-40'>
                  <div className='text-sm text-muted-foreground'>
                    No discount data available
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Profitability Analysis */}
        {orderProfitability && (
          <Card className='mb-8'>
            <CardHeader>
              <CardTitle>Order Profitability Analysis</CardTitle>
              <CardDescription>
                Profitability metrics by order status and customer segment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='text-center p-4 border rounded-lg'>
                  <div className='text-2xl font-bold text-green-600'>
                    $
                    {orderProfitability.averageOrderProfit?.toFixed(2) ||
                      '0.00'}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Avg Order Profit
                  </div>
                </div>
                <div className='text-center p-4 border rounded-lg'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {orderProfitability.profitMargin?.toFixed(1) || '0.0'}%
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Profit Margin
                  </div>
                </div>
                <div className='text-center p-4 border rounded-lg'>
                  <div className='text-2xl font-bold text-purple-600'>
                    {orderProfitability.profitabilityRate?.toFixed(1) || '0.0'}%
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Profitable Orders
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Operational Efficiency Metrics */}
        {operationalEfficiency && (
          <Card>
            <CardHeader>
              <CardTitle>Operational Efficiency Metrics</CardTitle>
              <CardDescription>
                Key performance indicators for operational efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div className='text-center p-4 border rounded-lg'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {operationalEfficiency.deliveryEfficiency?.toFixed(1) ||
                      '0.0'}
                    %
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Order Fulfillment Rate
                  </div>
                </div>
                <div className='text-center p-4 border rounded-lg'>
                  <div className='text-2xl font-bold text-green-600'>
                    {operationalEfficiency.inventoryTurnover?.toFixed(1) ||
                      '0.0'}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Inventory Turnover
                  </div>
                </div>
                <div className='text-center p-4 border rounded-lg'>
                  <div className='text-2xl font-bold text-purple-600'>
                    {operationalEfficiency.overallEfficiency?.toFixed(1) ||
                      '0.0'}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Customer Satisfaction
                  </div>
                </div>
                <div className='text-center p-4 border rounded-lg'>
                  <div className='text-2xl font-bold text-orange-600'>
                    {operationalEfficiency.costPerOrder?.toFixed(1) || '0.0'}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Operational Cost Ratio
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
