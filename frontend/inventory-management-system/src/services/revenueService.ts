import {
  TodayRevenueResponse,
  MonthlyRevenueResponse,
  StripeStatsResponse,
} from '@/types/revenue';
import { authService } from '@/lib/services/authService';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8090'}/api/revenue`; // Changed to API Gateway port

export const revenueService = {
  getTodayRevenue: async (): Promise<TodayRevenueResponse> => {
    try {
      console.log("Fetching today's revenue from:", `${BASE_URL}/today`);

      // Debug authentication
      const token = authService.getToken();
      const isAuthenticated = authService.isAuthenticated();
      const userRole = authService.getUserRole();
      console.log('🔐 Auth Debug:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        isAuthenticated,
        userRole,
      });

      const headers = {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      };
      console.log('📡 Request headers:', headers);

      const response = await fetch(`${BASE_URL}/today`, {
        method: 'GET',
        headers,
      });
      console.log('Today revenue response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }
      const data = await response.json();
      console.log('Today revenue data:', data);
      return data;
    } catch (error) {
      console.error("Error fetching today's revenue:", error);
      throw error;
    }
  },

  getMonthlyRevenue: async (): Promise<MonthlyRevenueResponse> => {
    try {
      console.log('Fetching monthly revenue from:', `${BASE_URL}/monthly`);
      const response = await fetch(`${BASE_URL}/monthly`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader(), // Add authentication header
        },
      });
      console.log('Monthly revenue response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Monthly revenue data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      throw error;
    }
  },

  getStripeStats: async (): Promise<StripeStatsResponse> => {
    try {
      console.log('Fetching Stripe stats from:', `${BASE_URL}/stripe-stats`);
      const response = await fetch(`${BASE_URL}/stripe-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader(), // Add authentication header
        },
      });
      console.log('Stripe stats response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Stripe stats data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching Stripe stats:', error);
      throw error;
    }
  },
};
