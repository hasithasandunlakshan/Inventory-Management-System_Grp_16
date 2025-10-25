'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Phone,
  MapPin,
  Shield,
  Car,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { DriverProfile } from '@/lib/types/driver';
import { formatDriverStatus } from '@/lib/utils/driver/driverUtils';
import { userService, UserInfo } from '@/lib/services/userService';

interface DriverCardProps {
  readonly driver: DriverProfile;
  readonly showVehicleInfo?: boolean;
}

export default function DriverCard({
  driver,
  showVehicleInfo = false,
}: DriverCardProps) {
  const [driverUserDetails, setDriverUserDetails] = useState<UserInfo | null>(
    null
  );
  useEffect(() => {
    const loadDriverUserDetails = async () => {
      if (driver.userId) {
        try {
          const userResponse = await userService.getUserById(driver.userId);
          if (userResponse) {
            setDriverUserDetails(userResponse);
          }
        } catch {
          // Handle error silently
        }
      }
    };

    loadDriverUserDetails();
  }, [driver.userId]);

  const getStatusColor = () => {
    switch (driver.availabilityStatus) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'BUSY':
        return 'bg-yellow-100 text-yellow-800';
      case 'OFF_DUTY':
        return 'bg-gray-100 text-gray-800';
      case 'ON_LEAVE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (driver.availabilityStatus) {
      case 'AVAILABLE':
        return '🟢';
      case 'BUSY':
        return '🟡';
      case 'OFF_DUTY':
        return '⚫';
      case 'ON_LEAVE':
        return '🔴';
      default:
        return '⚫';
    }
  };

  return (
    <Card className='group hover:shadow-xl transition-all duration-300 border rounded-lg overflow-hidden bg-white h-full flex flex-col'>
      <CardHeader className='p-0'>
        {/* Driver Image Section - Compact */}
        <div className='relative w-full h-32 overflow-hidden bg-gray-50'>
          <Image
            src='/Delivery.png'
            alt='Driver'
            fill
            className='object-contain group-hover:scale-110 transition-transform duration-300 p-2'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />

          {/* Status Badge - Top Right */}
          <div className='absolute top-1 right-1'>
            <Badge
              variant='secondary'
              className={`text-[10px] px-1.5 py-0 shadow-sm leading-tight ${getStatusColor()}`}
            >
              {getStatusIcon()} {formatDriverStatus(driver.availabilityStatus)}
            </Badge>
          </div>

          {/* Driver ID Badge - Top Left */}
          <div className='absolute top-1 left-1'>
            <Badge
              variant='secondary'
              className='text-[10px] px-1.5 py-0 bg-white/90 backdrop-blur-sm shadow-sm leading-tight'
            >
              ID: {driver.driverId}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className='p-3 flex-1 flex flex-col space-y-2'>
        {/* Driver Name - Centered */}
        <div className='text-center'>
          <h3 className='font-semibold text-base text-gray-900'>
            {driverUserDetails?.fullName || `Driver ${driver.driverId}`}
          </h3>
          <p className='text-sm text-gray-600 mt-1'>{driver.licenseClass}</p>
        </div>

        {/* Email */}
        {driverUserDetails?.email && (
          <div className='flex items-center gap-2'>
            <Mail className='h-4 w-4 text-gray-400' />
            <span className='text-sm text-gray-600 truncate'>
              {driverUserDetails.email}
            </span>
          </div>
        )}

        {/* Phone */}
        {driverUserDetails?.phoneNumber && (
          <div className='flex items-center gap-2'>
            <Phone className='h-4 w-4 text-gray-400' />
            <span className='text-sm text-gray-600'>
              {driverUserDetails.phoneNumber}
            </span>
          </div>
        )}

        {/* Address */}
        {driverUserDetails?.formattedAddress && (
          <div className='flex items-center gap-2'>
            <MapPin className='h-4 w-4 text-gray-400' />
            <span className='text-sm text-gray-600 truncate'>
              {driverUserDetails.formattedAddress}
            </span>
          </div>
        )}

        {/* License Information */}
        <div className='border-t pt-2 space-y-1'>
          <div className='flex items-center gap-2'>
            <Shield className='h-4 w-4 text-gray-400' />
            <span className='text-sm text-gray-600'>
              <strong>License:</strong> {driver.licenseNumber}
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <Clock className='h-4 w-4 text-gray-400' />
            <span className='text-sm text-gray-600'>
              <strong>Expires:</strong>{' '}
              {new Date(driver.licenseExpiry).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Emergency Contact */}
        {driver.emergencyContact && (
          <div className='flex items-center gap-2'>
            <AlertCircle className='h-4 w-4 text-gray-400' />
            <span className='text-sm text-gray-600'>
              <strong>Emergency:</strong> {driver.emergencyContact}
            </span>
          </div>
        )}

        {/* Vehicle Assignment */}
        {showVehicleInfo && driver.assignedVehicleId && (
          <div className='flex items-center gap-2'>
            <Car className='h-4 w-4 text-gray-400' />
            <span className='text-sm text-gray-600'>
              <strong>Assigned Vehicle:</strong> {driver.assignedVehicleId}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
