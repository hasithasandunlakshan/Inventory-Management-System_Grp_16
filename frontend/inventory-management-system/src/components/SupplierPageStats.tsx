import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  Calendar,
  DollarSign,
  Truck,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { purchaseOrderService } from '@/lib/services/purchaseOrderService';
import { enhancedSupplierService } from '@/lib/services/enhancedSupplierService';
import { MonthlyStats, StatsSummary } from '@/lib/types/supplier';
import { useAuth } from '@/contexts/AuthContext';

interface SupplierPageStatsProps {
  refreshTrigger?: number;
}

export function SupplierPageStats({ refreshTrigger }: SupplierPageStatsProps) {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [generalStats, setGeneralStats] = useState<StatsSummary | null>(null);
  const [supplierCount, setSupplierCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();

  const loadStats = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      // Load monthly stats, general stats, and supplier count in parallel
      const [monthlyData, generalData, suppliers] = await Promise.all([
        purchaseOrderService.getMonthlyStats(),
        purchaseOrderService.getStatsSummary(),
        enhancedSupplierService
          .getAllSuppliersWithUserDetails()
          .catch(() => []), // Fallback to empty array if fails
      ]);

      setMonthlyStats(monthlyData);
      setGeneralStats(generalData);
      setSupplierCount(suppliers.length);
    } catch {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadStats();
  }, [loadStats, refreshTrigger]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage}%`;
  };

  const getPendingOrders = () => {
    if (!generalStats?.byStatusCounts) return 0;
    return (
      (generalStats.byStatusCounts.PENDING || 0) +
      (generalStats.byStatusCounts.SENT || 0) +
      (generalStats.byStatusCounts.DRAFT || 0)
    );
  };

  const getMonthName = (month: number) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1];
  };

  if (!isAuthenticated) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* Placeholder cards when not authenticated */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>--</div>
            <p className='text-xs text-muted-foreground'>
              Please log in to view data
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Orders
            </CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>--</div>
            <p className='text-xs text-muted-foreground'>
              Please log in to view data
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Value</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>--</div>
            <p className='text-xs text-muted-foreground'>
              Please log in to view data
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Suppliers
            </CardTitle>
            <Truck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>--</div>
            <p className='text-xs text-muted-foreground'>
              Please log in to view data
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {/* Total Orders - This Month with Percentage Change */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
          <Package className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {loading ? '...' : monthlyStats?.currentMonth.count || 0}
          </div>
          <div className='flex items-center space-x-1'>
            {loading ? (
              <p className='text-xs text-muted-foreground'>Loading...</p>
            ) : monthlyStats ? (
              <>
                {monthlyStats.percentageChange.count !== 0 && (
                  <>
                    {monthlyStats.percentageChange.count > 0 ? (
                      <TrendingUp className='h-3 w-3 text-green-600' />
                    ) : (
                      <TrendingDown className='h-3 w-3 text-red-600' />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        monthlyStats.percentageChange.count > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatPercentage(monthlyStats.percentageChange.count)}
                    </span>
                  </>
                )}
                <p className='text-xs text-muted-foreground'>
                  from {getMonthName(monthlyStats.previousMonth.month)}
                  {monthlyStats.previousMonth.count > 0 &&
                    ` (${monthlyStats.previousMonth.count})`}
                </p>
              </>
            ) : (
              <p className='text-xs text-muted-foreground'>This month</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Orders */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Pending Orders</CardTitle>
          <Calendar className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {loading ? '...' : getPendingOrders()}
          </div>
          <p className='text-xs text-muted-foreground'>Awaiting fulfillment</p>
        </CardContent>
      </Card>

      {/* Total Value - This Month */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Value</CardTitle>
          <DollarSign className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {loading
              ? '...'
              : formatCurrency(monthlyStats?.currentMonth.total || 0)}
          </div>
          <div className='flex items-center space-x-1'>
            {loading ? (
              <p className='text-xs text-muted-foreground'>Loading...</p>
            ) : monthlyStats ? (
              <>
                {monthlyStats.percentageChange.total !== 0 && (
                  <>
                    {monthlyStats.percentageChange.total > 0 ? (
                      <TrendingUp className='h-3 w-3 text-green-600' />
                    ) : (
                      <TrendingDown className='h-3 w-3 text-red-600' />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        monthlyStats.percentageChange.total > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatPercentage(monthlyStats.percentageChange.total)}
                    </span>
                  </>
                )}
                <p className='text-xs text-muted-foreground'>
                  from {getMonthName(monthlyStats.previousMonth.month)}
                  {monthlyStats.previousMonth.total > 0 &&
                    ` (${formatCurrency(monthlyStats.previousMonth.total)})`}
                </p>
              </>
            ) : (
              <p className='text-xs text-muted-foreground'>This month</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Suppliers */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Active Suppliers
          </CardTitle>
          <Truck className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {loading ? '...' : supplierCount}
          </div>
          <p className='text-xs text-muted-foreground'>Registered suppliers</p>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className='col-span-full border-red-200'>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2 text-red-600'>
              <span className='text-sm'>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
