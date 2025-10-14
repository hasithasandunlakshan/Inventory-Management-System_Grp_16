import {
  PurchaseOrder,
  PurchaseOrderSummary,
  PurchaseOrderCreateRequest,
  PurchaseOrderUpdateRequest,
  StatusUpdateRequest,
  ReceiveRequest,
  PurchaseOrderSearchParams,
  StatsSummary,
  MonthlyStats,
  PageResponse,
  PurchaseOrderItem,
  PurchaseOrderItemCreateRequest,
  PurchaseOrderNote,
  PurchaseOrderAttachment,
  PurchaseOrderAudit,
  NoteCreateRequest,
  ImportReportDTO,
} from '../types/supplier';
import { createAuthenticatedRequestOptions } from '../utils/authUtils';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8082'}/api/purchase-orders`; // Through API Gateway

export const purchaseOrderService = {
  /**
   * Create new purchase order
   */
  async createPurchaseOrder(
    order: PurchaseOrderCreateRequest
  ): Promise<PurchaseOrder> {
    try {
      const response = await fetch(
        API_BASE_URL,
        createAuthenticatedRequestOptions('POST', order)
      );

      if (!response.ok) {
        throw new Error('Failed to create purchase order');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to create purchase order:', error);
      throw new Error(
        'Failed to create purchase order - backend not available'
      );
    }
  },

  /**
   * Get all purchase orders (summary)
   */
  async getAllPurchaseOrders(): Promise<PurchaseOrderSummary[]> {
    try {
      const response = await fetch(
        API_BASE_URL,
        createAuthenticatedRequestOptions()
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch purchase orders: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
      throw new Error(
        'Failed to fetch purchase orders - backend not available'
      );
    }
  },

  /**
   * Get purchase order total by ID
   */
  async getPurchaseOrderTotal(id: number): Promise<{ total: number }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${id}/totals`,
        createAuthenticatedRequestOptions()
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Purchase order not found');
        }
        throw new Error(
          `Failed to fetch purchase order total: ${response.status}`
        );
      }

      const data = await response.json();

      // Handle different response formats
      if (typeof data === 'number') {
        return { total: data };
      } else if (data && typeof data.total === 'number') {
        return { total: data.total };
      } else if (data && typeof data.totalAmount === 'number') {
        return { total: data.totalAmount };
      } else {
        console.warn(
          'Unexpected response format for purchase order total:',
          data
        );
        return { total: 0 };
      }
    } catch (error) {
      console.error('Failed to fetch purchase order total:', error);
      throw error;
    }
  },

  /**
   * Get purchase order by ID (with items)
   */
  async getPurchaseOrderById(id: number): Promise<PurchaseOrder> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${id}`,
        createAuthenticatedRequestOptions()
      );

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
  async updatePurchaseOrder(
    id: number,
    order: PurchaseOrderUpdateRequest
  ): Promise<PurchaseOrder> {
    try {
      console.log('🔄 Updating purchase order:', id, order);
      const response = await fetch(
        `${API_BASE_URL}/${id}`,
        createAuthenticatedRequestOptions('PUT', order)
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Purchase order update failed:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          url: `${API_BASE_URL}/${id}`,
          requestData: order,
        });

        if (response.status === 409) {
          throw new Error(
            `Conflict: ${errorText || 'The purchase order was modified by another user. Please refresh and try again.'}`
          );
        }

        throw new Error(
          `Failed to update purchase order: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log('✅ Purchase order updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to update purchase order:', error);
      throw error; // Re-throw the original error instead of wrapping it
    }
  },

  /**
   * Delete purchase order
   */
  async deletePurchaseOrder(
    id: number,
    hard: boolean = false,
    reason?: string
  ): Promise<void> {
    try {
      const url = new URL(`${API_BASE_URL}/${id}`);
      url.searchParams.append('hard', hard.toString());

      const body = reason ? { reason } : undefined;

      const response = await fetch(
        url.toString(),
        createAuthenticatedRequestOptions('DELETE', body)
      );

      if (!response.ok) {
        throw new Error('Failed to delete purchase order');
      }
    } catch (error) {
      console.error('Failed to delete purchase order:', error);
      throw new Error(
        'Failed to delete purchase order - backend not available'
      );
    }
  },

  /**
   * Update purchase order status
   */
  async updateStatus(
    id: number,
    statusUpdate: StatusUpdateRequest
  ): Promise<PurchaseOrder> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${id}/status`,
        createAuthenticatedRequestOptions('PUT', statusUpdate)
      );

      if (!response.ok) {
        throw new Error('Failed to update purchase order status');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to update purchase order status:', error);
      throw new Error(
        'Failed to update purchase order status - backend not available'
      );
    }
  },

  /**
   * Mark purchase order as received
   */
  async markReceived(
    id: number,
    receiveData?: ReceiveRequest
  ): Promise<PurchaseOrder> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${id}/receive`,
        createAuthenticatedRequestOptions('POST', receiveData)
      );

      if (!response.ok) {
        throw new Error('Failed to mark purchase order as received');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to mark purchase order as received:', error);
      throw new Error(
        'Failed to mark purchase order as received - backend not available'
      );
    }
  },

  /**
   * Search purchase orders with filtering
   */
  async searchPurchaseOrders(
    params: PurchaseOrderSearchParams
  ): Promise<PageResponse<PurchaseOrderSummary>> {
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
          Authorization: `Bearer ${localStorage.getItem('inventory_auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to search purchase orders');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to search purchase orders:', error);
      throw new Error(
        'Failed to search purchase orders - backend not available'
      );
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
          Authorization: `Bearer ${localStorage.getItem('inventory_auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch purchase order statistics');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to fetch purchase order statistics:', error);
      throw new Error(
        'Failed to fetch purchase order statistics - backend not available'
      );
    }
  },

  /**
   * Get monthly purchase order statistics with percentage change
   */
  async getMonthlyStats(): Promise<MonthlyStats> {
    try {
      // Get current date
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed

      // Calculate previous month
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      // Get current month data (from 1st to today)
      const currentMonthStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      const currentMonthEnd = now.toISOString().split('T')[0]; // Today's date

      // Get previous month data (full month)
      const prevMonthStart = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
      // Calculate last day of previous month more accurately
      const lastDayOfPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
      const prevMonthEnd = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(lastDayOfPrevMonth).padStart(2, '0')}`;

      console.log('📊 Monthly stats date ranges:', {
        currentMonth: { start: currentMonthStart, end: currentMonthEnd },
        previousMonth: { start: prevMonthStart, end: prevMonthEnd },
      });

      // Fetch both months' data in parallel
      const [currentMonthStats, prevMonthStats] = await Promise.all([
        this.getStatsSummary({
          dateFrom: currentMonthStart,
          dateTo: currentMonthEnd,
        }),
        this.getStatsSummary({
          dateFrom: prevMonthStart,
          dateTo: prevMonthEnd,
        }),
      ]);

      console.log('📊 Monthly stats data:', {
        current: currentMonthStats,
        previous: prevMonthStats,
      });

      // Calculate percentage changes
      const countChange =
        prevMonthStats.count > 0
          ? ((currentMonthStats.count - prevMonthStats.count) /
              prevMonthStats.count) *
            100
          : currentMonthStats.count > 0
            ? 100
            : 0;

      const totalChange =
        prevMonthStats.total > 0
          ? ((currentMonthStats.total - prevMonthStats.total) /
              prevMonthStats.total) *
            100
          : currentMonthStats.total > 0
            ? 100
            : 0;

      const result = {
        currentMonth: {
          count: currentMonthStats.count,
          total: currentMonthStats.total,
          year: currentYear,
          month: currentMonth,
        },
        previousMonth: {
          count: prevMonthStats.count,
          total: prevMonthStats.total,
          year: prevYear,
          month: prevMonth,
        },
        percentageChange: {
          count: Math.round(countChange * 10) / 10, // Round to 1 decimal place
          total: Math.round(totalChange * 10) / 10,
        },
      };

      console.log('📊 Final monthly stats result:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch monthly statistics:', error);
      // Return default values if API fails
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear =
        currentMonth === 1 ? now.getFullYear() - 1 : now.getFullYear();

      return {
        currentMonth: {
          count: 0,
          total: 0,
          year: now.getFullYear(),
          month: currentMonth,
        },
        previousMonth: {
          count: 0,
          total: 0,
          year: prevYear,
          month: prevMonth,
        },
        percentageChange: {
          count: 0,
          total: 0,
        },
      };
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
          Authorization: `Bearer ${localStorage.getItem('inventory_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export purchase orders');
      }

      return response.blob();
    } catch (error) {
      console.error('Failed to export purchase orders:', error);
      throw new Error(
        'Failed to export purchase orders - backend not available'
      );
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
          Authorization: `Bearer ${localStorage.getItem('inventory_auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch purchase order items');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to fetch purchase order items:', error);
      throw new Error(
        'Failed to fetch purchase order items - backend not available'
      );
    }
  },

  /**
   * Add purchase order items
   */
  async addPurchaseOrderItems(
    orderId: number,
    items: PurchaseOrderItemCreateRequest[]
  ): Promise<PurchaseOrderItem[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${orderId}/items`,
        createAuthenticatedRequestOptions('POST', items)
      );

      if (!response.ok) {
        throw new Error('Failed to add purchase order items');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to add purchase order items:', error);
      throw new Error(
        'Failed to add purchase order items - backend not available'
      );
    }
  },

  /**
   * Update a purchase order item
   */
  async updatePurchaseOrderItem(
    orderId: number,
    itemId: number,
    item: PurchaseOrderItem
  ): Promise<PurchaseOrderItem> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${orderId}/items/${itemId}`,
        createAuthenticatedRequestOptions('PUT', item)
      );

      if (!response.ok) {
        throw new Error('Failed to update purchase order item');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to update purchase order item:', error);
      throw new Error(
        'Failed to update purchase order item - backend not available'
      );
    }
  },

  /**
   * Delete a purchase order item
   */
  async deletePurchaseOrderItem(
    orderId: number,
    itemId: number
  ): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${orderId}/items/${itemId}`,
        createAuthenticatedRequestOptions('DELETE')
      );

      if (!response.ok) {
        throw new Error('Failed to delete purchase order item');
      }
    } catch (error) {
      console.error('Failed to delete purchase order item:', error);
      throw new Error(
        'Failed to delete purchase order item - backend not available'
      );
    }
  },

  /**
   * Get purchase order notes
   */
  async getPurchaseOrderNotes(poId: number): Promise<PurchaseOrderNote[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${poId}/notes`,
        createAuthenticatedRequestOptions()
      );

      if (!response.ok) {
        if (response.status === 404) {
          return []; // No notes found
        }
        throw new Error(
          `Failed to fetch purchase order notes: ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      console.error('Failed to fetch purchase order notes:', error);
      return []; // Return empty array on error
    }
  },

  /**
   * Get purchase order attachments
   */
  async getPurchaseOrderAttachments(
    poId: number
  ): Promise<PurchaseOrderAttachment[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${poId}/attachments`,
        createAuthenticatedRequestOptions()
      );

      if (!response.ok) {
        if (response.status === 404) {
          return []; // No attachments found
        }
        throw new Error(
          `Failed to fetch purchase order attachments: ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      console.error('Failed to fetch purchase order attachments:', error);
      return []; // Return empty array on error
    }
  },

  /**
   * Get purchase order audit log
   */
  async getPurchaseOrderAudit(poId: number): Promise<PurchaseOrderAudit[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${poId}/audit`,
        createAuthenticatedRequestOptions()
      );

      if (!response.ok) {
        if (response.status === 404) {
          return []; // No audit logs found
        }
        throw new Error(
          `Failed to fetch purchase order audit: ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      console.error('Failed to fetch purchase order audit:', error);
      return []; // Return empty array on error
    }
  },

  /**
   * Update item quantity
   */
  async updateItemQuantity(
    orderId: number,
    itemId: number,
    quantity: number
  ): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${orderId}/items/${itemId}/quantity`,
        createAuthenticatedRequestOptions('PATCH', { quantity })
      );

      if (!response.ok) {
        throw new Error('Failed to update item quantity');
      }
    } catch (error) {
      console.error('Failed to update item quantity:', error);
      throw error;
    }
  },

  /**
   * Receive purchase order
   */
  async receivePurchaseOrder(
    id: number,
    receiveData: Record<string, unknown>
  ): Promise<PurchaseOrder> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${id}/receive`,
        createAuthenticatedRequestOptions('POST', receiveData)
      );

      if (!response.ok) {
        throw new Error('Failed to receive purchase order');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to receive purchase order:', error);
      throw error;
    }
  },

  /**
   * Update purchase order status
   */
  async updatePurchaseOrderStatus(
    id: number,
    statusData: StatusUpdateRequest
  ): Promise<PurchaseOrder> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${id}/status`,
        createAuthenticatedRequestOptions('PATCH', statusData)
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Status update failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(
          `Failed to update purchase order status: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      console.error('Failed to update purchase order status:', error);
      throw error;
    }
  },

  /**
   * Add note to purchase order
   */
  async addNote(
    poId: number,
    noteData: NoteCreateRequest
  ): Promise<PurchaseOrderNote> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${poId}/notes`,
        createAuthenticatedRequestOptions('POST', noteData)
      );

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to add note:', error);
      throw error;
    }
  },

  /**
   * Add attachment to purchase order - Updated for multipart file upload
   */
  async addAttachment(
    poId: number,
    file: File,
    uploadedBy?: string
  ): Promise<PurchaseOrderAttachment> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (uploadedBy) {
        formData.append('uploadedBy', uploadedBy);
      }

      const token = localStorage.getItem('inventory_auth_token');
      const response = await fetch(`${API_BASE_URL}/${poId}/attachments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type header - let browser set it for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add attachment');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to add attachment:', error);
      throw error;
    }
  },

  /**
   * Download attachment from purchase order
   */
  async downloadAttachment(
    poId: number,
    attachmentId: number,
    filename: string
  ): Promise<void> {
    try {
      const token = localStorage.getItem('inventory_auth_token');
      const response = await fetch(
        `${API_BASE_URL}/${poId}/attachments/${attachmentId}/download`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download attachment');
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create a temporary download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download attachment:', error);
      throw error;
    }
  },

  /**
   * Import purchase orders from file
   */
  async importPurchaseOrders(file: File): Promise<ImportReportDTO> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('inventory_auth_token');

      console.log('🔄 Starting import:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hasToken: !!token,
      });

      const response = await fetch(`${API_BASE_URL}/import`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      console.log('📥 Import response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Import failed with response:', errorText);
        throw new Error(
          `Import failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log(
        '✅ Import successful - Raw response:',
        JSON.stringify(result, null, 2)
      );
      console.log('✅ Import successful - Response structure:', {
        created: result.created,
        failed: result.failed,
        errorsLength: result.errors?.length || 0,
        errorsContent: result.errors,
      });

      // Return the backend ImportReportDTO directly
      return result;
    } catch (error) {
      console.error('❌ Failed to import purchase orders:', error);
      throw error;
    }
  },

  /**
   * Export purchase orders to file
   */
  async exportPurchaseOrders(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/export?format=${format}`,
        createAuthenticatedRequestOptions('GET')
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      return response.blob();
    } catch (error) {
      console.error('Failed to export purchase orders:', error);
      throw error;
    }
  },
};
