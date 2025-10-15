import { orderService } from '@/lib/services/orderService';
import { supplierService } from '@/lib/services/supplierService';
import { purchaseOrderService } from '@/lib/services/purchaseOrderService';
import { deliveryLogService } from '@/lib/services/deliveryLogService';
import { categoryService } from '@/lib/services/categoryService';
import { productService } from '@/lib/services/productService';

export interface InventoryAnalytics {
  lowStock: number;
  outOfStock: number;
  inStock: number;
  totalProducts: number;
}

export interface StockMovementData {
  date: string;
  incoming: number;
  outgoing: number;
  net: number;
  [key: string]: unknown;
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  dailyData: Array<{
    date: string;
    revenue: number;
    orders: number;
    customers: number;
    avgOrderValue: number;
  }>;
  topProducts: Array<{
    product: string;
    sales: number;
    revenue: number;
  }>;
}

export interface SupplierAnalytics {
  totalSuppliers: number;
  totalOrders: number;
  onTimeRate: number;
  avgQualityScore: number;
  supplierPerformance: Array<{
    name: string;
    orders: number;
    onTimeDelivery: number;
    qualityScore: number;
    totalValue: number;
    avgDeliveryTime: number;
  }>;
  deliveryTrend: Array<{
    month: string;
    onTime: number;
    late: number;
    total: number;
  }>;
}

