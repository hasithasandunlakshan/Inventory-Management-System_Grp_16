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

// Use direct service for inventory cost (CORS issue with API Gateway)
const INVENTORY_COST_URL =
  process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8083';
const INVENTORY_SERVICE_URL = process.env.NEXT_PUBLIC_INVENTORY_SERVICE_URL
  ? `${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_URL}/api/inventory`
  : 'http://localhost:8085/api/inventory';

export const inventoryService = {
  getInventoryCost: async (): Promise<InventoryCostResponse> => {
    try {
      const response = await fetch(`${INVENTORY_COST_URL}/api/products/inventory/cost`, {
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
   * Get all inventory items
   */
  listAll: async (): Promise<InventoryItem[]> => {
    try {
      const response = await fetch(INVENTORY_SERVICE_URL, {
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
};
