'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { revenueService } from '@/lib/services/revenueService';
import {
  inventoryService,
  InventoryCostResponse,
} from '@/lib/services/inventoryService';
import { TodayRevenueResponse } from '@/lib/types/revenue';
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
        if (!token) {
          setLoading(false);
          return;
        }
        // Fetch both revenue and inventory data in parallel
        const [revenueData, inventoryData] = await Promise.all([
          revenueService.getTodayRevenue().catch(() => {
            return null;
          }),
          inventoryService.getInventoryCost().catch(() => {
            return null;
          }),
        ]);
        setTodayRevenue(revenueData);
        setInventoryCost(inventoryData);
      } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className='bg-card border-border card-shadow'>
            <CardHeader className='pb-2'>
              <Skeleton className='h-4 w-24' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      label: "Today's Revenue",
      value: todayRevenue
        ? `$${todayRevenue.revenue.toFixed(2)}`
        : 'Login Required',
      error: !todayRevenue,
      icon: DollarSign,
      gradient: true,
    },
    {
      label: "Today's Orders",
      value: todayRevenue ? todayRevenue.count.toString() : 'Login Required',
      error: !todayRevenue,
      icon: ShoppingCart,
    },
    {
      label: 'Inventory Value',
      value: inventoryCost
        ? `$${inventoryCost.totalAvailableInventoryCost.toFixed(2)}`
        : 'Login Required',
      error: !inventoryCost,
      icon: Package,
    },
    {
      label: 'Products in Stock',
      value: inventoryCost
        ? inventoryCost.totalProductsWithStock.toString()
        : 'Login Required',
      error: !inventoryCost,
      icon: TrendingUp,
      gradient: true,
    },
  ];

  return (
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
      {kpis.map(kpi => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.label}
            className={`border-border card-shadow ${kpi.gradient ? 'bg-success-gradient' : 'bg-card'}`}
          >
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium flex items-center text-muted-foreground'>
                <Icon className='h-4 w-4 mr-2 text-primary' />
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${kpi.error ? 'text-destructive' : 'text-foreground'}`}
              >
                {kpi.value}
              </div>
              {kpi.error && (
                <div className='text-xs mt-1 text-destructive'>
                  Please log in as Manager
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
