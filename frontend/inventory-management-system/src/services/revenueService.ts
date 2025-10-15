import {
  TodayRevenueResponse,
  MonthlyRevenueResponse,
  StripeStatsResponse,
} from '@/types/revenue';
import { authService } from '@/lib/services/authService';

const BASE_URL = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:8084'}/api/revenue`; // Direct to local Order Service

export const revenueService = {
  getTodayRevenue: async (): Promise<TodayRevenueResponse> => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      };

      const response = await fetch(`${BASE_URL}/today`, {
        method: 'GET',
        headers,
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

  getMonthlyRevenue: async (): Promise<MonthlyRevenueResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/monthly`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader(),
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  getStripeStats: async (): Promise<StripeStatsResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/stripe-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader(),
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
};
