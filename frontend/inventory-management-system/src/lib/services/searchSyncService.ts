/**
 * Search Sync Service
 * 
 * This service handles syncing data from your existing database
 * to Azure Search for intelligent search functionality.
 */

export interface SyncResult {
  success: boolean;
  message: string;
  data?: {
    totalDocuments: number;
    products: number;
    suppliers: number;
    syncTime: string;
  };
  error?: string;
}

export interface SyncOptions {
  forceSync?: boolean;
  includeProducts?: boolean;
  includeSuppliers?: boolean;
  batchSize?: number;
}

export class SearchSyncService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  private static readonly SYNC_ENDPOINT = '/api/ml/search/sync';

  /**
   * Sync data from your existing database to Azure Search
   */
  public static async syncData(options: SyncOptions = {}): Promise<SyncResult> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}${this.SYNC_ENDPOINT}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(options),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          `Data sync request failed with status ${response.status}`
        );
      }

      const result: SyncResult = await response.json();
      return result;
    } catch (error) {
      console.error('Error during data sync:', error);
      return {
        success: false,
        message: 'Failed to synchronize data with Azure Search.',
        error: error instanceof Error ? error.message : 'An unknown error occurred.',
      };
    }
  }

  /**
   * Get sync status and information
   */
  public static async getSyncInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE_URL}${this.SYNC_ENDPOINT}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get sync info: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get sync info:', error);
      throw error;
    }
  }

  /**
   * Check if backend services are available
   */
  public static async checkBackendServices(): Promise<{
    products: boolean;
    suppliers: boolean;
    overall: boolean;
  }> {
    const results = {
      products: false,
      suppliers: false,
      overall: false
    };

    try {
      // Check products service
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 3000);
        
        const productsResponse = await fetch('http://localhost:8083/api/products', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        results.products = productsResponse.ok;
      } catch (error) {
        console.warn('Products service not available:', error);
        results.products = false;
      }

      // Check suppliers service
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 3000);
        
        const suppliersResponse = await fetch('http://localhost:8082/api/suppliers', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        results.suppliers = suppliersResponse.ok;
      } catch (error) {
        console.warn('Suppliers service not available:', error);
        results.suppliers = false;
      }

      results.overall = results.products || results.suppliers;
      return results;
    } catch (error) {
      console.error('Error checking backend services:', error);
      return {
        products: false,
        suppliers: false,
        overall: false
      };
    }
  }

  /**
   * Get estimated sync time based on data size
   */
  public static async estimateSyncTime(): Promise<{
    estimatedTime: string;
    dataSources: string[];
  }> {
    const services = await this.checkBackendServices();
    const dataSources = [];

    if (services.products) dataSources.push('Products');
    if (services.suppliers) dataSources.push('Suppliers');

    let estimatedTime = '1-2 minutes';
    if (dataSources.length === 0) {
      estimatedTime = 'No data sources available';
    } else if (dataSources.length === 1) {
      estimatedTime = '30 seconds - 1 minute';
    }

    return {
      estimatedTime,
      dataSources
    };
  }

  /**
   * Validate sync prerequisites
   */
  public static async validateSyncPrerequisites(): Promise<{
    valid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const services = await this.checkBackendServices();
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!services.overall) {
      issues.push('No backend services are available');
    }

    if (!services.products) {
      issues.push('Product service is not available');
    }

    if (!services.suppliers) {
      issues.push('Supplier service is not available');
    }

    if (!services.products) {
      recommendations.push('Start the inventory service to sync product data');
    }

    if (!services.suppliers) {
      recommendations.push('Start the supplier service to sync supplier data');
    }

    return {
      valid: issues.length === 0,
      issues,
      recommendations
    };
  }
}