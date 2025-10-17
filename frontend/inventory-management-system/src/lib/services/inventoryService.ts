import { createAuthenticatedRequestOptions } from '../utils/auth/authUtils';

// Prefer direct Inventory Service when API Gateway is unavailable
// Usage: set NEXT_PUBLIC_INVENTORY_SERVICE_URL (e.g., http://localhost:8080)
const INVENTORY_BASE =
  process.env.NEXT_PUBLIC_INVENTORY_SERVICE_URL || 'http://localhost:8085';
const API_BASE_URL = `${INVENTORY_BASE}/api/inventory`;

// Product service for cost calculation
const INVENTORY_COST_URL =
  process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8083';

export interface InventoryRow {
  inventoryId: number;
  productId: number;
  stock: number;
  reserved: number;
  availableStock: number;
  minThreshold: number;
}

export interface InventoryCostResponse {
  message: string;
  success: boolean;
  calculatedAt: string;
  currency: string;
  totalProductsWithStock: number;
  totalAvailableInventoryCost: number;
}

export interface InventoryItem {
  productId: number;
  productName: string;
  availableStock: number;
  minThreshold: number;
  maxThreshold: number;
  unitPrice: number;
  categoryId: number;
  categoryName: string;
}

export const inventoryService = {
  /**
   * Get all inventory rows with optional date filtering
   */
  async listAll(dateFrom?: string, dateTo?: string): Promise<InventoryRow[]> {
    let url = API_BASE_URL;
    if (dateFrom && dateTo) {
      url += `?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;
    }

    const res = await fetch(url, createAuthenticatedRequestOptions('GET'));
    if (!res.ok) {
      throw new Error('Failed to fetch inventory');
    }
    return res.json();
  },

  /**
   * Get all inventory items (with category details)
   */
  async listAllItems(): Promise<InventoryItem[]> {
    try {
      const response = await fetch(`${INVENTORY_BASE}/api/inventory`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get inventory cost (total value of all available stock)
   */
  async getInventoryCost(): Promise<InventoryCostResponse> {
    try {
      const response = await fetch(
        `${INVENTORY_COST_URL}/api/products/inventory/cost`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Adjust stock for a product
   */
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

  /**
   * Update minimum threshold for a product
   */
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
