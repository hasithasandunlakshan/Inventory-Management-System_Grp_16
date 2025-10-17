import ManagerDashboardClient from './ManagerDashboardClient';

// Make this page dynamic - don't try to pre-render at build time
// since it requires authentication and backend services
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ManagerDashboard() {
  // Pass null data - client will fetch everything
  const dashboardData = {
    inventoryData: null,
    salesData: null,
    logisticsData: null,
  };

  return <ManagerDashboardClient initialData={dashboardData} />;
}
