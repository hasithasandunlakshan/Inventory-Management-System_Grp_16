'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, AlertCircle } from 'lucide-react';
import { DriverProfile, DriverFilters } from '@/types/driver';
import { filterDrivers } from '@/utils/driverUtils';
import DriverCard from './DriverCard';

interface DriverListProps {
  drivers: DriverProfile[];
  availableDrivers: DriverProfile[];
  filters: DriverFilters;
  canManageDrivers: boolean;
  onViewDriverDetails?: (driver: DriverProfile) => void;
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  message: string;
  subMessage?: string;
}

const EmptyState = ({ icon: Icon, message, subMessage }: EmptyStateProps) => (
  <div className='text-center py-8'>
    <Icon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
    <p className='text-gray-500'>{message}</p>
    {subMessage && <p className='text-sm text-gray-400'>{subMessage}</p>}
  </div>
);

export default function DriverList({
  drivers,
  availableDrivers,
  filters,
  canManageDrivers,
  onViewDriverDetails,
}: DriverListProps) {
  const filteredDrivers = filterDrivers(drivers, filters);
  const busyDrivers = drivers.filter(d => d.availabilityStatus === 'BUSY');
  const filteredBusyDrivers = filterDrivers(busyDrivers, filters);

  return (
    <Tabs defaultValue='all' className='space-y-4'>
      <TabsList>
        <TabsTrigger value='all'>All Drivers ({drivers.length})</TabsTrigger>
        <TabsTrigger value='available'>
          Available ({availableDrivers.length})
        </TabsTrigger>
        <TabsTrigger value='busy'>Busy ({busyDrivers.length})</TabsTrigger>
      </TabsList>

      <TabsContent value='all'>
        <Card>
          <CardHeader>
            <CardTitle>All Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDrivers.length === 0 ? (
              <EmptyState
                icon={Users}
                message='No drivers found'
                subMessage={
                  canManageDrivers
                    ? 'Click "Register Driver" to add your first driver'
                    : undefined
                }
              />
            ) : (
              <div className='space-y-4'>
                {filteredDrivers.map(driver => (
                  <DriverCard
                    key={driver.driverId}
                    driver={driver}
                    onViewDetails={onViewDriverDetails}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='available'>
        <Card>
          <CardHeader>
            <CardTitle>Available Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            {availableDrivers.length === 0 ? (
              <EmptyState icon={UserCheck} message='No available drivers' />
            ) : (
              <div className='space-y-4'>
                {availableDrivers.map(driver => (
                  <DriverCard
                    key={driver.driverId}
                    driver={driver}
                    onViewDetails={onViewDriverDetails}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='busy'>
        <Card>
          <CardHeader>
            <CardTitle>Busy Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBusyDrivers.length === 0 ? (
              <EmptyState icon={AlertCircle} message='No busy drivers' />
            ) : (
              <div className='space-y-4'>
                {filteredBusyDrivers.map(driver => (
                  <DriverCard
                    key={driver.driverId}
                    driver={driver}
                    onViewDetails={onViewDriverDetails}
                    showVehicleInfo={true}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
