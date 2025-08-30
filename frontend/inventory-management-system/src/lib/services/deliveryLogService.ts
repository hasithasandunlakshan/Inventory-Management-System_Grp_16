import { DeliveryLog, DeliveryLogCreateRequest } from '../types/supplier';

const API_BASE_URL = 'http://localhost:8090/api/delivery-logs'; // Through API Gateway

export const deliveryLogService = {
  /**
   * Create/log a new delivery
   */
  async logDelivery(delivery: DeliveryLogCreateRequest): Promise<DeliveryLog> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(delivery)
      });

      if (!response.ok) {
        throw new Error('Failed to log delivery');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to log delivery:', error);
      throw new Error('Failed to log delivery - backend not available');
    }
  },

  /**
   * Get delivery logs for a purchase order
   */
  async getDeliveryLogs(purchaseOrderId: number): Promise<DeliveryLog[]> {
    try {
      const response = await fetch(`${API_BASE_URL}?purchaseOrderId=${purchaseOrderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch delivery logs');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to fetch delivery logs:', error);
      throw new Error('Failed to fetch delivery logs - backend not available');
    }
  }
};
