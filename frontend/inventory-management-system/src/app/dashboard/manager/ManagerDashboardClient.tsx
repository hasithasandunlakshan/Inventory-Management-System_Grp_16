'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';
import KpiCards from '../../../components/dashboard/KpiCards';
import RevenueDashboard from '../../../components/dashboard/RevenueDashboard';
import InventoryTabClient from '../../../components/dashboard/tabs/InventoryTabClient';
import SalesTabClient from '../../../components/dashboard/tabs/SalesTabClient';
import LogisticsTabClient from '../../../components/dashboard/tabs/LogisticsTabClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  InventoryAnalytics,
  StockMovementData,
  SalesAnalytics,
} from '@/lib/services/analyticsService';
import type { LogisticsMetrics } from '@/lib/services/logisticsService';
import { LayoutDashboard, Package, DollarSign, Truck } from 'lucide-react';

// Color scheme
const CustomerColors = {
  brandBlue: '#2A7CC7',
  brandDark: '#072033ff',
  brandMedium: '#245e91ff',
  accentBlue: '#6366F1',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  bgPage: '#F8FAFC',
  bgCard: '#FFFFFF',
  borderDefault: '#E2E8F0',
};

interface DashboardData {
  inventoryData: {
    inventoryData: InventoryAnalytics;
    stockMovement: StockMovementData[];
    categoryData: Array<{ category: string; count: number; value: number }>;
  } | null;
  salesData: SalesAnalytics | null;
  logisticsData: LogisticsMetrics | null;
}

interface Props {
  initialData: DashboardData;
}

export default function ManagerDashboardClient({ initialData }: Props) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { value: 'overview', label: 'Overview', icon: LayoutDashboard },
    { value: 'inventory', label: 'Inventory', icon: Package },
    { value: 'sales', label: 'Sales', icon: DollarSign },
    { value: 'logistics', label: 'Logistics', icon: Truck },
  ];

  return (
    <div
      className='min-h-screen'
      style={{ backgroundColor: CustomerColors.bgPage }}
    >
      <div className='space-y-6'>
        {/* Tabbed Content */}
        <Tabs
          defaultValue='overview'
          className='w-full'
          onValueChange={setActiveTab}
        >
          {/* Beautiful Tab Bar with Integrated Header */}
          <div
            className='w-full mb-8 rounded-2xl transition-all duration-500 relative'
            style={{
              background: `linear-gradient(135deg, ${CustomerColors.brandBlue} 0%, ${CustomerColors.brandMedium} 100%)`,
              boxShadow:
                '0 10px 25px -5px rgba(42, 124, 199, 0.3), 0 8px 10px -6px rgba(42, 124, 199, 0.2)',
            }}
          >
            {/* Header Section */}
            <div className='px-6 pt-6 pb-4 flex items-center justify-between relative z-50'>
              <div>
                <h1
                  className='text-2xl font-bold tracking-tight'
                  style={{ color: 'white' }}
                >
                  Manager Dashboard
                </h1>
                <p
                  className='text-sm mt-1'
                  style={{ color: 'rgba(255, 255, 255, 0.85)' }}
                >
                  Welcome back, {user?.fullName || user?.username}!
                </p>
              </div>
              <div className='relative z-[100]'>
                <NotificationBell />
              </div>
            </div>

            {/* Tab Navigation */}
            <div className='px-4 pb-3 overflow-hidden rounded-b-2xl'>
              <TabsList
                className='grid w-full grid-cols-4 p-1.5 gap-2'
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                }}
              >
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.value;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className='relative overflow-hidden transition-all duration-300 py-3 px-4'
                      style={{
                        color: isActive
                          ? CustomerColors.brandDark
                          : 'rgba(255, 255, 255, 0.9)',
                        background: isActive ? 'white' : 'transparent',
                        borderRadius: '10px',
                        fontWeight: isActive ? '600' : '500',
                        boxShadow: isActive
                          ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                          : 'none',
                        transform: isActive ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      <div className='flex items-center justify-center'>
                        <Icon
                          className='h-4 w-4 mr-2'
                          style={{
                            strokeWidth: isActive ? 2.5 : 2,
                          }}
                        />
                        <span className='text-sm font-medium'>{tab.label}</span>
                      </div>
                      {isActive && (
                        <div
                          className='absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 rounded-full transition-all duration-300'
                          style={{
                            width: '50%',
                            background: `linear-gradient(90deg, ${CustomerColors.brandBlue} 0%, ${CustomerColors.accentBlue} 100%)`,
                          }}
                        />
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </div>

          {/* Overview Tab - Current content */}
          <TabsContent value='overview' className='space-y-6'>
            <KpiCards />
            <RevenueDashboard />
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value='inventory'>
            <InventoryTabClient
              initialInventoryData={
                initialData.inventoryData?.inventoryData || null
              }
              initialStockMovement={
                initialData.inventoryData?.stockMovement || []
              }
              initialCategoryData={
                initialData.inventoryData?.categoryData || []
              }
            />
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value='sales'>
            <SalesTabClient initialSalesData={initialData.salesData} />
          </TabsContent>

          {/* Logistics Tab */}
          <TabsContent value='logistics'>
            <LogisticsTabClient
              initialLogisticsData={initialData.logisticsData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
