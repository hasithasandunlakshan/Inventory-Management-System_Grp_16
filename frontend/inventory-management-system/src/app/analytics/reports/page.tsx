'use client';

import { useState, useMemo } from 'react';
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
        d='M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 8M7 13l2.5 8m10-8v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8m10 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4'
      />
    </svg>
  ),
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
        d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
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
  Building: () => (
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
        d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
      />
    </svg>
  ),
  ChartBar: () => (
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
        d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
      />
    </svg>
  ),
  Calendar: () => (
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
        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      />
    </svg>
  ),
  Search: () => (
    <svg
      className='w-5 h-5'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
      />
    </svg>
  ),
  Filter: () => (
    <svg
      className='w-5 h-5'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z'
      />
    </svg>
  ),
  Refresh: () => (
    <svg
      className='w-5 h-5'
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
  Eye: () => (
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
        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
      />
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
      />
    </svg>
  ),
  Download: () => (
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
        d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      />
    </svg>
  ),
  Star: () => (
    <svg
      className='w-5 h-5 text-yellow-400'
      fill='currentColor'
      viewBox='0 0 20 20'
    >
      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
    </svg>
  ),
  Warning: () => (
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
        d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z'
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
  DocumentReport: () => (
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
        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
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
        d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      />
    </svg>
  ),
};

type ReportType =
  | 'inventory'
  | 'sales'
  | 'orders'
  | 'logistics'
  | 'financial'
  | 'supplier';
type TimeRange = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

interface InventoryReport {
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  stockValue: number;
  turnoverRate: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstocked';
}

interface SalesReport {
  period: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  topProducts: string[];
  growth: number;
}

interface LogisticsReport {
  deliveryDate: string;
  ordersDelivered: number;
  averageDeliveryTime: number;
  deliverySuccess: number;
  fuelCost: number;
  driverEfficiency: number;
}

interface SupplierReport {
  supplierId: string;
  supplierName: string;
  totalOrders: number;
  totalValue: number;
  deliveryTime: number;
  qualityRating: number;
  paymentTerms: string;
}

// Dummy data
const inventoryData: InventoryReport[] = [
  {
    productId: 'PRD001',
    productName: 'Rice (White) - 5kg',
    category: 'Grains',
    currentStock: 150,
    reorderLevel: 100,
    stockValue: 112500,
    turnoverRate: 8.5,
    status: 'In Stock',
  },
  {
    productId: 'PRD002',
    productName: 'Coconut Oil - 1L',
    category: 'Oils',
    currentStock: 25,
    reorderLevel: 50,
    stockValue: 12500,
    turnoverRate: 12.3,
    status: 'Low Stock',
  },
  {
    productId: 'PRD003',
    productName: 'Tea Packets - 100g',
    category: 'Beverages',
    currentStock: 0,
    reorderLevel: 200,
    stockValue: 0,
    turnoverRate: 15.2,
    status: 'Out of Stock',
  },
  {
    productId: 'PRD004',
    productName: 'Sugar - 1kg',
    category: 'Sweeteners',
    currentStock: 500,
    reorderLevel: 100,
    stockValue: 70000,
    turnoverRate: 6.8,
    status: 'Overstocked',
  },
];

const salesData: SalesReport[] = [
  {
    period: 'Jan 2025',
    revenue: 1250000,
    orders: 485,
    averageOrderValue: 2577,
    topProducts: ['Rice', 'Tea', 'Sugar'],
    growth: 12.5,
  },
  {
    period: 'Feb 2025',
    revenue: 1380000,
    orders: 520,
    averageOrderValue: 2653,
    topProducts: ['Oil', 'Rice', 'Spices'],
    growth: 10.4,
  },
  {
    period: 'Mar 2025',
    revenue: 1420000,
    orders: 545,
    averageOrderValue: 2605,
    topProducts: ['Tea', 'Rice', 'Oil'],
    growth: 2.9,
  },
];

const logisticsData: LogisticsReport[] = [
  {
    deliveryDate: '2025-01-15',
    ordersDelivered: 45,
    averageDeliveryTime: 2.5,
    deliverySuccess: 95.5,
    fuelCost: 8500,
    driverEfficiency: 89,
  },
  {
    deliveryDate: '2025-01-20',
    ordersDelivered: 52,
    averageDeliveryTime: 2.8,
    deliverySuccess: 92.3,
    fuelCost: 9200,
    driverEfficiency: 85,
  },
  {
    deliveryDate: '2025-01-25',
    ordersDelivered: 48,
    averageDeliveryTime: 2.2,
    deliverySuccess: 97.9,
    fuelCost: 7800,
    driverEfficiency: 92,
  },
];

const supplierData: SupplierReport[] = [
  {
    supplierId: 'SUP001',
    supplierName: 'Lanka Rice Mills',
    totalOrders: 45,
    totalValue: 450000,
    deliveryTime: 3.2,
    qualityRating: 4.8,
    paymentTerms: '30 days',
  },
  {
    supplierId: 'SUP002',
    supplierName: 'Ceylon Tea Co.',
    totalOrders: 38,
    totalValue: 285000,
    deliveryTime: 2.8,
    qualityRating: 4.9,
    paymentTerms: '15 days',
  },
  {
    supplierId: 'SUP003',
    supplierName: 'Tropical Oils Ltd',
    totalOrders: 25,
    totalValue: 175000,
    deliveryTime: 4.1,
    qualityRating: 4.2,
    paymentTerms: '45 days',
  },
];

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('inventory');
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-12-31');

  // Report navigation items
  const reportTypes = [
    {
      id: 'inventory',
      name: 'Inventory',
      icon: Icons.Package,
      color: 'bg-blue-500',
    },
    {
      id: 'sales',
      name: 'Sales',
      icon: Icons.TrendingUp,
      color: 'bg-green-500',
    },
    {
      id: 'orders',
      name: 'Orders',
      icon: Icons.ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      id: 'logistics',
      name: 'Logistics',
      icon: Icons.Truck,
      color: 'bg-orange-500',
    },
    {
      id: 'financial',
      name: 'Financial',
      icon: Icons.CurrencyDollar,
      color: 'bg-red-500',
    },
    {
      id: 'supplier',
      name: 'Suppliers',
      icon: Icons.Building,
      color: 'bg-indigo-500',
    },
  ];

  // Get status color for inventory
  const getInventoryStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Overstocked':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalStockValue = inventoryData.reduce(
      (sum, item) => sum + item.stockValue,
      0
    );
    const lowStockItems = inventoryData.filter(
      item => item.status === 'Low Stock' || item.status === 'Out of Stock'
    ).length;
    const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);

    return { totalStockValue, lowStockItems, totalRevenue, totalOrders };
  }, []);

  return (
    <div className='min-h-screen'>
      {/* Header */}
      <div className='border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-8'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight flex items-center'>
                <Icons.ChartBar />
                <span className='ml-3'>Analytics & Reports</span>
              </h1>
              <p className='text-muted-foreground mt-2'>
                Comprehensive business insights and analytics
              </p>
            </div>
            <div className='flex items-center space-x-6'>
              <div className='text-center'>
                <div className='text-2xl font-bold'>
                  LKR {summaryStats.totalStockValue.toLocaleString()}
                </div>
                <div className='text-sm text-muted-foreground'>
                  Total Stock Value
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold'>
                  LKR {summaryStats.totalRevenue.toLocaleString()}
                </div>
                <div className='text-sm text-muted-foreground'>
                  Total Revenue
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Products
              </CardTitle>
              <Icons.Package />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{inventoryData.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Low Stock Alerts
              </CardTitle>
              <Icons.Warning />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {summaryStats.lowStockItems}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Orders
              </CardTitle>
              <Icons.ShoppingCart />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {summaryStats.totalOrders}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Suppliers
              </CardTitle>
              <Icons.Building />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{supplierData.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* Report Navigation */}
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Icons.DocumentReport />
                  <span className='ml-2'>Report Categories</span>
                </CardTitle>
                <CardDescription>Select a report type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {reportTypes.map(report => (
                    <Button
                      key={report.id}
                      variant={
                        activeReport === report.id ? 'default' : 'outline'
                      }
                      className='w-full justify-start'
                      onClick={() => setActiveReport(report.id as ReportType)}
                    >
                      <report.icon />
                      <span className='ml-2'>{report.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
              {/* Date Range Selector */}
              <div className='mt-6 pt-6 border-t'>
                <CardTitle className='text-base flex items-center'>
                  <Icons.Calendar />
                  <span className='ml-2'>Date Range</span>
                </CardTitle>
                <div className='px-0 pt-4 space-y-4'>
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>Time Period</Label>
                    <Select
                      value={timeRange}
                      onValueChange={v => setTimeRange(v as TimeRange)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select period' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='daily'>Daily</SelectItem>
                        <SelectItem value='weekly'>Weekly</SelectItem>
                        <SelectItem value='monthly'>Monthly</SelectItem>
                        <SelectItem value='quarterly'>Quarterly</SelectItem>
                        <SelectItem value='yearly'>Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>From Date</Label>
                    <Input
                      type='date'
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>To Date</Label>
                    <Input
                      type='date'
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                    />
                  </div>
                  <Button className='w-full'>
                    <Icons.ChartBar />
                    <span className='ml-2'>Generate Report</span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Report Content */}
          <div className='lg:col-span-3'>
            <Card>
              {/* Inventory Report */}
              {activeReport === 'inventory' && (
                <div>
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
                    <div className='overflow-x-auto'>
                      <table className='min-w-full divide-y divide-gray-200'>
                        <thead className='bg-muted/50'>
                          <tr>
                            <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                              Product
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                              Stock Level
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                              Stock Value
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                              Turnover Rate
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-200'>
                          {inventoryData.map(item => (
                            <tr
                              key={item.productId}
                              className='hover:bg-muted/30'
                            >
                              <td className='px-6 py-4'>
                                <div>
                                  <div className='text-sm font-semibold'>
                                    {item.productName}
                                  </div>
                                  <div className='text-sm text-muted-foreground'>
                                    {item.category}
                                  </div>
                                  <div className='text-xs text-muted-foreground'>
                                    {item.productId}
                                  </div>
                                </div>
                              </td>
                              <td className='px-6 py-4'>
                                <div className='text-sm font-medium'>
                                  {item.currentStock} units
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  Reorder at: {item.reorderLevel}
                                </div>
                              </td>
                              <td className='px-6 py-4'>
                                <div className='text-lg font-bold'>
                                  LKR {item.stockValue.toLocaleString()}
                                </div>
                              </td>
                              <td className='px-6 py-4'>
                                <div className='text-sm font-medium'>
                                  {item.turnoverRate}x
                                </div>
                              </td>
                              <td className='px-6 py-4'>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getInventoryStatusColor(item.status)}`}
                                >
                                  {item.status === 'In Stock' && (
                                    <Icons.CheckCircle />
                                  )}
                                  {item.status === 'Low Stock' && (
                                    <Icons.Warning />
                                  )}
                                  {item.status === 'Out of Stock' && (
                                    <Icons.XCircle />
                                  )}
                                  {item.status === 'Overstocked' && (
                                    <Icons.TrendingUp />
                                  )}
                                  <span className='ml-1'>{item.status}</span>
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Sales Report */}
              {activeReport === 'sales' && (
                <div>
                  <div className='px-6 py-4 border-b'>
                    <h2 className='text-2xl font-bold flex items-center'>
                      <Icons.TrendingUp />
                      <span className='ml-3'>Sales Report</span>
                    </h2>
                    <p className='text-muted-foreground mt-1'>
                      Revenue, orders, and sales performance analysis
                    </p>
                  </div>

                  <div className='p-6'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                      {salesData.map((period, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className='text-base'>
                              {period.period}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className='mt-4 space-y-2'>
                              <div className='flex justify-between'>
                                <span className='text-sm text-muted-foreground flex items-center'>
                                  <Icons.CurrencyDollar />
                                  <span className='ml-1'>Revenue:</span>
                                </span>
                                <span className='font-semibold'>
                                  LKR {period.revenue.toLocaleString()}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-sm text-muted-foreground flex items-center'>
                                  <Icons.ShoppingCart />
                                  <span className='ml-1'>Orders:</span>
                                </span>
                                <span className='font-semibold'>
                                  {period.orders}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-sm text-muted-foreground flex items-center'>
                                  <Icons.TrendingUp />
                                  <span className='ml-1'>Avg Order:</span>
                                </span>
                                <span className='font-semibold'>
                                  LKR{' '}
                                  {period.averageOrderValue.toLocaleString()}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-sm text-muted-foreground flex items-center'>
                                  <Icons.ChartBar />
                                  <span className='ml-1'>Growth:</span>
                                </span>
                                <span
                                  className={`font-semibold flex items-center`}
                                >
                                  {period.growth > 0 ? (
                                    <Icons.TrendingUp />
                                  ) : (
                                    <Icons.XCircle />
                                  )}
                                  <span className='ml-1'>
                                    {period.growth > 0 ? '+' : ''}
                                    {period.growth}%
                                  </span>
                                </span>
                              </div>
                            </div>
                            <div className='mt-4'>
                              <div className='text-xs text-muted-foreground mb-1'>
                                Top Products:
                              </div>
                              <div className='flex flex-wrap gap-1'>
                                {period.topProducts.map((product, idx) => (
                                  <span
                                    key={idx}
                                    className='px-2 py-1 bg-muted text-xs rounded-full'
                                  >
                                    {product}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Logistics Report */}
              {activeReport === 'logistics' && (
                <div>
                  <div className='px-6 py-4 border-b'>
                    <h2 className='text-2xl font-bold flex items-center'>
                      <Icons.Truck />
                      <span className='ml-3'>Logistics Report</span>
                    </h2>
                    <p className='text-muted-foreground mt-1'>
                      Delivery performance and logistics efficiency
                    </p>
                  </div>

                  <div className='p-6'>
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
                            <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                              Fuel Cost
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                              Driver Efficiency
                            </th>
                          </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-200'>
                          {logisticsData.map((item, index) => (
                            <tr key={index} className='hover:bg-muted/30'>
                              <td className='px-6 py-4 text-sm font-medium'>
                                {new Date(
                                  item.deliveryDate
                                ).toLocaleDateString()}
                              </td>
                              <td className='px-6 py-4 text-sm'>
                                {item.ordersDelivered}
                              </td>
                              <td className='px-6 py-4 text-sm flex items-center'>
                                <Icons.Clock />
                                <span className='ml-2'>
                                  {item.averageDeliveryTime} hours
                                </span>
                              </td>
                              <td className='px-6 py-4'>
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center bg-muted`}
                                >
                                  {item.deliverySuccess >= 95 ? (
                                    <Icons.CheckCircle />
                                  ) : item.deliverySuccess >= 90 ? (
                                    <Icons.Warning />
                                  ) : (
                                    <Icons.XCircle />
                                  )}
                                  <span className='ml-1'>
                                    {item.deliverySuccess}%
                                  </span>
                                </span>
                              </td>
                              <td className='px-6 py-4 text-sm flex items-center'>
                                <Icons.CurrencyDollar />
                                <span className='ml-2'>
                                  LKR {item.fuelCost.toLocaleString()}
                                </span>
                              </td>
                              <td className='px-6 py-4'>
                                <div className='flex items-center'>
                                  <div className='w-full bg-muted rounded-full h-2 mr-2'>
                                    <div
                                      className='bg-foreground h-2 rounded-full'
                                      style={{
                                        width: `${item.driverEfficiency}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className='text-sm font-medium'>
                                    {item.driverEfficiency}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Supplier Report */}
              {activeReport === 'supplier' && (
                <div>
                  <div className='px-6 py-4 border-b'>
                    <h2 className='text-2xl font-bold flex items-center'>
                      <Icons.Building />
                      <span className='ml-3'>Supplier Report</span>
                    </h2>
                    <p className='text-muted-foreground mt-1'>
                      Supplier performance and partnership analysis
                    </p>
                  </div>

                  <div className='p-6'>
                    <div className='grid gap-6'>
                      {supplierData.map(supplier => (
                        <Card key={supplier.supplierId}>
                          <CardContent className='p-6'>
                            <div className='flex justify-between items-start'>
                              <div>
                                <h3 className='text-xl font-bold'>
                                  {supplier.supplierName}
                                </h3>
                                <p className='text-muted-foreground'>
                                  {supplier.supplierId}
                                </p>
                              </div>
                              <div className='text-right'>
                                <div className='text-2xl font-bold'>
                                  LKR {supplier.totalValue.toLocaleString()}
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  Total Value
                                </div>
                              </div>
                            </div>

                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-6'>
                              <div className='text-center'>
                                <div className='text-lg font-semibold flex items-center justify-center'>
                                  <Icons.ShoppingCart />
                                  <span className='ml-1'>
                                    {supplier.totalOrders}
                                  </span>
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  Total Orders
                                </div>
                              </div>
                              <div className='text-center'>
                                <div className='text-lg font-semibold flex items-center justify-center'>
                                  <Icons.Clock />
                                  <span className='ml-1'>
                                    {supplier.deliveryTime} days
                                  </span>
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  Avg Delivery
                                </div>
                              </div>
                              <div className='text-center'>
                                <div className='flex items-center justify-center'>
                                  <div className='text-lg font-semibold mr-1'>
                                    {supplier.qualityRating}
                                  </div>
                                  <Icons.Star />
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  Quality Rating
                                </div>
                              </div>
                              <div className='text-center'>
                                <div className='text-lg font-semibold flex items-center justify-center'>
                                  <Icons.CreditCard />
                                  <span className='ml-1'>
                                    {supplier.paymentTerms}
                                  </span>
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  Payment Terms
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Report */}
              {activeReport === 'orders' && (
                <div>
                  <div className='px-6 py-4 border-b'>
                    <h2 className='text-2xl font-bold flex items-center'>
                      <Icons.ShoppingCart />
                      <span className='ml-3'>Orders Report</span>
                    </h2>
                    <p className='text-muted-foreground mt-1'>
                      Order processing and fulfillment analysis
                    </p>
                  </div>

                  <div className='p-6'>
                    <div className='text-center py-12'>
                      <h3 className='text-2xl font-bold mb-2'>Orders Report</h3>
                      <p className='text-muted-foreground mb-4'>
                        Detailed order analysis and processing metrics
                      </p>
                      <Button className='mx-auto'>
                        <Icons.ChartBar />
                        <span className='ml-2'>Generate Order Report</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Report */}
              {activeReport === 'financial' && (
                <div>
                  <div className='px-6 py-4 border-b'>
                    <h2 className='text-2xl font-bold flex items-center'>
                      <Icons.CurrencyDollar />
                      <span className='ml-3'>Financial Report</span>
                    </h2>
                    <p className='text-muted-foreground mt-1'>
                      Financial performance and profitability analysis
                    </p>
                  </div>

                  <div className='p-6'>
                    <div className='text-center py-12'>
                      <h3 className='text-2xl font-bold mb-2'>
                        Financial Report
                      </h3>
                      <p className='text-muted-foreground mb-4'>
                        Comprehensive financial analysis and insights
                      </p>
                      <Button className='mx-auto'>
                        <Icons.ChartBar />
                        <span className='ml-2'>Generate Financial Report</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
