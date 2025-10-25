import { NextRequest, NextResponse } from 'next/server';

interface SearchRequest {
  query: string;
  filters?: {
    entityType?: string;
    category?: string;
    priceRange?: { min: number; max: number };
    stockStatus?: string;
    supplier?: string;
    dateRange?: { start: string; end: string };
  };
  facets?: string[];
  top?: number;
  skip?: number;
  orderBy?: string;
}

interface SearchResult {
  id: string;
  entityType: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stockLevel: number;
  stockStatus: string;
  supplier: string;
  score: number;
  highlights: Record<string, string[]> | Record<string, never>;
}

interface SearchResponse {
  results: SearchResult[];
  facets: { [key: string]: Array<{ value: string; count: number }> };
  totalCount: number;
  searchTime: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get Azure Search configuration from environment variables
    const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT;
    const searchApiKey = process.env.AZURE_SEARCH_API_KEY;
    const indexName = process.env.AZURE_SEARCH_INDEX_NAME || 'inventory-index';

    if (!searchEndpoint || !searchApiKey) {
      return NextResponse.json(
        { success: false, error: 'Azure Search configuration not found' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: SearchRequest = await request.json();
    const { query, filters, facets, top = 20, skip = 0, orderBy } = body;

    // Build Azure Search query
    const searchQuery = buildSearchQuery(
      query,
      filters,
      facets,
      top,
      skip,
      orderBy
    );

    // Call Azure Search API
    const searchResponse = await fetch(
      `${searchEndpoint}/indexes/${indexName}/docs/search?api-version=2023-11-01`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': searchApiKey,
        },
        body: JSON.stringify(searchQuery),
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      return NextResponse.json(
        {
          success: false,
          error: `Azure Search error: ${searchResponse.status} - ${errorText}`,
        },
        { status: searchResponse.status }
      );
    }

    const searchResults = await searchResponse.json();

    // Process and format results
    const processedResults = processSearchResults(searchResults);

    return NextResponse.json({
      success: true,
      data: processedResults,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  // Health check endpoint
  const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT;
  const searchApiKey = process.env.AZURE_SEARCH_API_KEY;
  const indexName = process.env.AZURE_SEARCH_INDEX_NAME || 'inventory-index';

  return NextResponse.json({
    status: 'healthy',
    service: 'azure-search',
    azure_configured: !!(searchEndpoint && searchApiKey),
    endpoint: searchEndpoint,
    index_name: indexName,
    capabilities: {
      full_text_search: true,
      semantic_search: true,
      faceted_search: true,
      autocomplete: true,
      suggestions: true,
    },
    supported_entity_types: [
      'product',
      'supplier',
      'document',
      'purchase_order',
    ],
  });
}

/**
 * Builds Azure Search query from request parameters
 */
function buildSearchQuery(
  query: string,
  filters?: Record<string, unknown>,
  facets?: string[],
  top: number = 20,
  skip: number = 0,
  orderBy?: string
): Record<string, unknown> {
  const searchQuery: Record<string, unknown> = {
    search: query || '*',
    top,
    skip,
    count: true, // Use 'count' instead of 'includeTotalCount'
    highlight: 'name,description',
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    facets: facets || ['entityType', 'category', 'stockStatus'],
  };

  // Add orderBy if specified (use 'orderby' instead of 'orderBy')
  if (orderBy) {
    searchQuery.orderby = orderBy;
  } else {
    searchQuery.orderby = 'search.score() desc';
  }

  // Add filters
  if (filters) {
    const filterExpressions: string[] = [];

    if (filters.entityType) {
      filterExpressions.push(`entityType eq '${filters.entityType}'`);
    }

    if (filters.category) {
      filterExpressions.push(`category eq '${filters.category}'`);
    }

    if (filters.priceRange) {
      const priceRange = filters.priceRange as { min: number; max: number };
      const { min, max } = priceRange;
      filterExpressions.push(`price ge ${min} and price le ${max}`);
    }

    if (filters.stockStatus) {
      filterExpressions.push(`stockStatus eq '${filters.stockStatus}'`);
    }

    if (filters.supplier) {
      filterExpressions.push(`supplier eq '${filters.supplier}'`);
    }

    if (filters.dateRange) {
      const dateRange = filters.dateRange as { start: string; end: string };
      const { start, end } = dateRange;
      filterExpressions.push(
        `createdDate ge ${start} and createdDate le ${end}`
      );
    }

    if (filterExpressions.length > 0) {
      searchQuery.filter = filterExpressions.join(' and ');
    }
  }

  return searchQuery;
}

/**
 * Processes Azure Search results into our format
 */
function processSearchResults(
  searchResults: Record<string, unknown>
): SearchResponse {
  const results: SearchResult[] =
    (searchResults.value as Array<Record<string, unknown>>)?.map(item => ({
      id: String(item.id || ''),
      entityType: String(item.entityType || ''),
      name: String(item.name || ''),
      description: String(item.description || ''),
      category: String(item.category || ''),
      price: Number(item.price || 0),
      stockLevel: Number(item.stockLevel || 0),
      stockStatus: String(item.stockStatus || ''),
      supplier: String(item.supplier || ''),
      score: Number(item['@search.score'] || 0),
      highlights:
        (item['@search.highlights'] as Record<string, string[]>) || {},
    })) || [];

  const facets: { [key: string]: Array<{ value: string; count: number }> } = {};

  const searchFacets = searchResults['@search.facets'] as
    | Record<string, unknown>
    | undefined;
  if (searchFacets) {
    Object.entries(searchFacets).forEach(([key, value]) => {
      facets[key] = (value as Array<Record<string, unknown>>).map(facet => ({
        value: facet.value as string,
        count: facet.count as number,
      }));
    });
  }

  return {
    results,
    facets,
    totalCount: (searchResults['@odata.count'] as number) || results.length,
    searchTime: (searchResults['@search.time'] as number) || 0,
  };
}
