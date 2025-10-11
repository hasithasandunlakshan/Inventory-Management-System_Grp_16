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
  process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL ||
  'http://localhost:8083/api/products';
const INVENTORY_SERVICE_URL = process.env.NEXT_PUBLIC_INVENTORY_SERVICE_URL
  ? `${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_URL}/api/inventory`
  : 'http://localhost:8085/api/inventory';

export const inventoryService = {
  getInventoryCost: async (): Promise<InventoryCostResponse> => {
    try {
      console.log(
        'Fetching inventory cost from:',
        `${INVENTORY_COST_URL}/inventory/cost`
      );

      const response = await fetch(`${INVENTORY_COST_URL}/inventory/cost`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Inventory cost response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Inventory API Error:', errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log('Inventory cost data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching inventory cost:', error);
      throw error;
    }
  },

  /**
   * Get all inventory items
   */
  listAll: async (): Promise<InventoryItem[]> => {
    try {
      console.log('Fetching all inventory items from:', INVENTORY_SERVICE_URL);

      const response = await fetch(INVENTORY_SERVICE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Inventory list response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Inventory list API Error:', errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log('Inventory list data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching inventory list:', error);
      throw error;
    }
  },
};
