'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugApiPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    setResults(null);

    const apiUrl = process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8083';
    console.log('🔍 Testing API URL:', apiUrl);

    try {
      // Test products endpoint
      const productsResponse = await fetch(`${apiUrl}/api/products?page=0&size=5`);
      const productsData = await productsResponse.json();

      // Test categories endpoint
      const categoriesResponse = await fetch(`${apiUrl}/api/categories`);
      const categoriesData = await categoriesResponse.json();

      setResults({
        apiUrl,
        timestamp: new Date().toISOString(),
        products: {
          status: productsResponse.status,
          ok: productsResponse.ok,
          data: productsData,
          totalElements: productsData.totalElements || 0,
          contentLength: productsData.content?.length || 0,
        },
        categories: {
          status: categoriesResponse.status,
          ok: categoriesResponse.ok,
          data: categoriesData,
          length: Array.isArray(categoriesData) ? categoriesData.length : 0,
        },
      });
    } catch (error) {
      setResults({
        apiUrl,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>API Connection Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Environment Variable: <code>NEXT_PUBLIC_PRODUCT_SERVICE_URL</code>
            </p>
            <p className="text-sm font-mono bg-gray-100 p-2 rounded">
              {process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'Not set (using localhost:8083)'}
            </p>
          </div>

          <Button onClick={testApiConnection} disabled={loading}>
            {loading ? 'Testing...' : 'Test API Connection'}
          </Button>

          {results && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Test Results</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}