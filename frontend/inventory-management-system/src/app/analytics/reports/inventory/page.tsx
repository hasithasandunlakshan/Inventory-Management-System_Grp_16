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
  inventoryService,
  type InventoryRow,
} from '@/lib/services/inventoryService';
import {
  stockAlertService,
  type StockAlert,
} from '@/lib/services/stockAlertService';

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

export default function InventoryReportPage() {
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

  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [openAlerts, setOpenAlerts] = useState<StockAlert[]>([]);
  const [alertHistory, setAlertHistory] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load inventory data
  useEffect(() => {
    const loadInventoryData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('📦 Loading inventory data from backend...', { dateFrom, dateTo });
        const inventoryData = await inventoryService.listAll(dateFrom, dateTo);
        console.log('📦 Inventory data loaded:', inventoryData);
        setInventory(inventoryData);
      } catch (err) {
        console.error('❌ Error loading inventory data:', err);
        setError('Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };

    loadInventoryData();
  }, [dateFrom, dateTo]);

  // Load stock alerts
  useEffect(() => {
    const loadStockAlerts = async () => {
      try {
        console.log('🚨 Loading stock alerts from backend...', { dateFrom, dateTo });
        const [openAlerts, alertHistory] = await Promise.all([
          stockAlertService.listUnresolved(dateFrom, dateTo),
          stockAlertService.listHistory(dateFrom, dateTo)
        ]);
        console.log('🚨 Stock alerts loaded:', { openAlerts, alertHistory });
        
        setOpenAlerts(openAlerts);
        setAlertHistory(alertHistory);
      } catch (err) {
        console.error('❌ Error loading stock alerts:', err);
      }
    };

    loadStockAlerts();
  }, [dateFrom, dateTo]);

  const reloadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Reloading inventory data...', { dateFrom, dateTo });
      const [inventoryData, openAlerts, alertHistory] = await Promise.all([
        inventoryService.listAll(dateFrom, dateTo),
        stockAlertService.listUnresolved(dateFrom, dateTo),
        stockAlertService.listHistory(dateFrom, dateTo),
      ]);
      
      setInventory(inventoryData);
      setOpenAlerts(openAlerts);
      setAlertHistory(alertHistory);
    } catch (err) {
      console.error('❌ Error reloading data:', err);
      setError('Failed to reload data');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  const inventoryStats = useMemo(() => {
    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(row => (row.stock || 0) <= (row.minThreshold || 0)).length;
    const outOfStockItems = inventory.filter(row => (row.stock || 0) === 0).length;
    const totalValue = inventory.reduce((sum, row) => sum + ((row.stock || 0) * (row.unitPrice || 0)), 0);
    
    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalValue,
      openAlertsCount: openAlerts.length,
    };
  }, [inventory, openAlerts]);

  const lowStockItems = useMemo(() => {
    return inventory.filter(row => (row.stock || 0) <= (row.minThreshold || 0));
  }, [inventory]);

  const filteredHistory = useMemo(() => {
    const from = new Date(dateFrom).getTime();
    const to = new Date(dateTo).getTime();
    return alertHistory.filter(a => {
      const t = new Date(a.createdAt).getTime();
      return (
        (!Number.isNaN(from) ? t >= from : true) &&
        (!Number.isNaN(to) ? t <= to : true)
      );
    });
  }, [alertHistory, dateFrom, dateTo]);

  const handleResolveAlert = useCallback(async (alertId: number) => {
    try {
      await stockAlertService.resolve(alertId);
      setOpenAlerts(prev => prev.filter(a => a.alertId !== alertId));
    } catch {
      // Ignore errors when resolving alerts
    }
  }, []);

  return (
    <div className='min-h-screen'>
      {/* Header */}
      <div className='border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Inventory Report</h1>
              <p className='mt-2 text-gray-600'>
                Current stock levels and inventory analysis
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
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Items</CardTitle>
              <Icons.Package className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{inventoryStats.totalItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Low Stock Items</CardTitle>
              <Icons.Package className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-orange-600'>{inventoryStats.lowStockItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Out of Stock</CardTitle>
              <Icons.Package className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>{inventoryStats.outOfStockItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Value</CardTitle>
              <Icons.Package className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>${inventoryStats.totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Report Content */}
        <Card>
          <div className='px-6 py-4 border-b'>
            <h2 className='text-2xl font-bold flex items-center'>
              <Icons.Package />
              <span className='ml-3'>Inventory Report</span>
            </h2>
            <p className='text-muted-foreground mt-1'>
              Current stock levels and inventory analysis
            </p>
          </div>

          <div className='p-6'>
            <div className='grid grid-cols-1 gap-8'>
              <div>
                <div className='mb-3 text-sm font-semibold'>
                  Low-Stock Items
                </div>
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-muted/50'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Product ID
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Stock
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Reserved
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Available
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Threshold
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {(loading ? [] : lowStockItems).map(item => (
                        <tr
                          key={item.inventoryId}
                          className='hover:bg-muted/30'
                        >
                          <td className='px-6 py-4 text-sm font-medium'>
                            {item.productId}
                          </td>
                          <td className='px-6 py-4 text-sm'>
                            {item.stock}
                          </td>
                          <td className='px-6 py-4 text-sm'>
                            {item.reserved}
                          </td>
                          <td className='px-6 py-4 text-sm'>
                            {item.availableStock}
                          </td>
                          <td className='px-6 py-4 text-sm'>
                            {item.minThreshold}
                          </td>
                        </tr>
                      ))}
                      {!loading && lowStockItems.length === 0 && (
                        <tr>
                          <td
                            className='px-6 py-6 text-sm text-muted-foreground'
                            colSpan={5}
                          >
                            No low-stock items
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className='mb-3 flex items-center justify-between'>
                  <div className='text-sm font-semibold'>
                    Open Stock Alerts
                  </div>
                  <Button variant='outline' onClick={reloadData}>
                    <Icons.Refresh />
                    <span className='ml-2'>Refresh</span>
                  </Button>
                </div>
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-muted/50'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Alert ID
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Product ID
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Type
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Message
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Created
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {(loading ? [] : openAlerts).map(alert => (
                        <tr
                          key={alert.alertId}
                          className='hover:bg-muted/30'
                        >
                          <td className='px-6 py-4 text-sm font-medium'>
                            {alert.alertId}
                          </td>
                          <td className='px-6 py-4 text-sm'>
                            {alert.productId}
                          </td>
                          <td className='px-6 py-4 text-sm'>
                            {alert.alertType}
                          </td>
                          <td className='px-6 py-4 text-sm'>
                            {alert.message}
                          </td>
                          <td className='px-6 py-4 text-sm'>
                            {new Date(alert.createdAt).toLocaleString()}
                          </td>
                          <td className='px-6 py-4 text-sm'>
                            <Button
                              size='sm'
                              onClick={() =>
                                handleResolveAlert(alert.alertId)
                              }
                            >
                              Resolve
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {!loading && openAlerts.length === 0 && (
                        <tr>
                          <td
                            className='px-6 py-6 text-sm text-muted-foreground'
                            colSpan={6}
                          >
                            No open alerts
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className='mb-3 text-sm font-semibold'>
                  Alert History
                </div>
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-muted/50'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Alert ID
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Product ID
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Type
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Message
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Created
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Resolved
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {(loading ? [] : filteredHistory).map(alert => (
                        <tr
                          key={alert.alertId}
                          className='hover:bg-muted/30'
                        >
                          <td className='px-6 py-4 text-sm font-medium'>
                            {alert.alertId}
                          </td>
                          <td className='px-6 py-4 text-sm'>
                            {alert.productId}
                          </td>
                          <td className='px-6 py-4 text-sm'>
                            {alert.alertType}
                          </td>
                          <td className='px-6 py-4 text-sm'>
                            {alert.message}
                          </td>
                          <td className='px-6 py-4 text-sm'>
                            {new Date(alert.createdAt).toLocaleString()}
                          </td>
                          <td className='px-6 py-4 text-sm'>
                            {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                      {!loading && filteredHistory.length === 0 && (
                        <tr>
                          <td
                            className='px-6 py-6 text-sm text-muted-foreground'
                            colSpan={6}
                          >
                            No alert history found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
