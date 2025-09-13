"use client";

import { useEffect, useState } from "react";
import { revenueService } from "@/services/revenueService";

export default function ApiTestComponent() {
  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testApi = async () => {
      console.log('ApiTestComponent: Starting API test...');
      try {
        console.log('Testing today revenue...');
        const todayData = await revenueService.getTodayRevenue();
        console.log('Today data received:', todayData);
        
        setTestData(todayData);
        setError(null);
      } catch (err) {
        console.error('API Test Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    testApi();
  }, []);

  if (loading) {
    return <div className="p-4 border rounded">Loading API test...</div>;
  }

  if (error) {
    return (
      <div className="p-4 border rounded bg-red-50">
        <h3 className="font-bold text-red-600">API Error:</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded bg-green-50">
      <h3 className="font-bold text-green-600">API Test Success!</h3>
      <pre className="text-sm mt-2 bg-white p-2 rounded">
        {JSON.stringify(testData, null, 2)}
      </pre>
    </div>
  );
}
