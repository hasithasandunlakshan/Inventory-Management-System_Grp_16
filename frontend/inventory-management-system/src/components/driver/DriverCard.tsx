'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { DriverProfile } from '@/types/driver';
import { getStatusBadgeVariant, formatDriverStatus } from '@/utils/driverUtils';

interface DriverCardProps {
  driver: DriverProfile;
  onViewDetails?: (driver: DriverProfile) => void;
  showVehicleInfo?: boolean;
}

export default function DriverCard({
  driver,
  onViewDetails,
  showVehicleInfo = false,
}: DriverCardProps) {
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(driver);
    }
  };

  return (
    <div className='flex items-center justify-between p-4 border rounded-lg'>
      <div className='flex items-center space-x-4'>
        <div>
          <p className='font-medium'>License: {driver.licenseNumber}</p>
          <p className='text-sm text-gray-500'>Class: {driver.licenseClass}</p>
          <p className='text-sm text-gray-500'>
            Expiry: {driver.licenseExpiry}
          </p>
          {driver.emergencyContact && (
            <p className='text-sm text-gray-500'>
              Emergency: {driver.emergencyContact}
            </p>
          )}
          {showVehicleInfo && driver.assignedVehicleId && (
            <p className='text-sm text-gray-500'>
              Vehicle ID: {driver.assignedVehicleId}
            </p>
          )}
        </div>
      </div>
      <div className='flex items-center space-x-2'>
        <Badge variant={getStatusBadgeVariant(driver.availabilityStatus)}>
          {formatDriverStatus(driver.availabilityStatus)}
        </Badge>
        <Button variant='outline' size='sm' onClick={handleViewDetails}>
          <Eye className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
