import { Suspense } from 'react';
import DriversClient from './DriversClient';
import type { Metadata } from 'next';

import type { DriverProfile } from '@/lib/services/driverService';

// Define types for SSG
interface User {
  id: string;
  username: string;
  email: string;
}

interface UserDropdownInfo {
  userId: number;
  username: string;
}

// Server-side data fetching function
async function fetchDriversData(): Promise<{
  availableUsers: UserDropdownInfo[];
  drivers: DriverProfile[];
  availableDrivers: DriverProfile[];
}> {
  try {
    const userServiceUrl =
      process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8081';
    const resourceServiceUrl =
      process.env.NEXT_PUBLIC_RESOURCE_SERVICE_URL || 'http://localhost:8086';

    const [usersResponse, driversResponse, availableDriversResponse] =
      await Promise.all([
        fetch(`${userServiceUrl}/api/auth/users/by-role?role=USER`, {
          next: { revalidate: 300 },
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`${resourceServiceUrl}/api/resources/drivers`, {
          next: { revalidate: 300 },
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`${resourceServiceUrl}/api/resources/drivers/available`, {
          next: { revalidate: 300 },
          headers: { 'Content-Type': 'application/json' },
        }),
      ]);

    const availableUsers: UserDropdownInfo[] = usersResponse.ok
      ? (await usersResponse.json()).map((user: User) => ({
          userId: Number.parseInt(user.id, 10),
          username: user.username,
        }))
      : [];

    const drivers: DriverProfile[] = driversResponse.ok
      ? (await driversResponse.json()).data || []
      : [];

    const availableDrivers: DriverProfile[] = availableDriversResponse.ok
      ? (await availableDriversResponse.json()).data || []
      : [];

    return { availableUsers, drivers, availableDrivers };
  } catch {
    return { availableUsers: [], drivers: [], availableDrivers: [] };
  }
}

// Main Server Component
export default async function DriversPage() {
  // Fetch data on server at build time
  const { availableUsers, drivers, availableDrivers } =
    await fetchDriversData();

  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
        </div>
      }
    >
      <DriversClient
        initialAvailableUsers={availableUsers}
        initialDrivers={drivers}
        initialAvailableDrivers={availableDrivers}
      />
    </Suspense>
  );
}

// Add metadata for SEO
export const metadata: Metadata = {
  title: 'Driver Management | Inventory System',
  description: 'Manage drivers, profiles, and availability',
};

// Enable ISR with 5-minute revalidation
export const revalidate = 300;
