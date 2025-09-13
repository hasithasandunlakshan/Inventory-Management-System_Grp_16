'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  UserCheck,
  Car,
  Calendar,
  AlertCircle,
  Eye,
  Clock,
} from 'lucide-react';
import {
  driverService,
  DriverProfile,
  Vehicle,
  DriverVehicleAssignment,
} from '@/lib/services/driverService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function DriverDashboard() {
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(
    null
  );
  const [assignedVehicle, setAssignedVehicle] = useState<Vehicle | null>(null);
  const [currentAssignment, setCurrentAssignment] =
    useState<DriverVehicleAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const loadDriverData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get driver profile by user ID
      const profileResponse = await driverService.getDriverByUserId(
        Number(user.id)
      );

      if (profileResponse.success && profileResponse.data) {
        const profile = profileResponse.data;
        setDriverProfile(profile);

        // If driver has an assigned vehicle, get vehicle details
        if (profile.assignedVehicleId) {
          // Note: You'll need to add a getVehicleById method to the driver service
          // For now, we'll get all vehicles and filter
          const vehiclesResponse = await driverService.getAllVehicles();
          if (vehiclesResponse.success && vehiclesResponse.data) {
            const vehicle = vehiclesResponse.data.find(
              v => v.vehicleId === profile.assignedVehicleId
            );
            if (vehicle) {
              setAssignedVehicle(vehicle);
            }
          }
        }

        // Get current assignment
        const assignmentsResponse = await driverService.getActiveAssignments();
        if (assignmentsResponse.success && assignmentsResponse.data) {
          const assignment = assignmentsResponse.data.find(
            a => a.driverId === profile.driverId
          );
          if (assignment) {
            setCurrentAssignment(assignment);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load driver data:', error);
      toast.error('Failed to load driver information');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      loadDriverData();
    }
  }, [user, loadDriverData]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'default';
      case 'BUSY':
        return 'secondary';
      case 'OFF_DUTY':
        return 'outline';
      case 'ON_LEAVE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isLicenseExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    return expiry <= thirtyDaysFromNow;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  if (!driverProfile) {
    return (
      <div className='text-center py-12'>
        <UserCheck className='h-16 w-16 text-gray-400 mx-auto mb-4' />
        <h2 className='text-xl font-semibold text-gray-600 mb-2'>
          No Driver Profile Found
        </h2>
        <p className='text-gray-500 mb-4'>
          It looks like you don&apos;t have a driver profile yet. Please contact
          your manager to set up your driver profile.
        </p>
        <Button onClick={loadDriverData}>Refresh</Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-3xl font-bold'>Driver Dashboard</h1>
          <p className='text-gray-600'>
            Welcome back, {user?.fullName || user?.username}
          </p>
        </div>
        <div className='text-right'>
          <Badge
            variant={getStatusBadgeVariant(driverProfile.availabilityStatus)}
            className='text-sm'
          >
            {driverProfile.availabilityStatus}
          </Badge>
        </div>
      </div>

      {/* License Expiry Warning */}
      {isLicenseExpiringSoon(driverProfile.licenseExpiry) && (
        <Card className='border-orange-200 bg-orange-50'>
          <CardContent className='pt-4'>
            <div className='flex items-center space-x-3'>
              <AlertCircle className='h-5 w-5 text-orange-600' />
              <div>
                <p className='font-medium text-orange-800'>
                  License Expiring Soon
                </p>
                <p className='text-sm text-orange-700'>
                  Your driving license expires on{' '}
                  {formatDate(driverProfile.licenseExpiry)}. Please renew it as
                  soon as possible.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Driver Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <UserCheck className='h-5 w-5 mr-2' />
              Driver Profile
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div>
              <p className='text-sm text-gray-500'>License Number</p>
              <p className='font-medium'>{driverProfile.licenseNumber}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>License Class</p>
              <p className='font-medium'>{driverProfile.licenseClass}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>License Expiry</p>
              <p
                className={`font-medium ${isLicenseExpiringSoon(driverProfile.licenseExpiry) ? 'text-orange-600' : ''}`}
              >
                {formatDate(driverProfile.licenseExpiry)}
              </p>
            </div>
            {driverProfile.emergencyContact && (
              <div>
                <p className='text-sm text-gray-500'>Emergency Contact</p>
                <p className='font-medium'>{driverProfile.emergencyContact}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Vehicle Card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Car className='h-5 w-5 mr-2' />
              Assigned Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedVehicle ? (
              <div className='space-y-3'>
                <div>
                  <p className='text-sm text-gray-500'>Vehicle Number</p>
                  <p className='font-medium'>{assignedVehicle.vehicleNumber}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Type & Details</p>
                  <p className='font-medium'>
                    {assignedVehicle.vehicleType} - {assignedVehicle.year}{' '}
                    {assignedVehicle.make} {assignedVehicle.model}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Capacity</p>
                  <p className='font-medium'>{assignedVehicle.capacity} kg</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Status</p>
                  <Badge
                    variant={
                      assignedVehicle.status === 'ASSIGNED'
                        ? 'secondary'
                        : 'default'
                    }
                  >
                    {assignedVehicle.status}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className='text-center py-4'>
                <Car className='h-8 w-8 text-gray-400 mx-auto mb-2' />
                <p className='text-gray-500'>No vehicle assigned</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Clock className='h-5 w-5 mr-2' />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div>
              <p className='text-sm text-gray-500'>Availability</p>
              <Badge
                variant={getStatusBadgeVariant(
                  driverProfile.availabilityStatus
                )}
              >
                {driverProfile.availabilityStatus}
              </Badge>
            </div>
            {currentAssignment && (
              <div>
                <p className='text-sm text-gray-500'>Current Assignment</p>
                <div className='mt-2 p-2 bg-blue-50 rounded'>
                  <p className='text-sm font-medium'>
                    Assignment #{currentAssignment.assignmentId}
                  </p>
                  <p className='text-xs text-gray-600'>
                    Started: {formatDateTime(currentAssignment.assignedAt)}
                  </p>
                  {currentAssignment.notes && (
                    <p className='text-xs text-gray-600 mt-1'>
                      Notes: {currentAssignment.notes}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div>
              <p className='text-sm text-gray-500'>Profile Created</p>
              <p className='text-sm'>{formatDate(driverProfile.createdAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Button variant='outline' className='justify-start'>
              <Eye className='h-4 w-4 mr-2' />
              View Assignments
            </Button>
            <Button variant='outline' className='justify-start'>
              <Calendar className='h-4 w-4 mr-2' />
              Schedule
            </Button>
            <Button variant='outline' className='justify-start'>
              <Car className='h-4 w-4 mr-2' />
              Vehicle Details
            </Button>
            <Button
              variant='outline'
              className='justify-start'
              onClick={loadDriverData}
            >
              <Clock className='h-4 w-4 mr-2' />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded'>
              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
              <div className='flex-1'>
                <p className='text-sm font-medium'>
                  Profile Status: {driverProfile.availabilityStatus}
                </p>
                <p className='text-xs text-gray-500'>
                  Last updated: {formatDateTime(driverProfile.updatedAt)}
                </p>
              </div>
            </div>

            {currentAssignment && (
              <div className='flex items-center space-x-3 p-3 bg-blue-50 rounded'>
                <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                <div className='flex-1'>
                  <p className='text-sm font-medium'>
                    Assignment #{currentAssignment.assignmentId} Active
                  </p>
                  <p className='text-xs text-gray-500'>
                    Started: {formatDateTime(currentAssignment.assignedAt)}
                  </p>
                </div>
              </div>
            )}

            {assignedVehicle && (
              <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded'>
                <div className='w-2 h-2 bg-gray-500 rounded-full'></div>
                <div className='flex-1'>
                  <p className='text-sm font-medium'>
                    Vehicle {assignedVehicle.vehicleNumber} Assigned
                  </p>
                  <p className='text-xs text-gray-500'>
                    {assignedVehicle.vehicleType} - {assignedVehicle.capacity}kg
                    capacity
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
