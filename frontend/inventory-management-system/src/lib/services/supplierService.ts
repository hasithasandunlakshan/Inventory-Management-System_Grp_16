import { createAuthenticatedRequestOptions } from '../utils/auth/authUtils';

// Types for supplier data
export interface SupplierDTO {
  supplierId: number;
  userId: number;
  userName: string;
  categoryId?: number;
  categoryName?: string;
}

export interface SupplierCategoryDTO {
  categoryId: number;
  name: string;
}

export interface PurchaseOrderSummaryDTO {
  orderId: number;
  supplierId: number;
  supplierName: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  itemCount: number;
}

export interface SupplierSpendDTO {
  supplierId: number;
  supplierName: string;
  totalSpend: number;
  orderCount: number;
  averageOrderValue: number;
  lastOrderDate?: string;
}

export interface StatsSummaryDTO {
  count: number;
  total: number;
  byStatusCounts: {
    [key: string]: number;
  };
  byStatusTotals: {
    [key: string]: number;
  };
  totalOrders: number;
  totalValue: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export interface PurchaseOrderStats {
  totalOrders: number;
  totalValue: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  topSuppliers: Array<{
    supplierId: number;
    supplierName: string;
    totalSpend: number;
    orderCount: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    orders: number;
    value: number;
  }>;
}

class SupplierService {
  private baseUrl =
    process.env.NEXT_PUBLIC_SUPPLIER_SERVICE_URL || 'http://localhost:8082';

  constructor() {
    console.log(
      '🏭 SupplierService initialized with direct URL:',
      this.baseUrl
    );
  }

