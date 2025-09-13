'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, AlertCircle } from 'lucide-react';
import { DriverStats } from '@/types/driver';

interface DriverStatsCardsProps {
  stats: DriverStats;
}

export default function DriverStatsCards({ stats }: DriverStatsCardsProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Drivers</CardTitle>
          <Users className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalDrivers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Available Drivers
          </CardTitle>
          <UserCheck className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.availableDrivers}</div>
          <p className='text-xs text-muted-foreground'>Ready for assignments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Busy Drivers</CardTitle>
          <AlertCircle className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.busyDrivers}</div>
          <p className='text-xs text-muted-foreground'>Currently assigned</p>
        </CardContent>
      </Card>
    </div>
  );
}
