'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCheck, Search, RefreshCw } from 'lucide-react';
import {
  driverService,
  DriverProfile,
  UserDropdownInfo,
} from '@/lib/services/driverService';
import { DriverFilters, DriverStats } from '@/lib/types/driver';
import { calculateDriverStats } from '@/lib/utils/driver/driverUtils';
import DriverRegistrationModal from '@/components/driver/DriverRegistrationModal';
import DriverStatsCards from '@/components/driver/DriverStatsCards';
import DriverList from '@/components/driver/DriverList';

// Props interface - receives SSG data
interface DriversClientProps {
  readonly initialAvailableUsers: UserDropdownInfo[];
}

export default function DriversClient({
  initialAvailableUsers,
}: DriversClientProps) {
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<DriverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Use SSG data as initial state
  const [availableUsers, setAvailableUsers] = useState<UserDropdownInfo[]>(
    initialAvailableUsers
  );

  const { hasAnyRole, isAuthenticated } = useAuth();
  const canManageDrivers = hasAnyRole(['MANAGER', 'ADMIN']);

  const filters: DriverFilters = {
    searchTerm,
  };

  const stats: DriverStats = calculateDriverStats(drivers, availableDrivers);

  // Event handlers
  const handleDriverRegistered = () => {
    loadDrivers();
  };

  const handleUsersRefresh = () => {
    loadAvailableUsers();
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadDrivers();

    // Only refresh users if SSG data is empty
    if (canManageDrivers && availableUsers.length === 0) {
      loadAvailableUsers();
    }
  }, [isAuthenticated, canManageDrivers]);

  // Optional: Refresh users from API (only when needed)
  const loadAvailableUsers = async () => {
    try {
      const token =
        typeof globalThis.window !== 'undefined'
          ? globalThis.window.localStorage.getItem('inventory_auth_token')
          : null;
      if (token) {
        const users = await driverService.getUsersByRole('USER');
        if (Array.isArray(users)) {
          setAvailableUsers(
            users.map(user => ({
              userId: Number.parseInt(user.id, 10),
              username: user.username,
            }))
          );
        }
      }
    } catch {
      // Keep SSG data if API fails
      toast.error('Failed to refresh users');
    }
  };

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const [allDriversResponse, availableDriversResponse] = await Promise.all([
        driverService.getAllDrivers(),
        driverService.getAvailableDrivers(),
      ]);

      if (allDriversResponse.success && allDriversResponse.data) {
        setDrivers(allDriversResponse.data);
      }

      if (availableDriversResponse.success && availableDriversResponse.data) {
        setAvailableDrivers(availableDriversResponse.data);
      }
    } catch {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Blue Header Card */}
      <Card
        className='border-0 shadow-lg'
        style={{
          background: 'linear-gradient(135deg, #2A7CC7 0%, #245e91ff 100%)',
        }}
      >
        <CardContent className='p-6'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            {/* Title Section */}
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-white/20 rounded-lg'>
                <UserCheck className='h-6 w-6 text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white'>
                  Driver Management
                </h1>
                <p className='text-white/90 text-sm'>
                  Manage drivers, profiles, and availability • {drivers.length}{' '}
                  total drivers
                </p>
              </div>
            </div>

            {/* Controls Section */}
            <div className='flex flex-col sm:flex-row gap-3'>
              {/* Search Input */}
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70' />
                <Input
                  placeholder='Search drivers...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10 h-11 bg-white/95 border-white/20 hover:bg-white text-gray-900 placeholder:text-gray-500 focus:border-white/40 focus:ring-white/20'
                />
              </div>

              {/* Action Buttons */}
              <div className='flex gap-2'>
                <Button
                  onClick={loadDrivers}
                  variant='outline'
                  size='sm'
                  className='h-11 px-4 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40'
                >
                  <RefreshCw className='h-4 w-4 mr-2' />
                  Refresh
                </Button>

                {canManageDrivers && (
                  <DriverRegistrationModal
                    availableUsers={availableUsers}
                    onDriverRegistered={handleDriverRegistered}
                    onUsersRefresh={handleUsersRefresh}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <DriverStatsCards stats={stats} />

      {/* Drivers List */}
      <DriverList
        drivers={drivers}
        availableDrivers={availableDrivers}
        filters={filters}
        canManageDrivers={canManageDrivers}
      />
    </div>
  );
}
