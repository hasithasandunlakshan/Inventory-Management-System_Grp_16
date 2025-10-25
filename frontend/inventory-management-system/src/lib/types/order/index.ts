// Order-related type definitions

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  orderItemId?: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  orderId: number;
  orderNumber?: string;
  customerId: number;
  customerName?: string;
  customerEmail?: string;
  status: OrderStatus;
  totalAmount: number;
  orderDate: string;
  deliveryDate?: string;
  shippingAddress?: string;
  items?: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderCreateRequest {
  customerId: number;
  items: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
  }>;
  shippingAddress?: string;
  deliveryDate?: string;
}

export interface OrderUpdateRequest {
  status?: OrderStatus;
  shippingAddress?: string;
  deliveryDate?: string;
}

export interface OrderStats {
  totalOrders: number;
  confirmed: number;
  processed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  pending: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export interface OrderAnalytics extends OrderStats {
  ordersByMonth: Array<{ month: string; count: number; revenue: number }>;
  topCustomers: Array<{
    customerId: number;
    customerName: string;
    orders: number;
    revenue: number;
  }>;
  statusDistribution: Record<OrderStatus, number>;
}
