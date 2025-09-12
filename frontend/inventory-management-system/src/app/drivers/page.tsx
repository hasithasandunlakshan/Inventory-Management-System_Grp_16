'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserCheck, Plus, Eye, Search, AlertCircle } from 'lucide-react';
import { driverService, DriverProfile, UserDropdownInfo } from '@/lib/services/driverService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<DriverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserDropdownInfo[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [driverProfileForm, setDriverProfileForm] = useState({
    licenseNumber: '',
    licenseClass: '',
    licenseExpiry: '',
    emergencyContact: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, hasAnyRole, isAuthenticated } = useAuth();
  const canManageDrivers = hasAnyRole(['MANAGER', 'ADMIN']);

  // Validation functions
  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // User selection validation
    if (!selectedUserId) {
      errors.userId = 'Please select a user';
    }

    // License number validation
    if (!driverProfileForm.licenseNumber.trim()) {
      errors.licenseNumber = 'License number is required';
    } else if (driverProfileForm.licenseNumber.trim().length < 3) {
      errors.licenseNumber = 'License number must be at least 3 characters';
    }

    // License class validation (must be single uppercase letter or two uppercase letters)
    if (!driverProfileForm.licenseClass.trim()) {
      errors.licenseClass = 'License class is required';
    } else {
      const licenseClassRegex = /^[A-Z]$|^[A-Z]{2}$/;
      if (!licenseClassRegex.test(driverProfileForm.licenseClass.trim())) {
        errors.licenseClass = 'License class must be a single letter (A, B, C) or two letters (AB, CD)';
      }
    }

    // License expiry validation
    if (!driverProfileForm.licenseExpiry) {
      errors.licenseExpiry = 'License expiry date is required';
    } else {
      const expiryDate = new Date(driverProfileForm.licenseExpiry);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate <= today) {
        errors.licenseExpiry = 'License expiry date must be in the future';
      }
    }

    // Emergency contact validation (optional but if provided, must be valid phone number)
    if (driverProfileForm.emergencyContact && driverProfileForm.emergencyContact.trim()) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(driverProfileForm.emergencyContact.trim())) {
        errors.emergencyContact = 'Please enter a valid phone number (e.g., +1234567890)';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setSelectedUserId('');
    setDriverProfileForm({
      licenseNumber: '',
      licenseClass: '',
      licenseExpiry: '',
      emergencyContact: ''
    });
    setFormErrors({});
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadDrivers();
    if (canManageDrivers) {
      loadAvailableUsers();
    }
  }, [isAuthenticated, canManageDrivers]);

  const loadAvailableUsers = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('inventory_auth_token') : null;
      if (!token) return; // wait until token exists

      const users = await driverService.getUsersByRole('USER');
      setAvailableUsers(users.map(user => ({ userId: parseInt(user.id), username: user.username })));
    } catch (error) {
      // Likely 403 for non-manager/admin users; log only
      console.error('Failed to load available users:', error);
    }
  };

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const [allDriversResponse, availableDriversResponse] = await Promise.all([
        driverService.getAllDrivers(),
        driverService.getAvailableDrivers()
      ]);

      if (allDriversResponse.success && allDriversResponse.data) {
        setDrivers(allDriversResponse.data);
      }

      if (availableDriversResponse.success && availableDriversResponse.data) {
        setAvailableDrivers(availableDriversResponse.data);
      }
    } catch (error) {
      console.error('Failed to load drivers:', error);
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create driver profile for selected user
      const response = await driverService.registerDriver({
        userId: parseInt(selectedUserId),
        licenseNumber: driverProfileForm.licenseNumber.trim(),
        licenseClass: driverProfileForm.licenseClass.trim().toUpperCase(),
        licenseExpiry: driverProfileForm.licenseExpiry,
        emergencyContact: driverProfileForm.emergencyContact.trim() || undefined
      });

      if (response.success) {
        toast.success('Driver profile created successfully!');
        setShowRegistrationModal(false);
        resetForm();
        loadDrivers();
        loadAvailableUsers(); // Refresh available users
      } else {
        toast.error(response.message || 'Failed to create driver profile');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Handle specific error messages
      if (error.message?.includes('already exists')) {
        toast.error('This user already has a driver profile or license number is already in use');
      } else if (error.message?.includes('Validation failed')) {
        toast.error('Please check your input data and try again');
      } else {
        toast.error('Failed to register driver. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'default';
      case 'BUSY': return 'secondary';
      case 'OFF_DUTY': return 'outline';
      case 'ON_LEAVE': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.licenseClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.emergencyContact?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold">Driver Management</h1>
          <p className="text-gray-600">Manage drivers, profiles, and availability</p>
        </div>
        {canManageDrivers && (
          <Dialog open={showRegistrationModal} onOpenChange={setShowRegistrationModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Register Driver
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Register New Driver</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRegistration} className="space-y-4">
                <div>
                  <Label htmlFor="userId">Select User *</Label>
                  <Select
                    value={selectedUserId}
                    onValueChange={(value) => {
                      setSelectedUserId(value);
                      if (formErrors.userId) {
                        setFormErrors(prev => ({...prev, userId: ''}));
                      }
                    }}
                  >
                    <SelectTrigger className={formErrors.userId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Choose a user to make driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.userId} value={user.userId.toString()}>
                          {user.username} (ID: {user.userId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.userId && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.userId}</p>
                  )}
                  {availableUsers.length === 0 && !formErrors.userId && (
                    <p className="text-sm text-gray-500 mt-1">No available users found</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licenseNumber">License Number *</Label>
                    <Input
                      id="licenseNumber"
                      value={driverProfileForm.licenseNumber}
                      onChange={(e) => {
                        setDriverProfileForm({...driverProfileForm, licenseNumber: e.target.value});
                        if (formErrors.licenseNumber) {
                          setFormErrors(prev => ({...prev, licenseNumber: ''}));
                        }
                      }}
                      className={formErrors.licenseNumber ? 'border-red-500' : ''}
                      placeholder="e.g., ABC123456"
                    />
                    {formErrors.licenseNumber && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.licenseNumber}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="licenseClass">License Class *</Label>
                    <Input
                      id="licenseClass"
                      value={driverProfileForm.licenseClass}
                      onChange={(e) => {
                        setDriverProfileForm({...driverProfileForm, licenseClass: e.target.value});
                        if (formErrors.licenseClass) {
                          setFormErrors(prev => ({...prev, licenseClass: ''}));
                        }
                      }}
                      className={formErrors.licenseClass ? 'border-red-500' : ''}
                      placeholder="e.g., B, C, AB"
                      maxLength={2}
                    />
                    {formErrors.licenseClass && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.licenseClass}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="licenseExpiry">License Expiry *</Label>
                    <Input
                      id="licenseExpiry"
                      type="date"
                      value={driverProfileForm.licenseExpiry}
                      onChange={(e) => {
                        setDriverProfileForm({...driverProfileForm, licenseExpiry: e.target.value});
                        if (formErrors.licenseExpiry) {
                          setFormErrors(prev => ({...prev, licenseExpiry: ''}));
                        }
                      }}
                      className={formErrors.licenseExpiry ? 'border-red-500' : ''}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {formErrors.licenseExpiry && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.licenseExpiry}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={driverProfileForm.emergencyContact}
                      onChange={(e) => {
                        setDriverProfileForm({...driverProfileForm, emergencyContact: e.target.value});
                        if (formErrors.emergencyContact) {
                          setFormErrors(prev => ({...prev, emergencyContact: ''}));
                        }
                      }}
                      className={formErrors.emergencyContact ? 'border-red-500' : ''}
                      placeholder="+1234567890"
                    />
                    {formErrors.emergencyContact && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.emergencyContact}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Optional - include country code</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowRegistrationModal(false);
                      resetForm();
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? 'Registering...' : 'Register Driver'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableDrivers.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready for assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Busy Drivers</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {drivers.filter(d => d.availabilityStatus === 'BUSY').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently assigned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search drivers by license, class, contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Drivers List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Drivers ({drivers.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availableDrivers.length})</TabsTrigger>
          <TabsTrigger value="busy">Busy ({drivers.filter(d => d.availabilityStatus === 'BUSY').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDrivers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No drivers found</p>
                  {canManageDrivers && (
                    <p className="text-sm text-gray-400">Click "Register Driver" to add your first driver</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDrivers.map((driver) => (
                    <div key={driver.driverId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">License: {driver.licenseNumber}</p>
                          <p className="text-sm text-gray-500">Class: {driver.licenseClass}</p>
                          <p className="text-sm text-gray-500">Expiry: {driver.licenseExpiry}</p>
                          {driver.emergencyContact && (
                            <p className="text-sm text-gray-500">Emergency: {driver.emergencyContact}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadgeVariant(driver.availabilityStatus)}>
                          {driver.availabilityStatus}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle>Available Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              {availableDrivers.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No available drivers</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableDrivers.map((driver) => (
                    <div key={driver.driverId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">License: {driver.licenseNumber}</p>
                          <p className="text-sm text-gray-500">Class: {driver.licenseClass}</p>
                          <p className="text-sm text-gray-500">Ready for assignment</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">AVAILABLE</Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="busy">
          <Card>
            <CardHeader>
              <CardTitle>Busy Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              {drivers.filter(d => d.availabilityStatus === 'BUSY').length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No busy drivers</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {drivers.filter(d => d.availabilityStatus === 'BUSY').map((driver) => (
                    <div key={driver.driverId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">License: {driver.licenseNumber}</p>
                          <p className="text-sm text-gray-500">Class: {driver.licenseClass}</p>
                          {driver.assignedVehicleId && (
                            <p className="text-sm text-gray-500">Vehicle ID: {driver.assignedVehicleId}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">BUSY</Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
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
