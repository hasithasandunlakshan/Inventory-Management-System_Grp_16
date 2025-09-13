'use client';

import React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  User,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  X,
} from 'lucide-react';
import { UserInfo } from '@/services/userService';

interface CustomerDetailsModalProps {
  customer: UserInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerDetailsModal({
  customer,
  isOpen,
  onClose,
}: CustomerDetailsModalProps) {
  if (!customer) return null;

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-2xl font-bold'>
              Customer Details
            </DialogTitle>
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Customer Header */}
          <div className='flex items-start space-x-4 p-4 bg-gray-50 rounded-lg'>
            <div className='w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden'>
              {customer.profileImageUrl ? (
                <Image
                  src={customer.profileImageUrl}
                  alt={customer.fullName}
                  width={64}
                  height={64}
                  className='w-full h-full object-cover'
                />
              ) : (
                <User className='h-8 w-8 text-gray-400' />
              )}
            </div>
            <div className='flex-1'>
              <h3 className='text-xl font-semibold'>{customer.fullName}</h3>
              <p className='text-gray-600'>@{customer.username}</p>
              <div className='flex items-center gap-2 mt-2'>
                <Badge className={getStatusColor(customer.accountStatus)}>
                  {customer.accountStatus}
                </Badge>
                {customer.emailVerified && (
                  <Badge className='bg-blue-100 text-blue-800'>
                    <CheckCircle className='w-3 h-3 mr-1' />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            <div className='text-right'>
              <p className='text-sm text-gray-500'>Customer ID</p>
              <p className='font-mono font-bold'>#{customer.id}</p>
            </div>
          </div>

          {/* Contact Information */}
          <Card>
            <CardContent className='p-4'>
              <h4 className='text-lg font-semibold mb-4'>
                Contact Information
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center space-x-3'>
                  <Mail className='h-4 w-4 text-gray-400' />
                  <div>
                    <p className='text-sm text-gray-500'>Email</p>
                    <p className='font-medium'>{customer.email}</p>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <Phone className='h-4 w-4 text-gray-400' />
                  <div>
                    <p className='text-sm text-gray-500'>Phone</p>
                    <p className='font-medium'>
                      {customer.phoneNumber || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          {(customer.formattedAddress ||
            (customer.latitude && customer.longitude)) && (
            <Card>
              <CardContent className='p-4'>
                <h4 className='text-lg font-semibold mb-4'>
                  Location Information
                </h4>
                <div className='space-y-3'>
                  {customer.formattedAddress && (
                    <div className='flex items-start space-x-3'>
                      <MapPin className='h-4 w-4 text-gray-400 mt-1' />
                      <div>
                        <p className='text-sm text-gray-500'>Address</p>
                        <p className='font-medium'>
                          {customer.formattedAddress}
                        </p>
                      </div>
                    </div>
                  )}
                  {customer.latitude && customer.longitude && (
                    <div className='flex items-center space-x-3'>
                      <div className='w-4'></div>
                      <div>
                        <p className='text-sm text-gray-500'>Coordinates</p>
                        <p className='font-mono text-sm'>
                          {customer.latitude.toFixed(6)},{' '}
                          {customer.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Information */}
          <Card>
            <CardContent className='p-4'>
              <h4 className='text-lg font-semibold mb-4'>
                Account Information
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center space-x-3'>
                  <Calendar className='h-4 w-4 text-gray-400' />
                  <div>
                    <p className='text-sm text-gray-500'>Joined Date</p>
                    <p className='font-medium'>
                      {formatDateTime(customer.createdAt)}
                    </p>
                  </div>
                </div>
                {customer.dateOfBirth && (
                  <div className='flex items-center space-x-3'>
                    <User className='h-4 w-4 text-gray-400' />
                    <div>
                      <p className='text-sm text-gray-500'>Date of Birth</p>
                      <p className='font-medium'>
                        {formatDate(customer.dateOfBirth)}
                      </p>
                    </div>
                  </div>
                )}
                <div className='flex items-center space-x-3'>
                  <CheckCircle className='h-4 w-4 text-gray-400' />
                  <div>
                    <p className='text-sm text-gray-500'>Email Verification</p>
                    <p
                      className={`font-medium ${customer.emailVerified ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {customer.emailVerified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <User className='h-4 w-4 text-gray-400' />
                  <div>
                    <p className='text-sm text-gray-500'>Role</p>
                    <Badge variant='outline'>{customer.role}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className='flex justify-end space-x-2 pt-4 border-t'>
            <Button variant='outline' onClick={onClose}>
              Close
            </Button>
            <Button>
              <Mail className='w-4 h-4 mr-2' />
              Send Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
