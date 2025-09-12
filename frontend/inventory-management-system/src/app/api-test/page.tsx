"use client";

import { useState } from "react";
import { revenueService } from "@/services/revenueService";
import { inventoryService } from "@/services/inventoryService";

export default function ApiTestPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testAllApis = async () => {
    setLoading(true);
    console.log('🧪 Starting API tests...');
    
    try {
      console.log('Testing Today API...');
      const todayData = await revenueService.getTodayRevenue();
      setResults(prev => ({ ...prev, today: todayData }));
      
      console.log('Testing Monthly API...');
      const monthlyData = await revenueService.getMonthlyRevenue();
      setResults(prev => ({ ...prev, monthly: monthlyData }));
      
      console.log('Testing Stripe API...');
      const stripeData = await revenueService.getStripeStats();
      setResults(prev => ({ ...prev, stripe: stripeData }));
      
      console.log('Testing Inventory Cost API...');
      const inventoryData = await inventoryService.getInventoryCost();
      setResults(prev => ({ ...prev, inventory: inventoryData }));
      
      console.log('✅ All API tests completed!');
    } catch (error) {
      console.error('❌ API test failed:', error);
      setResults(prev => ({ ...prev, error: error.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <button 
        onClick={testAllApis}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing APIs...' : 'Test All APIs'}
      </button>
      
      <div className="mt-6 space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Today's Revenue:</h2>
          <pre className="text-sm overflow-auto">
            {results.today ? JSON.stringify(results.today, null, 2) : 'No data'}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Monthly Revenue:</h2>
          <pre className="text-sm overflow-auto">
            {results.monthly ? JSON.stringify(results.monthly, null, 2) : 'No data'}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Stripe Stats:</h2>
          <pre className="text-sm overflow-auto">
            {results.stripe ? JSON.stringify(results.stripe, null, 2) : 'No data'}
          </pre>
        </div>
        
        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-bold mb-2">Inventory Cost:</h2>
          <pre className="text-sm overflow-auto">
            {results.inventory ? JSON.stringify(results.inventory, null, 2) : 'No data'}
          </pre>
        </div>
        
        {results.error && (
          <div className="bg-red-100 p-4 rounded">
            <h2 className="font-bold mb-2 text-red-600">Error:</h2>
            <pre className="text-sm text-red-600">{results.error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
