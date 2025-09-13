import { authService } from '@/lib/services/authService';

export interface InventoryCostResponse {
  message: string;
  success: boolean;
  calculatedAt: string;
  currency: string;
  totalProductsWithStock: number;
  totalAvailableInventoryCost: number;
}

// Temporarily use direct API for debugging
const BASE_URL = 'http://localhost:8083/api/products'; // Direct to Product Service

export const inventoryService = {
  getInventoryCost: async (): Promise<InventoryCostResponse> => {
    try {
      console.log(
        'Fetching inventory cost from:',
        `${BASE_URL}/inventory/cost`
      );

      const response = await fetch(`${BASE_URL}/inventory/cost`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Removed auth header for direct API call
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
};
