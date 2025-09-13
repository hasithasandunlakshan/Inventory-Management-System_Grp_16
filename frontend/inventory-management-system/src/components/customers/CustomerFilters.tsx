'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, RefreshCw } from 'lucide-react';

interface CustomerFiltersProps {
  onFiltersChange: (filters: {
    status?: string;
    searchTerm?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export default function CustomerFilters({
  onFiltersChange,
  onRefresh,
  isLoading,
}: CustomerFiltersProps) {
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Convert filters to the format expected by userService
    const processedFilters: any = {
      searchTerm: newFilters.searchTerm || undefined,
    };

    // Status filter
    if (newFilters.status !== 'all') {
      processedFilters.status = newFilters.status;
    }

    // Date filters
    if (newFilters.dateFrom) {
      processedFilters.dateFrom = newFilters.dateFrom;
    }
    if (newFilters.dateTo) {
      processedFilters.dateTo = newFilters.dateTo;
    }

    onFiltersChange(processedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: 'all',
      dateFrom: '',
      dateTo: '',
      searchTerm: '',
    };
    setFilters(clearedFilters);
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    filters.searchTerm !== '';

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4' />
            <h3 className='font-semibold'>Filters</h3>
            {hasActiveFilters && (
              <span className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full'>
                Active
              </span>
            )}
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            {hasActiveFilters && (
              <Button variant='outline' size='sm' onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-4'>
          {/* Search */}
          <div className='space-y-2'>
            <Label htmlFor='search'>Search Customers</Label>
            <div className='relative'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-gray-400' />
              <Input
                id='search'
                placeholder='Name, email, username...'
                className='pl-8'
                value={filters.searchTerm}
                onChange={e => handleFilterChange('searchTerm', e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className='space-y-2'>
            <Label>Account Status</Label>
            <Select
              value={filters.status}
              onValueChange={value => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
                <SelectItem value='suspended'>Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className='space-y-2'>
            <Label htmlFor='dateFrom'>Joined From</Label>
            <Input
              id='dateFrom'
              type='date'
              value={filters.dateFrom}
              onChange={e => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className='space-y-2'>
            <Label htmlFor='dateTo'>Joined To</Label>
            <Input
              id='dateTo'
              type='date'
              value={filters.dateTo}
              onChange={e => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className='mt-4 pt-4 border-t'>
          <Label className='text-sm text-gray-600 mb-2 block'>
            Quick Filters:
          </Label>
          <div className='flex flex-wrap gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                handleFilterChange('dateFrom', today);
                handleFilterChange('dateTo', today);
              }}
            >
              Joined Today
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);
                handleFilterChange(
                  'dateFrom',
                  lastWeek.toISOString().split('T')[0]
                );
                handleFilterChange(
                  'dateTo',
                  new Date().toISOString().split('T')[0]
                );
              }}
            >
              Last 7 Days
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                handleFilterChange(
                  'dateFrom',
                  lastMonth.toISOString().split('T')[0]
                );
                handleFilterChange(
                  'dateTo',
                  new Date().toISOString().split('T')[0]
                );
              }}
            >
              Last 30 Days
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleFilterChange('status', 'active')}
            >
              Active Only
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
