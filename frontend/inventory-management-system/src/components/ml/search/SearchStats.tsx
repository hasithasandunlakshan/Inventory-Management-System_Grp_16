'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Clock, 
  TrendingUp, 
  Filter,
  Package,
  Users,
  FileText,
  ShoppingCart
} from 'lucide-react';

interface SearchStatsProps {
  totalResults: number;
  searchTime: number;
  facets: { [key: string]: Array<{ value: string; count: number }> };
  activeFilters: { [key: string]: any };
}

export default function SearchStats({ 
  totalResults, 
  searchTime, 
  facets,
  activeFilters 
}: SearchStatsProps) {
  const getEntityTypeCount = (entityType: string) => {
    const entityFacet = facets[entityType];
    return entityFacet ? entityFacet.reduce((sum, item) => sum + item.count, 0) : 0;
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'supplier':
        return <Users className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'purchase_order':
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
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

  const activeFiltersCount = Object.keys(activeFilters).filter(key => 
    activeFilters[key] !== undefined && 
    activeFilters[key] !== null && 
    activeFilters[key] !== ''
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Results */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Results</CardTitle>
          <Search className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalResults.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Found in {searchTime}ms
          </p>
        </CardContent>
      </Card>

      {/* Search Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Search Speed</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{searchTime}ms</div>
          <p className="text-xs text-muted-foreground">
            {searchTime < 100 ? 'Very Fast' : searchTime < 500 ? 'Fast' : 'Slow'}
          </p>
        </CardContent>
      </Card>

      {/* Active Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Filters</CardTitle>
          <Filter className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeFiltersCount}</div>
          <p className="text-xs text-muted-foreground">
            {activeFiltersCount === 0 ? 'No filters applied' : 'Filters active'}
          </p>
        </CardContent>
      </Card>

      {/* Entity Distribution */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Entity Types</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {['product', 'supplier', 'document', 'purchase_order'].map((entityType) => {
              const count = getEntityTypeCount(entityType);
              if (count === 0) return null;
              
              return (
                <div key={entityType} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getEntityIcon(entityType)}
                    <span className="text-sm capitalize">
                      {entityType.replace('_', ' ')}s
                    </span>
                  </div>
                  <Badge className={`${getEntityColor(entityType)} text-xs`}>
                    {count}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
