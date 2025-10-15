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

import { inventoryService, type InventoryRow } from '@/lib/services/inventoryService';
import { stockAlertService, type StockAlert } from '@/lib/services/stockAlertService';
import { orderService } from '@/lib/services/orderService';
import { revenueService } from '@/services/revenueService';
import { logisticsService, type LogisticsMetrics, type DriverProfile, type Vehicle, type Assignment } from '@/lib/services/logisticsService';
import { costService, type InventoryCostResponse, type PurchaseOrderStats, type CostAnalysisMetrics } from '@/lib/services/costService';
import { profitabilityService, type GrossProfitAnalysis, type DiscountImpactAnalysis, type OrderProfitability, type LogisticsCostAnalysis, type OperationalEfficiencyMetrics } from '@/lib/services/profitabilityService';
import { supplierService, type PurchaseOrderStats as SupplierPurchaseOrderStats } from '@/lib/services/supplierService';
import type { TodayRevenueResponse, MonthlyRevenueResponse, StripeStatsResponse } from '@/types/revenue';

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
};

type ReportType =
  | 'inventory'
  | 'sales'
  | 'orders'
  | 'logistics'
  | 'financial'
  | 'cost-analysis'
  | 'profitability'
  | 'operational-costs'
  | 'supplier';
type TimeRange = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// interface InventoryReport {
//   productId: string;
//   productName: string;
//   category: string;
//   currentStock: number;
//   reorderLevel: number;
//   stockValue: number;
//   turnoverRate: number;
//   status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstocked';
// }

// interface SalesReport {
//   period: string;
//   revenue: number;
//   orders: number;
//   averageOrderValue: number;
//   topProducts: string[];
//   growth: number;
// }

interface LogisticsReport {
  deliveryDate: string;
  ordersDelivered: number;
  averageDeliveryTime: number;
  deliverySuccess: number;
  fuelCost: number;
  driverEfficiency: number;
}

// interface SupplierReport {
//   supplierId: string;
//   supplierName: string;
//   totalOrders: number;
//   totalValue: number;
//   deliveryTime: number;
//   qualityRating: number;
//   paymentTerms: string;
// }

// Dummy data - commented out as it's not used
/*
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
*/

/*
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
*/

// Real logistics data will be loaded from backend

// const supplierData: SupplierReport[] = [
//   {
//     supplierId: 'SUP001',
//     supplierName: 'Lanka Rice Mills',
//     totalOrders: 45,
//     totalValue: 450000,
//     deliveryTime: 3.2,
//     qualityRating: 4.8,
//     paymentTerms: '30 days',
//   },
//   {
//     supplierId: 'SUP002',
//     supplierName: 'Ceylon Tea Co.',
//     totalOrders: 38,
//     totalValue: 285000,
//     deliveryTime: 2.8,
//     qualityRating: 4.9,
//     paymentTerms: '15 days',
//   },
//   {
//     supplierId: 'SUP003',
//     supplierName: 'Tropical Oils Ltd',
//     totalOrders: 25,
//     totalValue: 175000,
//     deliveryTime: 4.1,
//     qualityRating: 4.2,
//     paymentTerms: '45 days',
//   },
// ];

