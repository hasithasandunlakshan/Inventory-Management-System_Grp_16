"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { revenueService } from "@/services/revenueService";
import { inventoryService, InventoryCostResponse } from "@/services/inventoryService";
import { TodayRevenueResponse } from "@/types/revenue";

export default function KpiCards() {
  const [todayRevenue, setTodayRevenue] = useState<TodayRevenueResponse | null>(null);
  const [inventoryCost, setInventoryCost] = useState<InventoryCostResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 KpiCards component mounted, fetching revenue and inventory data...');
    
    const fetchData = async () => {
      try {
        // Check authentication first
        const token = localStorage.getItem('inventory_auth_token');
        const userInfo = localStorage.getItem('inventory_user_info');
        console.log('🔐 Authentication check:', {
          hasToken: !!token,
          tokenLength: token?.length || 0,
          hasUserInfo: !!userInfo,
          userInfo: userInfo ? JSON.parse(userInfo) : null
        });

        if (!token) {
          console.error('❌ No authentication token found!');
          setLoading(false);
          return;
        }

        console.log('📞 About to call revenue and inventory services');
        
        // Fetch both revenue and inventory data in parallel
        const [revenueData, inventoryData] = await Promise.all([
          revenueService.getTodayRevenue().catch(err => {
            console.error('Revenue API failed:', err);
            return null;
          }),
          inventoryService.getInventoryCost().catch(err => {
            console.error('Inventory API failed:', err);
            return null;
          })
        ]);
        
        console.log('✅ KpiCards received revenue data:', revenueData);
        console.log('✅ KpiCards received inventory data:', inventoryData);
        
        setTodayRevenue(revenueData);
        setInventoryCost(inventoryData);
      } catch (error) {
        console.error('❌ KpiCards error fetching data:', error);
      } finally {
        console.log('🏁 KpiCards finished loading');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const kpis = [
    { 
      label: "Today's Revenue", 
      value: loading 
        ? "Loading..." 
        : todayRevenue 
          ? `$${todayRevenue.revenue.toFixed(2)}` 
          : "Login Required",
      error: !todayRevenue && !loading
    },
    { 
      label: "Today's Orders", 
      value: loading 
        ? "Loading..." 
        : todayRevenue 
          ? todayRevenue.count.toString() 
          : "Login Required",
      error: !todayRevenue && !loading
    },
    { 
      label: "Inventory Value", 
      value: loading 
        ? "Loading..." 
        : inventoryCost 
          ? `$${inventoryCost.totalAvailableInventoryCost.toFixed(2)}` 
          : "Login Required",
      error: !inventoryCost && !loading
    },
    { 
      label: "Products in Stock", 
      value: loading 
        ? "Loading..." 
        : inventoryCost 
          ? inventoryCost.totalProductsWithStock.toString() 
          : "Login Required",
      error: !inventoryCost && !loading
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpi.error ? 'text-red-500' : ''}`}>
              {kpi.value}
            </div>
            {kpi.error && (
              <div className="text-xs text-red-500 mt-1">
                Please log in as Manager
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


