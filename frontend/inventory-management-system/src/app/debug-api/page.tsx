'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EndpointTestResult {
  status: number;
  ok: boolean;
  data: unknown;
  dataCount?: number;
  error?: string;
}

interface ApiTestResults {
  timestamp: string;
  endpoints: {
    [key: string]: {
      url: string;
      result: EndpointTestResult;
    };
  };
  error?: string;
  stack?: string;
}

export default function DebugApiPage() {
  const [results, setResults] = useState<ApiTestResults | null>(null);
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    setResults(null);

    const productServiceUrl =
      process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8083';
    const orderServiceUrl =
      process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:8084';
    const userServiceUrl =
      process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8081';
    const supplierServiceUrl =
      process.env.NEXT_PUBLIC_SUPPLIER_SERVICE_URL || 'http://localhost:8085';

    const endpoints = {
      // Product Service
      'Products (GET /api/products)': `${productServiceUrl}/api/products?page=0&size=5`,
      'Categories (GET /api/categories)': `${productServiceUrl}/api/categories`,
      'Single Product (GET /api/products/1)': `${productServiceUrl}/api/products/1`,

      // Order Service
      'Orders (GET /api/orders/all)': `${orderServiceUrl}/api/orders/all?page=0&size=5`,
      'Order Count Confirmed (GET /api/orders/count/confirmed)': `${orderServiceUrl}/api/orders/count/confirmed`,
      'Discounts (GET /api/admin/discounts/all)': `${orderServiceUrl}/api/admin/discounts/all?page=0&size=5`,

      // User Service
      'Users (GET /api/users)': `${userServiceUrl}/api/users`,
      'Current User (GET /api/users/me)': `${userServiceUrl}/api/users/me`,

      // Supplier Service
      'Suppliers (GET /api/suppliers)': `${supplierServiceUrl}/api/suppliers`,
      'Purchase Orders (GET /api/purchase-orders)': `${supplierServiceUrl}/api/purchase-orders`,
    };

    const testResults: {
      [key: string]: { url: string; result: EndpointTestResult };
    } = {};

    try {
      // Test all endpoints
      for (const [name, url] of Object.entries(endpoints)) {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          let data;
          let dataCount;
          try {
            data = await response.json();
            // Count data items
            if (Array.isArray(data)) {
              dataCount = data.length;
            } else if (data.content && Array.isArray(data.content)) {
              dataCount = data.content.length;
            } else if (data.totalElements !== undefined) {
              dataCount = data.totalElements;
            }
          } catch {
            data = await response.text();
          }

          testResults[name] = {
            url,
            result: {
              status: response.status,
              ok: response.ok,
              data,
              dataCount,
            },
          };
        } catch (error) {
          testResults[name] = {
            url,
            result: {
              status: 0,
              ok: false,
              data: null,
              error:
                error instanceof Error ? error.message : 'Connection failed',
            },
          };
        }
      }

      setResults({
        timestamp: new Date().toISOString(),
        endpoints: testResults,
      });
    } catch (error) {
      setResults({
        timestamp: new Date().toISOString(),
        endpoints: {},
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <Card>
        <CardHeader>
          <CardTitle>API Connection Debug</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <div>
              <p className='text-sm text-gray-600 mb-1'>
                <strong>NEXT_PUBLIC_PRODUCT_SERVICE_URL:</strong>
              </p>
              <p className='text-xs font-mono bg-gray-100 p-2 rounded'>
                {process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL ||
                  'Not set (using localhost:8083)'}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-600 mb-1'>
                <strong>NEXT_PUBLIC_ORDER_SERVICE_URL:</strong>
              </p>
              <p className='text-xs font-mono bg-gray-100 p-2 rounded'>
                {process.env.NEXT_PUBLIC_ORDER_SERVICE_URL ||
                  'Not set (using localhost:8084)'}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-600 mb-1'>
                <strong>NEXT_PUBLIC_USER_SERVICE_URL:</strong>
              </p>
              <p className='text-xs font-mono bg-gray-100 p-2 rounded'>
                {process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
                  'Not set (using localhost:8081)'}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-600 mb-1'>
                <strong>NEXT_PUBLIC_SUPPLIER_SERVICE_URL:</strong>
              </p>
              <p className='text-xs font-mono bg-gray-100 p-2 rounded'>
                {process.env.NEXT_PUBLIC_SUPPLIER_SERVICE_URL ||
                  'Not set (using localhost:8085)'}
              </p>
            </div>
          </div>

          <Button
            onClick={testApiConnection}
            disabled={loading}
            className='w-full'
          >
            {loading ? 'Testing All Endpoints...' : 'Test All API Endpoints'}
          </Button>

          {results && (
            <div className='mt-6 space-y-4'>
              <h3 className='text-lg font-semibold'>Test Results</h3>
              <p className='text-sm text-gray-600'>
                Tested at: {new Date(results.timestamp).toLocaleString()}
              </p>

              {results.error && (
                <div className='bg-red-50 border border-red-200 p-4 rounded-lg'>
                  <p className='text-red-800 font-semibold'>Error:</p>
                  <p className='text-red-600 text-sm'>{results.error}</p>
                </div>
              )}

              <div className='space-y-3'>
                {Object.entries(results.endpoints).map(([name, endpoint]) => (
                  <div
                    key={name}
                    className={`border rounded-lg p-4 ${
                      endpoint.result.ok
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <h4 className='font-semibold text-sm'>{name}</h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-mono ${
                          endpoint.result.ok
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {endpoint.result.status || 'FAIL'}
                      </span>
                    </div>
                    <p className='text-xs font-mono text-gray-600 mb-2 break-all'>
                      {endpoint.url}
                    </p>
                    {endpoint.result.dataCount !== undefined && (
                      <p className='text-sm text-gray-700 mb-2'>
                        📊 Data Count:{' '}
                        <strong>{endpoint.result.dataCount}</strong>
                      </p>
                    )}
                    {endpoint.result.error && (
                      <p className='text-sm text-red-600 mb-2'>
                        ❌ Error: {endpoint.result.error}
                      </p>
                    )}
                    <details className='mt-2'>
                      <summary className='text-xs text-gray-600 cursor-pointer hover:text-gray-800'>
                        View Response Data
                      </summary>
                      <pre className='bg-white p-3 rounded mt-2 overflow-auto text-xs border'>
                        {JSON.stringify(endpoint.result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
