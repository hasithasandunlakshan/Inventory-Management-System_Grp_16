import { Suspense } from 'react';
import DriversClient from './DriversClient';
import type { Metadata } from 'next';

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
async function fetchAvailableUsers(): Promise<UserDropdownInfo[]> {
  try {
    const userServiceUrl =
      process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8081';

    const response = await fetch(
      `${userServiceUrl}/api/auth/users/by-role?role=USER`,
      {
        next: {
          revalidate: 300, // Revalidate every 5 minutes
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const users: User[] = await response.json();

    return users.map(user => ({
      userId: parseInt(user.id),
      username: user.username,
    }));
  } catch (error) {
    return [];
  }
}

// Main Server Component
export default async function DriversPage() {
  // Fetch data on server at build time
  const availableUsers = await fetchAvailableUsers();

  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
        </div>
      }
    >
      <DriversClient initialAvailableUsers={availableUsers} />
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
