import ManagerDashboardClient from './ManagerDashboardClient';
import { analyticsService } from '@/lib/services/analyticsService';

// This is a Server Component that fetches data at build time
export const revalidate = 300; // Revalidate every 5 minutes (ISR)

async function fetchDashboardData() {
  try {
    // Only fetch analytics data on the server (inventory and sales)
    // Logistics data will be fetched on the client side due to auth requirements
    const [inventoryAnalytics, salesAnalytics] = await Promise.allSettled([
      analyticsService.getInventoryAnalytics().catch(() => null),
      analyticsService.getSalesAnalytics().catch(() => null),
    ]);

    return {
      inventoryData:
        inventoryAnalytics.status === 'fulfilled'
          ? inventoryAnalytics.value
          : null,
      salesData:
        salesAnalytics.status === 'fulfilled' ? salesAnalytics.value : null,
      logisticsData: null, // Will be fetched client-side
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      inventoryData: null,
      salesData: null,
      logisticsData: null,
    };
  }
}

export default async function ManagerDashboard() {
  const dashboardData = await fetchDashboardData();

  return <ManagerDashboardClient initialData={dashboardData} />;
}
