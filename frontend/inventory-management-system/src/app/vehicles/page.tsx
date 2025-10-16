import { Suspense } from 'react';
import VehiclesClient from './VehiclesClient';
import type { Metadata } from 'next';
import type { Vehicle } from '@/lib/services/driverService';

// Server-side data fetching for vehicles
async function fetchVehiclesData(): Promise<{
  vehicles: Vehicle[];
  availableVehicles: Vehicle[];
}> {
  try {
    const resourceServiceUrl =
      process.env.NEXT_PUBLIC_RESOURCE_SERVICE_URL || 'http://localhost:8086';

    const [vehiclesResponse, availableVehiclesResponse] = await Promise.all([
      fetch(`${resourceServiceUrl}/api/resources/vehicles`, {
        next: { revalidate: 180 }, // Revalidate every 3 minutes
        headers: { 'Content-Type': 'application/json' },
      }),
      fetch(`${resourceServiceUrl}/api/resources/vehicles/available`, {
        next: { revalidate: 180 },
        headers: { 'Content-Type': 'application/json' },
      }),
    ]);

    const vehicles: Vehicle[] = vehiclesResponse.ok
      ? (await vehiclesResponse.json()).data || []
      : [];
    const availableVehicles: Vehicle[] = availableVehiclesResponse.ok
      ? (await availableVehiclesResponse.json()).data || []
      : [];

    return { vehicles, availableVehicles };
  } catch {
    return { vehicles: [], availableVehicles: [] };
  }
}

export default async function VehiclesPage() {
  // Fetch data on server at build time
  const { vehicles, availableVehicles } = await fetchVehiclesData();

  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
        </div>
      }
    >
      <VehiclesClient
        initialVehicles={vehicles}
        initialAvailableVehicles={availableVehicles}
      />
    </Suspense>
  );
}

// Add metadata for SEO
export const metadata: Metadata = {
  title: 'Vehicle Management | Inventory System',
  description: 'Manage vehicle fleet and maintenance',
};

// Enable ISR with 3-minute revalidation
export const revalidate = 180;
