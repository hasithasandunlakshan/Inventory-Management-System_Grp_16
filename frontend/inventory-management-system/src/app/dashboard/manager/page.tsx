'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { FilterProvider } from '@/contexts/FilterContext';
import FiltersControls from '../../../components/dashboard/FiltersControls';
import KpiCards from '../../../components/dashboard/KpiCards';
import SalesOverview from '../../../components/dashboard/SalesOverview';
import InventoryHealth from '../../../components/dashboard/InventoryHealth';
import OperationsPanel from '../../../components/dashboard/OperationsPanel';
import LogisticsPanel from '../../../components/dashboard/LogisticsPanel';
import FinancePanel from '../../../components/dashboard/FinancePanel';
import SuppliersPanel from '../../../components/dashboard/SuppliersPanel';
import AlertsTasks from '../../../components/dashboard/AlertsTasks';
import NotificationBell from '@/components/NotificationBell';
import QuickActions from '../../../components/dashboard/QuickActions';
import MonthlyRevenueChart from '../../../components/dashboard/MonthlyRevenueChart';
import RevenueDashboard from '../../../components/dashboard/RevenueDashboard';

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

        <div className='grid gap-4 lg:grid-cols-3'>
          <SalesOverview />
          <InventoryHealth />
          <OperationsPanel />
        </div>

        <div className='grid gap-4 lg:grid-cols-3'>
          <LogisticsPanel />
          <FinancePanel />
          <SuppliersPanel />
        </div>

        <div className='grid gap-4 lg:grid-cols-3'>
          <AlertsTasks />
          <QuickActions />
          <MonthlyRevenueChart />
        </div>
      </div>
    </FilterProvider>
  );
}