export default function ReportsPage() {
  //console.log('🚀 ReportsPage component is rendering');
  
  
  const [activeReport, setActiveReport] = useState<ReportType>('inventory');
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-12-31');

  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [openAlerts, setOpenAlerts] = useState<StockAlert[]>([]);
  const [alertHistory, setAlertHistory] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sales state
  const [salesLoading, setSalesLoading] = useState<boolean>(true);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [todayRevenue, setTodayRevenue] = useState<TodayRevenueResponse | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueResponse>([]);
  const [stripeStats, setStripeStats] = useState<StripeStatsResponse | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [recentOrders, setRecentOrders] = useState<import('@/lib/services/orderService').Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('CONFIRMED');
  const [ordersByStatus, setOrdersByStatus] = useState<import('@/lib/services/orderService').Order[]>([]);

  // Logistics state
  const [logisticsLoading, setLogisticsLoading] = useState<boolean>(true);
  const [logisticsError, setLogisticsError] = useState<string | null>(null);
  const [logisticsData, setLogisticsData] = useState<LogisticsReport[]>([]);
  const [logisticsMetrics, setLogisticsMetrics] = useState<LogisticsMetrics | null>(null);

  // Cost Analysis state
  const [inventoryCost, setInventoryCost] = useState<InventoryCostResponse | null>(null);
  const [purchaseStats, setPurchaseStats] = useState<PurchaseOrderStats | null>(null);
  const [costMetrics, setCostMetrics] = useState<CostAnalysisMetrics | null>(null);
  const [costLoading, setCostLoading] = useState(false);
  const [costError, setCostError] = useState<string | null>(null);

  // Profitability Analysis state
  const [grossProfitAnalysis, setGrossProfitAnalysis] = useState<GrossProfitAnalysis | null>(null);
  const [discountImpactAnalysis, setDiscountImpactAnalysis] = useState<DiscountImpactAnalysis | null>(null);
  const [orderProfitability, setOrderProfitability] = useState<OrderProfitability | null>(null);
  const [profitabilityLoading, setProfitabilityLoading] = useState(false);
  const [profitabilityError, setProfitabilityError] = useState<string | null>(null);

  // Operational Cost Analysis state
  const [logisticsCostAnalysis, setLogisticsCostAnalysis] = useState<LogisticsCostAnalysis | null>(null);
  const [operationalEfficiencyMetrics, setOperationalEfficiencyMetrics] = useState<OperationalEfficiencyMetrics | null>(null);
  const [operationalLoading, setOperationalLoading] = useState(false);
  const [operationalError, setOperationalError] = useState<string | null>(null);
  const [fleetUtilization, setFleetUtilization] = useState<{
    totalDrivers: number;
    activeDrivers: number;
    totalVehicles: number;
    assignedVehicles: number;
    totalAssignments: number;
    activeAssignments: number;
    driverUtilization: number;
    vehicleUtilization: number;
  } | null>(null);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Supplier Analytics state
  const [supplierAnalytics, setSupplierAnalytics] = useState<SupplierPurchaseOrderStats | null>(null);
  const [supplierLoading, setSupplierLoading] = useState<boolean>(true);
  const [supplierError, setSupplierError] = useState<string | null>(null);

  const reloadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inv, alerts, history] = await Promise.all([
        inventoryService.listAll(),
        stockAlertService.listUnresolved(),
        stockAlertService.listHistory(),
      ]);
      setInventory(inv);
      setOpenAlerts(alerts);
      setAlertHistory(history);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Load sales data
  useEffect(() => {
    const loadSales = async () => {
      setSalesLoading(true);
      setSalesError(null);
      // const statuses = ['CONFIRMED', 'PROCESSED', 'SHIPPED', 'CANCELLED'];
      try {
        // Fetch revenue endpoints in parallel and tolerate failures
        const [todayRes, monthlyRes, stripeRes] = await Promise.allSettled([
          revenueService.getTodayRevenue(),
          revenueService.getMonthlyRevenue(),
          revenueService.getStripeStats(),
        ]);
        if (todayRes.status === 'fulfilled') setTodayRevenue(todayRes.value);
        if (monthlyRes.status === 'fulfilled') setMonthlyRevenue(monthlyRes.value);
        if (stripeRes.status === 'fulfilled') setStripeStats(stripeRes.value);

        // Fetch all status counts at once
        try {
          const statusRes = await orderService.getAllStatusCounts();
          setStatusCounts(statusRes.statusBreakdown || {});
        } catch (error) {
          console.error('Failed to fetch status counts:', error);
          setStatusCounts({});
        }

        // Orders lists (do not block charts)
        const [allOrdersRes, byStatusRes] = await Promise.allSettled([
          orderService.getAllOrders(),
          orderService.getOrdersByStatus(selectedStatus),
        ]);
        if (allOrdersRes.status === 'fulfilled') {
          setRecentOrders(allOrdersRes.value.orders || []);
        }
        if (byStatusRes.status === 'fulfilled') {
          setOrdersByStatus(byStatusRes.value.orders || []);
        }
      } catch (e: unknown) {
        setSalesError(e instanceof Error ? e.message : 'Failed to load sales data');
      } finally {
        setSalesLoading(false);
      }
    };
    loadSales();
  }, [selectedStatus]);

  // Load logistics data
  useEffect(() => {
    const loadLogistics = async () => {
      setLogisticsLoading(true);
      setLogisticsError(null);
      try {
        console.log('🚚 Loading logistics data from backend...');
        
        // Load all logistics data in parallel
        const [
          deliveryPerformance,
          metrics,
          fleetData,
          driversData,
          vehiclesData,
          assignmentsData
        ] = await Promise.allSettled([
          logisticsService.getDeliveryPerformanceReport(),
          logisticsService.getLogisticsMetrics(),
          logisticsService.getFleetUtilizationReport(),
          logisticsService.getAllDrivers(),
          logisticsService.getAllVehicles(),
          logisticsService.getAllAssignments()
        ]);

        // Set delivery performance data
        if (deliveryPerformance.status === 'fulfilled') {
          setLogisticsData(deliveryPerformance.value);
          console.log('✅ Delivery performance data loaded:', deliveryPerformance.value.length, 'records');
        }

        // Set logistics metrics
        if (metrics.status === 'fulfilled') {
          setLogisticsMetrics(metrics.value);
          console.log('✅ Logistics metrics loaded:', metrics.value);
        }

        // Set fleet utilization data
        if (fleetData.status === 'fulfilled') {
          setFleetUtilization(fleetData.value);
          console.log('✅ Fleet utilization data loaded:', fleetData.value);
        }

        // Set drivers data
        if (driversData.status === 'fulfilled') {
          setDrivers(driversData.value);
          console.log('✅ Drivers data loaded:', driversData.value.length, 'drivers');
        }

        // Set vehicles data
        if (vehiclesData.status === 'fulfilled') {
          setVehicles(vehiclesData.value);
          console.log('✅ Vehicles data loaded:', vehiclesData.value.length, 'vehicles');
        }

        // Set assignments data
        if (assignmentsData.status === 'fulfilled') {
          setAssignments(assignmentsData.value);
          console.log('✅ Assignments data loaded:', assignmentsData.value.length, 'assignments');
        }

        console.log('🚚 Logistics data loading completed');
      } catch (e: unknown) {
        console.error('❌ Failed to load logistics data:', e);
        setLogisticsError(e instanceof Error ? e.message : 'Failed to load logistics data');
      } finally {
        setLogisticsLoading(false);
      }
    };
    loadLogistics();
  }, []);

  // Load cost analysis data
  useEffect(() => {
    const loadCostAnalysis = async () => {
      setCostLoading(true);
      setCostError(null);
      try {
        console.log('💰 Loading cost analysis data from backend...');
        
        const [inventoryCostRes, purchaseStatsRes, costMetricsRes] = await Promise.allSettled([
          costService.getInventoryCost(),
          costService.getPurchaseOrderStats(),
          costService.getCostAnalysisMetrics(),
        ]);

        if (inventoryCostRes.status === 'fulfilled') {
          setInventoryCost(inventoryCostRes.value);
          console.log('✅ Inventory cost data loaded:', inventoryCostRes.value);
        }
        if (purchaseStatsRes.status === 'fulfilled') {
          setPurchaseStats(purchaseStatsRes.value);
          console.log('✅ Purchase stats data loaded:', purchaseStatsRes.value);
        }
        if (costMetricsRes.status === 'fulfilled') {
          setCostMetrics(costMetricsRes.value);
          console.log('✅ Cost metrics data loaded:', costMetricsRes.value);
        }

      } catch (error) {
        console.error('❌ Error loading cost analysis data:', error);
        setCostError(error instanceof Error ? error.message : 'Failed to load cost analysis data');
      } finally {
        setCostLoading(false);
      }
    };
    loadCostAnalysis();
  }, []);

  // Load profitability analysis data
  useEffect(() => {
    const loadProfitabilityAnalysis = async () => {
      setProfitabilityLoading(true);
      setProfitabilityError(null);
      try {
        console.log('💰 Loading profitability analysis data from backend...');
        
        const [grossProfitRes, discountImpactRes, orderProfitRes] = await Promise.allSettled([
          profitabilityService.getGrossProfitAnalysis(),
          profitabilityService.getDiscountImpactAnalysis(),
          profitabilityService.getOrderProfitability(),
        ]);

        if (grossProfitRes.status === 'fulfilled') {
          setGrossProfitAnalysis(grossProfitRes.value);
          console.log('✅ Gross profit analysis loaded:', grossProfitRes.value);
        }
        if (discountImpactRes.status === 'fulfilled') {
          setDiscountImpactAnalysis(discountImpactRes.value);
          console.log('✅ Discount impact analysis loaded:', discountImpactRes.value);
        }
        if (orderProfitRes.status === 'fulfilled') {
          setOrderProfitability(orderProfitRes.value);
          console.log('✅ Order profitability loaded:', orderProfitRes.value);
        }

      } catch (error) {
        console.error('❌ Error loading profitability analysis data:', error);
        setProfitabilityError(error instanceof Error ? error.message : 'Failed to load profitability analysis data');
      } finally {
        setProfitabilityLoading(false);
      }
    };
    loadProfitabilityAnalysis();
  }, []);

  // Load operational cost analysis data
  useEffect(() => {
    const loadOperationalCostAnalysis = async () => {
      setOperationalLoading(true);
      setOperationalError(null);
      try {
        console.log('🚚 Loading operational cost analysis data from backend...');
        
        const [logisticsCostRes, efficiencyRes] = await Promise.allSettled([
          profitabilityService.getLogisticsCostAnalysis(),
          profitabilityService.getOperationalEfficiencyMetrics(),
        ]);

        if (logisticsCostRes.status === 'fulfilled') {
          setLogisticsCostAnalysis(logisticsCostRes.value);
          console.log('✅ Logistics cost analysis loaded:', logisticsCostRes.value);
        }
        if (efficiencyRes.status === 'fulfilled') {
          setOperationalEfficiencyMetrics(efficiencyRes.value);
          console.log('✅ Operational efficiency metrics loaded:', efficiencyRes.value);
        }

      } catch (error) {
        console.error('❌ Error loading operational cost analysis data:', error);
        setOperationalError(error instanceof Error ? error.message : 'Failed to load operational cost analysis data');
      } finally {
        setOperationalLoading(false);
      }
    };
    loadOperationalCostAnalysis();
  }, []);

  // Load supplier analytics data
  useEffect(() => {
    const loadSupplierAnalytics = async () => {
      setSupplierLoading(true);
      setSupplierError(null);
      try {
        console.log('🏭 Loading supplier analytics data from backend...');
        
        const analytics = await supplierService.getSupplierAnalytics(dateFrom, dateTo);
        setSupplierAnalytics(analytics);
        
        console.log('✅ Supplier analytics data loaded:', analytics);
      } catch (error) {
        console.error('❌ Error loading supplier analytics data:', error);
        setSupplierError(error instanceof Error ? error.message : 'Failed to load supplier analytics data');
      } finally {
        setSupplierLoading(false);
      }
    };
    loadSupplierAnalytics();
  }, [dateFrom, dateTo]);

  const salesKpis = useMemo(() => {
    const totalOrders = Object.values(statusCounts).reduce((a, b) => a + (b || 0), 0);
    const confirmed = statusCounts['CONFIRMED'] || 0;
    const processed = statusCounts['PROCESSED'] || 0;
    const refunds = stripeStats?.total_refunds ?? 0;
    const todaysRevenue = todayRevenue?.revenue ?? 0;
    const aov = confirmed > 0 ? Math.round((todaysRevenue / confirmed) * 100) / 100 : 0;
    return { totalOrders, confirmed, processed, refunds, todaysRevenue, aov };
  }, [statusCounts, stripeStats, todayRevenue]);

  const monthlyMaxRevenue = useMemo(() => {
    const values = monthlyRevenue?.map(x => x?.revenue || 0) || [];
    const max = Math.max(1, ...values);
    console.log('🔍 Monthly revenue data:', monthlyRevenue);
    console.log('🔍 Monthly max revenue:', max);
    console.log('🔍 Revenue values:', values);
    return max;
  }, [monthlyRevenue]);

  const statusMax = useMemo(() => {
    const values = Object.values(statusCounts);
    const max = values.length ? Math.max(1, ...values) : 1;
    console.log('🔍 Status counts:', statusCounts);
    console.log('🔍 Status values:', values);
    console.log('🔍 Status max:', max);
    return max;
  }, [statusCounts]);

  // Debug data loading
  useEffect(() => {
    console.log('🔍 Sales data debug:', {
      salesLoading,
      monthlyRevenue,
      monthlyMaxRevenue,
      statusCounts,
      statusMax,
      todayRevenue,
      stripeStats
    });
    
    // Add a simple alert to verify the component is working
    if (monthlyRevenue.length > 0) {
      console.log('✅ Monthly revenue data loaded:', monthlyRevenue);
    } else {
      console.log('❌ No monthly revenue data');
    }
  }, [salesLoading, monthlyRevenue, monthlyMaxRevenue, statusCounts, statusMax, todayRevenue, stripeStats]);

  // Debug chart rendering
  useEffect(() => {
    console.log('🎯 Chart rendering debug:', {
      salesLoading,
      monthlyRevenue: monthlyRevenue?.length,
      monthlyMaxRevenue,
      statusCounts: Object.keys(statusCounts).length,
      statusMax
    });
  }, [salesLoading, monthlyRevenue, monthlyMaxRevenue, statusCounts, statusMax]);

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
      id: 'cost-analysis',
      name: 'Cost Analysis',
      icon: Icons.Package,
      color: 'bg-purple-500',
    },
    {
      id: 'profitability',
      name: 'Profitability',
      icon: Icons.TrendingUp,
      color: 'bg-green-500',
    },
    {
      id: 'operational-costs',
      name: 'Operational Costs',
      icon: Icons.Truck,
      color: 'bg-orange-500',
    },
    {
      id: 'supplier',
      name: 'Suppliers',
      icon: Icons.Building,
      color: 'bg-indigo-500',
    },
  ];

  // Get status color for inventory - commented out as not used
  /*
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
  */

  // Calculate summary statistics (Inventory KPIs)
  const inventoryKpis = useMemo(() => {
    const totalSkus = inventory.length;
    const totalOnHand = inventory.reduce((sum, row) => sum + (row.stock || 0), 0);
    const totalReserved = inventory.reduce(
      (sum, row) => sum + (row.reserved || 0),
      0
    );
    const totalAvailable = inventory.reduce(
      (sum, row) => sum + (row.availableStock || Math.max((row.stock || 0) - (row.reserved || 0), 0)),
      0
    );
    const belowThreshold = inventory.filter(
      row => (row.stock || 0) <= (row.minThreshold || 0)
    ).length;
    const stockoutRate = totalSkus === 0
      ? 0
      : Math.round((inventory.filter(r => (r.stock || 0) === 0).length / totalSkus) * 100);
    return {
      totalSkus,
      totalOnHand,
      totalReserved,
      totalAvailable,
      belowThreshold,
      stockoutRate,
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
      return (!Number.isNaN(from) ? t >= from : true) && (!Number.isNaN(to) ? t <= to : true);
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
      {/* Debug indicator */}
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        🚀 ReportsPage is rendering - Check console for debug logs
      </div>
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
                  {loading ? '—' : inventoryKpis.totalOnHand.toLocaleString()}
                </div>
                <div className='text-sm text-muted-foreground'>
                  On-Hand Units
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold'>
                  {loading ? '—' : `${inventoryKpis.stockoutRate}%`}
                </div>
                <div className='text-sm text-muted-foreground'>
                  Stockout Rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {error && (
          <div className='mb-4 text-sm text-red-600'>
            {error}
          </div>
        )}
        {salesError && (
          <div className='mb-4 text-sm text-red-600'>
            {salesError}
          </div>
        )}
        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total SKUs
              </CardTitle>
              <Icons.Package />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{loading ? '—' : inventoryKpis.totalSkus}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Open Stock Alerts
              </CardTitle>
              <Icons.Warning />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {loading ? '—' : inventoryKpis.openAlertsCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                On‑Hand Units
              </CardTitle>
              <Icons.ShoppingCart />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {loading ? '—' : inventoryKpis.totalOnHand}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Below Threshold
              </CardTitle>
              <Icons.Building />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{loading ? '—' : inventoryKpis.belowThreshold}</div>
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
                    <div className='grid grid-cols-1 gap-8'>
                      <div>
                        <div className='mb-3 text-sm font-semibold'>Low-Stock Items</div>
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
                                <tr key={item.inventoryId} className='hover:bg-muted/30'>
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
                                  <td className='px-6 py-6 text-sm text-muted-foreground' colSpan={5}>No low-stock items</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div>
                        <div className='mb-3 flex items-center justify-between'>
                          <div className='text-sm font-semibold'>Open Stock Alerts</div>
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
                                <tr key={alert.alertId} className='hover:bg-muted/30'>
                                  <td className='px-6 py-4 text-sm font-medium'>
                                    {alert.alertId}
                                  </td>
                                  <td className='px-6 py-4 text-sm'>{alert.productId}</td>
                                  <td className='px-6 py-4 text-sm'>{alert.alertType}</td>
                                  <td className='px-6 py-4 text-sm'>{alert.message}</td>
                                  <td className='px-6 py-4 text-sm'>
                                    {new Date(alert.createdAt).toLocaleString()}
                                  </td>
                                  <td className='px-6 py-4 text-sm'>
                                    <Button size='sm' onClick={() => handleResolveAlert(alert.alertId)}>Resolve</Button>
                                  </td>
                                </tr>
                              ))}
                              {!loading && openAlerts.length === 0 && (
                                <tr>
                                  <td className='px-6 py-6 text-sm text-muted-foreground' colSpan={6}>No open alerts</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div>
                        <div className='mb-3 text-sm font-semibold'>Alert History</div>
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
                              </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-gray-200'>
                              {(loading ? [] : filteredHistory).map(alert => (
                                <tr key={alert.alertId} className='hover:bg-muted/30'>
                                  <td className='px-6 py-4 text-sm font-medium'>{alert.alertId}</td>
                                  <td className='px-6 py-4 text-sm'>{alert.productId}</td>
                                  <td className='px-6 py-4 text-sm'>{alert.alertType}</td>
                                  <td className='px-6 py-4 text-sm'>{alert.message}</td>
                                  <td className='px-6 py-4 text-sm'>{new Date(alert.createdAt).toLocaleString()}</td>
                                </tr>
                              ))}
                              {!loading && filteredHistory.length === 0 && (
                                <tr>
                                  <td className='px-6 py-6 text-sm text-muted-foreground' colSpan={5}>No alerts in selected range</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
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
                    {/* KPI Row */}
                    <div className='grid grid-cols-1 md:grid-cols-6 gap-4 mb-6'>
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
                          <Icons.ShoppingCart />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>{salesLoading ? '—' : salesKpis.totalOrders}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Confirmed</CardTitle>
                          <Icons.CheckCircle />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>{salesLoading ? '—' : salesKpis.confirmed}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Processed</CardTitle>
                          <Icons.DocumentReport />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>{salesLoading ? '—' : salesKpis.processed}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Today Revenue</CardTitle>
                          <Icons.CurrencyDollar />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>{salesLoading ? '—' : (salesKpis.todaysRevenue || 0).toLocaleString()}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Refunds</CardTitle>
                          <Icons.XCircle />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>{salesLoading ? '—' : salesKpis.refunds}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Avg Order Value</CardTitle>
                          <Icons.TrendingUp />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>{salesLoading ? '—' : salesKpis.aov.toLocaleString()}</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Charts */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                      <Card>
                        <CardHeader>
                          <CardTitle className='text-base'>Revenue by Month</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className='text-sm text-gray-600 mb-2'>Chart Container (h-40 with border)</div>
                          <div className='grid grid-cols-12 gap-2 items-end h-40 border border-gray-200 p-2 bg-gray-50'>
                            {(!salesLoading && monthlyRevenue && monthlyRevenue.length > 0) ? monthlyRevenue.map((m, idx) => {
                              const height = Math.min(100, Math.max(8, Math.round(((m.revenue || 0) / monthlyMaxRevenue) * 100)));
                              console.log(`📊 Chart bar ${idx}:`, { month: m.month, revenue: m.revenue, height, monthlyMaxRevenue });
                              return (
                                <div key={idx} className='flex flex-col items-center h-full'>
                                  <div
                                    className='w-full bg-blue-500 rounded min-h-[8px] border border-blue-600'
                                    style={{ height: `${height}%` }}
                                    title={`${m.month}: $${m.revenue?.toFixed(2) || 0}`}
                                  />
                                  <div className='text-[10px] mt-1 truncate'>{m.month?.slice(0,3)}</div>
                                </div>
                              );
                            }) : (
                              <div className='col-span-12 text-center text-sm text-muted-foreground'>
                                {salesLoading ? 'Loading...' : 'No revenue data'}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className='text-base'>Orders by Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className='text-sm text-gray-600 mb-2'>Status Chart Container (h-40 with border)</div>
                          <div className='grid grid-cols-4 gap-4 items-end h-40 border border-gray-200 p-2 bg-gray-50'>
                            {['CONFIRMED','PROCESSED','SHIPPED','CANCELLED'].map(status => {
                              const value = statusCounts[status] || 0;
                              const pct = Math.min(100, Math.max(8, Math.round((value / statusMax) * 100)));
                              console.log(`📊 Status bar ${status}:`, { value, pct, statusMax });
                              return (
                                <div key={status} className='flex flex-col items-center h-full'>
                                  <div className='w-full bg-foreground/10 rounded h-full flex items-end'>
                                    <div 
                                      className='w-full bg-foreground rounded min-h-[8px] border border-gray-400' 
                                      style={{ height: `${pct}%` }} 
                                      title={`${status}: ${value}`} 
                                    />
                                  </div>
                                  <div className='text-[10px] mt-1'>{status}</div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Tables */}
                    <div className='grid grid-cols-1 gap-8'>
                      <div>
                        <div className='mb-3 text-sm font-semibold'>Recent Orders</div>
                        <div className='overflow-x-auto'>
                          <table className='min-w-full divide-y divide-gray-200'>
                            <thead className='bg-muted/50'>
                              <tr>
                                <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Order ID</th>
                                <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Customer</th>
                                <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Status</th>
                                <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Total</th>
                                <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Created</th>
                              </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-gray-200'>
                              {(salesLoading ? [] : recentOrders).slice(0,10).map(o => (
                                <tr key={o.orderId} className='hover:bg-muted/30'>
                                  <td className='px-6 py-4 text-sm font-medium'>{o.orderId}</td>
                                  <td className='px-6 py-4 text-sm'>{o.customerId}</td>
                                  <td className='px-6 py-4 text-sm'>{o.status}</td>
                                  <td className='px-6 py-4 text-sm'>{o.totalAmount?.toLocaleString?.() || o.totalAmount}</td>
                                  <td className='px-6 py-4 text-sm'>{new Date(o.createdAt).toLocaleString()}</td>
                                </tr>
                              ))}
                              {!salesLoading && recentOrders.length === 0 && (
                                <tr>
                                  <td className='px-6 py-6 text-sm text-muted-foreground' colSpan={5}>No recent orders</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div>
                        <div className='mb-3 flex items-center justify-between'>
                          <div className='text-sm font-semibold'>Orders by Status</div>
                          <div className='flex items-center gap-2'>
                            <Select value={selectedStatus} onValueChange={v => setSelectedStatus(v)}>
                              <SelectTrigger className='w-40'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {['CONFIRMED','PROCESSED','SHIPPED','CANCELLED'].map(s => (
                                  <SelectItem value={s} key={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button variant='outline' onClick={() => setSelectedStatus(selectedStatus)}>
                              <Icons.Refresh />
                              <span className='ml-2'>Refresh</span>
                            </Button>
                          </div>
                        </div>
                        <div className='overflow-x-auto'>
                          <table className='min-w-full divide-y divide-gray-200'>
                            <thead className='bg-muted/50'>
                              <tr>
                                <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Order ID</th>
                                <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Customer</th>
                                <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Status</th>
                                <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Total</th>
                                <th className='px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Created</th>
                              </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-gray-200'>
                              {(salesLoading ? [] : ordersByStatus).slice(0,10).map(o => (
                                <tr key={o.orderId} className='hover:bg-muted/30'>
                                  <td className='px-6 py-4 text-sm font-medium'>{o.orderId}</td>
                                  <td className='px-6 py-4 text-sm'>{o.customerId}</td>
                                  <td className='px-6 py-4 text-sm'>{o.status}</td>
                                  <td className='px-6 py-4 text-sm'>{o.totalAmount?.toLocaleString?.() || o.totalAmount}</td>
                                  <td className='px-6 py-4 text-sm'>{new Date(o.createdAt).toLocaleString()}</td>
                                </tr>
                              ))}
                              {!salesLoading && ordersByStatus.length === 0 && (
                                <tr>
                                  <td className='px-6 py-6 text-sm text-muted-foreground' colSpan={5}>No orders for status {selectedStatus}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
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
                    {/* Loading State */}
                    {logisticsLoading && (
                      <div className='flex items-center justify-center py-12'>
                        <div className='h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent mr-3' />
                        <span className='text-muted-foreground'>Loading logistics data...</span>
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
                            <h3 className='text-sm font-medium text-red-800'>Error Loading Logistics Data</h3>
                            <p className='text-sm text-red-700 mt-1'>{logisticsError}</p>
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
                                <p className='text-sm font-medium text-muted-foreground'>Delivery Success Rate</p>
                                <p className='text-2xl font-bold'>{logisticsMetrics.deliverySuccessRate}%</p>
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
                                <p className='text-sm font-medium text-muted-foreground'>Avg Delivery Time</p>
                                <p className='text-2xl font-bold'>{logisticsMetrics.averageDeliveryTime}h</p>
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
                                <p className='text-sm font-medium text-muted-foreground'>Driver Utilization</p>
                                <p className='text-2xl font-bold'>{logisticsMetrics.driverUtilization}%</p>
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
                                <p className='text-sm font-medium text-muted-foreground'>Vehicle Utilization</p>
                                <p className='text-2xl font-bold'>{logisticsMetrics.vehicleUtilization}%</p>
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
                              <div className='text-2xl font-bold text-blue-600'>{fleetUtilization.totalDrivers}</div>
                              <div className='text-sm text-muted-foreground'>Total Drivers</div>
                            </div>
                            <div className='text-center'>
                              <div className='text-2xl font-bold text-green-600'>{fleetUtilization.activeDrivers}</div>
                              <div className='text-sm text-muted-foreground'>Active Drivers</div>
                            </div>
                            <div className='text-center'>
                              <div className='text-2xl font-bold text-purple-600'>{fleetUtilization.totalVehicles}</div>
                              <div className='text-sm text-muted-foreground'>Total Vehicles</div>
                            </div>
                            <div className='text-center'>
                              <div className='text-2xl font-bold text-orange-600'>{fleetUtilization.assignedVehicles}</div>
                              <div className='text-sm text-muted-foreground'>Assigned Vehicles</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Delivery Performance Table */}
                    {!logisticsLoading && !logisticsError && (
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
                            {logisticsData.length > 0 ? (
                              logisticsData.map((item, index) => (
                                <tr key={index} className='hover:bg-muted/30'>
                                  <td className='px-6 py-4 text-sm font-medium'>
                                    {new Date(item.deliveryDate).toLocaleDateString()}
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
                                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                                        item.deliverySuccess >= 95 
                                          ? 'bg-green-100 text-green-800' 
                                          : item.deliverySuccess >= 90 
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
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
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className='px-6 py-12 text-center text-muted-foreground'>
                                  No delivery data available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Supplier Report */}
              {activeReport === 'supplier' && (
                <div>
                  <div className='px-6 py-4 border-b'>
                    <h2 className='text-2xl font-bold flex items-center'>
                      <Icons.Building />
                      <span className='ml-3'>Supplier Analytics</span>
                    </h2>
                    <p className='text-muted-foreground mt-1'>
                      Supplier performance, purchase orders, and spending analysis
                    </p>
                  </div>

                  <div className='p-6'>
                    {supplierLoading ? (
                      <div className='flex items-center justify-center py-12'>
                        <div className='text-center'>
                          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
                          <p className='text-muted-foreground'>Loading supplier analytics...</p>
                        </div>
                      </div>
                    ) : supplierError ? (
                      <div className='flex items-center justify-center py-12'>
                        <div className='text-center'>
                          <div className='text-red-500 mb-4'>❌</div>
                          <p className='text-red-600 font-medium'>Failed to load supplier data</p>
                          <p className='text-sm text-muted-foreground mt-2'>{supplierError}</p>
                        </div>
                      </div>
                    ) : supplierAnalytics ? (
                      <div className='space-y-6'>
                        {/* Key Metrics */}
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                          <Card>
                            <CardContent className='p-6'>
                              <div className='flex items-center justify-between'>
                                <div>
                                  <p className='text-sm font-medium text-muted-foreground'>Total Orders</p>
                                  <p className='text-2xl font-bold'>{supplierAnalytics.totalOrders || 0}</p>
                                </div>
                                <div className='h-8 w-8 text-muted-foreground'>
                                  <Icons.ShoppingCart />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className='p-6'>
                              <div className='flex items-center justify-between'>
                                <div>
                                  <p className='text-sm font-medium text-muted-foreground'>Total Value</p>
                                  <p className='text-2xl font-bold'>${(supplierAnalytics.totalValue || 0).toLocaleString()}</p>
                                </div>
                                <div className='h-8 w-8 text-muted-foreground'>
                                  <Icons.CreditCard />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className='p-6'>
                              <div className='flex items-center justify-between'>
                                <div>
                                  <p className='text-sm font-medium text-muted-foreground'>Avg Order Value</p>
                                  <p className='text-2xl font-bold'>${(supplierAnalytics.averageOrderValue || 0).toLocaleString()}</p>
                                </div>
                                <div className='h-8 w-8 text-muted-foreground'>
                                  <Icons.TrendingUp />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className='p-6'>
                              <div className='flex items-center justify-between'>
                                <div>
                                  <p className='text-sm font-medium text-muted-foreground'>Completed Orders</p>
                                  <p className='text-2xl font-bold'>{supplierAnalytics.completedOrders || 0}</p>
                                </div>
                                <div className='h-8 w-8 text-muted-foreground'>
                                  <Icons.Package />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Order Status Distribution */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Order Status Distribution</CardTitle>
                            <CardDescription>Breakdown of purchase orders by status</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className='grid grid-cols-3 gap-4 items-end h-40 border border-gray-200 p-4 bg-gray-50 rounded-lg'>
                              {[
                                { status: 'Pending', count: supplierAnalytics.pendingOrders || 0, color: 'bg-yellow-500' },
                                { status: 'Completed', count: supplierAnalytics.completedOrders || 0, color: 'bg-green-500' },
                                { status: 'Cancelled', count: supplierAnalytics.cancelledOrders || 0, color: 'bg-red-500' }
                              ].map(({ status, count, color }) => {
                                const maxCount = Math.max(supplierAnalytics.pendingOrders || 0, supplierAnalytics.completedOrders || 0, supplierAnalytics.cancelledOrders || 0);
                                const height = maxCount > 0 ? Math.max(8, Math.round((count / maxCount) * 100)) : 8;
                                return (
                                  <div key={status} className='flex flex-col items-center h-full'>
                                    <div
                                      className={`w-full ${color} rounded min-h-[8px] border border-gray-400`}
                                      style={{ height: `${height}%` }}
                                      title={`${status}: ${count} orders`}
                                    ></div>
                                    <div className='text-xs text-center mt-2'>
                                      <div className='font-medium'>{count}</div>
                                      <div className='text-muted-foreground'>{status}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Top Suppliers */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Top Suppliers by Spend</CardTitle>
                            <CardDescription>Suppliers ranked by total purchase value</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {(supplierAnalytics.topSuppliers || []).length > 0 ? (
                              <div className='space-y-4'>
                                {(supplierAnalytics.topSuppliers || []).map((supplier, index) => (
                                  <div key={supplier.supplierId} className='flex items-center justify-between p-4 border rounded-lg'>
                                    <div className='flex items-center space-x-4'>
                                      <div className='flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium'>
                                        {index + 1}
                                      </div>
                                      <div>
                                        <p className='font-medium'>{supplier.supplierName}</p>
                                        <p className='text-sm text-muted-foreground'>{supplier.orderCount} orders</p>
                                      </div>
                                    </div>
                                    <div className='text-right'>
                                      <p className='font-bold'>${(supplier.totalSpend || 0).toLocaleString()}</p>
                                      <p className='text-sm text-muted-foreground'>
                                        Avg: ${Math.round((supplier.totalSpend || 0) / (supplier.orderCount || 1)).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className='text-center py-8 text-muted-foreground'>
                                No supplier data available
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Monthly Trends Chart */}
                        {(supplierAnalytics.monthlyTrends || []).length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Monthly Purchase Trends</CardTitle>
                              <CardDescription>Purchase orders and value over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className='space-y-4'>
                                <div className='grid grid-cols-12 gap-2 items-end h-40 border border-gray-200 p-4 bg-gray-50 rounded-lg'>
                                  {(supplierAnalytics.monthlyTrends || []).map((trend, idx) => {
                                    const maxValue = Math.max(...(supplierAnalytics.monthlyTrends || []).map(t => t.value || 0));
                                    const height = maxValue > 0 ? Math.max(8, Math.round((trend.value / maxValue) * 100)) : 8;
                                    return (
                                      <div key={idx} className='flex flex-col items-center h-full'>
                                        <div
                                          className='w-full bg-blue-500 rounded min-h-[8px] border border-blue-600'
                                          style={{ height: `${height}%` }}
                                          title={`${trend.month}: $${(trend.value || 0).toLocaleString()} (${trend.orders || 0} orders)`}
                                        ></div>
                                        <div className='text-xs text-center mt-2 transform -rotate-45 origin-left'>
                                          {trend.month.slice(-2)}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className='grid grid-cols-2 gap-4 text-sm'>
                                  <div className='text-center p-3 bg-blue-50 rounded-lg'>
                                    <div className='font-medium text-blue-900'>Total Value</div>
                                    <div className='text-2xl font-bold text-blue-600'>
                                      ${(supplierAnalytics.monthlyTrends || []).reduce((sum, t) => sum + (t.value || 0), 0).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className='text-center p-3 bg-green-50 rounded-lg'>
                                    <div className='font-medium text-green-900'>Total Orders</div>
                                    <div className='text-2xl font-bold text-green-600'>
                                      {(supplierAnalytics.monthlyTrends || []).reduce((sum, t) => sum + (t.orders || 0), 0)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    ) : (
                      <div className='flex items-center justify-center py-12'>
                        <div className='text-center'>
                          <div className='text-muted-foreground mb-4'>📊</div>
                          <p className='text-muted-foreground'>No supplier data available</p>
                        </div>
                      </div>
                    )}
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

              {/* Cost Analysis Report */}
              {activeReport === 'cost-analysis' && (
                <div>
                  <div className='px-6 py-4 border-b'>
                    <h2 className='text-2xl font-bold flex items-center'>
                      <Icons.Package />
                      <span className='ml-3'>Cost Analysis Reports</span>
                    </h2>
                    <p className='text-muted-foreground mt-1'>
                      Inventory costs, purchase analysis, and cost optimization insights
                    </p>
                  </div>

                  <div className='p-6'>
                    {/* Cost KPIs */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                      {/* Total Inventory Cost */}
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Inventory Value</CardTitle>
                          <Icons.Package />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            ${inventoryCost?.totalAvailableInventoryCost ? inventoryCost.totalAvailableInventoryCost.toFixed(2) : '0.00'}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            {inventoryCost?.totalProductsWithStock || 0} products in stock
                          </p>
                        </CardContent>
                      </Card>

                      {/* Purchase Costs */}
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Purchase Costs</CardTitle>
                          <Icons.ShoppingCart />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            ${purchaseStats?.totalValue ? purchaseStats.totalValue.toFixed(2) : '0.00'}
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
                            ${costMetrics?.totalCosts ? costMetrics.totalCosts.toFixed(2) : '0.00'}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            Combined inventory + purchases
                          </p>
                        </CardContent>
                      </Card>

                      {/* Cost per Product */}
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Cost per Product</CardTitle>
                          <Icons.TrendingUp />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            ${costMetrics?.costPerProduct ? costMetrics.costPerProduct.toFixed(2) : '0.00'}
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
                              <div className='text-sm text-muted-foreground'>Loading cost data...</div>
                            </div>
                          ) : costMetrics ? (
                            <div className='space-y-4'>
                              <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>Inventory Value</span>
                                <span className='text-sm text-muted-foreground'>
                                  ${costMetrics.inventoryCost ? costMetrics.inventoryCost.toFixed(2) : '0.00'}
                                </span>
                              </div>
                              <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div 
                                  className='bg-blue-500 h-2 rounded-full' 
                                  style={{ 
                                    width: `${costMetrics.totalCosts && costMetrics.totalCosts > 0 && costMetrics.inventoryCost ? (costMetrics.inventoryCost / costMetrics.totalCosts) * 100 : 0}%` 
                                  }}
                                />
                              </div>
                              <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>Purchase Costs</span>
                                <span className='text-sm text-muted-foreground'>
                                  ${costMetrics.purchaseCosts ? costMetrics.purchaseCosts.toFixed(2) : '0.00'}
                                </span>
                              </div>
                              <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div 
                                  className='bg-green-500 h-2 rounded-full' 
                                  style={{ 
                                    width: `${costMetrics.totalCosts && costMetrics.totalCosts > 0 && costMetrics.purchaseCosts ? (costMetrics.purchaseCosts / costMetrics.totalCosts) * 100 : 0}%` 
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className='flex items-center justify-center h-40'>
                              <div className='text-sm text-muted-foreground'>No cost data available</div>
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
                              <div className='text-sm text-muted-foreground'>Loading purchase data...</div>
                            </div>
                          ) : purchaseStats ? (
                            <div className='space-y-4'>
                              <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>Total Orders</span>
                                <span className='text-sm text-muted-foreground'>
                                  {purchaseStats.totalOrders}
                                </span>
                              </div>
                              <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>Average Order Value</span>
                                <span className='text-sm text-muted-foreground'>
                                  ${purchaseStats.averageOrderValue ? purchaseStats.averageOrderValue.toFixed(2) : '0.00'}
                                </span>
                              </div>
                              <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>Total Value</span>
                                <span className='text-sm text-muted-foreground'>
                                  ${purchaseStats.totalValue ? purchaseStats.totalValue.toFixed(2) : '0.00'}
                                </span>
                              </div>
                              {purchaseStats.topSuppliers && purchaseStats.topSuppliers.length > 0 && (
                                <div className='mt-4'>
                                  <h4 className='text-sm font-medium mb-2'>Top Suppliers</h4>
                                  <div className='space-y-2'>
                                    {purchaseStats.topSuppliers.slice(0, 3).map((supplier, idx) => (
                                      <div key={idx} className='flex justify-between text-xs'>
                                        <span>{supplier.supplierName}</span>
                                        <span>${supplier.totalSpent ? supplier.totalSpent.toFixed(2) : '0.00'}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className='flex items-center justify-center h-40'>
                              <div className='text-sm text-muted-foreground'>No purchase data available</div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Cost Optimization Insights */}
                    <Card className='mb-6'>
                      <CardHeader>
                        <CardTitle>Cost Optimization Insights</CardTitle>
                        <CardDescription>
                          Recommendations for cost reduction and efficiency improvements
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                          <div className='space-y-4'>
                            <h4 className='font-semibold'>Cost Metrics</h4>
                            <div className='space-y-2'>
                              <div className='flex justify-between'>
                                <span className='text-sm'>Inventory Turnover</span>
                                <span className='text-sm font-medium'>
                                  {costMetrics?.inventoryTurnover ? costMetrics.inventoryTurnover.toFixed(2) : '0.00'}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-sm'>Cost Efficiency</span>
                                <span className='text-sm font-medium text-green-600'>
                                  {costMetrics?.costPerProduct && costMetrics.costPerProduct < 100 ? 'Good' : 'Needs Review'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className='space-y-4'>
                            <h4 className='font-semibold'>Optimization Recommendations</h4>
                            <div className='space-y-2 text-sm text-muted-foreground'>
                              <p>• {costMetrics?.inventoryCost && costMetrics.inventoryCost > costMetrics.purchaseCosts 
                                ? 'Consider reducing inventory levels' 
                                : 'Inventory levels are well balanced'}</p>
                              <p>• {purchaseStats?.averageOrderValue && purchaseStats.averageOrderValue > 1000 
                                ? 'Consider bulk purchasing for better rates' 
                                : 'Purchase order sizes are optimal'}</p>
                              <p>• {costMetrics?.inventoryTurnover && costMetrics.inventoryTurnover < 1 
                                ? 'Improve inventory turnover rate' 
                                : 'Inventory turnover is healthy'}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Cost Analysis Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Detailed Cost Analysis</CardTitle>
                        <CardDescription>
                          Comprehensive cost breakdown and analysis
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {costLoading ? (
                          <div className='flex items-center justify-center h-32'>
                            <div className='text-sm text-muted-foreground'>Loading cost analysis...</div>
                          </div>
                        ) : costMetrics ? (
                          <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                              <thead>
                                <tr className='border-b'>
                                  <th className='text-left py-2'>Cost Category</th>
                                  <th className='text-right py-2'>Amount</th>
                                  <th className='text-right py-2'>Percentage</th>
                                  <th className='text-right py-2'>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className='border-b'>
                                  <td className='py-2 font-medium'>Inventory Value</td>
                                  <td className='py-2 text-right'>${costMetrics.inventoryCost ? costMetrics.inventoryCost.toFixed(2) : '0.00'}</td>
                                  <td className='py-2 text-right'>
                                    {costMetrics.totalCosts && costMetrics.totalCosts > 0 && costMetrics.inventoryCost ? ((costMetrics.inventoryCost / costMetrics.totalCosts) * 100).toFixed(1) : '0.0'}%
                                  </td>
                                  <td className='py-2 text-right text-blue-600'>Active</td>
                                </tr>
                                <tr className='border-b'>
                                  <td className='py-2 font-medium'>Purchase Costs</td>
                                  <td className='py-2 text-right'>${costMetrics.purchaseCosts ? costMetrics.purchaseCosts.toFixed(2) : '0.00'}</td>
                                  <td className='py-2 text-right'>
                                    {costMetrics.totalCosts && costMetrics.totalCosts > 0 && costMetrics.purchaseCosts ? ((costMetrics.purchaseCosts / costMetrics.totalCosts) * 100).toFixed(1) : '0.0'}%
                                  </td>
                                  <td className='py-2 text-right text-green-600'>Recent</td>
                                </tr>
                                <tr className='border-b bg-gray-50'>
                                  <td className='py-2 font-medium'>Total Costs</td>
                                  <td className='py-2 text-right font-bold'>${costMetrics.totalCosts ? costMetrics.totalCosts.toFixed(2) : '0.00'}</td>
                                  <td className='py-2 text-right font-bold'>100.0%</td>
                                  <td className='py-2 text-right text-purple-600'>Combined</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className='flex items-center justify-center h-32'>
                            <div className='text-sm text-muted-foreground'>No cost analysis data available</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Profitability Reports */}
              {activeReport === 'profitability' && (
                <div>
                  <div className='px-6 py-4 border-b'>
                    <h2 className='text-2xl font-bold flex items-center'>
                      <Icons.TrendingUp />
                      <span className='ml-3'>Profitability Reports</span>
                    </h2>
                    <p className='text-muted-foreground mt-1'>
                      Gross profit analysis, discount impact, and order profitability insights
                    </p>
                  </div>

                  <div className='p-6'>
                    {/* Profitability KPIs */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                      {/* Gross Profit */}
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Gross Profit</CardTitle>
                          <Icons.TrendingUp />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold text-green-600'>
                            ${grossProfitAnalysis?.grossProfit ? grossProfitAnalysis.grossProfit.toFixed(2) : '0.00'}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            {grossProfitAnalysis?.grossProfitMargin ? grossProfitAnalysis.grossProfitMargin.toFixed(1) : '0.0'}% margin
                          </p>
                        </CardContent>
                      </Card>

                      {/* Total Revenue */}
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
                          <Icons.CurrencyDollar />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            ${grossProfitAnalysis?.totalRevenue ? grossProfitAnalysis.totalRevenue.toFixed(2) : '0.00'}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            {grossProfitAnalysis?.revenueGrowth ? (grossProfitAnalysis.revenueGrowth > 0 ? '+' : '') + grossProfitAnalysis.revenueGrowth.toFixed(1) + '%' : '0.0%'} growth
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
                            ${grossProfitAnalysis?.totalCostOfGoodsSold ? grossProfitAnalysis.totalCostOfGoodsSold.toFixed(2) : '0.00'}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            {grossProfitAnalysis?.costGrowth ? (grossProfitAnalysis.costGrowth > 0 ? '+' : '') + grossProfitAnalysis.costGrowth.toFixed(1) + '%' : '0.0%'} change
                          </p>
                        </CardContent>
                      </Card>

                      {/* Discount Impact */}
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Discount Impact</CardTitle>
                          <Icons.CreditCard />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold text-orange-600'>
                            ${discountImpactAnalysis?.totalDiscountsGiven ? discountImpactAnalysis.totalDiscountsGiven.toFixed(2) : '0.00'}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            {discountImpactAnalysis?.discountPercentage ? discountImpactAnalysis.discountPercentage.toFixed(1) : '0.0'}% of revenue
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
                              <div className='text-sm text-muted-foreground'>Loading profitability data...</div>
                            </div>
                          ) : grossProfitAnalysis ? (
                            <div className='space-y-4'>
                              <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>Revenue</span>
                                <span className='text-sm text-muted-foreground'>
                                  ${grossProfitAnalysis.totalRevenue ? grossProfitAnalysis.totalRevenue.toFixed(2) : '0.00'}
                                </span>
                              </div>
                              <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div 
                                  className='bg-green-500 h-2 rounded-full' 
                                  style={{ 
                                    width: `${grossProfitAnalysis.totalRevenue && grossProfitAnalysis.totalRevenue > 0 ? 100 : 0}%` 
                                  }}
                                />
                              </div>
                              <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>Cost of Goods Sold</span>
                                <span className='text-sm text-muted-foreground'>
                                  ${grossProfitAnalysis.totalCostOfGoodsSold ? grossProfitAnalysis.totalCostOfGoodsSold.toFixed(2) : '0.00'}
                                </span>
                              </div>
                              <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div 
                                  className='bg-red-500 h-2 rounded-full' 
                                  style={{ 
                                    width: `${grossProfitAnalysis.totalRevenue && grossProfitAnalysis.totalRevenue > 0 && grossProfitAnalysis.totalCostOfGoodsSold ? 
                                      (grossProfitAnalysis.totalCostOfGoodsSold / grossProfitAnalysis.totalRevenue) * 100 : 0}%` 
                                  }}
                                />
                              </div>
                              <div className='flex justify-between items-center pt-2 border-t'>
                                <span className='text-sm font-medium'>Gross Profit</span>
                                <span className='text-sm font-bold text-green-600'>
                                  ${grossProfitAnalysis.grossProfit ? grossProfitAnalysis.grossProfit.toFixed(2) : '0.00'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className='flex items-center justify-center h-40'>
                              <div className='text-sm text-muted-foreground'>No profitability data available</div>
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
                              <div className='text-sm text-muted-foreground'>Loading discount data...</div>
                            </div>
                          ) : discountImpactAnalysis ? (
                            <div className='space-y-4'>
                              <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>Total Discounts</span>
                                <span className='text-sm text-muted-foreground'>
                                  ${discountImpactAnalysis.totalDiscountsGiven ? discountImpactAnalysis.totalDiscountsGiven.toFixed(2) : '0.00'}
                                </span>
                              </div>
                              <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>Net Revenue</span>
                                <span className='text-sm text-muted-foreground'>
                                  ${discountImpactAnalysis.netRevenue ? discountImpactAnalysis.netRevenue.toFixed(2) : '0.00'}
                                </span>
                              </div>
                              <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>Discount Efficiency</span>
                                <span className='text-sm text-muted-foreground'>
                                  {discountImpactAnalysis.discountEfficiency ? discountImpactAnalysis.discountEfficiency.toFixed(1) : '0.0'}%
                                </span>
                              </div>
                              {discountImpactAnalysis.topDiscounts && discountImpactAnalysis.topDiscounts.length > 0 && (
                                <div className='mt-4'>
                                  <h4 className='text-sm font-medium mb-2'>Top Discounts</h4>
                                  <div className='space-y-2'>
                                    {discountImpactAnalysis.topDiscounts.slice(0, 3).map((discount, idx) => (
                                      <div key={idx} className='flex justify-between text-xs'>
                                        <span>{discount.discountName}</span>
                                        <span>${discount.totalSavings ? discount.totalSavings.toFixed(2) : '0.00'}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className='flex items-center justify-center h-40'>
                              <div className='text-sm text-muted-foreground'>No discount data available</div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Order Profitability Analysis */}
                    <Card className='mb-6'>
                      <CardHeader>
                        <CardTitle>Order Profitability Analysis</CardTitle>
                        <CardDescription>
                          Profitability metrics for individual orders
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {profitabilityLoading ? (
                          <div className='flex items-center justify-center h-32'>
                            <div className='text-sm text-muted-foreground'>Loading order profitability data...</div>
                          </div>
                        ) : orderProfitability ? (
                          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                            <div className='text-center p-4 border rounded-lg'>
                              <div className='text-2xl font-bold'>{orderProfitability.totalOrders || 0}</div>
                              <div className='text-sm text-muted-foreground'>Total Orders</div>
                            </div>
                            <div className='text-center p-4 border rounded-lg'>
                              <div className='text-2xl font-bold text-green-600'>
                                ${orderProfitability.averageOrderProfit ? orderProfitability.averageOrderProfit.toFixed(2) : '0.00'}
                              </div>
                              <div className='text-sm text-muted-foreground'>Avg Order Profit</div>
                            </div>
                            <div className='text-center p-4 border rounded-lg'>
                              <div className='text-2xl font-bold'>
                                {orderProfitability.profitMargin ? orderProfitability.profitMargin.toFixed(1) : '0.0'}%
                              </div>
                              <div className='text-sm text-muted-foreground'>Profit Margin</div>
                            </div>
                            <div className='text-center p-4 border rounded-lg'>
                              <div className='text-2xl font-bold text-blue-600'>
                                {orderProfitability.profitabilityRate ? orderProfitability.profitabilityRate.toFixed(1) : '0.0'}%
                              </div>
                              <div className='text-sm text-muted-foreground'>Profitability Rate</div>
                            </div>
                          </div>
                        ) : (
                          <div className='flex items-center justify-center h-32'>
                            <div className='text-sm text-muted-foreground'>No order profitability data available</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Profitability Insights */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Profitability Insights</CardTitle>
                        <CardDescription>
                          Key insights and recommendations for improving profitability
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                          <div className='space-y-4'>
                            <h4 className='font-semibold'>Performance Metrics</h4>
                            <div className='space-y-2'>
                              <div className='flex justify-between'>
                                <span className='text-sm'>Gross Profit Margin</span>
                                <span className='text-sm font-medium'>
                                  {grossProfitAnalysis?.grossProfitMargin ? grossProfitAnalysis.grossProfitMargin.toFixed(1) : '0.0'}%
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-sm'>Revenue Growth</span>
                                <span className={`text-sm font-medium ${grossProfitAnalysis?.revenueGrowth && grossProfitAnalysis.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {grossProfitAnalysis?.revenueGrowth ? (grossProfitAnalysis.revenueGrowth > 0 ? '+' : '') + grossProfitAnalysis.revenueGrowth.toFixed(1) + '%' : '0.0%'}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-sm'>Cost Growth</span>
                                <span className={`text-sm font-medium ${grossProfitAnalysis?.costGrowth && grossProfitAnalysis.costGrowth < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {grossProfitAnalysis?.costGrowth ? (grossProfitAnalysis.costGrowth > 0 ? '+' : '') + grossProfitAnalysis.costGrowth.toFixed(1) + '%' : '0.0%'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className='space-y-4'>
                            <h4 className='font-semibold'>Recommendations</h4>
                            <div className='space-y-2 text-sm text-muted-foreground'>
                              <p>• {grossProfitAnalysis?.grossProfitMargin && grossProfitAnalysis.grossProfitMargin < 20 
                                ? 'Focus on improving gross profit margins' 
                                : 'Gross profit margins are healthy'}</p>
                              <p>• {discountImpactAnalysis?.discountPercentage && discountImpactAnalysis.discountPercentage > 15 
                                ? 'Review discount strategy to maintain profitability' 
                                : 'Discount strategy is well balanced'}</p>
                              <p>• {orderProfitability?.profitabilityRate && orderProfitability.profitabilityRate < 70 
                                ? 'Improve order profitability through cost optimization' 
                                : 'Order profitability is strong'}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Operational Cost Reports */}
              {activeReport === 'operational-costs' && (
                <div>
                  <div className='px-6 py-4 border-b'>
                    <h2 className='text-2xl font-bold flex items-center'>
                      <Icons.Truck />
                      <span className='ml-3'>Operational Cost Reports</span>
                    </h2>
                    <p className='text-muted-foreground mt-1'>
                      Logistics costs, delivery analysis, and operational efficiency metrics
                    </p>
                  </div>

                  <div className='p-6'>
                    {/* Operational Cost KPIs */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                      {/* Total Logistics Cost */}
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Total Logistics Cost</CardTitle>
                          <Icons.Truck />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            ${logisticsCostAnalysis?.totalLogisticsCost ? logisticsCostAnalysis.totalLogisticsCost.toFixed(2) : '0.00'}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            {logisticsCostAnalysis?.efficiencyScore ? logisticsCostAnalysis.efficiencyScore.toFixed(1) : '0.0'}% efficiency
                          </p>
                        </CardContent>
                      </Card>

                      {/* Delivery Costs */}
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Delivery Costs</CardTitle>
                          <Icons.Package />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            ${logisticsCostAnalysis?.deliveryCosts ? logisticsCostAnalysis.deliveryCosts.toFixed(2) : '0.00'}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            ${logisticsCostAnalysis?.costPerDelivery ? logisticsCostAnalysis.costPerDelivery.toFixed(2) : '0.00'} per delivery
                          </p>
                        </CardContent>
                      </Card>

                      {/* Vehicle Costs */}
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Vehicle Costs</CardTitle>
                          <Icons.Truck />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            ${logisticsCostAnalysis?.vehicleCosts ? logisticsCostAnalysis.vehicleCosts.toFixed(2) : '0.00'}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            Fleet maintenance & fuel
                          </p>
                        </CardContent>
                      </Card>

                      {/* Driver Costs */}
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Driver Costs</CardTitle>
                          <Icons.TrendingUp />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            ${logisticsCostAnalysis?.driverCosts ? logisticsCostAnalysis.driverCosts.toFixed(2) : '0.00'}
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
                              <div className='text-sm text-muted-foreground'>Loading logistics data...</div>
                            </div>
                          ) : logisticsCostAnalysis ? (
                            <div className='space-y-4'>
                              <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>Delivery Costs</span>
                                <span className='text-sm text-muted-foreground'>
                                  ${logisticsCostAnalysis.deliveryCosts ? logisticsCostAnalysis.deliveryCosts.toFixed(2) : '0.00'}
                                </span>
                              </div>
                              <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div 
                                  className='bg-blue-500 h-2 rounded-full' 
                                  style={{ 
                                    width: `${logisticsCostAnalysis.totalLogisticsCost && logisticsCostAnalysis.totalLogisticsCost > 0 && logisticsCostAnalysis.deliveryCosts ? 
                                      (logisticsCostAnalysis.deliveryCosts / logisticsCostAnalysis.totalLogisticsCost) * 100 : 0}%` 
                                  }}
                                />
                              </div>
                              <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>Vehicle Costs</span>
                                <span className='text-sm text-muted-foreground'>
                                  ${logisticsCostAnalysis.vehicleCosts ? logisticsCostAnalysis.vehicleCosts.toFixed(2) : '0.00'}
                                </span>
                              </div>
                              <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div 
                                  className='bg-green-500 h-2 rounded-full' 
                                  style={{ 
                                    width: `${logisticsCostAnalysis.totalLogisticsCost && logisticsCostAnalysis.totalLogisticsCost > 0 && logisticsCostAnalysis.vehicleCosts ? 
                                      (logisticsCostAnalysis.vehicleCosts / logisticsCostAnalysis.totalLogisticsCost) * 100 : 0}%` 
                                  }}
                                />
                              </div>
                              <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>Driver Costs</span>
                                <span className='text-sm text-muted-foreground'>
                                  ${logisticsCostAnalysis.driverCosts ? logisticsCostAnalysis.driverCosts.toFixed(2) : '0.00'}
                                </span>
                              </div>
                              <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div 
                                  className='bg-orange-500 h-2 rounded-full' 
                                  style={{ 
                                    width: `${logisticsCostAnalysis.totalLogisticsCost && logisticsCostAnalysis.totalLogisticsCost > 0 && logisticsCostAnalysis.driverCosts ? 
                                      (logisticsCostAnalysis.driverCosts / logisticsCostAnalysis.totalLogisticsCost) * 100 : 0}%` 
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className='flex items-center justify-center h-40'>
                              <div className='text-sm text-muted-foreground'>No logistics data available</div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Operational Efficiency Metrics */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Operational Efficiency</CardTitle>
                          <CardDescription>
                            Key performance indicators for operational efficiency
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {operationalLoading ? (
                            <div className='flex items-center justify-center h-40'>
                              <div className='text-sm text-muted-foreground'>Loading efficiency data...</div>
                            </div>
                          ) : operationalEfficiencyMetrics ? (
                            <div className='space-y-4'>
                              <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>Revenue per Employee</span>
                                <span className='text-sm text-muted-foreground'>
                                  ${operationalEfficiencyMetrics.revenuePerEmployee ? operationalEfficiencyMetrics.revenuePerEmployee.toFixed(0) : '0'}
                                </span>
                              </div>
                              <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>Cost per Order</span>
                                <span className='text-sm text-muted-foreground'>
                                  ${operationalEfficiencyMetrics.costPerOrder ? operationalEfficiencyMetrics.costPerOrder.toFixed(2) : '0.00'}
                                </span>
                              </div>
                              <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>Inventory Turnover</span>
                                <span className='text-sm text-muted-foreground'>
                                  {operationalEfficiencyMetrics.inventoryTurnover ? operationalEfficiencyMetrics.inventoryTurnover.toFixed(1) : '0.0'}x
                                </span>
                              </div>
                              <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>Delivery Efficiency</span>
                                <span className='text-sm text-muted-foreground'>
                                  {operationalEfficiencyMetrics.deliveryEfficiency ? operationalEfficiencyMetrics.deliveryEfficiency.toFixed(1) : '0.0'}%
                                </span>
                              </div>
                              <div className='flex justify-between items-center pt-2 border-t'>
                                <span className='text-sm font-medium'>Overall Efficiency</span>
                                <span className='text-sm font-bold text-green-600'>
                                  {operationalEfficiencyMetrics.overallEfficiency ? operationalEfficiencyMetrics.overallEfficiency.toFixed(1) : '0.0'}%
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className='flex items-center justify-center h-40'>
                              <div className='text-sm text-muted-foreground'>No efficiency data available</div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Operational Recommendations */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Operational Recommendations</CardTitle>
                        <CardDescription>
                          Recommendations for improving operational efficiency and reducing costs
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {operationalLoading ? (
                          <div className='flex items-center justify-center h-32'>
                            <div className='text-sm text-muted-foreground'>Loading recommendations...</div>
                          </div>
                        ) : operationalEfficiencyMetrics && operationalEfficiencyMetrics.recommendations ? (
                          <div className='space-y-4'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                              {operationalEfficiencyMetrics.recommendations.map((recommendation, idx) => (
                                <div key={idx} className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                                  <div className='text-sm font-medium text-blue-800'>{recommendation}</div>
                                </div>
                              ))}
                            </div>
                            <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                              <h4 className='font-semibold mb-2'>Additional Insights</h4>
                              <div className='space-y-2 text-sm text-muted-foreground'>
                                <p>• {logisticsCostAnalysis?.costPerDelivery && logisticsCostAnalysis.costPerDelivery > 50 
                                  ? 'Consider optimizing delivery routes to reduce costs' 
                                  : 'Delivery costs are well optimized'}</p>
                                <p>• {operationalEfficiencyMetrics?.overallEfficiency && operationalEfficiencyMetrics.overallEfficiency < 70 
                                  ? 'Focus on improving overall operational efficiency' 
                                  : 'Operational efficiency is strong'}</p>
                                <p>• {logisticsCostAnalysis?.efficiencyScore && logisticsCostAnalysis.efficiencyScore < 80 
                                  ? 'Review logistics operations for efficiency improvements' 
                                  : 'Logistics operations are efficient'}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className='flex items-center justify-center h-32'>
                            <div className='text-sm text-muted-foreground'>No recommendations available</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Financial Report */}
              {activeReport === 'financial' && (
                <div>
                  <div className='px-6 py-4 border-b'>
                    <h2 className='text-2xl font-bold flex items-center'>
                      <Icons.CurrencyDollar />
                      <span className='ml-3'>Revenue Reports</span>
                    </h2>
                    <p className='text-muted-foreground mt-1'>
                      Revenue analytics, trends, and financial performance insights
                    </p>
                  </div>

                  <div className='p-6'>
                    {/* Revenue KPIs */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                      {/* Today's Revenue */}
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Today&apos;s Revenue</CardTitle>
                          <Icons.CurrencyDollar />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            ${todayRevenue?.revenue?.toFixed(2) || '0.00'}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            {todayRevenue?.count || 0} transactions
                          </p>
                        </CardContent>
                      </Card>

                      {/* Total Revenue */}
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
                          <Icons.TrendingUp />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            ${stripeStats?.total_revenue?.toFixed(2) || '0.00'}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            {stripeStats?.total_payments || 0} total payments
                          </p>
                        </CardContent>
                      </Card>

                      {/* Refunds */}
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Refunds</CardTitle>
                          <Icons.CreditCard />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold text-red-600'>
                            {stripeStats?.total_refunds || 0}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            Total refunded transactions
                          </p>
                        </CardContent>
                      </Card>

                      {/* Average Order Value */}
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Avg Order Value</CardTitle>
                          <Icons.ShoppingCart />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            ${stripeStats?.total_payments && stripeStats.total_payments > 0 
                              ? (stripeStats.total_revenue / stripeStats.total_payments).toFixed(2)
                              : '0.00'}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            Per transaction
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Revenue Growth Analysis */}
                    <Card className='mb-6'>
                      <CardHeader>
                        <CardTitle>Revenue Growth Analysis</CardTitle>
                        <CardDescription>
                          Month-over-month revenue growth and trend analysis
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {monthlyRevenue && monthlyRevenue.length > 1 ? (
                          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            {monthlyRevenue.slice(0, 3).map((month, idx) => {
                              const prevMonth = monthlyRevenue[idx + 1];
                              const growth = prevMonth && prevMonth.revenue > 0 
                                ? ((month.revenue - prevMonth.revenue) / prevMonth.revenue) * 100
                                : 0;
                              return (
                                <div key={idx} className='text-center p-4 border rounded-lg'>
                                  <div className='text-sm font-medium text-muted-foreground'>{month.month}</div>
                                  <div className='text-2xl font-bold'>${month.revenue?.toFixed(2) || '0.00'}</div>
                                  <div className={`text-sm ${growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                                    {growth > 0 ? '+' : ''}{growth.toFixed(1)}% vs previous
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className='text-center py-8 text-muted-foreground'>
                            Insufficient data for growth analysis
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Revenue Charts Section */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
                      {/* Monthly Revenue Trend */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Monthly Revenue Trend</CardTitle>
                          <CardDescription>
                            Revenue breakdown by month for the current year
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {salesLoading ? (
                            <div className='flex items-center justify-center h-40'>
                              <div className='text-sm text-muted-foreground'>Loading revenue data...</div>
                            </div>
                          ) : monthlyRevenue && monthlyRevenue.length > 0 ? (
                            <div className='space-y-4'>
                              <div className='grid grid-cols-12 gap-2 items-end h-40'>
                                {monthlyRevenue.map((month, idx) => {
                                  const height = Math.min(100, Math.max(8, Math.round(((month.revenue || 0) / monthlyMaxRevenue) * 100)));
                                  return (
                                    <div key={idx} className='flex flex-col items-center h-full'>
                                      <div
                                        className='w-full bg-blue-500 rounded min-h-[8px] border border-blue-600'
                                        style={{ height: `${height}%` }}
                                        title={`${month.month}: $${month.revenue?.toFixed(2) || 0}`}
                                      />
                                      <div className='text-[10px] mt-1 truncate'>{month.month?.slice(0,3)}</div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className='text-sm text-muted-foreground text-center'>
                                Total Monthly Revenue: ${monthlyRevenue.reduce((sum, month) => sum + (month.revenue || 0), 0).toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <div className='flex items-center justify-center h-40'>
                              <div className='text-sm text-muted-foreground'>No revenue data available</div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Revenue Summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Revenue Summary</CardTitle>
                          <CardDescription>
                            Key revenue metrics and performance indicators
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className='space-y-4'>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm font-medium'>Today&apos;s Performance</span>
                              <span className='text-sm text-muted-foreground'>
                                ${todayRevenue?.revenue?.toFixed(2) || '0.00'}
                              </span>
                            </div>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm font-medium'>Best Month</span>
                              <span className='text-sm text-muted-foreground'>
                                {monthlyRevenue && monthlyRevenue.length > 0 
                                  ? monthlyRevenue.reduce((best, month) => 
                                      (month.revenue || 0) > (best.revenue || 0) ? month : best
                                    ).month + ': $' + 
                                    monthlyRevenue.reduce((best, month) => 
                                      (month.revenue || 0) > (best.revenue || 0) ? month : best
                                    ).revenue?.toFixed(2)
                                  : 'N/A'
                                }
                              </span>
                            </div>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm font-medium'>Average Monthly</span>
                              <span className='text-sm text-muted-foreground'>
                                ${monthlyRevenue && monthlyRevenue.length > 0
                                  ? (monthlyRevenue.reduce((sum, month) => sum + (month.revenue || 0), 0) / monthlyRevenue.length).toFixed(2)
                                  : '0.00'
                                }
                              </span>
                            </div>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm font-medium'>Refund Rate</span>
                              <span className='text-sm text-muted-foreground'>
                                {stripeStats?.total_payments && stripeStats.total_payments > 0 
                                  ? ((stripeStats.total_refunds / stripeStats.total_payments) * 100).toFixed(1) + '%'
                                  : '0.0%'
                                }
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Revenue Performance Insights */}
                    <Card className='mb-6'>
                      <CardHeader>
                        <CardTitle>Revenue Performance Insights</CardTitle>
                        <CardDescription>
                          Key performance indicators and business insights
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                          <div className='space-y-4'>
                            <h4 className='font-semibold'>Performance Metrics</h4>
                            <div className='space-y-2'>
                              <div className='flex justify-between'>
                                <span className='text-sm'>Revenue per Transaction</span>
                                <span className='text-sm font-medium'>
                                  ${stripeStats?.total_payments && stripeStats.total_payments > 0 
                                    ? (stripeStats.total_revenue / stripeStats.total_payments).toFixed(2)
                                    : '0.00'
                                  }
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-sm'>Success Rate</span>
                                <span className='text-sm font-medium text-green-600'>
                                  {stripeStats?.total_payments && stripeStats.total_payments > 0 
                                    ? (((stripeStats.total_payments - (stripeStats.total_refunds || 0)) / stripeStats.total_payments) * 100).toFixed(1) + '%'
                                    : '0.0%'
                                  }
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-sm'>Refund Rate</span>
                                <span className='text-sm font-medium text-red-600'>
                                  {stripeStats?.total_payments && stripeStats.total_payments > 0 
                                    ? (((stripeStats.total_refunds || 0) / stripeStats.total_payments) * 100).toFixed(1) + '%'
                                    : '0.0%'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className='space-y-4'>
                            <h4 className='font-semibold'>Business Insights</h4>
                            <div className='space-y-2 text-sm text-muted-foreground'>
                              <p>• {todayRevenue?.revenue && todayRevenue.revenue > 0 ? 'Strong daily performance' : 'Monitor daily revenue trends'}</p>
                              <p>• {monthlyRevenue && monthlyRevenue.length > 0 ? 'Revenue data available for analysis' : 'Limited historical data'}</p>
                              <p>• {stripeStats?.total_refunds && stripeStats.total_refunds > 0 ? 'Some refunds processed' : 'No refunds recorded'}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Revenue Analytics Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Monthly Revenue Breakdown</CardTitle>
                        <CardDescription>
                          Detailed monthly revenue data with transaction counts
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {salesLoading ? (
                          <div className='flex items-center justify-center h-32'>
                            <div className='text-sm text-muted-foreground'>Loading revenue data...</div>
                          </div>
                        ) : monthlyRevenue && monthlyRevenue.length > 0 ? (
                          <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                              <thead>
                                <tr className='border-b'>
                                  <th className='text-left py-2'>Month</th>
                                  <th className='text-right py-2'>Revenue</th>
                                  <th className='text-right py-2'>Transactions</th>
                                  <th className='text-right py-2'>Avg per Transaction</th>
                                </tr>
                              </thead>
                              <tbody>
                                {monthlyRevenue.map((month, idx) => (
                                  <tr key={idx} className='border-b'>
                                    <td className='py-2 font-medium'>{month.month}</td>
                                    <td className='py-2 text-right'>${month.revenue?.toFixed(2) || '0.00'}</td>
                                    <td className='py-2 text-right'>{month.count || 0}</td>
                                    <td className='py-2 text-right'>
                                      ${month.count > 0 ? (month.revenue / month.count).toFixed(2) : '0.00'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className='flex items-center justify-center h-32'>
                            <div className='text-sm text-muted-foreground'>No revenue data available</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
