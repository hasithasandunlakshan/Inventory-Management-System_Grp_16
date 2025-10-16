'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  AlertCircle, 
  Loader2,
  Brain,
  Sparkles
} from 'lucide-react';

import SearchBar from '@/components/ml/search/SearchBar';
import SearchFilters from '@/components/ml/search/SearchFilters';
import SearchResults from '@/components/ml/search/SearchResults';
import SearchStats from '@/components/ml/search/SearchStats';
import { AzureSearchService, SearchResult, SearchResponse, SearchFilters as SearchFiltersType } from '@/lib/services/azureSearchService';
import { SearchSyncService, SyncResult } from '@/lib/services/searchSyncService';

export default function AISearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [facets, setFacets] = useState<{ [key: string]: Array<{ value: string; count: number }> }>({});
  const [totalCount, setTotalCount] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [activeTab, setActiveTab] = useState('search');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [backendServices, setBackendServices] = useState<{
    products: boolean;
    suppliers: boolean;
    overall: boolean;
  } | null>(null);

  // Load initial data
  useEffect(() => {
    // Check backend services status with error handling
    const initializeServices = async () => {
      try {
        await checkBackendServices();
      } catch (error) {
        console.error('Failed to initialize backend services check:', error);
        // Set default state if initialization fails
        setBackendServices({
          products: false,
          suppliers: false,
          overall: false
        });
      }
    };
    
    initializeServices();
  }, []);

  const checkBackendServices = async () => {
    try {
      const services = await SearchSyncService.checkBackendServices();
      setBackendServices(services);
    } catch (error) {
      console.error('Failed to check backend services:', error);
      // Set default unavailable state
      setBackendServices({
        products: false,
        suppliers: false,
        overall: false
      });
    }
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setQuery(searchQuery);
    setLoading(true);
    setError(null);

    try {
      const response = await AzureSearchService.search({
        query: searchQuery,
        filters,
        facets: ['entityType', 'category', 'stockStatus'],
        top: 20,
        skip: 0
      });

      setResults(response.results);
      setFacets(response.facets);
      setTotalCount(response.totalCount);
      setSearchTime(response.searchTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setFacets({});
      setTotalCount(0);
      setSearchTime(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    
    // Auto-search when filters change (if there's a query)
    if (query.trim()) {
      handleSearch(query);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Handle result click - could navigate to detail page or show modal
    console.log('Result clicked:', result);
    
    // Example navigation logic
    switch (result.entityType) {
      case 'product':
        // Navigate to product detail page
        break;
      case 'supplier':
        // Navigate to supplier detail page
        break;
      case 'document':
        // Navigate to document detail page
        break;
      case 'purchase_order':
        // Navigate to purchase order detail page
        break;
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setFacets({});
    setTotalCount(0);
    setSearchTime(0);
    setFilters({});
    setError(null);
  };

  const handleSyncData = async () => {
    setSyncLoading(true);
    setSyncResult(null);
    setError(null);

    try {
      const result = await SearchSyncService.syncData();
      setSyncResult(result);
      
      // Refresh backend services status
      await checkBackendServices();
      
      // If sync was successful, show a success message
      if (result.success) {
        console.log('Data sync completed successfully');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Data sync failed');
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <Brain className="h-8 w-8 mr-3 text-blue-600" />
          AI Search
        </h1>
        <p className="text-gray-600 mt-2">
          Intelligent search across products, suppliers, documents, and purchase orders using Azure AI Search
        </p>
        
        {/* Backend Services Status */}
        {backendServices && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${backendServices.products ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">Products Service</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${backendServices.suppliers ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">Suppliers Service</span>
              </div>
              {!backendServices.overall && (
                <span className="text-sm text-red-600">⚠️ Backend services not available</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkBackendServices}
              className="text-xs"
            >
              <Search className="h-3 w-3 mr-1" />
              Refresh Status
            </Button>
          </div>
        )}
      </div>

      {/* Data Sync Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Data Sync
            </div>
            <Button
              onClick={handleSyncData}
              disabled={syncLoading || !backendServices?.overall}
              variant="outline"
            >
              {syncLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Sync Data
                </>
              )}
            </Button>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Sync your existing database data to Azure Search for intelligent search capabilities
          </p>
        </CardHeader>
        <CardContent>
          {syncResult && (
            <Alert className={syncResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {syncResult.success ? (
                  <div>
                    <strong>Sync Successful!</strong> {syncResult.message}
                    {syncResult.data && (
                      <div className="mt-2 text-sm">
                        • {syncResult.data.totalDocuments} total documents
                        • {syncResult.data.products} products
                        • {syncResult.data.suppliers} suppliers
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <strong>Sync Failed:</strong> {syncResult.error}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {!backendServices?.overall && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Backend services are not available. Please start your inventory and supplier services to sync data.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search Everything
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SearchBar
              onSearch={handleSearch}
              onFiltersChange={handleFiltersChange}
              placeholder="Try: 'low stock electronics under $100' or 'suppliers in electronics'"
            />
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Searching...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-6">
          {/* Search Stats */}
          <SearchStats
            totalResults={totalCount}
            searchTime={searchTime}
            facets={facets}
            activeFilters={filters}
          />

          {/* Results and Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <SearchFilters
                facets={facets}
                onFiltersChange={handleFiltersChange}
                currentFilters={filters}
              />
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              <SearchResults
                results={results}
                totalCount={totalCount}
                searchTime={searchTime}
                onResultClick={handleResultClick}
              />
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && query && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button onClick={clearSearch} variant="outline">
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Getting Started */}
      {!loading && results.length === 0 && !query && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                Natural Language Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Use natural language to find what you need:
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• "low stock electronics"</li>
                <li>• "suppliers in California"</li>
                <li>• "recent purchase orders"</li>
                <li>• "products under $50"</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Search className="h-5 w-5 mr-2 text-green-600" />
                Smart Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Refine your search with intelligent filters:
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Filter by entity type</li>
                <li>• Price range selection</li>
                <li>• Stock status filters</li>
                <li>• Date range filtering</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                AI-Powered Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Get intelligent, relevant results:
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Semantic understanding</li>
                <li>• Relevance scoring</li>
                <li>• Highlighted matches</li>
                <li>• Cross-entity search</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
