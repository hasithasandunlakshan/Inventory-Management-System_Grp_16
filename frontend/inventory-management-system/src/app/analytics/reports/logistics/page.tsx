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
  logisticsService,
  type LogisticsMetrics,
  type DriverProfile,
  type Vehicle,
  type Assignment,
} from '@/lib/services/logisticsService';

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
  CheckCircle: () => (
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
        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      />
    </svg>
  ),
  Clock: () => (
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
        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
      />
    </svg>
  ),
  Users: () => (
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
        d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
      />
    </svg>
  ),
  XCircle: () => (
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
        d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
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

export default function LogisticsReportPage() {
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

  const [logisticsLoading, setLogisticsLoading] = useState(true);
  const [logisticsError, setLogisticsError] = useState<string | null>(null);
  const [logisticsMetrics, setLogisticsMetrics] = useState<LogisticsMetrics | null>(null);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Load logistics data
  useEffect(() => {
    const loadLogisticsData = async () => {
      setLogisticsLoading(true);
      setLogisticsError(null);
      try {
        console.log('🚚 Loading logistics data from backend...', { dateFrom, dateTo });
        const [metrics, driversData, vehiclesData, assignmentsData] = await Promise.all([
          logisticsService.getLogisticsMetrics(dateFrom, dateTo),
          logisticsService.getAllDrivers(),
          logisticsService.getAllVehicles(),
          logisticsService.getAllAssignments(),
        ]);
        
        console.log('🚚 Logistics data loaded:', { metrics, driversData, vehiclesData, assignmentsData });
        setLogisticsMetrics(metrics);
        setDrivers(driversData);
        setVehicles(vehiclesData);
        setAssignments(assignmentsData);
      } catch (err) {
        console.error('❌ Error loading logistics data:', err);
        setLogisticsError('Failed to load logistics data');
      } finally {
        setLogisticsLoading(false);
      }
    };

    loadLogisticsData();
  }, [dateFrom, dateTo]);

  const reloadData = useCallback(async () => {
    setLogisticsLoading(true);
    setLogisticsError(null);
    try {
      console.log('🔄 Reloading logistics data...', { dateFrom, dateTo });
      const [metrics, driversData, vehiclesData, assignmentsData] = await Promise.all([
        logisticsService.getLogisticsMetrics(dateFrom, dateTo),
        logisticsService.getAllDrivers(),
        logisticsService.getAllVehicles(),
        logisticsService.getAllAssignments(),
      ]);
      
      setLogisticsMetrics(metrics);
      setDrivers(driversData);
      setVehicles(vehiclesData);
      setAssignments(assignmentsData);
    } catch (err) {
      console.error('❌ Error reloading logistics data:', err);
      setLogisticsError('Failed to reload logistics data');
    } finally {
      setLogisticsLoading(false);
    }
  }, [dateFrom, dateTo]);

  const fleetUtilization = useMemo(() => {
    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter(d => d.status === 'active').length;
    const totalVehicles = vehicles.length;
    const assignedVehicles = assignments.filter(a => a.status === 'active').length;
    
    return {
      totalDrivers,
      activeDrivers,
      totalVehicles,
      assignedVehicles,
    };
  }, [drivers, vehicles, assignments]);

  const deliveryPerformance = useMemo(() => {
    // Mock data for delivery performance - in real app this would come from the backend
    const performance = [
      { date: '2025-01-01', ordersDelivered: 45, avgDeliveryTime: 2.5, successRate: 98 },
      { date: '2025-01-02', ordersDelivered: 52, avgDeliveryTime: 2.3, successRate: 96 },
      { date: '2025-01-03', ordersDelivered: 38, avgDeliveryTime: 2.8, successRate: 94 },
      { date: '2025-01-04', ordersDelivered: 61, avgDeliveryTime: 2.1, successRate: 99 },
      { date: '2025-01-05', ordersDelivered: 48, avgDeliveryTime: 2.6, successRate: 97 },
    ];
    
    return performance;
  }, []);

  return (
    <div className='min-h-screen'>
      {/* Header */}
      <div className='border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Logistics Report</h1>
              <p className='mt-2 text-gray-600'>
                Delivery performance and logistics efficiency
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
        {/* Loading State */}
        {logisticsLoading && (
          <div className='flex items-center justify-center py-12'>
            <div className='h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent mr-3' />
            <span className='text-muted-foreground'>
              Loading logistics data...
            </span>
          </div>
        )}

        {/* Error State */}
        {logisticsError && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <div className='flex'>
              <div className='h-5 w-5 text-red-400 mr-3'>
                <Icons.XCircle />
              </div>
              <div>
                <h3 className='text-sm font-medium text-red-800'>
                  Error Loading Logistics Data
                </h3>
                <p className='text-sm text-red-700 mt-1'>
                  {logisticsError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logistics Metrics Cards */}
        {logisticsMetrics && !logisticsLoading && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      Delivery Success Rate
                    </p>
                    <p className='text-2xl font-bold'>
                      {logisticsMetrics.deliverySuccessRate}%
                    </p>
                  </div>
                  <div className='h-8 w-8 text-green-500'>
                    <Icons.CheckCircle />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      Avg Delivery Time
                    </p>
                    <p className='text-2xl font-bold'>
                      {logisticsMetrics.averageDeliveryTime}h
                    </p>
                  </div>
                  <div className='h-8 w-8 text-blue-500'>
                    <Icons.Clock />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      Driver Utilization
                    </p>
                    <p className='text-2xl font-bold'>
                      {logisticsMetrics.driverUtilization}%
                    </p>
                  </div>
                  <div className='h-8 w-8 text-purple-500'>
                    <Icons.Users />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      Vehicle Utilization
                    </p>
                    <p className='text-2xl font-bold'>
                      {logisticsMetrics.vehicleUtilization}%
                    </p>
                  </div>
                  <div className='h-8 w-8 text-orange-500'>
                    <Icons.Truck />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fleet Utilization Summary */}
        {fleetUtilization && !logisticsLoading && (
          <Card className='mb-8'>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <div className='mr-2'>
                  <Icons.Truck />
                </div>
                Fleet Utilization Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {fleetUtilization.totalDrivers}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Total Drivers
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>
                    {fleetUtilization.activeDrivers}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Active Drivers
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-600'>
                    {fleetUtilization.totalVehicles}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Total Vehicles
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-orange-600'>
                    {fleetUtilization.assignedVehicles}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Assigned Vehicles
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delivery Performance Table */}
        {!logisticsLoading && !logisticsError && (
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Delivery Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-muted/50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                        Date
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                        Orders Delivered
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                        Avg Delivery Time
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                        Success Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {deliveryPerformance.map((perf, idx) => (
                      <tr key={idx} className='hover:bg-muted/30'>
                        <td className='px-6 py-4 text-sm font-medium'>
                          {new Date(perf.date).toLocaleDateString()}
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          {perf.ordersDelivered}
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          {perf.avgDeliveryTime}h
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            perf.successRate >= 98 ? 'bg-green-100 text-green-800' :
                            perf.successRate >= 95 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {perf.successRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Drivers Table */}
        {!logisticsLoading && !logisticsError && drivers.length > 0 && (
          <Card className='mt-8'>
            <CardHeader>
              <CardTitle className='text-base'>
                Driver Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-muted/50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                        Driver Name
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                        Deliveries
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                        Rating
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                        Vehicle
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {drivers.map(driver => (
                      <tr key={driver.driverId} className='hover:bg-muted/30'>
                        <td className='px-6 py-4 text-sm font-medium'>
                          {driver.name}
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            driver.status === 'active' ? 'bg-green-100 text-green-800' :
                            driver.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {driver.status}
                          </span>
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          {driver.totalDeliveries || 0}
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          {driver.rating || 'N/A'}
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          {driver.vehicleId || 'Unassigned'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
