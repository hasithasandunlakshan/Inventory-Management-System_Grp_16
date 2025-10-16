/**
 * Azure Search Service
 * 
 * This service provides secure integration with Azure AI Search
 * through a backend proxy API route.
 * 
 * Security: API keys are stored server-side and never exposed to the client
 */

export interface SearchFilters {
  entityType?: string;
  category?: string;
  priceRange?: { min: number; max: number };
  stockStatus?: string;
  supplier?: string;
  dateRange?: { start: string; end: string };
}

export interface SearchResult {
  id: string;
  entityType: string;
  name: string;
  description: string;
  category?: string;
  price?: number;
  stockLevel?: number;
  stockStatus?: string;
  supplier?: string;
  score: number;
  highlights?: { [key: string]: string[] };
}

export interface SearchResponse {
  results: SearchResult[];
  facets: { [key: string]: Array<{ value: string; count: number }> };
  totalCount: number;
  searchTime: number;
}

export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  facets?: string[];
  top?: number;
  skip?: number;
  orderBy?: string;
}

export class AzureSearchService {
  // Backend API Configuration
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  private static readonly SEARCH_ENDPOINT = '/api/ml/search';

  /**
   * Performs a search query
   */
  public static async search(request: SearchRequest): Promise<SearchResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}${this.SEARCH_ENDPOINT}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          `Search request failed with status ${response.status}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Search failed');
      }

      return result.data;

    } catch (error) {
      console.error('Search failed:', error);
      
      if (error instanceof Error) {
        throw new Error(`Search failed: ${error.message}`);
      }
      
      throw new Error('An unexpected error occurred during search');
    }
  }

  /**
   * Gets search suggestions/autocomplete
   */
  public static async getSuggestions(query: string, entityType?: string): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}${this.SEARCH_ENDPOINT}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query,
            filters: entityType ? { entityType } : undefined,
            top: 5,
            facets: ['name']
          }),
        }
      );

      if (!response.ok) {
        return [];
      }

      const result = await response.json();
      
      if (!result.success) {
        return [];
      }

      // Extract suggestions from results
      return result.data.results
        .map((item: SearchResult) => item.name)
        .slice(0, 5);

    } catch (error) {
      console.error('Suggestions failed:', error);
      return [];
    }
  }

  /**
   * Gets search health status
   */
  public static async getHealthStatus(): Promise<any> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}${this.SEARCH_ENDPOINT}`
      );

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Builds a natural language query from user input
   */
  public static buildNaturalLanguageQuery(
    userInput: string,
    context?: {
      entityType?: string;
      category?: string;
      priceRange?: { min: number; max: number };
    }
  ): string {
    let query = userInput;

    // Add context to the query for better results
    if (context?.entityType) {
      query += ` ${context.entityType}`;
    }

    if (context?.category) {
      query += ` ${context.category}`;
    }

    if (context?.priceRange) {
      const { min, max } = context.priceRange;
      query += ` price:${min}-${max}`;
    }

    return query.trim();
  }

  /**
   * Parses search results for display
   */
  public static formatSearchResults(results: SearchResult[]): {
    products: SearchResult[];
    suppliers: SearchResult[];
    documents: SearchResult[];
    purchaseOrders: SearchResult[];
  } {
    return {
      products: results.filter(r => r.entityType === 'product'),
      suppliers: results.filter(r => r.entityType === 'supplier'),
      documents: results.filter(r => r.entityType === 'document'),
      purchaseOrders: results.filter(r => r.entityType === 'purchase_order')
    };
  }

  /**
   * Gets popular search terms (mock implementation)
   */
  public static getPopularSearches(): string[] {
    return [
      'low stock products',
      'electronics under $100',
      'suppliers in electronics',
      'recent purchase orders',
      'out of stock items'
    ];
  }

  /**
   * Gets recent searches from localStorage
   */
  public static getRecentSearches(): string[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const recent = localStorage.getItem('recent-searches');
      return recent ? JSON.parse(recent) : [];
    } catch {
      return [];
    }
  }

  /**
   * Saves a search to recent searches
   */
  public static saveRecentSearch(query: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const recent = this.getRecentSearches();
      const updated = [query, ...recent.filter(q => q !== query)].slice(0, 10);
      localStorage.setItem('recent-searches', JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  }
}
