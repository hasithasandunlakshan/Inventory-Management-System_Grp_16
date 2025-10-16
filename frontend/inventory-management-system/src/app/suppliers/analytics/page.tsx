'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { enhancedSupplierService } from '@/lib/services/enhancedSupplierService';
import { supplierCategoryService } from '@/lib/services/supplierCategoryService';
import { purchaseOrderService } from '@/lib/services/purchaseOrderService';
import { useAuth } from '@/contexts/AuthContext';
import { getDistinctColor } from '@/lib/utils/colorUtils';
import { EnhancedSupplier, SupplierCategory, PurchaseOrderSummary } from '@/lib/types/supplier';

// Main component
function AnalyticsPageContent() {
  const { isAuthenticated } = useAuth();
  const [supplierCategoryData, setSupplierCategoryData] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);
  const [supplierSpendData, setSupplierSpendData] = useState<
    Array<{ supplierName: string; spend: number; orders: number }>
  >([]);
  const [poStatusData, setPoStatusData] = useState<
    Array<{ name: string; value: number; color: string; percentage: number }>
  >([]);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingSpend, setLoadingSpend] = useState(true);
  const [loadingPoStatus, setLoadingPoStatus] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('all');
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalPurchaseOrders, setTotalPurchaseOrders] = useState(0);

  // Load supplier category breakdown
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadSupplierCategoryData = async () => {
      try {
        setLoadingCategory(true);
        const [suppliers, categories] = await Promise.all([
          enhancedSupplierService.getAllSuppliersWithUserDetails(),
          supplierCategoryService.getAllCategories(),
        ]);

        // Count suppliers by category with distinct colors using utility function
        const categoryCounts = categories
          .map((category: SupplierCategory, index: number) => {
            const count = suppliers.filter(
              (supplier: EnhancedSupplier) =>
                supplier.categoryId === category.categoryId
            ).length;
            return {
              name: category.name,
              value: count,
              color: getDistinctColor(index),
            };
          })
          .filter(
            (item: { name: string; value: number; color: string }) =>
              item.value > 0
          );

        // Add uncategorized suppliers
        const uncategorizedCount = suppliers.filter(
          (supplier: EnhancedSupplier) => !supplier.categoryId
        ).length;
        if (uncategorizedCount > 0) {
          categoryCounts.push({
            name: 'Uncategorized',
            value: uncategorizedCount,
            color: getDistinctColor(categoryCounts.length),
          });
        }

        setSupplierCategoryData(categoryCounts);
        setTotalSuppliers(suppliers.length);
      } catch (error) {
        console.error('Error loading supplier category data:', error);
      } finally {
        setLoadingCategory(false);
      }
    };

    loadSupplierCategoryData();
  }, [isAuthenticated]);

  // Load supplier spend data
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadSupplierSpendData = async () => {
      try {
        setLoadingSpend(true);
        const [suppliers, allPurchaseOrders] = await Promise.all([
          enhancedSupplierService.getAllSuppliersWithUserDetails(),
          purchaseOrderService.getAllPurchaseOrders(),
        ]);

        // Filter purchase orders by time range
        let purchaseOrders = allPurchaseOrders;
        if (timeRange !== 'all') {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
          purchaseOrders = allPurchaseOrders.filter(
            (order: PurchaseOrderSummary) => new Date(order.date) >= cutoffDate
          );
        }

        // Calculate spend by supplier
        const spendBySupplier = new Map<
          number,
          { supplierName: string; totalSpend: number; orderCount: number }
        >();

        // Initialize all suppliers with zero spend
        suppliers.forEach((supplier: EnhancedSupplier) => {
          spendBySupplier.set(supplier.supplierId, {
            supplierName:
              supplier.userDetails?.fullName ||
              supplier.userName ||
              `Supplier ${supplier.supplierId}`,
            totalSpend: 0,
            orderCount: 0,
          });
        });

        // Calculate totals for each purchase order and aggregate by supplier
        const spendPromises = purchaseOrders.map(
          async (order: PurchaseOrderSummary) => {
            try {
              const totalResponse =
                await purchaseOrderService.getPurchaseOrderTotal(order.id);
              return {
                supplierId: order.supplierId,
                total: totalResponse.total,
              };
            } catch (error) {
              return {
                supplierId: order.supplierId,
                total: order.total || 0,
              };
            }
          }
        );

        const spendResults = await Promise.all(spendPromises);

        spendResults.forEach(
          ({ supplierId, total }: { supplierId: number; total: number }) => {
            const supplierData = spendBySupplier.get(supplierId);
            if (supplierData) {
              supplierData.totalSpend += total;
              supplierData.orderCount += 1;
            }
          }
        );

        // Convert to array and sort by spend (top 10)
        const sortedSpendData = Array.from(spendBySupplier.values())
          .filter(data => data.totalSpend > 0)
          .sort((a, b) => b.totalSpend - a.totalSpend)
          .slice(0, 10)
          .map(data => ({
            supplierName: data.supplierName,
            spend: data.totalSpend,
            orders: data.orderCount,
          }));

        setSupplierSpendData(sortedSpendData);
        setTotalSpend(
          sortedSpendData.reduce((sum, supplier) => sum + supplier.spend, 0)
        );
      } catch (error) {
        console.error('Error loading supplier spend data:', error);
      } finally {
        setLoadingSpend(false);
      }
    };

    loadSupplierSpendData();
  }, [isAuthenticated, timeRange]);

  // Load PO status data
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadPoStatusData = async () => {
      try {
        setLoadingPoStatus(true);
        const allPurchaseOrders =
          await purchaseOrderService.getAllPurchaseOrders();

        // Filter purchase orders by time range
        let purchaseOrders = allPurchaseOrders;
        if (timeRange !== 'all') {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
          purchaseOrders = allPurchaseOrders.filter(
            (order: PurchaseOrderSummary) => new Date(order.date) >= cutoffDate
          );
        }

        // Count orders by status
        const statusCounts = new Map<string, number>();
        purchaseOrders.forEach((order: PurchaseOrderSummary) => {
          const status = order.status || 'DRAFT';
          statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
        });

        const totalOrders = purchaseOrders.length;
        setTotalPurchaseOrders(totalOrders);

        // Define status colors and display names
        const statusConfig = [
          { key: 'DRAFT', name: 'Draft', color: '#94a3b8' },
          { key: 'SENT', name: 'Sent', color: '#3b82f6' },
          { key: 'PENDING', name: 'Pending', color: '#f59e0b' },
          { key: 'RECEIVED', name: 'Received', color: '#10b981' },
          { key: 'CANCELLED', name: 'Cancelled', color: '#ef4444' },
        ];

        // Convert to chart data with percentages
        const chartData = statusConfig
          .map(config => {
            const count = statusCounts.get(config.key) || 0;
            const percentage =
              totalOrders > 0 ? (count / totalOrders) * 100 : 0;
            return {
              name: config.name,
              value: count,
              color: config.color,
              percentage: Math.round(percentage * 100) / 100,
            };
          })
          .filter(item => item.value > 0);

        setPoStatusData(chartData);
      } catch (error) {
        console.error('Error loading PO status data:', error);
      } finally {
        setLoadingPoStatus(false);
      }
    };

    loadPoStatusData();
  }, [isAuthenticated, timeRange]);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Supplier Analytics
          </h1>
          <p className='text-muted-foreground'>
            Insights and analytics for supplier management
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='Select time range' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Time</SelectItem>
              <SelectItem value='30'>Last 30 Days</SelectItem>
              <SelectItem value='90'>Last 90 Days</SelectItem>
              <SelectItem value='365'>Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Suppliers</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalSuppliers}</div>
            <p className='text-xs text-muted-foreground'>
              Active suppliers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Spend</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>${totalSpend.toLocaleString()}</div>
            <p className='text-xs text-muted-foreground'>
              {timeRange === 'all' ? 'All time' : `Last ${timeRange} days`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Purchase Orders</CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalPurchaseOrders}</div>
            <p className='text-xs text-muted-foreground'>
              {timeRange === 'all' ? 'All time' : `Last ${timeRange} days`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Avg Order Value</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${totalPurchaseOrders > 0 ? (totalSpend / totalPurchaseOrders).toFixed(2) : '0.00'}
            </div>
            <p className='text-xs text-muted-foreground'>
              Per purchase order
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Supplier Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Suppliers by Category</CardTitle>
            <CardDescription>
              Distribution of suppliers across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCategory ? (
              <div className='flex items-center justify-center h-64'>
                <div className='text-lg'>Loading...</div>
              </div>
            ) : supplierCategoryData.length === 0 ? (
              <div className='flex items-center justify-center h-64'>
                <div className='text-center'>
                  <BarChart3 className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                  <p className='text-muted-foreground'>No category data available</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={supplierCategoryData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {supplierCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Purchase Order Status */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Order Status</CardTitle>
            <CardDescription>
              Distribution of purchase orders by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPoStatus ? (
              <div className='flex items-center justify-center h-64'>
                <div className='text-lg'>Loading...</div>
              </div>
            ) : poStatusData.length === 0 ? (
              <div className='flex items-center justify-center h-64'>
                <div className='text-center'>
                  <Package className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                  <p className='text-muted-foreground'>No status data available</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={poStatusData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {poStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Suppliers by Spend */}
        <Card>
          <CardHeader>
            <CardTitle>Top Suppliers by Spend</CardTitle>
            <CardDescription>
              Highest spending suppliers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSpend ? (
              <div className='flex items-center justify-center h-64'>
                <div className='text-lg'>Loading...</div>
              </div>
            ) : supplierSpendData.length === 0 ? (
              <div className='flex items-center justify-center h-64'>
                <div className='text-center'>
                  <TrendingUp className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                  <p className='text-muted-foreground'>No spend data available</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={supplierSpendData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis 
                    dataKey='supplierName' 
                    angle={-45}
                    textAnchor='end'
                    height={80}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'spend' ? `$${value.toLocaleString()}` : value,
                      name === 'spend' ? 'Spend' : 'Orders'
                    ]}
                  />
                  <Bar dataKey='spend' fill='#3b82f6' />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Supplier Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Performance</CardTitle>
            <CardDescription>
              Orders vs Spend analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSpend ? (
              <div className='flex items-center justify-center h-64'>
                <div className='text-lg'>Loading...</div>
              </div>
            ) : supplierSpendData.length === 0 ? (
              <div className='flex items-center justify-center h-64'>
                <div className='text-center'>
                  <BarChart3 className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                  <p className='text-muted-foreground'>No performance data available</p>
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                {supplierSpendData.slice(0, 5).map((supplier, index) => (
                  <div key={supplier.supplierName} className='flex items-center justify-between p-3 border rounded-lg'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium'>
                        {index + 1}
                      </div>
                      <div>
                        <p className='font-medium'>{supplier.supplierName}</p>
                        <p className='text-sm text-muted-foreground'>
                          {supplier.orders} orders
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold'>${supplier.spend.toLocaleString()}</p>
                      <p className='text-sm text-muted-foreground'>
                        ${supplier.orders > 0 ? (supplier.spend / supplier.orders).toFixed(2) : '0.00'} avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return <AnalyticsPageContent />;
}
