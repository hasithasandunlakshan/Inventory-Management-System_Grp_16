import { authService } from '../lib/services/authService';

const ORDER_API_BASE_URL =
  'https://api-gateway-q42ns563da-uc.a.run.app/api/orders';

export interface OrderItem {
  orderItemId: number;
  productId: number | null;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  barcode: string | null;
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
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  orders: Order[];
  totalOrders: number;
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

class OrderService {
  private async getAuthHeaders() {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getAllOrders(): Promise<OrdersResponse> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${ORDER_API_BASE_URL}/all`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async getOrderById(orderId: number): Promise<Order> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${ORDER_API_BASE_URL}/${orderId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.status}`);
      }

      const data = await response.json();
      return data.order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Filter and search utilities
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
  }

  // Get order statistics
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
  }

  async processRefund(refundRequest: RefundRequest): Promise<RefundResponse> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${ORDER_API_BASE_URL}/refund`, {
        method: 'POST',
        headers,
        body: JSON.stringify(refundRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to process refund: ${errorData.message || response.statusText}`
        );
      }

      const refundResponse = await response.json();

      console.log('Refund processed:', refundResponse);
      return refundResponse;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }
}

export const orderService = new OrderService();
