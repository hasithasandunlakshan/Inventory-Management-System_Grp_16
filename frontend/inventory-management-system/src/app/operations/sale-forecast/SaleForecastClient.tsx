'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { forecastService } from '@/lib/services/forecastService';
import { ForecastResponse, LegacyForecastData } from '@/lib/types/forecast';
import { Product } from '@/lib/types/product';
import {
  AlertCircle,
  Loader2,
  Package,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface SaleForecastClientProps {
  initialProducts: Product[];
}

export default function SaleForecastClient({
  initialProducts,
}: SaleForecastClientProps) {
  const [products] = useState<Product[]>(initialProducts);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [forecastResponse, setForecastResponse] =
    useState<ForecastResponse | null>(null);
  const [legacyForecastData, setLegacyForecastData] = useState<
    LegacyForecastData[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Load forecast when product is selected
  const handleProductSelect = async (productId: string) => {
    setSelectedProductId(productId);
    setError('');

    if (!productId) {
      setForecastResponse(null);
      setLegacyForecastData([]);
      return;
    }

    try {
      setLoading(true);
      const response = await forecastService.getForecastByProductId(
        Number(productId)
      );

      // Check if it's the new format or legacy format
      if (Array.isArray(response)) {
        // Legacy format
        setLegacyForecastData(response);
        setForecastResponse(null);
      } else {
        // New format
        setForecastResponse(response as ForecastResponse);
        setLegacyForecastData([]);
      }
    } catch {
      setError('Failed to load forecast data');
      setForecastResponse(null);
      setLegacyForecastData([]);
    } finally {
      setLoading(false);
    }
  };

  // Force refresh forecast (bypass cache)
  const handleForceRefresh = async () => {
    if (!selectedProductId) return;

    try {
      setLoading(true);
      setError('');
      const response = await forecastService.getForecastByProductId(
        Number(selectedProductId),
        0 // Force refresh with 0 TTL
      );

      if (Array.isArray(response)) {
        setLegacyForecastData(response);
        setForecastResponse(null);
      } else {
        setForecastResponse(response as ForecastResponse);
        setLegacyForecastData([]);
      }
    } catch {
      setError('Failed to refresh forecast data');
    } finally {
      setLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Custom tooltip component
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      name: string;
      color: string;
      payload: {
        fullDate: string;
        forecast: number;
        lowerBound: number;
        upperBound: number;
        trend?: number;
        daily?: number;
        weekly?: number;
      };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-white p-4 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-semibold text-sm mb-2'>{data.fullDate}</p>
          <div className='space-y-1'>
            <p className='text-sm'>
              <span className='font-medium text-blue-600'>Forecast:</span>{' '}
              {data.forecast} units
            </p>
            <p className='text-sm text-gray-600'>
              Range: {data.lowerBound} - {data.upperBound}
            </p>
            {data.trend !== undefined && data.trend !== 0 && (
              <>
                <p className='text-sm text-gray-600'>
                  Trend: {data.trend?.toFixed(2)}
                </p>
                <p className='text-sm text-gray-600'>
                  Daily: {data.daily?.toFixed(2)}
                </p>
                <p className='text-sm text-gray-600'>
                  Weekly: {data.weekly?.toFixed(2)}
                </p>
              </>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  // Get stock out information
  const getStockOutInfo = () => {
    if (forecastResponse) {
      return {
        date: forecastResponse.metrics.estimated_stock_out_date,
        daysUntil: null, // Not available in current type
        reorderQty: forecastResponse.metrics.reorder_quantity,
      };
    } else if (legacyForecastData.length > 0) {
      const lastDataPoint = legacyForecastData[legacyForecastData.length - 1];
      return {
        date: lastDataPoint.stock_out_date,
        daysUntil: null,
        reorderQty: lastDataPoint.reorder_quantity,
      };
    }

    return null;
  };

  // Prepare chart data - Handle both new and legacy API response structures
  const chartData = (() => {
    if (forecastResponse) {
      // New format
      return (
        forecastResponse.forecast_data?.map(item => ({
          date: formatDate(item.ds),
          fullDate: item.ds,
          forecast: parseFloat(item.yhat.toFixed(2)),
          lowerBound: parseFloat(item.yhat_lower.toFixed(2)),
          upperBound: parseFloat(item.yhat_upper.toFixed(2)),
          // New format doesn't have trend, daily, weekly - set defaults
          trend: 0,
          daily: 0,
          weekly: 0,
          stockOutDate: forecastResponse.metrics.estimated_stock_out_date,
          reorderQuantity: forecastResponse.metrics.reorder_quantity,
        })) || []
      );
    } else if (legacyForecastData.length > 0) {
      // Legacy format
      return legacyForecastData.map(item => ({
        date: formatDate(item.ds),
        fullDate: item.ds,
        forecast: parseFloat(item.yhat.toFixed(2)),
        lowerBound: parseFloat(item.yhat_lower.toFixed(2)),
        upperBound: parseFloat(item.yhat_upper.toFixed(2)),
        trend: parseFloat(item.trend.toFixed(2)),
        daily: parseFloat(item.daily.toFixed(2)),
        weekly: parseFloat(item.weekly.toFixed(2)),
        stockOutDate: item.stock_out_date,
        reorderQuantity: item.reorder_quantity,
      }));
    }
    return [];
  })();

  const stockOutInfo = getStockOutInfo();

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Sales Forecast</h1>
        <p className='text-muted-foreground'>
          Predict future sales and stock requirements for your products
        </p>
      </div>

      {/* Product Selection */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Select Product
          </CardTitle>
          <CardDescription>
            Choose a product to view its sales forecast (cached for 30 minutes
            to avoid model retraining)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-4'>
            <div className='max-w-md flex-1'>
              <Select
                value={selectedProductId}
                onValueChange={handleProductSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a product' />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem
                      key={product.productId}
                      value={product.productId.toString()}
                    >
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Force Refresh Button */}
            {selectedProductId && (
              <Button
                variant='outline'
                onClick={handleForceRefresh}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                Force Refresh
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant='destructive' className='mb-6'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card className='mb-6'>
          <CardContent className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-primary' />
              <p className='text-muted-foreground'>
                Generating forecast (this may take a few seconds)...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forecast Data */}
      {!loading && (forecastResponse || legacyForecastData.length > 0) && (
        <>
          {/* Stock Out Warning */}
          {stockOutInfo && (
            <Alert className='mb-6 border-orange-200 bg-orange-50'>
              <AlertCircle className='h-4 w-4 text-orange-600' />
              <AlertDescription className='text-orange-800'>
                <strong>Stock Out Alert:</strong> Estimated to run out on{' '}
                <strong>{stockOutInfo.date}</strong>
                {stockOutInfo.daysUntil && (
                  <span> ({stockOutInfo.daysUntil} days)</span>
                )}
                . Recommended reorder quantity:{' '}
                <strong>{stockOutInfo.reorderQty} units</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Metrics Cards */}
          {forecastResponse && (
            <div className='grid md:grid-cols-4 gap-4 mb-6'>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    Current Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold'>
                    {forecastResponse.metrics.current_stock}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    Avg Daily Demand
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold'>
                    {forecastResponse.metrics.average_daily_demand.toFixed(1)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    30-Day Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold text-orange-600'>
                    {forecastResponse.metrics.total_forecast_30_days}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    Reorder Quantity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold text-green-600'>
                    {forecastResponse.metrics.reorder_quantity}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                Sales Forecast (30 Days)
              </CardTitle>
              <CardDescription>
                Predicted sales with confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[400px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Confidence Interval */}
                    <Line
                      type='monotone'
                      dataKey='lowerBound'
                      stroke='#94a3b8'
                      strokeWidth={1}
                      dot={false}
                      strokeDasharray='5 5'
                      name='Lower Bound'
                    />
                    <Line
                      type='monotone'
                      dataKey='upperBound'
                      stroke='#94a3b8'
                      strokeWidth={1}
                      dot={false}
                      strokeDasharray='5 5'
                      name='Upper Bound'
                    />

                    {/* Forecast Line */}
                    <Line
                      type='monotone'
                      dataKey='forecast'
                      stroke='#3b82f6'
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name='Forecast'
                    />

                    {/* Stock Out Line */}
                    {stockOutInfo?.date && (
                      <ReferenceLine
                        x={formatDate(stockOutInfo.date)}
                        stroke='#f59e0b'
                        strokeDasharray='3 3'
                        label='Stock Out'
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!loading && !forecastResponse && legacyForecastData.length === 0 && (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <Package className='h-12 w-12 text-muted-foreground mb-4' />
            <p className='text-muted-foreground text-center'>
              {products.length === 0
                ? 'No products available'
                : 'Select a product to view sales forecast'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
