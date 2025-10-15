import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  X,
} from 'lucide-react';
import { purchaseOrderService } from '@/lib/services/purchaseOrderService';
import { StatsSummary } from '@/lib/types/supplier';
import { useAuth } from '@/contexts/AuthContext';

interface PurchaseOrderStatsProps {
  refreshTrigger?: number;
  onStatsLoaded?: (stats: StatsSummary) => void;
  defaultFilters?: {
    q?: string;
    status?: string;
    supplierId?: number;
    dateFrom?: string;
    dateTo?: string;
  };
}

export function PurchaseOrderStats({
  refreshTrigger,
  onStatsLoaded,
  defaultFilters,
}: PurchaseOrderStatsProps) {
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [dateFrom, setDateFrom] = useState(defaultFilters?.dateFrom || '');
  const [dateTo, setDateTo] = useState(defaultFilters?.dateTo || '');
  const [status, setStatus] = useState(defaultFilters?.status || '');
  const [supplierId, setSupplierId] = useState(
    defaultFilters?.supplierId?.toString() || ''
  );
  const [searchTerm, setSearchTerm] = useState(defaultFilters?.q || '');

  const { isAuthenticated } = useAuth();

  const loadStats = useCallback(
    async (filters?: {
      q?: string;
      status?: string;
      supplierId?: number;
      dateFrom?: string;
      dateTo?: string;
    }) => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);

        // Use provided filters or current state
        const params = filters || {
          q: searchTerm || undefined,
          status: status || undefined,
          supplierId: supplierId ? parseInt(supplierId) : undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        };

        const statsData = await purchaseOrderService.getStatsSummary(params);
        setStats(statsData);
        onStatsLoaded?.(statsData);
      } catch (error) {
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    },
    [
      isAuthenticated,
      onStatsLoaded,
      searchTerm,
      status,
      supplierId,
      dateFrom,
      dateTo,
    ]
  );

  const handleApplyFilters = () => {
    loadStats();
  };

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setStatus('');
    setSupplierId('');
    setSearchTerm('');
    // Load stats without filters
    loadStats({});
  };

  useEffect(() => {
    loadStats();
  }, [loadStats, refreshTrigger]);

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center text-muted-foreground'>
            Please log in to view purchase order statistics.
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Helper functions to extract data from the actual backend response
  const getTotalOrders = () => stats?.count || 0;
  const getTotalValue = () => stats?.total || 0;
  const getPendingOrders = () => {
    if (!stats?.byStatusCounts) return 0;
    return (
      (stats.byStatusCounts.PENDING || 0) +
      (stats.byStatusCounts.SENT || 0) +
      (stats.byStatusCounts.DRAFT || 0)
    );
  };
  const getReceivedOrders = () => stats?.byStatusCounts?.RECEIVED || 0;

  const completionRate =
    getTotalOrders() > 0
      ? ((getReceivedOrders() / getTotalOrders()) * 100).toFixed(1)
      : '0';

  return (
    <div className='space-y-4'>
      {/* Stats Header with Filter Toggle */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <DollarSign className='h-5 w-5' />
                Purchase Order Statistics
              </CardTitle>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className='h-4 w-4 mr-1' />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className='mt-4 p-4 bg-gray-50 rounded-lg space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='stats-search'>Search</Label>
                  <Input
                    id='stats-search'
                    placeholder='Search orders...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='stats-status'>Status</Label>
                  <Input
                    id='stats-status'
                    placeholder='e.g., DRAFT, SENT, PENDING'
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='stats-supplier'>Supplier ID</Label>
                  <Input
                    id='stats-supplier'
                    placeholder='Supplier ID'
                    type='number'
                    value={supplierId}
                    onChange={e => setSupplierId(e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='stats-date-from'>Date From</Label>
                  <Input
                    id='stats-date-from'
                    type='date'
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='stats-date-to'>Date To</Label>
                  <Input
                    id='stats-date-to'
                    type='date'
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                  />
                </div>
              </div>
              <div className='flex gap-2 pt-2'>
                <Button onClick={handleApplyFilters} disabled={loading}>
                  <Filter className='h-4 w-4 mr-1' />
                  Apply Filters
                </Button>
                <Button
                  variant='outline'
                  onClick={handleClearFilters}
                  disabled={loading}
                >
                  <X className='h-4 w-4 mr-1' />
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Total Orders */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Total Orders
                </p>
                <p className='text-2xl font-bold'>
                  {loading ? '...' : getTotalOrders()}
                </p>
              </div>
              <div className='h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center'>
                <ShoppingCart className='h-4 w-4 text-blue-600' />
              </div>
            </div>
            <div className='mt-2'>
              <Badge variant='secondary' className='text-xs'>
                {dateFrom || dateTo ? 'Filtered period' : 'All purchase orders'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Total Value */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Total Value
                </p>
                <p className='text-2xl font-bold'>
                  {loading ? '...' : formatCurrency(getTotalValue())}
                </p>
              </div>
              <div className='h-8 w-8 bg-green-100 rounded-full flex items-center justify-center'>
                <DollarSign className='h-4 w-4 text-green-600' />
              </div>
            </div>
            <div className='mt-2'>
              <Badge variant='secondary' className='text-xs'>
                Combined order value
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Pending Orders
                </p>
                <p className='text-2xl font-bold'>
                  {loading ? '...' : getPendingOrders()}
                </p>
              </div>
              <div className='h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center'>
                <Clock className='h-4 w-4 text-yellow-600' />
              </div>
            </div>
            <div className='mt-2'>
              <Badge variant='outline' className='text-xs'>
                Awaiting fulfillment
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Received Orders */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Received Orders
                </p>
                <p className='text-2xl font-bold'>
                  {loading ? '...' : getReceivedOrders()}
                </p>
              </div>
              <div className='h-8 w-8 bg-green-100 rounded-full flex items-center justify-center'>
                <CheckCircle className='h-4 w-4 text-green-600' />
              </div>
            </div>
            <div className='mt-2'>
              <Badge
                variant='default'
                className='text-xs bg-green-100 text-green-800'
              >
                {loading ? '...' : completionRate}% completion rate
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className='border-red-200'>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2 text-red-600'>
              <AlertCircle className='h-4 w-4' />
              <span className='text-sm'>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
