'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Car,
  Truck,
  Plus,
  Eye,
  Search,
  AlertTriangle,
  Wrench,
} from 'lucide-react';
import {
  driverService,
  Vehicle,
  VehicleRegistrationRequest,
} from '@/lib/services/driverService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationForm, setRegistrationForm] =
    useState<VehicleRegistrationRequest>({
      vehicleNumber: '',
      vehicleType: 'CAR',
      capacity: 0,
      make: '',
      model: '',
      year: new Date().getFullYear(),
      lastMaintenance: '',
      nextMaintenance: '',
    });

  const { hasAnyRole } = useAuth();
  const canManageVehicles = hasAnyRole(['MANAGER', 'ADMIN']);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const [allVehiclesResponse, availableVehiclesResponse] =
        await Promise.all([
          driverService.getAllVehicles(),
          driverService.getAvailableVehicles(),
        ]);

      if (allVehiclesResponse.success && allVehiclesResponse.data) {
        setVehicles(allVehiclesResponse.data);
      }

      if (availableVehiclesResponse.success && availableVehiclesResponse.data) {
        setAvailableVehicles(availableVehiclesResponse.data);
      }
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await driverService.registerVehicle(registrationForm);

      if (response.success) {
        toast.success('Vehicle registered successfully!');
        setShowRegistrationModal(false);
        setRegistrationForm({
          vehicleNumber: '',
          vehicleType: 'CAR',
          capacity: 0,
          make: '',
          model: '',
          year: new Date().getFullYear(),
          lastMaintenance: '',
          nextMaintenance: '',
        });
        loadVehicles();
      } else {
        toast.error(response.message || 'Failed to register vehicle');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Failed to register vehicle');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'default';
      case 'ASSIGNED':
        return 'secondary';
      case 'MAINTENANCE':
        return 'destructive';
      case 'OUT_OF_SERVICE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'TRUCK':
        return <Truck className='h-5 w-5' />;
      case 'VAN':
        return <Car className='h-5 w-5' />;
      case 'MOTORCYCLE':
        return <Car className='h-5 w-5' />;
      case 'CAR':
        return <Car className='h-5 w-5' />;
      default:
        return <Car className='h-5 w-5' />;
    }
  };

  const filteredVehicles = vehicles.filter(
    vehicle =>
      vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold'>Vehicle Management</h1>
          <p className='text-gray-600'>Manage vehicle fleet and maintenance</p>
        </div>
        {canManageVehicles && (
          <Dialog
            open={showRegistrationModal}
            onOpenChange={setShowRegistrationModal}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className='h-4 w-4 mr-2' />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRegistration} className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='vehicleNumber'>Vehicle Number</Label>
                    <Input
                      id='vehicleNumber'
                      value={registrationForm.vehicleNumber}
                      onChange={e =>
                        setRegistrationForm({
                          ...registrationForm,
                          vehicleNumber: e.target.value,
                        })
                      }
                      placeholder='e.g., ABC-1234'
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='vehicleType'>Vehicle Type</Label>
                    <Select
                      value={registrationForm.vehicleType}
                      onValueChange={(value: string) =>
                        setRegistrationForm({
                          ...registrationForm,
                          vehicleType: value as
                            | 'TRUCK'
                            | 'VAN'
                            | 'MOTORCYCLE'
                            | 'CAR',
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='CAR'>Car</SelectItem>
                        <SelectItem value='VAN'>Van</SelectItem>
                        <SelectItem value='TRUCK'>Truck</SelectItem>
                        <SelectItem value='MOTORCYCLE'>Motorcycle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor='capacity'>Capacity (kg)</Label>
                    <Input
                      id='capacity'
                      type='number'
                      value={registrationForm.capacity}
                      onChange={e =>
                        setRegistrationForm({
                          ...registrationForm,
                          capacity: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='make'>Make</Label>
                    <Input
                      id='make'
                      value={registrationForm.make}
                      onChange={e =>
                        setRegistrationForm({
                          ...registrationForm,
                          make: e.target.value,
                        })
                      }
                      placeholder='e.g., Toyota'
                    />
                  </div>
                  <div>
                    <Label htmlFor='model'>Model</Label>
                    <Input
                      id='model'
                      value={registrationForm.model}
                      onChange={e =>
                        setRegistrationForm({
                          ...registrationForm,
                          model: e.target.value,
                        })
                      }
                      placeholder='e.g., Camry'
                    />
                  </div>
                  <div>
                    <Label htmlFor='year'>Year</Label>
                    <Input
                      id='year'
                      type='number'
                      value={registrationForm.year}
                      onChange={e =>
                        setRegistrationForm({
                          ...registrationForm,
                          year: Number(e.target.value),
                        })
                      }
                      min='1900'
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  <div>
                    <Label htmlFor='lastMaintenance'>Last Maintenance</Label>
                    <Input
                      id='lastMaintenance'
                      type='date'
                      value={registrationForm.lastMaintenance}
                      onChange={e =>
                        setRegistrationForm({
                          ...registrationForm,
                          lastMaintenance: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='nextMaintenance'>Next Maintenance</Label>
                    <Input
                      id='nextMaintenance'
                      type='date'
                      value={registrationForm.nextMaintenance}
                      onChange={e =>
                        setRegistrationForm({
                          ...registrationForm,
                          nextMaintenance: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className='flex justify-end space-x-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setShowRegistrationModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type='submit'>Add Vehicle</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Vehicles
            </CardTitle>
            <Car className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{vehicles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Available</CardTitle>
            <Car className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{availableVehicles.length}</div>
            <p className='text-xs text-muted-foreground'>
              Ready for assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Assigned</CardTitle>
            <AlertTriangle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {vehicles.filter(v => v.status === 'ASSIGNED').length}
            </div>
            <p className='text-xs text-muted-foreground'>Currently in use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Maintenance</CardTitle>
            <Wrench className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {vehicles.filter(v => v.status === 'MAINTENANCE').length}
            </div>
            <p className='text-xs text-muted-foreground'>Under maintenance</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className='flex items-center space-x-2'>
        <Search className='h-4 w-4 text-gray-400' />
        <Input
          placeholder='Search vehicles by number, type, make, model...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='max-w-sm'
        />
      </div>

      {/* Vehicles List */}
      <Tabs defaultValue='all' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='all'>
            All Vehicles ({vehicles.length})
          </TabsTrigger>
          <TabsTrigger value='available'>
            Available ({availableVehicles.length})
          </TabsTrigger>
          <TabsTrigger value='assigned'>
            Assigned ({vehicles.filter(v => v.status === 'ASSIGNED').length})
          </TabsTrigger>
          <TabsTrigger value='maintenance'>
            Maintenance (
            {vehicles.filter(v => v.status === 'MAINTENANCE').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='all'>
          <Card>
            <CardHeader>
              <CardTitle>All Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredVehicles.length === 0 ? (
                <div className='text-center py-8'>
                  <Car className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>No vehicles found</p>
                  {canManageVehicles && (
                    <p className='text-sm text-gray-400'>
                      Click &quot;Add Vehicle&quot; to add your first vehicle
                    </p>
                  )}
                </div>
              ) : (
                <div className='space-y-4'>
                  {filteredVehicles.map(vehicle => (
                    <div
                      key={vehicle.vehicleId}
                      className='flex items-center justify-between p-4 border rounded-lg'
                    >
                      <div className='flex items-center space-x-4'>
                        <div className='p-2 bg-gray-100 rounded-lg'>
                          {getVehicleIcon(vehicle.vehicleType)}
                        </div>
                        <div>
                          <p className='font-medium'>{vehicle.vehicleNumber}</p>
                          <p className='text-sm text-gray-500'>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {vehicle.vehicleType} | Capacity: {vehicle.capacity}
                            kg
                          </p>
                          {vehicle.assignedDriverId && (
                            <p className='text-sm text-gray-500'>
                              Driver ID: {vehicle.assignedDriverId}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Badge variant={getStatusBadgeVariant(vehicle.status)}>
                          {vehicle.status}
                        </Badge>
                        <Button variant='outline' size='sm'>
                          <Eye className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='available'>
          <Card>
            <CardHeader>
              <CardTitle>Available Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              {availableVehicles.length === 0 ? (
                <div className='text-center py-8'>
                  <Car className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>No available vehicles</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {availableVehicles.map(vehicle => (
                    <div
                      key={vehicle.vehicleId}
                      className='flex items-center justify-between p-4 border rounded-lg'
                    >
                      <div className='flex items-center space-x-4'>
                        <div className='p-2 bg-green-100 rounded-lg'>
                          {getVehicleIcon(vehicle.vehicleType)}
                        </div>
                        <div>
                          <p className='font-medium'>{vehicle.vehicleNumber}</p>
                          <p className='text-sm text-gray-500'>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                          <p className='text-sm text-gray-500'>
                            Ready for assignment
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Badge variant='default'>AVAILABLE</Badge>
                        <Button variant='outline' size='sm'>
                          <Eye className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='assigned'>
          <Card>
            <CardHeader>
              <CardTitle>Assigned Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicles.filter(v => v.status === 'ASSIGNED').length === 0 ? (
                <div className='text-center py-8'>
                  <AlertTriangle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>No assigned vehicles</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {vehicles
                    .filter(v => v.status === 'ASSIGNED')
                    .map(vehicle => (
                      <div
                        key={vehicle.vehicleId}
                        className='flex items-center justify-between p-4 border rounded-lg'
                      >
                        <div className='flex items-center space-x-4'>
                          <div className='p-2 bg-blue-100 rounded-lg'>
                            {getVehicleIcon(vehicle.vehicleType)}
                          </div>
                          <div>
                            <p className='font-medium'>
                              {vehicle.vehicleNumber}
                            </p>
                            <p className='text-sm text-gray-500'>
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </p>
                            {vehicle.assignedDriverId && (
                              <p className='text-sm text-gray-500'>
                                Driver ID: {vehicle.assignedDriverId}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Badge variant='secondary'>ASSIGNED</Badge>
                          <Button variant='outline' size='sm'>
                            <Eye className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='maintenance'>
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicles.filter(v => v.status === 'MAINTENANCE').length === 0 ? (
                <div className='text-center py-8'>
                  <Wrench className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>No vehicles in maintenance</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {vehicles
                    .filter(v => v.status === 'MAINTENANCE')
                    .map(vehicle => (
                      <div
                        key={vehicle.vehicleId}
                        className='flex items-center justify-between p-4 border rounded-lg'
                      >
                        <div className='flex items-center space-x-4'>
                          <div className='p-2 bg-red-100 rounded-lg'>
                            {getVehicleIcon(vehicle.vehicleType)}
                          </div>
                          <div>
                            <p className='font-medium'>
                              {vehicle.vehicleNumber}
                            </p>
                            <p className='text-sm text-gray-500'>
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </p>
                            {vehicle.nextMaintenance && (
                              <p className='text-sm text-gray-500'>
                                Next: {vehicle.nextMaintenance}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Badge variant='destructive'>MAINTENANCE</Badge>
                          <Button variant='outline' size='sm'>
                            <Eye className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
