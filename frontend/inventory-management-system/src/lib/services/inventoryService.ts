import { createAuthenticatedRequestOptions } from '../utils/authUtils';

// Prefer direct Inventory Service when API Gateway is unavailable
// Usage: set NEXT_PUBLIC_INVENTORY_SERVICE_URL (e.g., http://localhost:8080)
const INVENTORY_BASE = process.env.NEXT_PUBLIC_INVENTORY_SERVICE_URL || 'http://localhost:8085';
const API_BASE_URL = `${INVENTORY_BASE}/api/inventory`;

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
