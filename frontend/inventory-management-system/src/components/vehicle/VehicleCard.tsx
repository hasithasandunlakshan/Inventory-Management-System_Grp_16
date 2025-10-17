'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Car,
  Truck,
  Calendar,
  Users,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
} from 'lucide-react';
import { Vehicle } from '@/lib/services/driverService';

interface VehicleCardProps {
  readonly vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const getVehicleImage = () => {
    switch (vehicle.vehicleType) {
      case 'VAN':
        return '/van.png';
      case 'TRUCK':
        return '/truck.png';
      case 'CAR':
        return '/car.png';
      case 'MOTORCYCLE':
        return '/bike.png';
      default:
        return '/truck.png'; // Fallback to truck image
    }
  };

  const getStatusColor = () => {
    switch (vehicle.status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      case 'OUT_OF_SERVICE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (vehicle.status) {
      case 'AVAILABLE':
        return '🟢';
      case 'ASSIGNED':
        return '🔵';
      case 'MAINTENANCE':
        return '🟡';
      case 'OUT_OF_SERVICE':
        return '🔴';
      default:
        return '⚫';
    }
  };

  const formatVehicleType = (type: string) => {
    switch (type) {
      case 'MOTORCYCLE':
        return 'Motorcycle';
      default:
        return type.charAt(0) + type.slice(1).toLowerCase();
    }
  };

  return (
    <Card className='group hover:shadow-xl transition-all duration-300 border rounded-lg overflow-hidden bg-white h-full flex flex-col'>
      <CardHeader className='p-0'>
        {/* Vehicle Image Section - Compact */}
        <div className='relative w-full h-32 overflow-hidden bg-gray-50'>
          <Image
            src={getVehicleImage()}
            alt={formatVehicleType(vehicle.vehicleType)}
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
              {getStatusIcon()} {vehicle.status.replace('_', ' ')}
            </Badge>
          </div>

          {/* Vehicle Number Badge - Top Left */}
          <div className='absolute top-1 left-1'>
            <Badge
              variant='secondary'
              className='text-[10px] px-1.5 py-0 bg-white/90 backdrop-blur-sm shadow-sm leading-tight'
            >
              {vehicle.vehicleNumber}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className='p-3 flex-1 flex flex-col space-y-2'>
        {/* Vehicle Name - Centered */}
        <div className='text-center'>
          <h3 className='font-semibold text-base text-gray-900'>
            {vehicle.make && vehicle.model
              ? `${vehicle.make} ${vehicle.model}`
              : formatVehicleType(vehicle.vehicleType)}
          </h3>
          <p className='text-sm text-gray-600 mt-1'>
            {formatVehicleType(vehicle.vehicleType)}
          </p>
        </div>

        {/* Year */}
        {vehicle.year && (
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 text-gray-400' />
            <span className='text-sm text-gray-600'>
              <strong>Year:</strong> {vehicle.year}
            </span>
          </div>
        )}

        {/* Capacity */}
        <div className='flex items-center gap-2'>
          <Package className='h-4 w-4 text-gray-400' />
          <span className='text-sm text-gray-600'>
            <strong>Capacity:</strong> {vehicle.capacity} kg
          </span>
        </div>

        {/* Assigned Driver */}
        {vehicle.assignedDriverId && (
          <div className='flex items-center gap-2'>
            <Users className='h-4 w-4 text-gray-400' />
            <span className='text-sm text-gray-600'>
              <strong>Driver ID:</strong> {vehicle.assignedDriverId}
            </span>
          </div>
        )}

        {/* Maintenance Information */}
        {(vehicle.lastMaintenance || vehicle.nextMaintenance) && (
          <div className='border-t pt-2 space-y-1'>
            {vehicle.lastMaintenance && (
              <div className='flex items-center gap-2'>
                <Wrench className='h-4 w-4 text-gray-400' />
                <span className='text-sm text-gray-600'>
                  <strong>Last Service:</strong>{' '}
                  {new Date(vehicle.lastMaintenance).toLocaleDateString()}
                </span>
              </div>
            )}

            {vehicle.nextMaintenance && (
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4 text-gray-400' />
                <span className='text-sm text-gray-600'>
                  <strong>Next Service:</strong>{' '}
                  {new Date(vehicle.nextMaintenance).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
