import { createAuthenticatedRequestOptions } from '../utils/auth/authUtils';
import { userService, UserInfo } from './userService';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:8084'}/api/orders`;

export interface OrderItem {
  orderItemId: number;
  productId: number | null;
  productName: string;
  productImageUrl?: string | null;
  quantity: number;
  barcode?: string | null;
  price: number;
  createdAt: string;
}

export interface Order {
  orderId: number;
  customerId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  // Customer address fields from User Service integration
  customerName?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerLatitude?: number;
  customerLongitude?: number;
  // Discount and refund fields
  originalAmount?: number | null;
  discountAmount?: number | null;
  discountCode?: string | null;
  discountId?: number | null;
  refundReason?: string | null;
  refundProcessedAt?: string | null;
  // Order delivery location fields
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
}

export interface OrderWithCustomer extends Order {
  customerInfo?: UserInfo;
}

export interface AllOrdersResponse {
  success: boolean;
  message: string;
  orders: Order[];
  totalOrders: number;
}

export interface AllOrdersWithCustomerResponse {
  success: boolean;
  message: string;
  orders: OrderWithCustomer[];
  totalOrders: number;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  last: boolean;
  first: boolean;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  orders: Order[];
  totalOrders: number;
  pagination: Pagination;
}

export interface RefundRequest {
  orderId: number;
  refundReason: string;
}

export interface RefundResponse {
  success: boolean;
  message: string;
  orderId: number;
  orderStatus?: string;
  refundAmount?: number;
  refundReason?: string;
  refundProcessedAt?: string;
  paymentStatus?: string;
}

export const orderService = {
  /**
   * Get all orders - returns confirmed orders ready for delivery
   * Supports both date filtering and pagination
   */
  async getAllOrders(
    dateFromOrPage?: string | number,
    dateToOrSize?: string | number
  ): Promise<AllOrdersResponse | OrdersResponse> {
    try {
      // Add timestamp to URL to prevent caching
      const timestamp = Date.now();
      let url = `${API_BASE_URL}/all?_t=${timestamp}`;

      // Check if pagination parameters (numbers) are provided
      if (
        typeof dateFromOrPage === 'number' &&
        typeof dateToOrSize === 'number'
      ) {
        // Pagination mode
        const page = dateFromOrPage;
        const size = dateToOrSize;
        url += `&page=${page}&size=${size}`;
      } else if (
        typeof dateFromOrPage === 'string' &&
        typeof dateToOrSize === 'string'
      ) {
        // Date filtering mode
        const dateFrom = dateFromOrPage;
        const dateTo = dateToOrSize;
        url += `&dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;
      }

      const requestOptions = createAuthenticatedRequestOptions();
      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch orders: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      // Add fetch timestamp to response for debugging
      data.fetchedAt = new Date().toISOString();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch orders - backend not available');
    }
  },

  /**
   * Get all orders with customer information for shipping
   */
  async getAllOrdersWithCustomers(): Promise<AllOrdersWithCustomerResponse> {
    try {
      const ordersResponse = await this.getAllOrders();

      if (!ordersResponse.success) {
        return {
          success: false,
          message: ordersResponse.message,
          orders: [],
          totalOrders: 0,
        };
      }

      // Fetch customer info for each order
      const ordersWithCustomers: OrderWithCustomer[] = [];

      for (const order of ordersResponse.orders) {
        try {
          const customerInfo = await userService.getUserById(order.customerId);
          ordersWithCustomers.push({
            ...order,
            customerInfo,
          });
        } catch (error) {
          // Add order without customer info
          ordersWithCustomers.push({
            ...order,
            customerInfo: undefined,
          });
        }
      }

      return {
        success: true,
        message: 'Orders with customer info retrieved successfully',
        orders: ordersWithCustomers,
        totalOrders: ordersWithCustomers.length,
      };
    } catch (error) {
      throw new Error(
        'Failed to fetch orders with customers - backend not available'
      );
    }
  },

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: string): Promise<AllOrdersResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/all/${status}`,
        createAuthenticatedRequestOptions()
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch orders by status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(
        'Failed to fetch orders by status - backend not available'
      );
    }
  },

  /**
   * Get a specific order by ID
   */
  async getOrderById(orderId: number): Promise<Order> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${orderId}`,
        createAuthenticatedRequestOptions()
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw new Error('Failed to fetch order - backend not available');
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: number,
    status: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${orderId}/status`,
        createAuthenticatedRequestOptions('PUT', { status })
      );

      if (!response.ok) {
        throw new Error(`Failed to update order status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw new Error('Failed to update order status - backend not available');
    }
  },

  /**
   * Get orders count by status
   */
  async getOrdersCountByStatus(status: string): Promise<{ count: number }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/count/status/${status}`,
        createAuthenticatedRequestOptions()
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch orders count: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw new Error('Failed to fetch orders count - backend not available');
    }
  },

  /**
   * Get all orders status counts (for analytics)
   */
  async getAllStatusCounts(): Promise<{
    statusBreakdown: Record<string, number>;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/debug/status-counts`,
        createAuthenticatedRequestOptions()
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch status counts: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to fetch status counts:', error);
      throw new Error('Failed to fetch status counts - backend not available');
    }
  },

  /**
   * Process refund for an order
   */
  async processRefund(refundRequest: RefundRequest): Promise<RefundResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/refund`,
        createAuthenticatedRequestOptions('POST', refundRequest)
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to process refund: ${errorData.message || response.statusText}`
        );
      }

      const refundResponse = await response.json();
      return refundResponse;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Filter orders client-side based on various criteria
   */
  filterOrders(
    orders: Order[],
    filters: {
      status?: string;
      minAmount?: number;
      maxAmount?: number;
      dateFrom?: string;
      dateTo?: string;
      searchTerm?: string;
    }
  ): Order[] {
    return orders.filter(order => {
      // Status filter
      if (
        filters.status &&
        filters.status !== 'all' &&
        order.status.toLowerCase() !== filters.status.toLowerCase()
      ) {
        return false;
      }

      // Amount filters
      if (filters.minAmount && order.totalAmount < filters.minAmount) {
        return false;
      }
      if (filters.maxAmount && order.totalAmount > filters.maxAmount) {
        return false;
      }

      // Date filters
      const orderDate = new Date(order.orderDate);
      if (filters.dateFrom && orderDate < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && orderDate > new Date(filters.dateTo)) {
        return false;
      }

      // Search term (search in order ID, customer ID, product names)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesOrderId = order.orderId.toString().includes(searchLower);
        const matchesCustomer = order.customerId
          .toString()
          .includes(searchLower);
        const matchesProducts = order.orderItems.some(item =>
          item.productName.toLowerCase().includes(searchLower)
        );

        if (!matchesOrderId && !matchesCustomer && !matchesProducts) {
          return false;
        }
      }

      return true;
    });
  },

  /**
   * Calculate order statistics
   */
  getOrderStats(orders: Order[]) {
    const totalOrders = orders.length;
    const confirmedOrders = orders.filter(o => o.status === 'CONFIRMED').length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get unique customers
    const uniqueCustomers = new Set(orders.map(o => o.customerId)).size;

    // Get most popular products
    const productCounts: { [key: string]: number } = {};
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.productName && item.productName !== 'No Product ID') {
          productCounts[item.productName] =
            (productCounts[item.productName] || 0) + item.quantity;
        }
      });
    });

    return {
      totalOrders,
      confirmedOrders,
      totalRevenue,
      averageOrderValue,
      uniqueCustomers,
      productCounts,
    };
  },
};
