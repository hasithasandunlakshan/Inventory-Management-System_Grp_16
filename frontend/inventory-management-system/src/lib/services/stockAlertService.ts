import { createAuthenticatedRequestOptions } from '../utils/authUtils';

const API_BASE_URL = 'http://localhost:8090/api/stock-alerts';

export interface StockAlert {
  alertId: number;
  productId: number;
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | string;
  message: string;
  isResolved: boolean;
  createdAt: string;
}

export const stockAlertService = {
  async listUnresolved(): Promise<StockAlert[]> {
    const res = await fetch(
      API_BASE_URL,
      createAuthenticatedRequestOptions('GET')
    );
    if (!res.ok) {
      throw new Error('Failed to fetch stock alerts');
    }
    return res.json();
  },

  async listHistory(): Promise<StockAlert[]> {
    const res = await fetch(
      `${API_BASE_URL}/history`,
      createAuthenticatedRequestOptions('GET')
    );
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
