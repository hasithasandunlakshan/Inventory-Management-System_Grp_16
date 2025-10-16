import { createAuthenticatedRequestOptions } from '../utils/authUtils';

// Prefer direct Inventory Service when API Gateway is unavailable
// Usage: set NEXT_PUBLIC_INVENTORY_SERVICE_URL (e.g., http://localhost:8080)
const INVENTORY_BASE =
  process.env.NEXT_PUBLIC_INVENTORY_SERVICE_URL || 'http://localhost:8085';
const API_BASE_URL = `${INVENTORY_BASE}/api/stock-alerts`;

export interface StockAlert {
  alertId: number;
  productId: number;
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | string;
  message: string;
  isResolved: boolean;
  createdAt: string;
}

export const stockAlertService = {
  async listUnresolved(
    dateFrom?: string,
    dateTo?: string
  ): Promise<StockAlert[]> {
    let url = API_BASE_URL;
    if (dateFrom && dateTo) {
      url += `?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;
    }

    const res = await fetch(url, createAuthenticatedRequestOptions('GET'));
    if (!res.ok) {
      throw new Error('Failed to fetch stock alerts');
    }
    return res.json();
  },

  async listHistory(dateFrom?: string, dateTo?: string): Promise<StockAlert[]> {
    let url = `${API_BASE_URL}/history`;
    if (dateFrom && dateTo) {
      url += `?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;
    }

    const res = await fetch(url, createAuthenticatedRequestOptions('GET'));
    if (!res.ok) {
      throw new Error('Failed to fetch stock alerts history');
    }
    return res.json();
  },

  async listByProduct(productId: number): Promise<StockAlert[]> {
    const res = await fetch(
      `${API_BASE_URL}/product/${productId}`,
      createAuthenticatedRequestOptions('GET')
    );
    if (!res.ok) {
      throw new Error('Failed to fetch stock alerts by product');
    }
    return res.json();
  },

  async resolve(alertId: number): Promise<void> {
    const res = await fetch(
      `${API_BASE_URL}/${alertId}/resolve`,
      createAuthenticatedRequestOptions('POST')
    );
    if (!res.ok) {
      throw new Error('Failed to resolve alert');
    }
  },
};