export const analyticsService = {
  /**
   * Get inventory analytics data
   */
  async getInventoryAnalytics(): Promise<{
    inventoryData: InventoryAnalytics;
    stockMovement: StockMovementData[];
    categoryData: Array<{ category: string; count: number; value: number }>;
  }> {
    try {
      // Fetch products data (which includes inventory information)
      // Get all products by using a large page size
      const products = await productService.getAllProducts(0, 1000);

      // Calculate stock status
      const lowStock = products.content.filter(
        (product: { availableStock: number; minThreshold?: number }) =>
          product.availableStock <= (product.minThreshold || 10) &&
          product.availableStock > 0
      ).length;
      const outOfStock = products.content.filter(
        (product: { availableStock: number }) => product.availableStock === 0
      ).length;
      const inStock = products.content.filter(
        (product: { availableStock: number; minThreshold?: number }) =>
          product.availableStock > (product.minThreshold || 10)
      ).length;
      const totalProducts = products.content.length;

      const inventoryData: InventoryAnalytics = {
        lowStock,
        outOfStock,
        inStock,
        totalProducts,
      };

      // Fetch orders and delivery logs for stock movement analysis
      const [ordersResponse, deliveryLogs] = await Promise.all([
        orderService.getAllOrders(),
        deliveryLogService.getAllDeliveryLogs().catch(() => []), // Fallback to empty array if delivery logs fail
      ]);

      let stockMovement: StockMovementData[] = [];

      if (ordersResponse.success) {
        const orders = ordersResponse.orders;

        // Group orders by date for the last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        stockMovement = last7Days.map(date => {
          const dayOrders = orders.filter(order =>
            order.orderDate.startsWith(date)
          );

          const outgoing = dayOrders.reduce(
            (sum, order) =>
              sum +
              order.orderItems.reduce(
                (itemSum, item) => itemSum + item.quantity,
                0
              ),
            0
          );

          // Calculate incoming stock from delivery logs
          const dayDeliveryLogs = deliveryLogs.filter(log =>
            log.receivedDate.startsWith(date)
          );

          const incoming = dayDeliveryLogs.reduce(
            (sum, log) => sum + (log.receivedQuantity || 0),
            0
          );

          return {
            date,
            incoming,
            outgoing,
            net: incoming - outgoing,
          };
        });
      }

      // Fetch real category data and calculate product counts
      const categories = await categoryService.getAllCategories();
      const categoryData = categories
        .map(category => {
          // Count products in this category
          const categoryProducts = products.content.filter(
            (product: { categoryId?: number }) =>
              product.categoryId === category.id
          );
          const count = categoryProducts.length;
          const value = categoryProducts.reduce(
            (
              sum: number,
              product: {
                unitPrice?: number;
                price: number;
                availableStock: number;
              }
            ) =>
              sum +
              (product.unitPrice || product.price) * product.availableStock,
            0
          );

          return {
            category: category.categoryName,
            count,
            value: Math.round(value),
          };
        })
        .filter(cat => cat.count > 0); // Only show categories with products

      return {
        inventoryData,
        stockMovement,
        categoryData,
      };
    } catch (error) {
      console.error('Error fetching inventory analytics:', error);
      throw error;
    }
  },

  /**
   * Get sales analytics data
   */
  async getSalesAnalytics(): Promise<SalesAnalytics> {
    try {
      const ordersResponse = await orderService.getAllOrders();
      if (!ordersResponse.success) {
        throw new Error('Failed to fetch orders');
      }

      const orders = ordersResponse.orders;

      // Calculate totals
      const totalRevenue = orders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );
      const totalOrders = orders.length;
      const totalCustomers = new Set(orders.map(order => order.customerId))
        .size;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Group orders by date for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const dailyData = last7Days.map(date => {
        const dayOrders = orders.filter(order =>
          order.orderDate.startsWith(date)
        );

        const revenue = dayOrders.reduce(
          (sum, order) => sum + order.totalAmount,
          0
        );
        const ordersCount = dayOrders.length;
        const uniqueCustomers = new Set(
          dayOrders.map(order => order.customerId)
        ).size;
        const dayAvgOrderValue = ordersCount > 0 ? revenue / ordersCount : 0;

        return {
          date,
          revenue: Math.round(revenue),
          orders: ordersCount,
          customers: uniqueCustomers,
          avgOrderValue: Math.round(dayAvgOrderValue),
        };
      });

      // Calculate top products from order items
      const productSales = new Map<
        string,
        { sales: number; revenue: number }
      >();

      orders.forEach(order => {
        order.orderItems.forEach(item => {
          const productName = item.productName;
          const existing = productSales.get(productName) || {
            sales: 0,
            revenue: 0,
          };
          productSales.set(productName, {
            sales: existing.sales + item.quantity,
            revenue: existing.revenue + item.price * item.quantity,
          });
        });
      });

      const topProducts = Array.from(productSales.entries())
        .map(([product, data]) => ({
          product,
          sales: data.sales,
          revenue: Math.round(data.revenue),
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      return {
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        totalCustomers,
        avgOrderValue: Math.round(avgOrderValue),
        dailyData,
        topProducts,
      };
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      throw error;
    }
  },

  /**
   * Get supplier analytics data
   */
  async getSupplierAnalytics(): Promise<SupplierAnalytics> {
    try {
      const [suppliers, purchaseOrders] = await Promise.all([
        supplierService.getAllSuppliers(),
        purchaseOrderService.getAllPurchaseOrders(),
      ]);

      // Calculate supplier performance metrics
      const supplierPerformanceMap = new Map<
        number,
        {
          name: string;
          orders: number;
          onTimeDelivery: number;
          qualityScore: number;
          totalValue: number;
          avgDeliveryTime: number;
        }
      >();

      // Initialize supplier data
      suppliers.forEach(supplier => {
        supplierPerformanceMap.set(supplier.supplierId, {
          name: supplier.userName,
          orders: 0,
          onTimeDelivery: 0,
          qualityScore: 4.0 + Math.random() * 1.0, // Mock quality score
          totalValue: 0,
          avgDeliveryTime: 2.0 + Math.random() * 2.0, // Mock delivery time
        });
      });

      // Process purchase orders
      for (const po of purchaseOrders) {
        const supplierData = supplierPerformanceMap.get(po.supplierId);
        if (supplierData) {
          supplierData.orders += 1;
          supplierData.totalValue += po.total || 0;

          // Mock on-time delivery calculation
          const isOnTime = Math.random() > 0.2; // 80% on-time rate
          if (isOnTime) {
            supplierData.onTimeDelivery += 1;
          }
        }
      }

      const supplierPerformance = Array.from(
        supplierPerformanceMap.values()
      ).filter(supplier => supplier.orders > 0);

      const totalOrders = supplierPerformance.reduce(
        (sum, s) => sum + s.orders,
        0
      );
      const totalOnTime = supplierPerformance.reduce(
        (sum, s) => sum + s.onTimeDelivery,
        0
      );
      const onTimeRate =
        totalOrders > 0 ? (totalOnTime / totalOrders) * 100 : 0;
      const avgQualityScore =
        supplierPerformance.length > 0
          ? supplierPerformance.reduce((sum, s) => sum + s.qualityScore, 0) /
            supplierPerformance.length
          : 0;

      // Generate delivery trend data (mock for now)
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toLocaleString('default', { month: 'short' });
      }).reverse();

      const deliveryTrend = last6Months.map(month => {
        const onTime = Math.floor(Math.random() * 20) + 80; // 80-100% on-time
        const late = 100 - onTime;
        return {
          month,
          onTime,
          late,
          total: 100,
        };
      });

      return {
        totalSuppliers: suppliers.length,
        totalOrders,
        onTimeRate: Math.round(onTimeRate * 10) / 10,
        avgQualityScore: Math.round(avgQualityScore * 10) / 10,
        supplierPerformance,
        deliveryTrend,
      };
    } catch (error) {
      console.error('Error fetching supplier analytics:', error);
      throw error;
    }
  },
};
