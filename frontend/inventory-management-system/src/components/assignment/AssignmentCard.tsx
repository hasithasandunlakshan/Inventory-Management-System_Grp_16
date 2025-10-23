'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Car, Calendar, Clock, Route, Eye, X } from 'lucide-react';
import { MinimalAssignment } from '@/lib/services/driverService';

interface AssignmentCardProps {
  readonly assignment: MinimalAssignment;
  readonly onViewDetails?: (assignment: MinimalAssignment) => void;
  readonly onUnassign?: (assignment: MinimalAssignment) => void;
  readonly showActions?: boolean;
}

export default function AssignmentCard({
  assignment,
  onViewDetails,
  onUnassign,
  showActions = true,
}: AssignmentCardProps) {
  const getStatusColor = () => {
    switch (assignment.status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (assignment.status) {
      case 'ACTIVE':
        return '🟢';
      case 'INACTIVE':
        return '⚫';
      case 'SUSPENDED':
        return '🔴';
      default:
        return '⚫';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(assignment);
    }
  };

  const handleUnassign = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUnassign) {
      onUnassign(assignment);
    }
  };

  return (
    <Card className='group hover:shadow-xl transition-all duration-300 border rounded-lg overflow-hidden bg-white h-full flex flex-col'>
      <CardHeader className='p-0'>
        {/* Assignment Image Section - Driver and Vehicle */}
        <div className='relative w-full h-32 overflow-hidden bg-gray-50'>
          {/* Driver Image */}
          <div className='absolute left-2 top-2 w-16 h-16 rounded-lg overflow-hidden bg-white shadow-sm'>
            <Image
              src='/Delivery.png'
              alt='Driver'
              fill
              className='object-contain p-1'
              sizes='64px'
            />
          </div>

          {/* Vehicle Image */}
          <div className='absolute right-2 top-2 w-16 h-16 rounded-lg overflow-hidden bg-white shadow-sm'>
            <Image
              src='/truck.png'
              alt='Vehicle'
              fill
              className='object-contain p-1'
              sizes='64px'
            />
          </div>

          {/* Status Badge - Top Center */}
          <div className='absolute top-1 left-1/2 transform -translate-x-1/2'>
            <Badge
              variant='secondary'
              className={`text-[10px] px-1.5 py-0 shadow-sm leading-tight ${getStatusColor()}`}
            >
              {getStatusIcon()} {assignment.status}
            </Badge>
          </div>

          {/* Assignment ID Badge - Bottom Center */}
          <div className='absolute bottom-1 left-1/2 transform -translate-x-1/2'>
            <Badge
              variant='secondary'
              className='text-[10px] px-1.5 py-0 bg-white/90 backdrop-blur-sm shadow-sm leading-tight'
            >
              #{assignment.assignmentId}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className='p-3 flex-1 flex flex-col space-y-2'>
        {/* Assignment Title - Centered */}
        <div className='text-center'>
          <h3 className='font-semibold text-base text-gray-900'>
            Driver-Vehicle Assignment
          </h3>
          <p className='text-sm text-gray-600 mt-1'>
            {assignment.driverName} ↔ {assignment.vehicleNumber}
          </p>
        </div>

        {/* Driver Information */}
        <div className='flex items-center gap-2'>
          <User className='h-4 w-4 text-gray-400' />
          <span className='text-sm text-gray-600'>
            <strong>Driver:</strong> {assignment.driverName}
          </span>
        </div>

        {/* Vehicle Information */}
        <div className='flex items-center gap-2'>
          <Car className='h-4 w-4 text-gray-400' />
          <span className='text-sm text-gray-600'>
            <strong>Vehicle:</strong> {assignment.vehicleNumber}
          </span>
        </div>

        {/* Assignment Date */}
        <div className='flex items-center gap-2'>
          <Calendar className='h-4 w-4 text-gray-400' />
          <span className='text-sm text-gray-600'>
            <strong>Assigned:</strong> {formatDate(assignment.assignedAt)}
          </span>
        </div>

        {/* Assignment Time */}
        <div className='flex items-center gap-2'>
          <Clock className='h-4 w-4 text-gray-400' />
          <span className='text-sm text-gray-600'>
            <strong>Time:</strong> {formatTime(assignment.assignedAt)}
          </span>
        </div>

        {/* Assigned By */}
        {assignment.assignedByName && (
          <div className='flex items-center gap-2'>
            <Route className='h-4 w-4 text-gray-400' />
            <span className='text-sm text-gray-600'>
              <strong>By:</strong> {assignment.assignedByName}
            </span>
          </div>
        )}

        {/* Notes */}
        {assignment.notes && (
          <div className='border-t pt-2'>
            <p className='text-xs text-gray-500 italic'>
              &quot;{assignment.notes}&quot;
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className='mt-auto pt-2'>
          {showActions && (
            <div className='flex gap-1.5'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleViewDetails}
                className='flex-1 h-7 text-[11px] border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200'
              >
                <Eye className='h-3 w-3 mr-1 transition-transform group-hover:scale-110' />
                View
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={handleUnassign}
                className='flex-1 h-7 text-[11px] border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200'
              >
                <X className='h-3 w-3 mr-1 transition-transform group-hover:scale-110' />
                Unassign
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
