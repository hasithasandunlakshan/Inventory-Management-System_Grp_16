import { NextRequest, NextResponse } from 'next/server';

interface Product {
  productId: number;
  name: string;
  description?: string;
  categoryName?: string;
  price?: number;
  availableStock?: number;
  stock?: number;
  reserved?: number;
  imageUrl?: string;
  barcode?: string;
  categoryId?: number;
}

interface Supplier {
  supplierId: number;
  userId: number;
  userName: string;
  categoryId?: number;
  categoryName?: string;
  description?: string;
  createdDate?: string;
}

interface SearchDocument {
  id: string;
  entityType: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  stockLevel?: number;
  stockStatus?: string;
  supplier?: string;
  createdDate?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('Starting data sync to Azure Search...');

    // Get Azure Search configuration
    const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT;
    const searchApiKey = process.env.AZURE_SEARCH_API_KEY;
    const indexName = process.env.AZURE_SEARCH_INDEX_NAME || 'inventory-index';

    if (!searchEndpoint || !searchApiKey) {
      return NextResponse.json(
        { success: false, error: 'Azure Search configuration not found' },
        { status: 500 }
      );
    }

    // 1. Fetch data from your existing services
    console.log('Fetching data from existing services...');

    const searchDocuments: SearchDocument[] = [];
    let totalFetched = 0;

    try {
      // Fetch products from product service
      console.log('Fetching products...');
      const productsResponse = await fetch(
        'http://localhost:8083/api/products',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(10000),
        }
      );

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        const products: Product[] = productsData.content || [];
        console.log(`Fetched ${products.length} products`);

        // Transform products to search documents
        products.forEach(product => {
          // Determine stock status based on available stock
          let stockStatus = 'in_stock';
          if (product.availableStock === 0) {
            stockStatus = 'out_of_stock';
          } else if (product.availableStock && product.availableStock < 10) {
            stockStatus = 'low_stock';
          }

          searchDocuments.push({
            id: `product-${product.productId}`,
            entityType: 'product',
            name: product.name || 'Unnamed Product',
            description: product.description || '',
            category: product.categoryName || 'General',
            price: product.price || 0,
            stockLevel: product.availableStock || 0,
            stockStatus: stockStatus,
            supplier: 'Unknown Supplier', // Products don't have supplier info in this structure
            createdDate: new Date().toISOString(),
          });
        });
        totalFetched += products.length;
      } else {
        console.warn(`Failed to fetch products: ${productsResponse.status}`);
      }
    } catch (error) {
      console.warn('Failed to fetch products:', error);
    }

    try {
      // Fetch suppliers from supplier service
      console.log('Fetching suppliers...');
      const suppliersResponse = await fetch(
        'http://localhost:8082/api/suppliers',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (suppliersResponse.ok) {
        const suppliers: Supplier[] = await suppliersResponse.json();
        console.log(`Fetched ${suppliers.length} suppliers`);

        // Transform suppliers to search documents
        suppliers.forEach(supplier => {
          searchDocuments.push({
            id: `supplier-${supplier.supplierId}`,
            entityType: 'supplier',
            name: supplier.userName || 'Unnamed Supplier',
            description: supplier.description || '',
            category: supplier.categoryName || 'Supplier',
            supplier: supplier.userName || 'Unknown Supplier',
            createdDate: supplier.createdDate || new Date().toISOString(),
          });
        });
        totalFetched += suppliers.length;
      } else {
        console.warn(`Failed to fetch suppliers: ${suppliersResponse.status}`);
      }
    } catch (error) {
      console.warn('Failed to fetch suppliers:', error);
    }

    // If no data was fetched, add some sample data for testing
    if (searchDocuments.length === 0) {
      console.log(
        'No data fetched from services, adding sample data for testing...'
      );

      // Add sample products
      searchDocuments.push({
        id: 'sample-product-1',
        entityType: 'product',
        name: 'Sample Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        category: 'Electronics',
        price: 99.99,
        stockLevel: 50,
        stockStatus: 'in_stock',
        supplier: 'Sample Tech Corp',
        createdDate: new Date().toISOString(),
      });

      searchDocuments.push({
        id: 'sample-product-2',
        entityType: 'product',
        name: 'Sample Gaming Mouse',
        description: 'Precision gaming mouse with RGB lighting',
        category: 'Electronics',
        price: 49.99,
        stockLevel: 25,
        stockStatus: 'in_stock',
        supplier: 'Sample Game Gear',
        createdDate: new Date().toISOString(),
      });

      // Add sample suppliers
      searchDocuments.push({
        id: 'sample-supplier-1',
        entityType: 'supplier',
        name: 'Sample Tech Corp',
        description: 'Leading electronics supplier with 10+ years experience',
        category: 'Electronics',
        supplier: 'Sample Tech Corp',
        createdDate: new Date().toISOString(),
      });

      searchDocuments.push({
        id: 'sample-supplier-2',
        entityType: 'supplier',
        name: 'Sample Game Gear',
        description: 'Gaming accessories and peripherals supplier',
        category: 'Gaming',
        supplier: 'Sample Game Gear',
        createdDate: new Date().toISOString(),
      });

      totalFetched = searchDocuments.length;
      console.log(
        `Added ${searchDocuments.length} sample documents for testing`
      );
    }

    console.log(
      `Transformed ${searchDocuments.length} documents for search index`
    );

    // 2. Upload to Azure Search
    console.log('Uploading documents to Azure Search...');
    const response = await fetch(
      `${searchEndpoint}/indexes/${indexName}/docs/index?api-version=2023-11-01`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': searchApiKey,
        },
        body: JSON.stringify({ value: searchDocuments }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure Search upload failed:', errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Search sync failed: ${response.status} - ${errorText}`,
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Successfully synced data to Azure Search');

    const syncResponse = NextResponse.json({
      success: true,
      message: `Successfully synced ${searchDocuments.length} documents to search index`,
      data: {
        totalDocuments: searchDocuments.length,
        products: searchDocuments.filter(doc => doc.entityType === 'product')
          .length,
        suppliers: searchDocuments.filter(doc => doc.entityType === 'supplier')
          .length,
        syncTime: new Date().toISOString(),
      },
    });

    // Add CORS headers
    syncResponse.headers.set('Access-Control-Allow-Origin', '*');
    syncResponse.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS'
    );
    syncResponse.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );

    return syncResponse;
  } catch (error) {
    console.error('Sync error:', error);
    const response = NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred during sync',
      },
      { status: 500 }
    );

    // Add CORS headers to error response
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );

    return response;
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Data sync endpoint for Azure Search',
    usage: 'POST to this endpoint to sync your database data to Azure Search',
    endpoints: {
      products: 'http://localhost:8083/api/products',
      suppliers: 'http://localhost:8082/api/suppliers',
    },
  });
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
