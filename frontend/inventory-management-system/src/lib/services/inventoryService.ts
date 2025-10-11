import { createAuthenticatedRequestOptions } from '../utils/authUtils';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8090'}/api/inventory`;

export interface InventoryRow {
  inventoryId: number;
  productId: number;
  stock: number;
  reserved: number;
  availableStock: number;
  minThreshold: number;
}

export const inventoryService = {
  async listAll(): Promise<InventoryRow[]> {
    const res = await fetch(
      API_BASE_URL,
      createAuthenticatedRequestOptions('GET')
    );
    if (!res.ok) {
      throw new Error('Failed to fetch inventory');
    }
    return res.json();
  },

  async adjust(productId: number, delta: number): Promise<InventoryRow> {
    const res = await fetch(
      `${API_BASE_URL}/${productId}/adjust?delta=${encodeURIComponent(delta)}`,
      createAuthenticatedRequestOptions('POST')
    );
    if (!res.ok) {
      throw new Error('Failed to adjust stock');
    }
    return res.json();
  },

  async updateThreshold(
    productId: number,
    value: number
  ): Promise<InventoryRow> {
    const res = await fetch(
      `${API_BASE_URL}/${productId}/threshold?value=${encodeURIComponent(value)}`,
      createAuthenticatedRequestOptions('POST')
    );
    if (!res.ok) {
      throw new Error('Failed to update threshold');
    }
    return res.json();
  },
};
