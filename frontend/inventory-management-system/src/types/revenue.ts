export interface TodayRevenueResponse {
  date: string;
  revenue: number;
  count: number;
  currency: string;
}

export interface MonthlyRevenueData {
  revenue: number;
  month: string;
  count: number;
  currency: string;
}

export interface StripeStatsResponse {
  total_revenue: number;
  total_payments: number;
  total_refunds: number;
}

export type MonthlyRevenueResponse = MonthlyRevenueData[];
