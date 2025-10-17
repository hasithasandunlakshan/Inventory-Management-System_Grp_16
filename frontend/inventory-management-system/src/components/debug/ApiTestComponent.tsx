'use client';

import { useEffect, useState } from 'react';
import { revenueService } from '@/lib/services/revenueService';

export default function ApiTestComponent() {
  const [testData, setTestData] = useState<Record<string, unknown> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        const todayData = await revenueService.getTodayRevenue();
        setTestData(todayData as unknown as Record<string, unknown>);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    testApi();
  }, []);

  if (loading) {
    return <div className='p-4 border rounded'>Loading API test...</div>;
  }

  if (error) {
    return (
      <div className='p-4 border rounded bg-red-50'>
        <h3 className='font-bold text-red-600'>API Error:</h3>
        <p className='text-red-600'>{error}</p>
      </div>
    );
  }

  return (
    <div className='p-4 border rounded bg-green-50'>
      <h3 className='font-bold text-green-600'>API Test Success!</h3>
      <pre className='text-sm mt-2 bg-white p-2 rounded'>
        {JSON.stringify(testData, null, 2)}
      </pre>
    </div>
  );
}
