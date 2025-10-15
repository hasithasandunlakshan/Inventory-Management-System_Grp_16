'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, User, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { DriverProfile } from '@/types/driver';
import { getStatusBadgeVariant, formatDriverStatus } from '@/utils/driverUtils';
import { userService, UserInfo } from '@/lib/services/userService';

interface DriverCardProps {
  readonly driver: DriverProfile;
  readonly onViewDetails?: (driver: DriverProfile) => void;
  readonly showVehicleInfo?: boolean;
}

export default function DriverCard({
  driver,
  onViewDetails,
  showVehicleInfo = false,
}: DriverCardProps) {
  const [driverUserDetails, setDriverUserDetails] = useState<UserInfo | null>(
    null
  );
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  useEffect(() => {
    const loadDriverUserDetails = async () => {
      if (driver.userId) {
        try {
          setLoadingUserDetails(true);
          const userResponse = await userService.getUserById(driver.userId);
          if (userResponse) {
            setDriverUserDetails(userResponse);
          }
        } catch (error) {
        } finally {
          setLoadingUserDetails(false);
        }
      }
    };

    loadDriverUserDetails();
  }, [driver.userId]);

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(driver);
    }
  };

  const renderPersonalInformation = () => {
    if (driverUserDetails) {
      return (
        <div className='space-y-1'>
          <div className='flex items-center space-x-2'>
            <User className='h-4 w-4 text-gray-400' />
            <span className='font-medium'>{driverUserDetails.fullName}</span>
          </div>
          <div className='flex items-center space-x-2'>
            <Mail className='h-4 w-4 text-gray-400' />
            <span className='text-sm text-gray-600'>
              {driverUserDetails.email}
            </span>
          </div>
          {driverUserDetails.phoneNumber && (
            <div className='flex items-center space-x-2'>
              <Phone className='h-4 w-4 text-gray-400' />
              <span className='text-sm text-gray-600'>
                {driverUserDetails.phoneNumber}
              </span>
            </div>
          )}
          {driverUserDetails.formattedAddress && (
            <div className='flex items-center space-x-2'>
              <MapPin className='h-4 w-4 text-gray-400' />
              <span className='text-sm text-gray-600'>
                {driverUserDetails.formattedAddress}
              </span>
            </div>
          )}
        </div>
      );
    }

    if (loadingUserDetails) {
      return (
        <div className='text-sm text-gray-500'>
          Loading driver information...
        </div>
      );
    }

    return (
      <div className='text-sm text-gray-500'>Driver ID: {driver.driverId}</div>
    );
  };

  return (
    <div className='flex items-center justify-between p-4 border rounded-lg'>
      <div className='flex items-center space-x-4'>
        <div className='flex-1'>
          {/* Personal Information */}
          <div className='mb-3'>{renderPersonalInformation()}</div>

          {/* License Information */}
          <div className='space-y-1'>
            <div className='flex items-center space-x-2'>
              <Shield className='h-4 w-4 text-gray-400' />
              <span className='text-sm text-gray-600'>
                <strong>License:</strong> {driver.licenseNumber} (
                {driver.licenseClass})
              </span>
            </div>
            <div className='text-sm text-gray-500'>
              Expiry: {driver.licenseExpiry}
            </div>
            {driver.emergencyContact && (
              <div className='text-sm text-gray-500'>
                Emergency: {driver.emergencyContact}
              </div>
            )}
            {showVehicleInfo && driver.assignedVehicleId && (
              <div className='text-sm text-gray-500'>
                Vehicle ID: {driver.assignedVehicleId}
              </div>
            )}
          </div>
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
