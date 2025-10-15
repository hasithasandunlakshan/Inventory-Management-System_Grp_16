'use client';

import { orderService } from '@/lib/services/orderService';
import { useState } from 'react';

export default function APIDebugPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('Testing API...\n');

    try {
      // Test the orderService method
      console.log('🔍 Testing orderService.getAllOrders()');
      setResult(prev => prev + '🔍 Testing orderService.getAllOrders()\n');

      const response = await orderService.getAllOrders();

      setResult(
        prev =>
          prev + `✅ Success! Got ${response.orders?.length || 0} orders\n`
      );
      setResult(
        prev => prev + `📊 Response: ${JSON.stringify(response, null, 2)}\n`
      );
    } catch (error) {
      console.error('❌ Error:', error);
      setResult(
        prev =>
          prev +
          `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`
      );

      // Additional debugging info
      const token = localStorage.getItem('inventory_auth_token');
      setResult(prev => prev + `🔑 Has token: ${!!token}\n`);
      setResult(prev => prev + `🔑 Token length: ${token?.length || 0}\n`);
    }

    setLoading(false);
  };

  const testDirectFetch = async () => {
    setLoading(true);
    setResult('Testing direct fetch...\n');

    const API_URL =
      'http://localhost:8084/api/orders/all';
    const token = localStorage.getItem('inventory_auth_token');

    try {
      // Test 1: Without auth
      setResult(prev => prev + '1️⃣ Testing without authentication...\n');

      let response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setResult(
        prev => prev + `Status: ${response.status} ${response.statusText}\n`
      );

      if (response.ok) {
        const data = await response.json();
        setResult(
          prev =>
            prev + `✅ Success without auth: ${JSON.stringify(data, null, 2)}\n`
        );
      } else {
        const errorText = await response.text();
        setResult(prev => prev + `❌ Error without auth: ${errorText}\n`);
      }

      // Test 2: With auth
      if (token) {
        setResult(prev => prev + '\n2️⃣ Testing with authentication...\n');

        response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        });

        setResult(
          prev => prev + `Status: ${response.status} ${response.statusText}\n`
        );

        if (response.ok) {
          const data = await response.json();
          setResult(
            prev =>
              prev + `✅ Success with auth: ${JSON.stringify(data, null, 2)}\n`
          );
        } else {
          const errorText = await response.text();
          setResult(prev => prev + `❌ Error with auth: ${errorText}\n`);
        }
      } else {
        setResult(prev => prev + '\n2️⃣ No auth token found\n');
      }
    } catch (error) {
      setResult(
        prev =>
          prev +
          `❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}\n`
      );
    }

    setLoading(false);
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    setResult('Local storage cleared\n');
  };

  const showTokenInfo = () => {
    const token = localStorage.getItem('inventory_auth_token');
    const user = localStorage.getItem('inventory_user_info');

    setResult(`🔑 Token info:\n`);
    setResult(prev => prev + `Has token: ${!!token}\n`);
    setResult(prev => prev + `Token length: ${token?.length || 0}\n`);
    if (token) {
      setResult(prev => prev + `Token start: ${token.substring(0, 50)}...\n`);
    }
    setResult(prev => prev + `\n👤 User info:\n${user || 'No user info'}\n`);
  };

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6'>API Debug Tool</h1>

      <div className='space-y-4 mb-6'>
        <button
          onClick={testAPI}
          disabled={loading}
          className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50'
        >
          {loading ? 'Testing...' : 'Test OrderService.getAllOrders()'}
        </button>

        <button
          onClick={testDirectFetch}
          disabled={loading}
          className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-2'
        >
          {loading ? 'Testing...' : 'Test Direct Fetch'}
        </button>

        <button
          onClick={showTokenInfo}
          className='bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 ml-2'
        >
          Show Token Info
        </button>

        <button
          onClick={clearLocalStorage}
          className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2'
        >
          Clear Local Storage
        </button>
      </div>

      <div className='bg-gray-100 p-4 rounded-lg'>
        <h2 className='font-bold mb-2'>Results:</h2>
        <pre className='whitespace-pre-wrap text-sm overflow-auto max-h-96'>
          {result || 'Click a button to test the API'}
        </pre>
      </div>

      <div className='mt-6 bg-blue-50 p-4 rounded-lg'>
        <h3 className='font-bold mb-2'>Debug Info:</h3>
        <p>
          <strong>API URL:</strong>{' '}
          http://localhost:8084/api/orders/all
        </p>
        <p>
          <strong>Current Origin:</strong>{' '}
          {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
        </p>
        <p>
          <strong>User Agent:</strong>{' '}
          {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
        </p>
      </div>
    </div>
  );
}
