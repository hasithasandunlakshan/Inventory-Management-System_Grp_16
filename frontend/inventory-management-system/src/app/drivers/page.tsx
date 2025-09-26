'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  driverService,
  DriverProfile,
  UserDropdownInfo,
} from '@/lib/services/driverService';
import { DriverFilters, DriverStats } from '@/types/driver';
import { calculateDriverStats } from '@/utils/driverUtils';
import DriverRegistrationModal from '@/components/driver/DriverRegistrationModal';
import DriverStatsCards from '@/components/driver/DriverStatsCards';
import DriverSearch from '@/components/driver/DriverSearch';
import DriverList from '@/components/driver/DriverList';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<DriverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState<UserDropdownInfo[]>([]);

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

  const handleViewDriverDetails = (driver: DriverProfile) => {
    // Future implementation: Open driver details modal or navigate to details page
    console.log('View driver details:', driver);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadDrivers();
    if (canManageDrivers) {
      loadAvailableUsers();
    }
  }, [isAuthenticated, canManageDrivers]);

  const loadAvailableUsers = async () => {
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('inventory_auth_token')
          : null;
      if (!token) return; // wait until token exists

      const users = await driverService.getUsersByRole('USER');
      console.log('🔍 loadAvailableUsers - Raw users:', users);

      if (Array.isArray(users)) {
        setAvailableUsers(
          users.map(user => ({
            userId: parseInt(user.id),
            username: user.username,
          }))
        );
      } else {
        console.error('🔍 loadAvailableUsers - Users is not an array:', users);
        setAvailableUsers([]);
      }
    } catch (error) {
      // Likely 403 for non-manager/admin users; log only
      console.error('Failed to load available users:', error);
      setAvailableUsers([]);
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
    } catch (error) {
      console.error('Failed to load drivers:', error);
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
        onViewDriverDetails={handleViewDriverDetails}
      />
    </div>
  );
}
