'use client';

import { useAuth } from '@/contexts/AuthContext';
import { FilterProvider } from '@/contexts/FilterContext';
import FiltersControls from '../../../components/dashboard/FiltersControls';
import KpiCards from '../../../components/dashboard/KpiCards';
import AlertsTasks from '../../../components/dashboard/AlertsTasks';
import NotificationBell from '@/components/NotificationBell';
import QuickActions from '../../../components/dashboard/QuickActions';
import RevenueDashboard from '../../../components/dashboard/RevenueDashboard';
import InventoryAnalytics from '../../../components/dashboard/InventoryAnalytics';
import SalesTrendsChart from '../../../components/dashboard/SalesTrendsChart';
import SupplierPerformanceChart from '../../../components/dashboard/SupplierPerformanceChart';

export default function ManagerDashboard() {
  const { user } = useAuth();

  return (
    <FilterProvider>
      <div className='space-y-6'>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-semibold tracking-tight'>
                Manager Dashboard
              </h1>
              <p className='text-sm text-muted-foreground'>
                Welcome back, {user?.fullName || user?.username}!
              </p>
            </div>
            <NotificationBell />
          </div>
        </div>

        <FiltersControls />
        <KpiCards />

        {/* Revenue Dashboard - Full Width */}
        <RevenueDashboard />

        {/* Inventory Analytics - Full Width */}
        <InventoryAnalytics />

        {/* Sales Trends - Full Width */}
        <SalesTrendsChart />

        {/* Supplier Performance - Full Width */}
        <SupplierPerformanceChart />

        {/* Quick Actions - Bottom of Page */}
        <QuickActions />

        {/* Alerts and Tasks - Bottom of Page */}
        <AlertsTasks />
      </div>
    </FilterProvider>
  );
}