  // Utility function to safely parse dates
  private safeParseDate(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('🏭 Invalid date string:', dateString);
        return null;
      }
      return date;
    } catch (error) {
      console.warn('🏭 Error parsing date:', dateString, error);
      return null;
    }
  }

  // Utility function to safely extract month from date
  private safeExtractMonth(
    dateString: string | null | undefined
  ): string | null {
    const date = this.safeParseDate(dateString);
    if (!date) return null;

    try {
      return date.toISOString().slice(0, 7); // YYYY-MM
    } catch (error) {
      console.warn('🏭 Error extracting month from date:', dateString, error);
      return null;
    }
  }

  // Get all suppliers
  async getAllSuppliers(): Promise<SupplierDTO[]> {
    try {
      console.log(
        '🏭 Fetching suppliers directly from supplier service:',
        `${this.baseUrl}/api/suppliers`
      );
      const response = await fetch(`${this.baseUrl}/api/suppliers`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('🏭 Supplier response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🏭 Supplier fetch error:', errorText);
        throw new Error(
          `Failed to fetch suppliers: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
      const data = await response.json();
      console.log('🏭 Suppliers fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('🏭 Error fetching suppliers:', error);
      throw error;
    }
  }

  // Create a new supplier
  async createSupplier(supplierData: {
    userId: number;
    categoryId: number;
  }): Promise<SupplierDTO> {
    try {
      console.log(
        '🏭 Creating supplier directly from supplier service:',
        `${this.baseUrl}/api/suppliers`
      );
      const response = await fetch(`${this.baseUrl}/api/suppliers`, {
        ...createAuthenticatedRequestOptions('POST', supplierData),
        credentials: 'include',
      });
      console.log('🏭 Create supplier response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🏭 Create supplier error:', errorText);
        throw new Error(
          `Failed to create supplier: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
      const data = await response.json();
      console.log('🏭 Supplier created successfully:', data);
      return data;
    } catch (error) {
      console.error('🏭 Error creating supplier:', error);
      throw error;
    }
  }

  // Get supplier by ID
  async getSupplierById(id: number): Promise<SupplierDTO> {
    try {
      console.log(
        '🏭 Fetching supplier directly from supplier service:',
        `${this.baseUrl}/api/suppliers/${id}`
      );
      const response = await fetch(`${this.baseUrl}/api/suppliers/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('🏭 Supplier response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🏭 Supplier fetch error:', errorText);
        throw new Error(
          `Failed to fetch supplier: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
      const data = await response.json();
      console.log('🏭 Supplier fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('🏭 Error fetching supplier:', error);
      throw error;
    }
  }

  // Get all supplier categories
  async getAllCategories(): Promise<SupplierCategoryDTO[]> {
    try {
      console.log(
        '🏭 Fetching supplier categories directly from supplier service:',
        `${this.baseUrl}/api/supplier-categories`
      );
      const response = await fetch(`${this.baseUrl}/api/supplier-categories`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('🏭 Supplier categories response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🏭 Supplier categories fetch error:', errorText);
        throw new Error(
          `Failed to fetch supplier categories: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
      const data = await response.json();
      console.log('🏭 Supplier categories fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('🏭 Error fetching supplier categories:', error);
      throw error;
    }
  }

  // Get all purchase orders
  async getAllPurchaseOrders(): Promise<PurchaseOrderSummaryDTO[]> {
    try {
      console.log(
        '🏭 Fetching purchase orders directly from supplier service:',
        `${this.baseUrl}/api/purchase-orders`
      );
      const response = await fetch(`${this.baseUrl}/api/purchase-orders`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('🏭 Purchase orders response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🏭 Purchase orders fetch error:', errorText);
        throw new Error(
          `Failed to fetch purchase orders: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
      const data = await response.json();
      console.log('🏭 Purchase orders fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('🏭 Error fetching purchase orders:', error);
      throw error;
    }
  }

  // Get purchase order statistics
  async getPurchaseOrderStats(params?: {
    status?: string;
    supplierId?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<StatsSummaryDTO> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.supplierId)
        queryParams.append('supplierId', params.supplierId.toString());
      if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

      const url = `${this.baseUrl}/api/purchase-orders/stats/summary?${queryParams}`;
      console.log(
        '🏭 Fetching purchase order stats directly from supplier service:',
        url
      );

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('🏭 Purchase order stats response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🏭 Purchase order stats fetch error:', errorText);
        throw new Error(
          `Failed to fetch purchase order stats: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
      const data = await response.json();
      console.log('🏭 Purchase order stats fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('🏭 Error fetching purchase order stats:', error);
      throw error;
    }
  }

  // Get supplier spend data
  async getSupplierSpend(
    supplierId: number,
    from?: string,
    to?: string
  ): Promise<SupplierSpendDTO> {
    try {
      const queryParams = new URLSearchParams();
      if (from) queryParams.append('from', from);
      if (to) queryParams.append('to', to);

      const url = `${this.baseUrl}/api/suppliers/${supplierId}/spend?${queryParams}`;
      console.log(
        '🏭 Fetching supplier spend directly from supplier service:',
        url
      );

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('🏭 Supplier spend response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🏭 Supplier spend fetch error:', errorText);
        throw new Error(
          `Failed to fetch supplier spend: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
      const data = await response.json();
      console.log('🏭 Supplier spend fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('🏭 Error fetching supplier spend:', error);
      throw error;
    }
  }

  // Get comprehensive supplier analytics
  async getSupplierAnalytics(
    dateFrom?: string,
    dateTo?: string
  ): Promise<PurchaseOrderStats> {
    try {
      console.log('🏭 Starting supplier analytics calculation...');
      console.log('🏭 Date range:', { dateFrom, dateTo });

      // Fetch all data in parallel
      const [suppliers, purchaseOrders, stats] = await Promise.all([
        this.getAllSuppliers(),
        this.getAllPurchaseOrders(),
        this.getPurchaseOrderStats({ dateFrom, dateTo }),
      ]);

      console.log('🏭 Raw data fetched:', {
        suppliersCount: suppliers.length,
        purchaseOrdersCount: purchaseOrders.length,
        stats: stats,
      });

      // Calculate top suppliers by spend
      const supplierSpendMap = new Map<
        number,
        { name: string; totalSpend: number; orderCount: number }
      >();

      purchaseOrders.forEach(order => {
        try {
          // Validate order data
          if (
            !order.supplierId ||
            !order.supplierName ||
            typeof order.totalAmount !== 'number'
          ) {
            console.warn('🏭 Invalid order data found:', order, 'Skipping...');
            return;
          }

          const existing = supplierSpendMap.get(order.supplierId) || {
            name: order.supplierName,
            totalSpend: 0,
            orderCount: 0,
          };
          existing.totalSpend += order.totalAmount;
          existing.orderCount += 1;
          supplierSpendMap.set(order.supplierId, existing);
        } catch (error) {
          console.error(
            '🏭 Error processing order for supplier spend:',
            error,
            'Order:',
            order
          );
          // Continue processing other orders
        }
      });

      const topSuppliers = Array.from(supplierSpendMap.entries())
        .map(([supplierId, data]) => ({
          supplierId,
          supplierName: data.name,
          totalSpend: data.totalSpend,
          orderCount: data.orderCount,
        }))
        .sort((a, b) => b.totalSpend - a.totalSpend)
        .slice(0, 5);

      // Calculate monthly trends
      const monthlyMap = new Map<string, { orders: number; value: number }>();

      purchaseOrders.forEach(order => {
        try {
          // Use safe date parsing
          const month = this.safeExtractMonth(order.orderDate);
          if (!month) {
            console.warn(
              '🏭 Could not extract month from order date:',
              order.orderDate,
              'Skipping...'
            );
            return; // Skip this order if date is invalid
          }

          const existing = monthlyMap.get(month) || { orders: 0, value: 0 };
          existing.orders += 1;
          existing.value += order.totalAmount;
          monthlyMap.set(month, existing);
        } catch (error) {
          console.error(
            '🏭 Error processing order date:',
            error,
            'Order:',
            order
          );
          // Continue processing other orders even if one fails
        }
      });

      const monthlyTrends = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month));

      const result = {
        totalOrders: stats.totalOrders,
        totalValue: stats.totalValue,
        averageOrderValue: stats.averageOrderValue,
        pendingOrders: stats.pendingOrders,
        completedOrders: stats.completedOrders,
        cancelledOrders: stats.cancelledOrders,
        topSuppliers,
        monthlyTrends,
      };

      console.log('🏭 Supplier analytics calculated successfully:', {
        totalOrders: result.totalOrders,
        totalValue: result.totalValue,
        topSuppliersCount: result.topSuppliers.length,
        monthlyTrendsCount: result.monthlyTrends.length,
      });

      return result;
    } catch (error) {
      console.error('🏭 Error fetching supplier analytics:', error);
      throw error;
    }
  }
}

export const supplierService = new SupplierService();
