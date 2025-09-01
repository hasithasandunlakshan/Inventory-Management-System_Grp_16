import { DeliveryLog, DeliveryLogCreateRequest } from '../types/supplier';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:8090'; // Use API Gateway

// Response type for delivery log creation
interface DeliveryLogResponse {
  success: boolean;
  message: string;
  data: DeliveryLog | null;
}

export const deliveryLogService = {
  // Create a new delivery log
  async logDelivery(deliveryLog: DeliveryLogCreateRequest): Promise<DeliveryLogResponse> {
    const response = await fetch(`${API_BASE_URL}/api/delivery-logs/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(), // Add JWT token
      },
      body: JSON.stringify(deliveryLog),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create delivery log: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result: DeliveryLogResponse = await response.json();
    
    // If the backend returns success: false, throw an error so it gets caught by the frontend
    if (!result.success) {
      throw new Error(result.message || 'Failed to create delivery log');
    }

    return result;
  },

  // Get delivery logs by purchase order ID
  async getDeliveryLogs(poId: number): Promise<DeliveryLog[]> {
    const response = await fetch(`${API_BASE_URL}/api/delivery-logs?purchaseOrderId=${poId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(), // Add JWT token
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch delivery logs: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  },

  // Get 10 most recent delivery logs
  async getAllDeliveryLogs(): Promise<DeliveryLog[]> {
    const response = await fetch(`${API_BASE_URL}/api/delivery-logs/recent`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(), // Add JWT token
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch recent delivery logs: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  },
};
