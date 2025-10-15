'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { revenueService } from '@/services/revenueService';
import {
  inventoryService,
  InventoryCostResponse,
} from '@/services/inventoryService';
import { TodayRevenueResponse } from '@/types/revenue';

export default function KpiCards() {
  const [todayRevenue, setTodayRevenue] = useState<TodayRevenueResponse | null>(
    null
  );
  const [inventoryCost, setInventoryCost] =
    useState<InventoryCostResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check authentication first
        const token = localStorage.getItem('inventory_auth_token');
        const userInfo = localStorage.getItem('inventory_user_info');
        if (!token) {
          setLoading(false);
          return;
        }
        // Fetch both revenue and inventory data in parallel
        const [revenueData, inventoryData] = await Promise.all([
          revenueService.getTodayRevenue().catch(err => {
            return null;
          }),
          inventoryService.getInventoryCost().catch(err => {
            return null;
          }),
        ]);
        setTodayRevenue(revenueData);
        setInventoryCost(inventoryData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const kpis = [
    {
      label: "Today's Revenue",
      value: loading
        ? 'Loading...'
        : todayRevenue
          ? `$${todayRevenue.revenue.toFixed(2)}`
          : 'Login Required',
      error: !todayRevenue && !loading,
    },
    {
      label: "Today's Orders",
      value: loading
        ? 'Loading...'
        : todayRevenue
          ? todayRevenue.count.toString()
          : 'Login Required',
      error: !todayRevenue && !loading,
    },
    {
      label: 'Inventory Value',
      value: loading
        ? 'Loading...'
        : inventoryCost
          ? `$${inventoryCost.totalAvailableInventoryCost.toFixed(2)}`
          : 'Login Required',
      error: !inventoryCost && !loading,
    },
    {
      label: 'Products in Stock',
      value: loading
        ? 'Loading...'
        : inventoryCost
          ? inventoryCost.totalProductsWithStock.toString()
          : 'Login Required',
      error: !inventoryCost && !loading,
    },
  ];

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {kpis.map(kpi => (
        <Card key={kpi.label}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{kpi.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${kpi.error ? 'text-red-500' : ''}`}
            >
              {kpi.value}
            </div>
            {kpi.error && (
              <div className='text-xs text-red-500 mt-1'>
                Please log in as Manager
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
