import { Suspense } from 'react';
import AssignmentsClient from './AssignmentsClient';
import type { Metadata } from 'next';
import type { DriverProfile, Vehicle } from '@/lib/services/driverService';

// Server-side data fetching for assignments page
async function fetchAssignmentsData(): Promise<{
  drivers: DriverProfile[];
  vehicles: Vehicle[];
}> {
  try {
    const resourceServiceUrl =
      process.env.NEXT_PUBLIC_RESOURCE_SERVICE_URL || 'http://localhost:8086';

    const [driversResponse, vehiclesResponse] = await Promise.all([
      fetch(`${resourceServiceUrl}/api/resources/drivers/available`, {
        next: { revalidate: 180 }, // Revalidate every 3 minutes
        headers: { 'Content-Type': 'application/json' },
      }),
      fetch(`${resourceServiceUrl}/api/resources/vehicles/available`, {
        next: { revalidate: 180 },
        headers: { 'Content-Type': 'application/json' },
      }),
    ]);

    const drivers: DriverProfile[] = driversResponse.ok
      ? (await driversResponse.json()).data || []
      : [];
    const vehicles: Vehicle[] = vehiclesResponse.ok
      ? (await vehiclesResponse.json()).data || []
      : [];

    return { drivers, vehicles };
  } catch {
    return { drivers: [], vehicles: [] };
  }
}

export default async function AssignmentsPage() {
  // Fetch data on server at build time
  const { drivers, vehicles } = await fetchAssignmentsData();

  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
        </div>
      }
    >
      <AssignmentsClient initialDrivers={drivers} initialVehicles={vehicles} />
    </Suspense>
  );
}

// Add metadata for SEO
export const metadata: Metadata = {
  title: 'Driver-Vehicle Assignments | Inventory System',
  description: 'Manage driver and vehicle assignments',
};

// Enable ISR with 3-minute revalidation
export const revalidate = 180;
