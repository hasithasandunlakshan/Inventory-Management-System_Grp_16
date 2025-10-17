'use client';

import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';
import KpiCards from '../../../components/dashboard/KpiCards';
import RevenueDashboard from '../../../components/dashboard/RevenueDashboard';

export default function ManagerDashboard() {
  const { user } = useAuth();

  return (
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

      <KpiCards />

      {/* Revenue Dashboard - Full Width */}
      <RevenueDashboard />
    </div>
  );
}
