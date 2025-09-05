import { 
  PurchaseOrder, 
  PurchaseOrderSummary,
  PurchaseOrderCreateRequest, 
  PurchaseOrderUpdateRequest,
  StatusUpdateRequest,
  ReceiveRequest,
  PurchaseOrderSearchParams,
  StatsSummary,
  PageResponse,
  PurchaseOrderItem,
  PurchaseOrderItemCreateRequest
} from '../types/supplier';
import { createAuthenticatedRequestOptions } from '../utils/authUtils';

const API_BASE_URL = 'http://localhost:8090/api/purchase-orders'; // Through API Gateway

export const purchaseOrderService = {
  /**
   * Create new purchase order
   */
  async createPurchaseOrder(order: PurchaseOrderCreateRequest): Promise<PurchaseOrder> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        ...createAuthenticatedRequestOptions(),
        body: JSON.stringify(order)
      });

      if (!response.ok) {
        throw new Error('Failed to create purchase order');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to create purchase order:', error);
      throw new Error('Failed to create purchase order - backend not available');
    }
  },

  /**
   * Get all purchase orders (summary)
   */
  async getAllPurchaseOrders(): Promise<PurchaseOrderSummary[]> {
    try {
      const response = await fetch(API_BASE_URL, createAuthenticatedRequestOptions());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch purchase orders: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
      throw new Error('Failed to fetch purchase orders - backend not available');
    }
  },

  /**
   * Get purchase order by ID (with items)
   */
  async getPurchaseOrderById(id: number): Promise<PurchaseOrder> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('inventory_auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Purchase order not found');
        }
        throw new Error(`Failed to fetch purchase order: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to fetch purchase order:', error);
      throw error;
    }
  },

  /**
   * Update purchase order
   */
  async updatePurchaseOrder(id: number, order: PurchaseOrderUpdateRequest): Promise<PurchaseOrder> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('inventory_auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
      });

      if (!response.ok) {
        throw new Error('Failed to update purchase order');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to update purchase order:', error);
      throw new Error('Failed to update purchase order - backend not available');
    }
  },

  /**
   * Delete purchase order
   */
  async deletePurchaseOrder(id: number, hard: boolean = false, reason?: string): Promise<void> {
    try {
      const url = new URL(`${API_BASE_URL}/${id}`);
      url.searchParams.append('hard', hard.toString());

      const body = reason ? { reason } : undefined;

      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('inventory_auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        throw new Error('Failed to delete purchase order');
      }
    } catch (error) {
      console.error('Failed to delete purchase order:', error);
      throw new Error('Failed to delete purchase order - backend not available');
    }
  },

  /**
   * Update purchase order status
   */
  async updateStatus(id: number, statusUpdate: StatusUpdateRequest): Promise<PurchaseOrder> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('inventory_auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(statusUpdate)
      });

      if (!response.ok) {
        throw new Error('Failed to update purchase order status');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to update purchase order status:', error);
      throw new Error('Failed to update purchase order status - backend not available');
    }
  },

  /**
   * Mark purchase order as received
   */
  async markReceived(id: number, receiveData?: ReceiveRequest): Promise<PurchaseOrder> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/receive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('inventory_auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: receiveData ? JSON.stringify(receiveData) : undefined
      });

      if (!response.ok) {
        throw new Error('Failed to mark purchase order as received');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to mark purchase order as received:', error);
      throw new Error('Failed to mark purchase order as received - backend not available');
    }
  },

  /**
   * Search purchase orders with filtering
   */
  async searchPurchaseOrders(params: PurchaseOrderSearchParams): Promise<PageResponse<PurchaseOrderSummary>> {
    try {
      const url = new URL(`${API_BASE_URL}/search`);
      
      // Add search parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('inventory_auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to search purchase orders');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to search purchase orders:', error);
      throw new Error('Failed to search purchase orders - backend not available');
    }
  },

  /**
   * Get purchase order statistics/KPIs
   */
  async getStatsSummary(params?: {
    q?: string;
    status?: string;
    supplierId?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<StatsSummary> {
    try {
      const url = new URL(`${API_BASE_URL}/stats/summary`);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('inventory_auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch purchase order statistics');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to fetch purchase order statistics:', error);
      throw new Error('Failed to fetch purchase order statistics - backend not available');
    }
  },

  /**
   * Export purchase orders to CSV
   */
  async exportToCsv(params?: {
    q?: string;
    status?: string;
    supplierId?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Blob> {
    try {
      const url = new URL(`${API_BASE_URL}/export/csv`);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('inventory_auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to export purchase orders');
      }
      
      return response.blob();
    } catch (error) {
      console.error('Failed to export purchase orders:', error);
      throw new Error('Failed to export purchase orders - backend not available');
    }
  },

  // Purchase Order Items methods
  
  /**
   * Get items for a purchase order
   */
  async getPurchaseOrderItems(orderId: number): Promise<PurchaseOrderItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/${orderId}/items`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('inventory_auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch purchase order items');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to fetch purchase order items:', error);
      throw new Error('Failed to fetch purchase order items - backend not available');
    }
  },

  /**
   * Add items to a purchase order
   */
  async addPurchaseOrderItems(orderId: number, items: PurchaseOrderItemCreateRequest[]): Promise<PurchaseOrderItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/${orderId}/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('inventory_auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(items)
      });

      if (!response.ok) {
        throw new Error('Failed to add purchase order items');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to add purchase order items:', error);
      throw new Error('Failed to add purchase order items - backend not available');
    }
  },

  /**
   * Update a purchase order item
   */
  async updatePurchaseOrderItem(orderId: number, itemId: number, item: PurchaseOrderItem): Promise<PurchaseOrderItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/${orderId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('inventory_auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        throw new Error('Failed to update purchase order item');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to update purchase order item:', error);
      throw new Error('Failed to update purchase order item - backend not available');
    }
  },

  /**
   * Delete a purchase order item
   */
  async deletePurchaseOrderItem(orderId: number, itemId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${orderId}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('inventory_auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete purchase order item');
      }
    } catch (error) {
      console.error('Failed to delete purchase order item:', error);
      throw new Error('Failed to delete purchase order item - backend not available');
    }
  }
};
