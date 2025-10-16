'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Users,
  FileText,
  ShoppingCart,
  Star,
  Eye,
  ExternalLink,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { SearchResult } from '@/lib/services/azureSearchService';

interface SearchResultsProps {
  results: SearchResult[];
  totalCount: number;
  searchTime: number;
  onResultClick?: (result: SearchResult) => void;
}

export default function SearchResults({
  results,
  totalCount,
  searchTime,
  onResultClick,
}: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'product':
        return <Package className='h-5 w-5' />;
      case 'supplier':
        return <Users className='h-5 w-5' />;
      case 'document':
        return <FileText className='h-5 w-5' />;
      case 'purchase_order':
        return <ShoppingCart className='h-5 w-5' />;
      default:
        return <Package className='h-5 w-5' />;
    }
  };

  const getEntityColor = (entityType: string) => {
    switch (entityType) {
      case 'product':
        return 'bg-blue-100 text-blue-800';
      case 'supplier':
        return 'bg-green-100 text-green-800';
      case 'document':
        return 'bg-purple-100 text-purple-800';
      case 'purchase_order':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatusBadge = (stockStatus?: string, stockLevel?: number) => {
    if (!stockStatus) return null;

    const statusConfig = {
      in_stock: { color: 'bg-green-100 text-green-800', icon: TrendingUp },
      low_stock: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertTriangle,
      },
      out_of_stock: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    };

    const config = statusConfig[stockStatus as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className='h-3 w-3' />
        {stockStatus.replace('_', ' ').toUpperCase()}
        {stockLevel && ` (${stockLevel})`}
      </Badge>
    );
  };

  const formatHighlights = (
    highlights: { [key: string]: string[] } | undefined
  ) => {
    if (!highlights) return null;

    const highlightTexts = Object.values(highlights).flat();
    if (highlightTexts.length === 0) return null;

    return (
      <div className='text-sm text-gray-600 mt-2'>
        <span className='font-medium'>Highlights:</span>
        <div className='mt-1'>
          {highlightTexts.slice(0, 2).map((highlight, index) => (
            <div
              key={index}
              className='text-xs bg-yellow-50 p-1 rounded'
              dangerouslySetInnerHTML={{ __html: highlight }}
            />
          ))}
        </div>
      </div>
    );
  };

  const ResultCard = ({ result }: { result: SearchResult }) => (
    <Card
      className='hover:shadow-md transition-shadow cursor-pointer'
      onClick={() => onResultClick?.(result)}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center space-x-2'>
            <div
              className={`p-2 rounded-lg ${getEntityColor(result.entityType)}`}
            >
              {getEntityIcon(result.entityType)}
            </div>
            <div>
              <CardTitle className='text-lg'>{result.name}</CardTitle>
              <div className='flex items-center space-x-2 mt-1'>
                <Badge variant='outline' className='text-xs'>
                  {result.entityType.replace('_', ' ').toUpperCase()}
                </Badge>
                {result.category && (
                  <Badge variant='secondary' className='text-xs'>
                    {result.category}
                  </Badge>
                )}
                {getStockStatusBadge(result.stockStatus, result.stockLevel)}
              </div>
            </div>
          </div>
          <div className='flex items-center space-x-1'>
            <Star className='h-4 w-4 text-yellow-500' />
            <span className='text-sm font-medium'>
              {result.score.toFixed(1)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className='text-gray-600 text-sm line-clamp-2'>
          {result.description}
        </p>

        {formatHighlights(result.highlights)}

        <div className='flex items-center justify-between mt-4'>
          <div className='flex items-center space-x-4 text-sm text-gray-500'>
            {result.price && (
              <span className='font-medium'>${result.price.toFixed(2)}</span>
            )}
            {result.supplier && <span>Supplier: {result.supplier}</span>}
          </div>

          <Button
            variant='ghost'
            size='sm'
            className='text-blue-600 hover:text-blue-700'
          >
            <Eye className='h-4 w-4 mr-1' />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ResultListItem = ({ result }: { result: SearchResult }) => (
    <div
      className='flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer'
      onClick={() => onResultClick?.(result)}
    >
      <div className={`p-2 rounded-lg ${getEntityColor(result.entityType)}`}>
        {getEntityIcon(result.entityType)}
      </div>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center space-x-2'>
          <h3 className='text-lg font-medium truncate'>{result.name}</h3>
          <Badge variant='outline' className='text-xs'>
            {result.entityType.replace('_', ' ').toUpperCase()}
          </Badge>
          {getStockStatusBadge(result.stockStatus, result.stockLevel)}
        </div>

        <p className='text-gray-600 text-sm mt-1 line-clamp-1'>
          {result.description}
        </p>

        {formatHighlights(result.highlights)}

        <div className='flex items-center space-x-4 mt-2 text-sm text-gray-500'>
          {result.price && (
            <span className='font-medium'>${result.price.toFixed(2)}</span>
          )}
          {result.supplier && <span>Supplier: {result.supplier}</span>}
          <div className='flex items-center space-x-1'>
            <Star className='h-4 w-4 text-yellow-500' />
            <span>{result.score.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <Button
        variant='ghost'
        size='sm'
        className='text-blue-600 hover:text-blue-700'
      >
        <ExternalLink className='h-4 w-4' />
      </Button>
    </div>
  );

  if (results.length === 0) {
    return (
      <div className='text-center py-12'>
        <Package className='h-12 w-12 text-gray-400 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          No results found
        </h3>
        <p className='text-gray-500'>
          Try adjusting your search terms or filters to find what you're looking
          for.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Results Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold'>
            Search Results ({totalCount.toLocaleString()})
          </h2>
          <p className='text-sm text-gray-500'>Found in {searchTime}ms</p>
        </div>

        <div className='flex items-center space-x-2'>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Results */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-2'
        }
      >
        {results.map(result =>
          viewMode === 'grid' ? (
            <ResultCard key={result.id} result={result} />
          ) : (
            <ResultListItem key={result.id} result={result} />
          )
        )}
      </div>
    </div>
  );
}
