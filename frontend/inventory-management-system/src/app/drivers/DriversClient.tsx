'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  driverService,
  DriverProfile,
  UserDropdownInfo,
} from '@/lib/services/driverService';
import { DriverFilters, DriverStats } from '@/lib/types/driver';
import { calculateDriverStats } from '@/lib/utils/driver/driverUtils';
import DriverRegistrationModal from '@/components/driver/DriverRegistrationModal';
import DriverStatsCards from '@/components/driver/DriverStatsCards';
import DriverSearch from '@/components/driver/DriverSearch';
import DriverList from '@/components/driver/DriverList';

// Props interface - receives SSG data
interface DriversClientProps {
  initialAvailableUsers: UserDropdownInfo[];
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
        typeof window !== 'undefined'
          ? localStorage.getItem('inventory_auth_token')
          : null;
      if (!token) return;

      const users = await driverService.getUsersByRole('USER');
      if (Array.isArray(users)) {
        setAvailableUsers(
          users.map(user => ({
            userId: parseInt(user.id),
            username: user.username,
          }))
        );
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
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold'>Driver Management</h1>
          <p className='text-gray-600'>
            Manage drivers, profiles, and availability
          </p>
        </div>
        {canManageDrivers && (
          <DriverRegistrationModal
            availableUsers={availableUsers}
            onDriverRegistered={handleDriverRegistered}
            onUsersRefresh={handleUsersRefresh}
          />
        )}
      </div>

      {/* Stats Cards */}
      <DriverStatsCards stats={stats} />

      {/* Search */}
      <DriverSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

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
