'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Filter,
  X,
  Package,
  Users,
  FileText,
  ShoppingCart,
  DollarSign,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { format } from 'date-fns';

interface SearchFiltersProps {
  facets: { [key: string]: Array<{ value: string; count: number }> };
  onFiltersChange: (filters: Record<string, unknown>) => void;
  currentFilters: Record<string, unknown>;
}

export default function SearchFilters({
  facets,
  onFiltersChange,
  currentFilters,
}: SearchFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  const handleFilterChange = (key: string, value: unknown) => {
    const newFilters = { ...currentFilters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...currentFilters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    return Object.keys(currentFilters).filter(
      key =>
        currentFilters[key] !== undefined &&
        currentFilters[key] !== null &&
        currentFilters[key] !== ''
    ).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className='w-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg flex items-center'>
            <Filter className='h-5 w-5 mr-2' />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant='secondary' className='ml-2'>
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={clearAllFilters}
              className='text-gray-500 hover:text-gray-700'
            >
              <X className='h-4 w-4 mr-1' />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Entity Type Filter */}
        <div>
          <label className='text-sm font-medium text-gray-700 mb-2 block'>
            Entity Type
          </label>
          <Select
            value={String(currentFilters.entityType || 'all')}
            onValueChange={value =>
              handleFilterChange(
                'entityType',
                value === 'all' ? undefined : value
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='All types' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All types</SelectItem>
              <SelectItem value='product'>
                <div className='flex items-center'>
                  <Package className='h-4 w-4 mr-2' />
                  Products
                </div>
              </SelectItem>
              <SelectItem value='supplier'>
                <div className='flex items-center'>
                  <Users className='h-4 w-4 mr-2' />
                  Suppliers
                </div>
              </SelectItem>
              <SelectItem value='document'>
                <div className='flex items-center'>
                  <FileText className='h-4 w-4 mr-2' />
                  Documents
                </div>
              </SelectItem>
              <SelectItem value='purchase_order'>
                <div className='flex items-center'>
                  <ShoppingCart className='h-4 w-4 mr-2' />
                  Purchase Orders
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        {facets.category && facets.category.length > 0 && (
          <div>
            <label className='text-sm font-medium text-gray-700 mb-2 block'>
              Category
            </label>
            <Select
              value={String(currentFilters.category || 'all')}
              onValueChange={value =>
                handleFilterChange(
                  'category',
                  value === 'all' ? undefined : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='All categories' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All categories</SelectItem>
                {facets.category.map(facet => (
                  <SelectItem key={facet.value} value={facet.value}>
                    {facet.value} ({facet.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Price Range Filter */}
        <div>
          <label className='text-sm font-medium text-gray-700 mb-2 block'>
            Price Range
          </label>
          <div className='space-y-2'>
            <Slider
              value={priceRange}
              onValueChange={(value: number[]) =>
                setPriceRange(value as [number, number])
              }
              max={1000}
              min={0}
              step={10}
              className='w-full'
            />
            <div className='flex justify-between text-xs text-gray-500'>
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                handleFilterChange('priceRange', {
                  min: priceRange[0],
                  max: priceRange[1],
                })
              }
              className='w-full'
            >
              <DollarSign className='h-4 w-4 mr-1' />
              Apply Price Filter
            </Button>
          </div>
        </div>

        {/* Stock Status Filter */}
        {facets.stockStatus && facets.stockStatus.length > 0 && (
          <div>
            <label className='text-sm font-medium text-gray-700 mb-2 block'>
              Stock Status
            </label>
            <Select
              value={String(currentFilters.stockStatus || 'all')}
              onValueChange={value =>
                handleFilterChange(
                  'stockStatus',
                  value === 'all' ? undefined : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='All stock status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All stock status</SelectItem>
                {facets.stockStatus.map(facet => (
                  <SelectItem key={facet.value} value={facet.value}>
                    {facet.value} ({facet.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Date Range Filter */}
        <div>
          <label className='text-sm font-medium text-gray-700 mb-2 block'>
            Date Range
          </label>
          <div className='space-y-2'>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className='w-full justify-start text-left font-normal'
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {dateRange.start
                    ? format(dateRange.start, 'PPP')
                    : 'Start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0'>
                <Calendar
                  mode='single'
                  selected={dateRange.start}
                  onSelect={date =>
                    setDateRange(prev => ({ ...prev, start: date }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className='w-full justify-start text-left font-normal'
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {dateRange.end ? format(dateRange.end, 'PPP') : 'End date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0'>
                <Calendar
                  mode='single'
                  selected={dateRange.end}
                  onSelect={date =>
                    setDateRange(prev => ({ ...prev, end: date }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                if (dateRange.start && dateRange.end) {
                  handleFilterChange('dateRange', {
                    start: dateRange.start.toISOString(),
                    end: dateRange.end.toISOString(),
                  });
                }
              }}
              className='w-full'
            >
              Apply Date Filter
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className='pt-4 border-t'>
            <div className='text-sm font-medium text-gray-700 mb-2'>
              Active Filters
            </div>
            <div className='flex flex-wrap gap-2'>
              {Object.entries(currentFilters).map(([key, value]) => {
                if (!value) return null;

                let displayValue = value;
                if (key === 'priceRange' && Array.isArray(value)) {
                  displayValue = `$${value[0]} - $${value[1]}`;
                } else if (
                  key === 'dateRange' &&
                  typeof value === 'object' &&
                  value !== null
                ) {
                  const rangeValue = value as Record<string, unknown>;
                  displayValue = `${rangeValue.start} to ${rangeValue.end}`;
                }

                return (
                  <Badge
                    key={key}
                    variant='secondary'
                    className='flex items-center gap-1'
                  >
                    {`${key}: ${displayValue}`}
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleRemoveFilter(key)}
                      className='h-4 w-4 p-0 hover:bg-transparent'
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
