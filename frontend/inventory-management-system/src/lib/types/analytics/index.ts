// Analytics-related type definitions

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ReportMetrics {
  total: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  revenueByMonth: ChartDataPoint[];
}

export interface SalesAnalytics {
  totalSales: number;
  salesGrowth: number;
  topProducts: Array<{
    productId: number;
    productName: string;
    sales: number;
    revenue: number;
  }>;
  salesByCategory: Array<{
    category: string;
    sales: number;
  }>;
}

export interface CostAnalytics {
  totalCosts: number;
  costsByCategory: Record<string, number>;
  monthlyCosts: ChartDataPoint[];
}

export interface ProfitabilityAnalytics {
  totalProfit: number;
  profitMargin: number;
  profitByProduct: Array<{
    productId: number;
    productName: string;
    profit: number;
    margin: number;
  }>;
}

export interface OperationalAnalytics {
  inventoryTurnover: number;
  stockoutRate: number;
  fulfillmentRate: number;
  averageDeliveryTime: number;
}
