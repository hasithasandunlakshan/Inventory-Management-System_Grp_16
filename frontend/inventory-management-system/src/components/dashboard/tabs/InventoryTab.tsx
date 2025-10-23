'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
  Box,
  Boxes,
} from 'lucide-react';
import type {
  InventoryAnalytics,
  StockMovementData,
} from '@/lib/services/analyticsService';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Color scheme
const CustomerColors = {
  brandBlue: '#2A7CC7',
  brandDark: '#072033ff',
  brandMedium: '#245e91ff',
  accentBlue: '#6366F1',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  success: '#059669',
  successBg: '#D1FAE5',
  warning: '#F59E0B',
  error: '#EF4444',
  bgCard: '#FFFFFF',
  borderDefault: '#E2E8F0',
  bgPage: '#F8FAFC',
};

interface InventoryTabProps {
  initialInventoryData: InventoryAnalytics | null;
  initialStockMovement: StockMovementData[];
  initialCategoryData: Array<{
    category: string;
    count: number;
    value: number;
  }>;
}

export default function InventoryTabClient({
  initialInventoryData,
  initialStockMovement,
  initialCategoryData,
}: InventoryTabProps) {
  const [inventoryData] = useState<InventoryAnalytics | null>(
    initialInventoryData
  );
  const [stockMovement] = useState<StockMovementData[]>(initialStockMovement);
  const [categoryData] =
    useState<Array<{ category: string; count: number; value: number }>>(
      initialCategoryData
    );

  if (!inventoryData) {
    return (
      <Card
        style={{
          backgroundColor: CustomerColors.bgCard,
          border: `1px solid ${CustomerColors.borderDefault}`,
        }}
      >
        <CardContent className='p-6'>
          <div className='text-center text-red-600'>
            <AlertTriangle className='mx-auto h-12 w-12 mb-4' />
            <p>No inventory data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stockStatusData = [
    {
      name: 'In Stock',
      value: inventoryData.inStock,
      color: CustomerColors.success,
    },
    {
      name: 'Low Stock',
      value: inventoryData.lowStock,
      color: CustomerColors.warning,
    },
    {
      name: 'Out of Stock',
      value: inventoryData.outOfStock,
      color: CustomerColors.error,
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Inventory Status Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card
          style={{
            backgroundColor: CustomerColors.bgCard,
            border: `1px solid ${CustomerColors.borderDefault}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardHeader className='pb-2'>
            <CardTitle
              className='text-sm font-medium flex items-center'
              style={{ color: CustomerColors.textSecondary }}
            >
              <Boxes
                className='h-4 w-4 mr-2'
                style={{ color: CustomerColors.brandBlue }}
              />
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className='text-3xl font-bold'
              style={{ color: CustomerColors.brandDark }}
            >
              {inventoryData.totalProducts}
            </div>
            <p
              className='text-xs mt-1'
              style={{ color: CustomerColors.textSecondary }}
            >
              All products in system
            </p>
          </CardContent>
        </Card>

        <Card
          style={{
            backgroundColor: CustomerColors.bgCard,
            border: `1px solid ${CustomerColors.borderDefault}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardHeader className='pb-2'>
            <CardTitle
              className='text-sm font-medium flex items-center'
              style={{ color: CustomerColors.textSecondary }}
            >
              <Box
                className='h-4 w-4 mr-2'
                style={{ color: CustomerColors.success }}
              />
              In Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className='text-3xl font-bold'
              style={{ color: CustomerColors.success }}
            >
              {inventoryData.inStock}
            </div>
            <p
              className='text-xs mt-1'
              style={{ color: CustomerColors.textSecondary }}
            >
              Healthy stock levels
            </p>
          </CardContent>
        </Card>

        <Card
          style={{
            backgroundColor: CustomerColors.bgCard,
            border: `1px solid ${CustomerColors.borderDefault}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardHeader className='pb-2'>
            <CardTitle
              className='text-sm font-medium flex items-center'
              style={{ color: CustomerColors.textSecondary }}
            >
              <AlertTriangle
                className='h-4 w-4 mr-2'
                style={{ color: CustomerColors.warning }}
              />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className='text-3xl font-bold'
              style={{ color: CustomerColors.warning }}
            >
              {inventoryData.lowStock}
            </div>
            <p
              className='text-xs mt-1'
              style={{ color: CustomerColors.textSecondary }}
            >
              Needs restocking soon
            </p>
          </CardContent>
        </Card>

        <Card
          style={{
            backgroundColor: CustomerColors.bgCard,
            border: `1px solid ${CustomerColors.borderDefault}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardHeader className='pb-2'>
            <CardTitle
              className='text-sm font-medium flex items-center'
              style={{ color: CustomerColors.textSecondary }}
            >
              <Package
                className='h-4 w-4 mr-2'
                style={{ color: CustomerColors.error }}
              />
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className='text-3xl font-bold'
              style={{ color: CustomerColors.error }}
            >
              {inventoryData.outOfStock}
            </div>
            <p
              className='text-xs mt-1'
              style={{ color: CustomerColors.textSecondary }}
            >
              Urgent restock needed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Stock Movement Line Chart */}
        <Card
          style={{
            backgroundColor: CustomerColors.bgCard,
            border: `1px solid ${CustomerColors.borderDefault}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardHeader>
            <CardTitle
              className='flex items-center'
              style={{ color: CustomerColors.brandDark }}
            >
              <TrendingUp
                className='h-5 w-5 mr-2'
                style={{ color: CustomerColors.brandBlue }}
              />
              Stock Movement (7 Days)
            </CardTitle>
            <p
              className='text-sm'
              style={{ color: CustomerColors.textSecondary }}
            >
              Incoming vs Outgoing inventory
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                incoming: {
                  label: 'Incoming',
                  color: CustomerColors.success,
                },
                outgoing: {
                  label: 'Outgoing',
                  color: CustomerColors.error,
                },
              }}
              className='h-[300px]'
            >
              <LineChart data={stockMovement.slice(0, 7)}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke={CustomerColors.borderDefault}
                />
                <XAxis
                  dataKey='date'
                  tickFormatter={value =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                  stroke={CustomerColors.textSecondary}
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke={CustomerColors.textSecondary}
                  style={{ fontSize: '12px' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='incoming'
                  stroke={CustomerColors.success}
                  strokeWidth={2}
                  dot={{ fill: CustomerColors.success, r: 4 }}
                  name='Incoming'
                />
                <Line
                  type='monotone'
                  dataKey='outgoing'
                  stroke={CustomerColors.error}
                  strokeWidth={2}
                  dot={{ fill: CustomerColors.error, r: 4 }}
                  name='Outgoing'
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Stock Status Pie Chart */}
        <Card
          style={{
            backgroundColor: CustomerColors.bgCard,
            border: `1px solid ${CustomerColors.borderDefault}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardHeader>
            <CardTitle
              className='flex items-center'
              style={{ color: CustomerColors.brandDark }}
            >
              <Package
                className='h-5 w-5 mr-2'
                style={{ color: CustomerColors.brandBlue }}
              />
              Stock Status Distribution
            </CardTitle>
            <p
              className='text-sm'
              style={{ color: CustomerColors.textSecondary }}
            >
              Current inventory health
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={stockStatusData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {stockStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution Chart */}
      {categoryData.length > 0 && (
        <Card
          style={{
            backgroundColor: CustomerColors.bgCard,
            border: `1px solid ${CustomerColors.borderDefault}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardHeader>
            <CardTitle
              className='flex items-center'
              style={{ color: CustomerColors.brandDark }}
            >
              <Boxes
                className='h-5 w-5 mr-2'
                style={{ color: CustomerColors.brandBlue }}
              />
              Products by Category
            </CardTitle>
            <p
              className='text-sm'
              style={{ color: CustomerColors.textSecondary }}
            >
              Distribution of products across categories
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: 'Products',
                  color: CustomerColors.brandBlue,
                },
              }}
              className='h-[300px]'
            >
              <BarChart data={categoryData}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke={CustomerColors.borderDefault}
                />
                <XAxis
                  dataKey='category'
                  stroke={CustomerColors.textSecondary}
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke={CustomerColors.textSecondary}
                  style={{ fontSize: '12px' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey='count'
                  fill={CustomerColors.brandBlue}
                  radius={[8, 8, 0, 0]}
                  name='Products'
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Stock Movement Table */}
      <Card
        style={{
          backgroundColor: CustomerColors.bgCard,
          border: `1px solid ${CustomerColors.borderDefault}`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: CustomerColors.brandDark }}>
            Recent Stock Movement Details
          </CardTitle>
          <p
            className='text-sm'
            style={{ color: CustomerColors.textSecondary }}
          >
            Daily breakdown of inventory changes
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: CustomerColors.borderDefault }}>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Date
                </TableHead>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Incoming
                </TableHead>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Outgoing
                </TableHead>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Net Change
                </TableHead>
                <TableHead
                  style={{ color: CustomerColors.textPrimary, fontWeight: 600 }}
                >
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockMovement.slice(0, 7).map(day => (
                <TableRow
                  key={day.date}
                  style={{ borderColor: CustomerColors.borderDefault }}
                >
                  <TableCell
                    className='font-medium'
                    style={{ color: CustomerColors.textPrimary }}
                  >
                    {new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <span
                      className='inline-flex items-center px-2 py-1 rounded text-sm'
                      style={{
                        backgroundColor: CustomerColors.successBg,
                        color: CustomerColors.success,
                      }}
                    >
                      +{day.incoming}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className='inline-flex items-center px-2 py-1 rounded text-sm'
                      style={{
                        backgroundColor: '#FEE2E2',
                        color: CustomerColors.error,
                      }}
                    >
                      -{day.outgoing}
                    </span>
                  </TableCell>
                  <TableCell
                    className='font-semibold'
                    style={{
                      color:
                        day.net >= 0
                          ? CustomerColors.success
                          : CustomerColors.error,
                    }}
                  >
                    {day.net >= 0 ? '+' : ''}
                    {day.net}
                  </TableCell>
                  <TableCell>
                    {day.net > 0 ? (
                      <TrendingUp
                        className='h-4 w-4'
                        style={{ color: CustomerColors.success }}
                      />
                    ) : day.net < 0 ? (
                      <TrendingDown
                        className='h-4 w-4'
                        style={{ color: CustomerColors.error }}
                      />
                    ) : (
                      <span style={{ color: CustomerColors.textSecondary }}>
                        Stable
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
