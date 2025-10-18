import ManagerDashboardClient from './ManagerDashboardClient';
import { analyticsService } from '@/lib/services/analyticsService';
import { logisticsService } from '@/lib/services/logisticsService';

// Use ISR with revalidation
export const revalidate = 300; // Revalidate every 5 minutes

export default async function ManagerDashboard() {
  // Fetch data server-side
  type InventoryDataType = Awaited<
    ReturnType<typeof analyticsService.getInventoryAnalytics>
  >;
  type SalesDataType = Awaited<
    ReturnType<typeof analyticsService.getSalesAnalytics>
  >;
  type LogisticsDataType = Awaited<
    ReturnType<typeof logisticsService.getLogisticsMetrics>
  >;

  const dashboardData: {
    inventoryData: InventoryDataType | null;
    salesData: SalesDataType | null;
    logisticsData: LogisticsDataType | null;
  } = {
    inventoryData: null,
    salesData: null,
    logisticsData: null,
  };

  try {
    const [inventoryResult, salesResult, logisticsResult] =
      await Promise.allSettled([
        analyticsService.getInventoryAnalytics(),
        analyticsService.getSalesAnalytics(),
        logisticsService.getLogisticsMetrics(),
      ]);

    if (inventoryResult.status === 'fulfilled') {
      dashboardData.inventoryData = inventoryResult.value;
    }

    if (salesResult.status === 'fulfilled') {
      dashboardData.salesData = salesResult.value;
    }

    if (logisticsResult.status === 'fulfilled') {
      dashboardData.logisticsData = logisticsResult.value;
    }
  } catch (error) {
    // Gracefully handle errors - client will show loading state and fetch
    console.error('Error fetching dashboard data:', error);
  }

  return <ManagerDashboardClient initialData={dashboardData} />;
}
