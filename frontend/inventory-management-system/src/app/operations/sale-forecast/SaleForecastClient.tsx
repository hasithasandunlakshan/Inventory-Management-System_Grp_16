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
import { AlertCircle, Loader2, RefreshCw, TrendingUp } from 'lucide-react';
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
  readonly initialProducts: Product[];
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
    <div className='space-y-6'>
      {/* Header Card */}
      <Card
        className='shadow-lg border-0'
        style={{
          background: 'linear-gradient(135deg, #2A7CC7 0%, #245e91ff 100%)',
        }}
      >
        <CardContent className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <TrendingUp className='h-8 w-8 text-white' />
              <div>
                <h1 className='text-2xl font-bold text-white'>
                  Sales Forecast
                </h1>
                <p className='text-sm text-white/80'>
                  Predict future sales and stock requirements
                </p>
              </div>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row gap-4 pt-2 border-t border-white/20'>
            {/* Product Selection */}
            <div className='flex-1'>
              <Select
                value={selectedProductId}
                onValueChange={handleProductSelect}
              >
                <SelectTrigger className='h-11 bg-white/95 border-white/20 hover:bg-white'>
                  <SelectValue placeholder='Select a product to forecast' />
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
                onClick={handleForceRefresh}
                disabled={loading}
                className='bg-white text-blue-700 hover:bg-blue-50 shadow-md h-11 px-6'
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                Force Refresh
              </Button>
            )}
          </div>

          <div className='mt-3 text-xs text-white/70'>
            * Cached for 30 minutes to avoid model retraining
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
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
              <Card className='border shadow-sm hover:shadow-md transition-shadow'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-xs font-medium text-gray-500'>
                    Current Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-3xl font-bold text-gray-900'>
                    {forecastResponse.metrics.current_stock}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>units</p>
                </CardContent>
              </Card>

              <Card className='border shadow-sm hover:shadow-md transition-shadow'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-xs font-medium text-gray-500'>
                    Avg Daily Demand
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-3xl font-bold text-blue-600'>
                    {forecastResponse.metrics.average_daily_demand.toFixed(1)}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>units/day</p>
                </CardContent>
              </Card>

              <Card className='border shadow-sm hover:shadow-md transition-shadow'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-xs font-medium text-gray-500'>
                    30-Day Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-3xl font-bold text-orange-600'>
                    {forecastResponse.metrics.total_forecast_30_days}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>units</p>
                </CardContent>
              </Card>

              <Card className='border shadow-sm hover:shadow-md transition-shadow'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-xs font-medium text-gray-500'>
                    Reorder Quantity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-3xl font-bold text-green-600'>
                    {forecastResponse.metrics.reorder_quantity}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>units</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Forecast Chart */}
          <Card className='shadow-md'>
            <CardHeader>
              <CardTitle className='text-xl font-bold flex items-center gap-2'>
                <TrendingUp className='h-6 w-6 text-blue-600' />
                Sales Forecast (30 Days)
              </CardTitle>
              <CardDescription className='text-sm'>
                Predicted sales with confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[450px] w-full'>
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
        <Card className='shadow-md'>
          <CardContent className='flex flex-col items-center justify-center py-16'>
            <div className='bg-blue-50 p-6 rounded-full mb-4'>
              <TrendingUp className='h-12 w-12 text-blue-600' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              {products.length === 0
                ? 'No Products Available'
                : 'Select a Product'}
            </h3>
            <p className='text-gray-500 text-center max-w-md'>
              {products.length === 0
                ? 'Add products to your inventory to start forecasting sales'
                : 'Choose a product from the dropdown above to view its sales forecast and insights'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
