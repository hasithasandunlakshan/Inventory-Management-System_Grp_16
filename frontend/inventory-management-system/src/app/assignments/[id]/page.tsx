'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  User,
  Car,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  Shield,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import {
  driverService,
  DetailedAssignment,
  DriverProfile,
  Vehicle,
} from '@/lib/services/driverService';
import { userService, UserInfo } from '@/lib/services/userService';
import { toast } from 'sonner';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [assignment, setAssignment] = useState<DetailedAssignment | null>(null);
  const [driverDetails, setDriverDetails] = useState<DriverProfile | null>(
    null
  );
  const [driverUserDetails, setDriverUserDetails] = useState<UserInfo | null>(
    null
  );
  const [vehicleDetails, setVehicleDetails] = useState<Vehicle | null>(null);
  const [assignedByDetails, setAssignedByDetails] = useState<UserInfo | null>(
    null
  );
  const [unassignedByDetails, setUnassignedByDetails] =
    useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const assignmentId = params.id as string;

  useEffect(() => {
    if (assignmentId) {
      loadAssignmentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const loadAssignmentDetails = async () => {
    try {
      setLoading(true);
      const response = await driverService.getAssignmentDetails(
        parseInt(assignmentId)
      );

      if (response.success && response.data) {
        const assignment = response.data;
        setAssignment(assignment);

        // Load driver details
        if (assignment.driverId) {
          try {
            const driverResponse = await driverService.getDriverById(
              assignment.driverId
            );
            if (driverResponse.success && driverResponse.data) {
              setDriverDetails(driverResponse.data);

              // Load driver user details
              try {
                const userResponse = await userService.getUserById(
                  driverResponse.data.userId
                );
                if (userResponse) {
                  setDriverUserDetails(userResponse);
                }
              } catch {
                // Failed to load driver user details
              }
            }
          } catch {
            // Failed to load driver details
          }
        }

        // Load vehicle details
        if (assignment.vehicleId) {
          try {
            const vehiclesResponse = await driverService.getAllVehicles();
            if (vehiclesResponse.success && vehiclesResponse.data) {
              const vehicle = vehiclesResponse.data.find(
                v => v.vehicleId === assignment.vehicleId
              );
              if (vehicle) {
                setVehicleDetails(vehicle);
              }
            }
          } catch {
            // Failed to load vehicle details
          }
        }

        // Load assigned by user details
        if (assignment.assignedBy) {
          try {
            const userResponse = await userService.getUserById(
              assignment.assignedBy
            );
            if (userResponse) {
              setAssignedByDetails(userResponse);
            }
          } catch {
            // Failed to load assigned by details
          }
        }

        // Load unassigned by user details
        if (assignment.unassignedBy) {
          try {
            const userResponse = await userService.getUserById(
              assignment.unassignedBy
            );
            if (userResponse) {
              setUnassignedByDetails(userResponse);
            }
          } catch {
            // Failed to load unassigned by details
          }
        }
      } else {
        toast.error('Assignment not found');
        router.push('/assignments');
      }
    } catch {
      toast.error('Failed to load assignment details');
      router.push('/assignments');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      case 'SUSPENDED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getAvailabilityBadgeVariant = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'default';
      case 'BUSY':
        return 'destructive';
      case 'OFF_DUTY':
        return 'secondary';
      case 'ON_LEAVE':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getVehicleStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'default';
      case 'ASSIGNED':
        return 'secondary';
      case 'MAINTENANCE':
        return 'destructive';
      case 'OUT_OF_SERVICE':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <AlertCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <p className='text-gray-500'>Assignment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button
            variant='outline'
            onClick={() => router.push('/assignments')}
            className='flex items-center space-x-2'
          >
            <ArrowLeft className='h-4 w-4' />
            <span>Back to Assignments</span>
          </Button>
          <div>
            <h1 className='text-3xl font-bold'>Assignment Details</h1>
            <p className='text-gray-600'>
              Assignment #{assignment.assignmentId}
            </p>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <Badge variant={getStatusBadgeVariant(assignment.status)}>
            {assignment.status}
          </Badge>
        </div>
      </div>

      {/* Assignment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <FileText className='h-5 w-5' />
            <span>Assignment Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-medium text-gray-900 mb-2'>
                  Assignment Information
                </h3>
                <div className='space-y-2'>
                  <div className='flex items-center space-x-2'>
                    <Calendar className='h-4 w-4 text-gray-400' />
                    <span className='text-sm'>
                      <strong>Assigned:</strong>{' '}
                      {formatDate(assignment.assignedAt)}
                    </span>
                  </div>
                  {assignment.unassignedAt && (
                    <div className='flex items-center space-x-2'>
                      <Calendar className='h-4 w-4 text-gray-400' />
                      <span className='text-sm'>
                        <strong>Unassigned:</strong>{' '}
                        {formatDate(assignment.unassignedAt)}
                      </span>
                    </div>
                  )}
                  <div className='flex items-center space-x-2'>
                    <Calendar className='h-4 w-4 text-gray-400' />
                    <span className='text-sm'>
                      <strong>Created:</strong>{' '}
                      {formatDate(assignment.createdAt)}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Calendar className='h-4 w-4 text-gray-400' />
                    <span className='text-sm'>
                      <strong>Last Updated:</strong>{' '}
                      {formatDate(assignment.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className='space-y-4'>
              {assignment.notes && (
                <div>
                  <h3 className='font-medium text-gray-900 mb-2'>Notes</h3>
                  <p className='text-sm text-gray-600 bg-gray-50 p-3 rounded-lg'>
                    {assignment.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Details */}
      {driverDetails && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <User className='h-5 w-5' />
              <span>Driver Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div>
                  <h3 className='font-medium text-gray-900 mb-2'>
                    Personal Information
                  </h3>
                  <div className='space-y-2'>
                    {driverUserDetails ? (
                      <>
                        <div className='flex items-center space-x-2'>
                          <User className='h-4 w-4 text-gray-400' />
                          <span className='text-sm'>
                            <strong>Name:</strong> {driverUserDetails.fullName}
                          </span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Mail className='h-4 w-4 text-gray-400' />
                          <span className='text-sm'>
                            <strong>Email:</strong> {driverUserDetails.email}
                          </span>
                        </div>
                        {driverUserDetails.phoneNumber && (
                          <div className='flex items-center space-x-2'>
                            <Phone className='h-4 w-4 text-gray-400' />
                            <span className='text-sm'>
                              <strong>Phone:</strong>{' '}
                              {driverUserDetails.phoneNumber}
                            </span>
                          </div>
                        )}
                        {driverUserDetails.formattedAddress && (
                          <div className='flex items-center space-x-2'>
                            <MapPin className='h-4 w-4 text-gray-400' />
                            <span className='text-sm'>
                              <strong>Address:</strong>{' '}
                              {driverUserDetails.formattedAddress}
                            </span>
                          </div>
                        )}
                        <div className='flex items-center space-x-2'>
                          <Shield className='h-4 w-4 text-gray-400' />
                          <span className='text-sm'>
                            <strong>Role:</strong> {driverUserDetails.role}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className='space-y-2'>
                        <div className='text-sm text-gray-500'>
                          Loading driver personal information...
                        </div>
                        <div className='flex items-center space-x-2'>
                          <User className='h-4 w-4 text-gray-400' />
                          <span className='text-sm'>
                            <strong>Driver ID:</strong> {driverDetails.driverId}
                          </span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <User className='h-4 w-4 text-gray-400' />
                          <span className='text-sm'>
                            <strong>User ID:</strong> {driverDetails.userId}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className='space-y-4'>
                <div>
                  <h3 className='font-medium text-gray-900 mb-2'>
                    License Information
                  </h3>
                  <div className='space-y-2'>
                    <div className='flex items-center space-x-2'>
                      <Shield className='h-4 w-4 text-gray-400' />
                      <span className='text-sm'>
                        <strong>License Number:</strong>{' '}
                        {driverDetails.licenseNumber}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Shield className='h-4 w-4 text-gray-400' />
                      <span className='text-sm'>
                        <strong>License Class:</strong>{' '}
                        {driverDetails.licenseClass}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Calendar className='h-4 w-4 text-gray-400' />
                      <span className='text-sm'>
                        <strong>License Expiry:</strong>{' '}
                        {driverDetails.licenseExpiry}
                      </span>
                    </div>
                    {driverDetails.emergencyContact && (
                      <div className='flex items-center space-x-2'>
                        <Phone className='h-4 w-4 text-gray-400' />
                        <span className='text-sm'>
                          <strong>Emergency Contact:</strong>{' '}
                          {driverDetails.emergencyContact}
                        </span>
                      </div>
                    )}
                    <div className='flex items-center space-x-2'>
                      <Badge
                        variant={getAvailabilityBadgeVariant(
                          driverDetails.availabilityStatus
                        )}
                      >
                        {driverDetails.availabilityStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Details */}
      {vehicleDetails && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Car className='h-5 w-5' />
              <span>Vehicle Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div>
                  <h3 className='font-medium text-gray-900 mb-2'>
                    Vehicle Information
                  </h3>
                  <div className='space-y-2'>
                    <div className='flex items-center space-x-2'>
                      <Car className='h-4 w-4 text-gray-400' />
                      <span className='text-sm'>
                        <strong>Vehicle Number:</strong>{' '}
                        {vehicleDetails.vehicleNumber}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Car className='h-4 w-4 text-gray-400' />
                      <span className='text-sm'>
                        <strong>Type:</strong> {vehicleDetails.vehicleType}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Car className='h-4 w-4 text-gray-400' />
                      <span className='text-sm'>
                        <strong>Capacity:</strong> {vehicleDetails.capacity} kg
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Badge
                        variant={getVehicleStatusBadgeVariant(
                          vehicleDetails.status
                        )}
                      >
                        {vehicleDetails.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className='space-y-4'>
                <div>
                  <h3 className='font-medium text-gray-900 mb-2'>
                    Vehicle Specifications
                  </h3>
                  <div className='space-y-2'>
                    {vehicleDetails.make && (
                      <div className='flex items-center space-x-2'>
                        <Car className='h-4 w-4 text-gray-400' />
                        <span className='text-sm'>
                          <strong>Make:</strong> {vehicleDetails.make}
                        </span>
                      </div>
                    )}
                    {vehicleDetails.model && (
                      <div className='flex items-center space-x-2'>
                        <Car className='h-4 w-4 text-gray-400' />
                        <span className='text-sm'>
                          <strong>Model:</strong> {vehicleDetails.model}
                        </span>
                      </div>
                    )}
                    {vehicleDetails.year && (
                      <div className='flex items-center space-x-2'>
                        <Calendar className='h-4 w-4 text-gray-400' />
                        <span className='text-sm'>
                          <strong>Year:</strong> {vehicleDetails.year}
                        </span>
                      </div>
                    )}
                    {vehicleDetails.lastMaintenance && (
                      <div className='flex items-center space-x-2'>
                        <Wrench className='h-4 w-4 text-gray-400' />
                        <span className='text-sm'>
                          <strong>Last Maintenance:</strong>{' '}
                          {vehicleDetails.lastMaintenance}
                        </span>
                      </div>
                    )}
                    {vehicleDetails.nextMaintenance && (
                      <div className='flex items-center space-x-2'>
                        <Wrench className='h-4 w-4 text-gray-400' />
                        <span className='text-sm'>
                          <strong>Next Maintenance:</strong>{' '}
                          {vehicleDetails.nextMaintenance}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignment History */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Assigned By */}
        {assignedByDetails && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <User className='h-5 w-5' />
                <span>Assigned By</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='flex items-center space-x-2'>
                  <User className='h-4 w-4 text-gray-400' />
                  <span className='text-sm'>
                    <strong>Name:</strong> {assignedByDetails.fullName}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Mail className='h-4 w-4 text-gray-400' />
                  <span className='text-sm'>
                    <strong>Email:</strong> {assignedByDetails.email}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Shield className='h-4 w-4 text-gray-400' />
                  <span className='text-sm'>
                    <strong>Role:</strong> {assignedByDetails.role}
                  </span>
                </div>
                {assignedByDetails.phoneNumber && (
                  <div className='flex items-center space-x-2'>
                    <Phone className='h-4 w-4 text-gray-400' />
                    <span className='text-sm'>
                      <strong>Phone:</strong> {assignedByDetails.phoneNumber}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Unassigned By */}
        {unassignedByDetails && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <User className='h-5 w-5' />
                <span>Unassigned By</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='flex items-center space-x-2'>
                  <User className='h-4 w-4 text-gray-400' />
                  <span className='text-sm'>
                    <strong>Name:</strong> {unassignedByDetails.fullName}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Mail className='h-4 w-4 text-gray-400' />
                  <span className='text-sm'>
                    <strong>Email:</strong> {unassignedByDetails.email}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Shield className='h-4 w-4 text-gray-400' />
                  <span className='text-sm'>
                    <strong>Role:</strong> {unassignedByDetails.role}
                  </span>
                </div>
                {unassignedByDetails.phoneNumber && (
                  <div className='flex items-center space-x-2'>
                    <Phone className='h-4 w-4 text-gray-400' />
                    <span className='text-sm'>
                      <strong>Phone:</strong> {unassignedByDetails.phoneNumber}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
