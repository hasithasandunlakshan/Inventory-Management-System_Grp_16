'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  UserDropdownInfo,
  DriverRegistrationForm,
  FormErrors,
  DriverRegistrationRequest,
} from '@/types/driver';
import {
  validateDriverForm,
  getInitialDriverForm,
  getMinLicenseExpiryDate,
  handleFormFieldChange,
  handleUserSelectionChange,
} from '@/utils/driverUtils';
import { driverService } from '@/lib/services/driverService';

interface DriverRegistrationModalProps {
  availableUsers: UserDropdownInfo[];
  onDriverRegistered: () => void;
  onUsersRefresh: () => void;
}

export default function DriverRegistrationModal({
  availableUsers,
  onDriverRegistered,
  onUsersRefresh,
}: DriverRegistrationModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [form, setForm] = useState<DriverRegistrationForm>(
    getInitialDriverForm()
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setSelectedUserId('');
    setForm(getInitialDriverForm());
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateDriverForm(selectedUserId, form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create driver profile for selected user
      const registrationData: DriverRegistrationRequest = {
        userId: parseInt(selectedUserId),
        licenseNumber: form.licenseNumber.trim(),
        licenseClass: form.licenseClass.trim().toUpperCase(),
        licenseExpiry: form.licenseExpiry,
        emergencyContact: form.emergencyContact.trim() || undefined,
      };

      const response = await driverService.registerDriver(registrationData);

      if (response.success) {
        toast.success('Driver profile created successfully!');
        setShowModal(false);
        resetForm();
        onDriverRegistered();
        onUsersRefresh();
      } else {
        toast.error(response.message || 'Failed to create driver profile');
      }
    } catch (error: unknown) {
      console.error('Registration failed:', error);

      // Handle specific error messages
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('already exists')) {
        toast.error(
          'This user already has a driver profile or license number is already in use'
        );
      } else if (errorMessage.includes('Validation failed')) {
        toast.error('Please check your input data and try again');
      } else {
        toast.error('Failed to register driver. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='h-4 w-4 mr-2' />
          Register Driver
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Register New Driver</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='userId'>Select User *</Label>
            <Select
              value={selectedUserId}
              onValueChange={value =>
                handleUserSelectionChange(
                  value,
                  setSelectedUserId,
                  errors,
                  setErrors
                )
              }
            >
              <SelectTrigger className={errors.userId ? 'border-red-500' : ''}>
                <SelectValue placeholder='Choose a user to make driver' />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map(user => (
                  <SelectItem key={user.userId} value={user.userId.toString()}>
                    {user.username} (ID: {user.userId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.userId && (
              <p className='text-sm text-red-500 mt-1'>{errors.userId}</p>
            )}
            {availableUsers.length === 0 && !errors.userId && (
              <p className='text-sm text-gray-500 mt-1'>
                No available users found
              </p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='licenseNumber'>License Number *</Label>
              <Input
                id='licenseNumber'
                value={form.licenseNumber}
                onChange={e =>
                  handleFormFieldChange(
                    'licenseNumber',
                    e.target.value,
                    form,
                    setForm,
                    errors,
                    setErrors
                  )
                }
                className={errors.licenseNumber ? 'border-red-500' : ''}
                placeholder='e.g., ABC123456'
              />
              {errors.licenseNumber && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.licenseNumber}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor='licenseClass'>License Class *</Label>
              <Input
                id='licenseClass'
                value={form.licenseClass}
                onChange={e =>
                  handleFormFieldChange(
                    'licenseClass',
                    e.target.value,
                    form,
                    setForm,
                    errors,
                    setErrors
                  )
                }
                className={errors.licenseClass ? 'border-red-500' : ''}
                placeholder='e.g., B, C, AB'
                maxLength={2}
              />
              {errors.licenseClass && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.licenseClass}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor='licenseExpiry'>License Expiry *</Label>
              <Input
                id='licenseExpiry'
                type='date'
                value={form.licenseExpiry}
                onChange={e =>
                  handleFormFieldChange(
                    'licenseExpiry',
                    e.target.value,
                    form,
                    setForm,
                    errors,
                    setErrors
                  )
                }
                className={errors.licenseExpiry ? 'border-red-500' : ''}
                min={getMinLicenseExpiryDate()}
              />
              {errors.licenseExpiry && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.licenseExpiry}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor='emergencyContact'>Emergency Contact</Label>
              <Input
                id='emergencyContact'
                value={form.emergencyContact}
                onChange={e =>
                  handleFormFieldChange(
                    'emergencyContact',
                    e.target.value,
                    form,
                    setForm,
                    errors,
                    setErrors
                  )
                }
                className={errors.emergencyContact ? 'border-red-500' : ''}
                placeholder='+1234567890'
              />
              {errors.emergencyContact && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.emergencyContact}
                </p>
              )}
              <p className='text-xs text-gray-500 mt-1'>
                Optional - include country code
              </p>
            </div>
          </div>

          <div className='flex justify-end space-x-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='min-w-[120px]'
            >
              {isSubmitting ? 'Registering...' : 'Register Driver'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
