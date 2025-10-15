import { createAuthenticatedRequestOptions } from '../utils/authUtils';
import { userService, UserInfo } from './userService';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:8084'}/api/orders`;

export interface OrderItem {
  orderItemId: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  barcode?: string;
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

export const orderService = {
  /**
   * Get all orders - returns confirmed orders ready for delivery
   */
  async getAllOrders(): Promise<AllOrdersResponse> {
    try {
      // Add timestamp to URL to prevent caching
      const timestamp = Date.now();
      const url = `${API_BASE_URL}/all?_t=${timestamp}`;
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
};
