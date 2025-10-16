import {
  TodayRevenueResponse,
  MonthlyRevenueResponse,
  StripeStatsResponse,
} from '@/types/revenue';
import { authService } from '@/lib/services/authService';

const BASE_URL = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:8084'}/api/revenue`; // Direct to local Order Service

export const revenueService = {
  getTodayRevenue: async (
    dateFrom?: string,
    dateTo?: string
  ): Promise<TodayRevenueResponse> => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      };

      let url = `${BASE_URL}/today`;
      if (dateFrom && dateTo) {
        url += `?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;
      }

      const response = await fetch(url, {
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

  getMonthlyRevenue: async (
    dateFrom?: string,
    dateTo?: string
  ): Promise<MonthlyRevenueResponse> => {
    try {
      let url = `${BASE_URL}/monthly`;
      if (dateFrom && dateTo) {
        url += `?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;
      }

      const response = await fetch(url, {
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

  getStripeStats: async (
    dateFrom?: string,
    dateTo?: string
  ): Promise<StripeStatsResponse> => {
    try {
      let url = `${BASE_URL}/stripe-stats`;
      if (dateFrom && dateTo) {
        url += `?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;
      }

      const response = await fetch(url, {
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
