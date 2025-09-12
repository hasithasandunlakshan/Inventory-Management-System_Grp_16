'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Route, Plus, Eye, Search, UserCheck, Car, Calendar, MapPin, Phone, Mail, Clock, Wrench, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { 
  driverService, 
  DriverVehicleAssignment, 
  DriverProfile, 
  Vehicle, 
  AssignmentRequest 
} from '@/lib/services/driverService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<DriverVehicleAssignment[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<DriverVehicleAssignment[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<DriverProfile[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [userDetails, setUserDetails] = useState<Map<number, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showDetailSlider, setShowDetailSlider] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<DriverVehicleAssignment | null>(null);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentRequest>({
    driverId: 0,
    vehicleId: 0,
    assignedBy: 0,
    notes: ''
  });

  const { user, hasAnyRole } = useAuth();
  const canManageAssignments = hasAnyRole(['MANAGER', 'ADMIN']);

  useEffect(() => {
    loadData();
  }, []);

  const loadUserDetails = async (userId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090'}/api/auth/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('inventory_auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        return userData.data || userData;
      }
    } catch (error) {
      console.error(`Failed to load user details for user ${userId}:`, error);
    }
    return null;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        assignmentsResponse,
        activeAssignmentsResponse,
        availableDriversResponse,
        availableVehiclesResponse
      ] = await Promise.all([
        driverService.getAllAssignments(),
        driverService.getActiveAssignments(),
        driverService.getAvailableDrivers(),
        driverService.getAvailableVehicles()
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

      // Load user details for all drivers
      const userDetailsMap = new Map();
      if (availableDriversResponse.success && availableDriversResponse.data) {
        for (const driver of availableDriversResponse.data) {
          const userDetail = await loadUserDetails(driver.userId);
          if (userDetail) {
            userDetailsMap.set(driver.userId, userDetail);
          }
        }
      }
      setUserDetails(userDetailsMap);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAssignmentDetails = (assignment: DriverVehicleAssignment) => {
    setSelectedAssignment(assignment);
    setShowDetailSlider(true);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (assignmentForm.driverId === 0 || assignmentForm.vehicleId === 0) {
      toast.error('Please select both driver and vehicle');
      return;
    }

    if (!user?.id) {
      toast.error('User information not available');
      return;
    }

    try {
      const assignmentData = {
        ...assignmentForm,
        assignedBy: parseInt(user.id)
      };
      const response = await driverService.createAssignment(assignmentData);

      if (response.success) {
        toast.success('Assignment created successfully!');
        setShowAssignmentModal(false);
        setAssignmentForm({
          driverId: 0,
          vehicleId: 0,
          assignedBy: 0,
          notes: ''
        });
        loadData();
      } else {
        toast.error(response.message || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Assignment creation failed:', error);
      toast.error('Failed to create assignment');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'COMPLETED': return 'secondary';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDriverDetails = (driverId: number) => {
    return availableDrivers.find(driver => driver.driverId === driverId);
  };

  const getVehicleDetails = (vehicleId: number) => {
    return availableVehicles.find(vehicle => vehicle.vehicleId === vehicleId);
  };

  const getUserDetails = (userId: number) => {
    return userDetails.get(userId);
  };

  const getDriverDisplayName = (driverId: number) => {
    const driver = getDriverDetails(driverId);
    if (driver) {
      const userDetail = getUserDetails(driver.userId);
      return userDetail?.fullName || `Driver ${driver.licenseNumber}`;
    }
    return `Driver ${driverId}`;
  };

  const getDriverDisplayInfo = (driverId: number) => {
    const driver = getDriverDetails(driverId);
    if (driver) {
      const userDetail = getUserDetails(driver.userId);
      return {
        name: userDetail?.fullName || `Driver ${driver.licenseNumber}`,
        address: userDetail?.formattedAddress || 'Address not available',
        phone: userDetail?.phoneNumber || 'Phone not available',
        email: userDetail?.email || 'Email not available',
        licenseNumber: driver.licenseNumber,
        licenseClass: driver.licenseClass
      };
    }
    return {
      name: `Driver ${driverId}`,
      address: 'Address not available',
      phone: 'Phone not available',
      email: 'Email not available',
      licenseNumber: 'N/A',
      licenseClass: 'N/A'
    };
  };

  const getVehicleDisplayInfo = (vehicleId: number) => {
    const vehicle = getVehicleDetails(vehicleId);
    if (vehicle) {
      return {
        number: vehicle.vehicleNumber,
        type: vehicle.vehicleType,
        capacity: `${vehicle.capacity} kg`,
        make: vehicle.make || 'Not specified',
        model: vehicle.model || 'Not specified',
        year: vehicle.year || 'Not specified',
        status: vehicle.status
      };
    }
    return {
      number: `Vehicle ${vehicleId}`,
      type: 'Unknown',
      capacity: 'Unknown',
      make: 'Unknown',
      model: 'Unknown',
      year: 'Unknown',
      status: 'Unknown'
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'COMPLETED': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAvailabilityIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'BUSY': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'OFF_DUTY': return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'ON_LEAVE': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.driverId.toString().includes(searchTerm) ||
    assignment.vehicleId.toString().includes(searchTerm) ||
    assignment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Driver-Vehicle Assignments</h1>
          <p className="text-gray-600">Manage driver and vehicle assignments</p>
        </div>
        {canManageAssignments && (
          <Dialog open={showAssignmentModal} onOpenChange={setShowAssignmentModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <Label htmlFor="driverId">Select Driver</Label>
                  <Select
                    value={assignmentForm.driverId.toString()}
                    onValueChange={(value) => setAssignmentForm({...assignmentForm, driverId: Number(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an available driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrivers.map((driver) => (
                        <SelectItem key={driver.driverId} value={driver.driverId.toString()}>
                          License: {driver.licenseNumber} (Class: {driver.licenseClass})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableDrivers.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">No available drivers</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="vehicleId">Select Vehicle</Label>
                  <Select
                    value={assignmentForm.vehicleId.toString()}
                    onValueChange={(value) => setAssignmentForm({...assignmentForm, vehicleId: Number(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an available vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.vehicleId} value={vehicle.vehicleId.toString()}>
                          {vehicle.vehicleNumber} - {vehicle.vehicleType} ({vehicle.capacity}kg)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableVehicles.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">No available vehicles</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={assignmentForm.notes}
                    onChange={(e) => setAssignmentForm({...assignmentForm, notes: e.target.value})}
                    placeholder="Add any assignment notes..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAssignmentModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={availableDrivers.length === 0 || availableVehicles.length === 0}
                  >
                    Create Assignment
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableDrivers.length}</div>
            <p className="text-xs text-muted-foreground">Ready for assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableVehicles.length}</div>
            <p className="text-xs text-muted-foreground">Ready for assignment</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search assignments by driver ID, vehicle ID, or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2" />
              Active Assignments ({activeAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeAssignments.length === 0 ? (
              <div className="text-center py-8">
                <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active assignments</p>
                {canManageAssignments && (
                  <p className="text-sm text-gray-400">Create an assignment to get started</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {activeAssignments.map((assignment) => (
                  <div key={assignment.assignmentId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">ACTIVE</Badge>
                        <span className="text-sm text-gray-500">
                          #{assignment.assignmentId}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewAssignmentDetails(assignment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{getDriverDisplayName(assignment.driverId)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{getVehicleDisplayInfo(assignment.vehicleId).number}</span>
                        <Badge variant="outline" className="text-xs">{getVehicleDisplayInfo(assignment.vehicleId).type}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Assigned: {formatDate(assignment.assignedAt)}</span>
                      </div>
                      {assignment.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          Notes: {assignment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Route className="h-5 w-5 mr-2" />
              All Assignments ({filteredAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-8">
                <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No assignments found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAssignments.map((assignment) => (
                  <div key={assignment.assignmentId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadgeVariant(assignment.status)}>
                          {assignment.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          #{assignment.assignmentId}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewAssignmentDetails(assignment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{getDriverDisplayName(assignment.driverId)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{getVehicleDisplayInfo(assignment.vehicleId).number}</span>
                        <Badge variant="outline" className="text-xs">{getVehicleDisplayInfo(assignment.vehicleId).type}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          Assigned: {formatDate(assignment.assignedAt)}
                        </span>
                      </div>
                      {assignment.unassignedAt && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            Unassigned: {formatDate(assignment.unassignedAt)}
                          </span>
                        </div>
                      )}
                      {assignment.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          Notes: {assignment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Resources Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2" />
              Available Drivers ({availableDrivers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableDrivers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No available drivers</p>
            ) : (
              <div className="space-y-2">
                {availableDrivers.slice(0, 5).map((driver) => (
                  <div key={driver.driverId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">License: {driver.licenseNumber}</span>
                    <Badge variant="outline">{driver.licenseClass}</Badge>
                  </div>
                ))}
                {availableDrivers.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{availableDrivers.length - 5} more drivers
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="h-5 w-5 mr-2" />
              Available Vehicles ({availableVehicles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableVehicles.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No available vehicles</p>
            ) : (
              <div className="space-y-2">
                {availableVehicles.slice(0, 5).map((vehicle) => (
                  <div key={vehicle.vehicleId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">{vehicle.vehicleNumber}</span>
                    <Badge variant="outline">{vehicle.vehicleType}</Badge>
                  </div>
                ))}
                {availableVehicles.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{availableVehicles.length - 5} more vehicles
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assignment Details Slider */}
      <Sheet open={showDetailSlider} onOpenChange={setShowDetailSlider}>
        <SheetContent className="w-[600px] sm:w-[700px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <Route className="h-5 w-5 mr-2" />
              Assignment Details
              {selectedAssignment && (
                <Badge variant="outline" className="ml-2">
                  #{selectedAssignment.assignmentId}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          {selectedAssignment && (
            <div className="mt-6 space-y-6">
              {/* Assignment Overview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Route className="h-5 w-5 mr-2" />
                  Assignment Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedAssignment.status)}
                      <span className="font-medium">Status:</span>
                      <Badge variant={getStatusBadgeVariant(selectedAssignment.status)}>
                        {selectedAssignment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Assigned:</span>
                      <span className="text-sm">{formatDate(selectedAssignment.assignedAt)}</span>
                    </div>
                    {selectedAssignment.unassignedAt && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Unassigned:</span>
                        <span className="text-sm">{formatDate(selectedAssignment.unassignedAt)}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Driver:</span>
                      <span className="text-sm">{getDriverDisplayName(selectedAssignment.driverId)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Car className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Vehicle:</span>
                      <span className="text-sm">{getVehicleDisplayInfo(selectedAssignment.vehicleId).number}</span>
                      <Badge variant="outline" className="text-xs">{getVehicleDisplayInfo(selectedAssignment.vehicleId).type}</Badge>
                    </div>
                    {canManageAssignments && (
                      <>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-xs text-gray-500">Driver ID:</span>
                          <span className="text-xs text-gray-500">{selectedAssignment.driverId}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-xs text-gray-500">Vehicle ID:</span>
                          <span className="text-xs text-gray-500">{selectedAssignment.vehicleId}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {selectedAssignment.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Notes:</span>
                    <p className="text-sm text-gray-600 mt-1">{selectedAssignment.notes}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200" />

              {/* Driver Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  Driver Information
                </h3>
                {(() => {
                  const driver = getDriverDetails(selectedAssignment.driverId);
                  const driverInfo = getDriverDisplayInfo(selectedAssignment.driverId);
                  return driver ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Name:</span>
                            <span className="text-sm font-medium">{driverInfo.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Address:</span>
                            <span className="text-sm">{driverInfo.address}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Phone:</span>
                            <span className="text-sm">{driverInfo.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Email:</span>
                            <span className="text-sm">{driverInfo.email}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">License Number:</span>
                            <span className="text-sm font-mono">{driverInfo.licenseNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">License Class:</span>
                            <Badge variant="outline">{driverInfo.licenseClass}</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">License Expiry:</span>
                            <span className="text-sm">{new Date(driver.licenseExpiry).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getAvailabilityIcon(driver.availabilityStatus)}
                            <span className="font-medium">Status:</span>
                            <Badge variant="outline">{driver.availabilityStatus}</Badge>
                          </div>
                        </div>
                      </div>
                      {driver.emergencyContact && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Emergency Contact:</span>
                          <span className="text-sm">{driver.emergencyContact}</span>
                        </div>
                      )}
                      {canManageAssignments && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">Technical Details (Manager Only)</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>Driver ID: {driver.driverId}</div>
                            <div>User ID: {driver.userId}</div>
                            {driver.assignedVehicleId && (
                              <div>Assigned Vehicle ID: {driver.assignedVehicleId}</div>
                            )}
                            <div>Created: {new Date(driver.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>Driver details not found</p>
                    </div>
                  );
                })()}
              </div>

              <div className="border-t border-gray-200" />

              {/* Vehicle Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Car className="h-5 w-5 mr-2" />
                  Vehicle Information
                </h3>
                {(() => {
                  const vehicle = getVehicleDetails(selectedAssignment.vehicleId);
                  const vehicleInfo = getVehicleDisplayInfo(selectedAssignment.vehicleId);
                  return vehicle ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Vehicle Number:</span>
                            <span className="text-sm font-mono font-medium">{vehicleInfo.number}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Type:</span>
                            <Badge variant="outline">{vehicleInfo.type}</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Capacity:</span>
                            <span className="text-sm">{vehicleInfo.capacity}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Make & Model:</span>
                            <span className="text-sm">{vehicleInfo.make} {vehicleInfo.model}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(vehicle.status)}
                            <span className="font-medium">Status:</span>
                            <Badge variant="outline">{vehicleInfo.status}</Badge>
                          </div>
                          {vehicle.year && (
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">Year:</span>
                              <span className="text-sm">{vehicleInfo.year}</span>
                            </div>
                          )}
                          {vehicle.assignedDriverId && (
                            <div className="flex items-center space-x-2">
                              <UserCheck className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">Assigned Driver:</span>
                              <span className="text-sm">{getDriverDisplayName(vehicle.assignedDriverId)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {vehicle.lastMaintenance && (
                          <div className="flex items-center space-x-2">
                            <Wrench className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Last Maintenance:</span>
                            <span className="text-sm">{new Date(vehicle.lastMaintenance).toLocaleDateString()}</span>
                          </div>
                        )}
                        {vehicle.nextMaintenance && (
                          <div className="flex items-center space-x-2">
                            <Wrench className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Next Maintenance:</span>
                            <span className="text-sm">{new Date(vehicle.nextMaintenance).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      {canManageAssignments && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">Technical Details (Manager Only)</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>Vehicle ID: {vehicle.vehicleId}</div>
                            {vehicle.assignedDriverId && (
                              <div>Assigned Driver ID: {vehicle.assignedDriverId}</div>
                            )}
                            <div>Created: {new Date(vehicle.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>Vehicle details not found</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
