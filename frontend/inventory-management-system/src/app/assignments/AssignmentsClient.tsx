'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Route, Plus, Search, UserCheck, Car, RefreshCw } from 'lucide-react';
import {
  driverService,
  DriverProfile,
  Vehicle,
  AssignmentRequest,
  MinimalAssignment,
} from '@/lib/services/driverService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import AssignmentCard from '@/components/assignment/AssignmentCard';

interface AssignmentsClientProps {
  initialDrivers: DriverProfile[];
  initialVehicles: Vehicle[];
}

export default function AssignmentsClient({
  initialDrivers,
  initialVehicles,
}: AssignmentsClientProps) {
  const [assignments, setAssignments] = useState<MinimalAssignment[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<
    MinimalAssignment[]
  >([]);
  const [availableDrivers, setAvailableDrivers] =
    useState<DriverProfile[]>(initialDrivers);
  const [availableVehicles, setAvailableVehicles] =
    useState<Vehicle[]>(initialVehicles);
  const [loading, setLoading] = useState(false); // Start with false since we have SSG data
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentRequest>({
    driverId: 0,
    vehicleId: 0,
    assignedBy: 0,
    notes: '',
  });

  const { user, hasAnyRole } = useAuth();
  const canManageAssignments = hasAnyRole(['MANAGER', 'ADMIN']);

  // Load assignments on mount, optionally refresh drivers/vehicles if SSG data is empty
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        assignmentsResponse,
        activeAssignmentsResponse,
        availableDriversResponse,
        availableVehiclesResponse,
      ] = await Promise.all([
        driverService.getAllAssignmentsMinimal(),
        driverService.getActiveAssignmentsMinimal(),
        driverService.getAvailableDrivers(),
        driverService.getAvailableVehicles(),
      ]);

      if (assignmentsResponse.success && assignmentsResponse.data) {
        setAssignments(assignmentsResponse.data);
      }

      if (activeAssignmentsResponse.success && activeAssignmentsResponse.data) {
        setActiveAssignments(activeAssignmentsResponse.data);
      }

      if (availableDriversResponse.success && availableDriversResponse.data) {
        setAvailableDrivers(availableDriversResponse.data);
      }

      if (availableVehiclesResponse.success && availableVehiclesResponse.data) {
        setAvailableVehicles(availableVehiclesResponse.data);
      }
    } catch {
      toast.error('Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (assignmentForm.driverId === 0 || assignmentForm.vehicleId === 0) {
      toast.error('Please select both driver and vehicle');
      return;
    }

    try {
      // Set the assignedBy field to current user's ID
      const assignmentData = {
        ...assignmentForm,
        assignedBy: user?.id ? parseInt(user.id) : 0,
      };
      const response = await driverService.createAssignment(assignmentData);

      if (response.success) {
        toast.success('Assignment created successfully!');
        setShowAssignmentModal(false);
        setAssignmentForm({
          driverId: 0,
          vehicleId: 0,
          assignedBy: 0,
          notes: '',
        });
        loadData();
      } else {
        toast.error(response.message || 'Failed to create assignment');
      }
    } catch {
      toast.error('Failed to create assignment');
    }
  };

  const filteredAssignments = assignments.filter(
    assignment =>
      assignment.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.vehicleNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewAssignment = (assignmentId: number) => {
    // Navigate to assignment details page
    window.location.href = `/assignments/${assignmentId}`;
  };

  const handleUnassign = async () => {
    toast.info('Unassign feature coming soon!');
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
      {/* Blue Header Card */}
      <Card
        className='border-0 shadow-lg'
        style={{
          background: 'linear-gradient(135deg, #2A7CC7 0%, #245e91ff 100%)',
        }}
      >
        <CardContent className='p-6'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            {/* Title Section */}
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-white/20 rounded-lg'>
                <Route className='h-6 w-6 text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white'>
                  Driver-Vehicle Assignments
                </h1>
                <p className='text-white/90 text-sm'>
                  Manage driver and vehicle assignments •{' '}
                  {activeAssignments.length} active assignments
                </p>
              </div>
            </div>

            {/* Controls Section */}
            <div className='flex flex-col sm:flex-row gap-3'>
              {/* Search Input */}
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70' />
                <Input
                  placeholder='Search assignments...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10 h-11 bg-white/95 border-white/20 hover:bg-white text-gray-900 placeholder:text-gray-500 focus:border-white/40 focus:ring-white/20'
                />
              </div>

              {/* Action Buttons */}
              <div className='flex gap-2'>
                <Button
                  onClick={loadData}
                  variant='outline'
                  size='sm'
                  className='h-11 px-4 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40'
                >
                  <RefreshCw className='h-4 w-4 mr-2' />
                  Refresh
                </Button>

                {canManageAssignments && (
                  <Dialog
                    open={showAssignmentModal}
                    onOpenChange={setShowAssignmentModal}
                  >
                    <DialogTrigger asChild>
                      <Button className='h-11 px-4 bg-white text-blue-700 hover:bg-blue-50 shadow-md'>
                        <Plus className='h-4 w-4 mr-2' />
                        New Assignment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-lg'>
                      <DialogHeader>
                        <DialogTitle>Create New Assignment</DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={handleCreateAssignment}
                        className='space-y-4'
                      >
                        <div>
                          <Label htmlFor='driverId'>Select Driver</Label>
                          <Select
                            value={assignmentForm.driverId.toString()}
                            onValueChange={value =>
                              setAssignmentForm({
                                ...assignmentForm,
                                driverId: Number(value),
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Choose an available driver' />
                            </SelectTrigger>
                            <SelectContent>
                              {availableDrivers.map(driver => (
                                <SelectItem
                                  key={driver.driverId}
                                  value={driver.driverId.toString()}
                                >
                                  License: {driver.licenseNumber} (Class:{' '}
                                  {driver.licenseClass})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {availableDrivers.length === 0 && (
                            <p className='text-sm text-gray-500 mt-1'>
                              No available drivers
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor='vehicleId'>Select Vehicle</Label>
                          <Select
                            value={assignmentForm.vehicleId.toString()}
                            onValueChange={value =>
                              setAssignmentForm({
                                ...assignmentForm,
                                vehicleId: Number(value),
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Choose an available vehicle' />
                            </SelectTrigger>
                            <SelectContent>
                              {availableVehicles.map(vehicle => (
                                <SelectItem
                                  key={vehicle.vehicleId}
                                  value={vehicle.vehicleId.toString()}
                                >
                                  {vehicle.vehicleNumber} -{' '}
                                  {vehicle.vehicleType} ({vehicle.capacity}kg)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {availableVehicles.length === 0 && (
                            <p className='text-sm text-gray-500 mt-1'>
                              No available vehicles
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor='notes'>Notes (Optional)</Label>
                          <Textarea
                            id='notes'
                            value={assignmentForm.notes}
                            onChange={e =>
                              setAssignmentForm({
                                ...assignmentForm,
                                notes: e.target.value,
                              })
                            }
                            placeholder='Add any assignment notes...'
                            rows={3}
                          />
                        </div>

                        <div className='flex justify-end space-x-2'>
                          <Button
                            type='button'
                            variant='outline'
                            onClick={() => setShowAssignmentModal(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type='submit'
                            disabled={
                              availableDrivers.length === 0 ||
                              availableVehicles.length === 0
                            }
                          >
                            Create Assignment
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Assignments
            </CardTitle>
            <Route className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{assignments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active</CardTitle>
            <UserCheck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{activeAssignments.length}</div>
            <p className='text-xs text-muted-foreground'>Currently active</p>
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
            <div className='text-2xl font-bold'>{availableDrivers.length}</div>
            <p className='text-xs text-muted-foreground'>
              Ready for assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Available Vehicles
            </CardTitle>
            <Car className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{availableVehicles.length}</div>
            <p className='text-xs text-muted-foreground'>
              Ready for assignment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className='flex items-center space-x-2'>
        <Search className='h-4 w-4 text-gray-400' />
        <Input
          placeholder='Search assignments by driver name, vehicle number, or notes...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='max-w-sm'
        />
      </div>

      {/* Assignments List */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Active Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <UserCheck className='h-5 w-5 mr-2' />
              Active Assignments ({activeAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeAssignments.length === 0 ? (
              <div className='text-center py-8'>
                <Route className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>No active assignments</p>
                {canManageAssignments && (
                  <p className='text-sm text-gray-400'>
                    Create an assignment to get started
                  </p>
                )}
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {activeAssignments.map(assignment => (
                  <AssignmentCard
                    key={assignment.assignmentId}
                    assignment={assignment}
                    onViewDetails={() =>
                      handleViewAssignment(assignment.assignmentId)
                    }
                    onUnassign={() => handleUnassign()}
                    showActions={canManageAssignments}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Route className='h-5 w-5 mr-2' />
              All Assignments ({filteredAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className='max-h-96 overflow-y-auto'>
            {filteredAssignments.length === 0 ? (
              <div className='text-center py-8'>
                <Route className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>No assignments found</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {filteredAssignments.map(assignment => (
                  <AssignmentCard
                    key={assignment.assignmentId}
                    assignment={assignment}
                    onViewDetails={() =>
                      handleViewAssignment(assignment.assignmentId)
                    }
                    onUnassign={() => handleUnassign()}
                    showActions={canManageAssignments}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Resources Summary */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <UserCheck className='h-5 w-5 mr-2' />
              Available Drivers ({availableDrivers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableDrivers.length === 0 ? (
              <p className='text-gray-500 text-center py-4'>
                No available drivers
              </p>
            ) : (
              <div className='space-y-2'>
                {availableDrivers.slice(0, 5).map(driver => (
                  <div
                    key={driver.driverId}
                    className='flex justify-between items-center p-2 bg-gray-50 rounded'
                  >
                    <span className='text-sm'>
                      License: {driver.licenseNumber}
                    </span>
                    <Badge variant='outline'>{driver.licenseClass}</Badge>
                  </div>
                ))}
                {availableDrivers.length > 5 && (
                  <p className='text-sm text-gray-500 text-center'>
                    +{availableDrivers.length - 5} more drivers
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Car className='h-5 w-5 mr-2' />
              Available Vehicles ({availableVehicles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableVehicles.length === 0 ? (
              <p className='text-gray-500 text-center py-4'>
                No available vehicles
              </p>
            ) : (
              <div className='space-y-2'>
                {availableVehicles.slice(0, 5).map(vehicle => (
                  <div
                    key={vehicle.vehicleId}
                    className='flex justify-between items-center p-2 bg-gray-50 rounded'
                  >
                    <span className='text-sm'>{vehicle.vehicleNumber}</span>
                    <Badge variant='outline'>{vehicle.vehicleType}</Badge>
                  </div>
                ))}
                {availableVehicles.length > 5 && (
                  <p className='text-sm text-gray-500 text-center'>
                    +{availableVehicles.length - 5} more vehicles
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
