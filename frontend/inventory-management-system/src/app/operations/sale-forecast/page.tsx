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
import { productService } from '@/lib/services/productService';
import { ForecastResponse, LegacyForecastData } from '@/lib/types/forecast';
import { Product } from '@/lib/types/product';
import {
  AlertCircle,
  Loader2,
  Package,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
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

export default function SaleForecastPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [forecastResponse, setForecastResponse] =
    useState<ForecastResponse | null>(null);
  const [legacyForecastData, setLegacyForecastData] = useState<
    LegacyForecastData[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const productsData = await productService.getAllProducts();
        setProducts(productsData);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);

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
    } catch (err) {
      setError('Failed to load forecast data');
      console.error('Error loading forecast:', err);
      setForecastResponse(null);
      setLegacyForecastData([]);
    } finally {
      setLoading(false);
    }
  };

  // Force refresh forecast (bypass cache)
  const handleForceRefresh = async () => {
    if (!selectedProductId) return;

    // Clear cache for selected product
    forecastService.clearCache(Number(selectedProductId));

    // Reload data
    await handleProductSelect(selectedProductId);
  };

  const selectedProduct = products.find(
    p => p.productId.toString() === selectedProductId
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStockOutInfo = () => {
    if (forecastResponse) {
      // New format
      return {
        date: formatDate(forecastResponse.metrics.estimated_stock_out_date),
        reorderQuantity: forecastResponse.metrics.reorder_quantity,
        currentStock: forecastResponse.metrics.current_stock,
        averageDailyDemand: forecastResponse.metrics.average_daily_demand,
        totalForecast30Days: forecastResponse.metrics.total_forecast_30_days,
        reorderNow: forecastResponse.recommendations.reorder_now,
        urgency: forecastResponse.recommendations.urgency,
      };
    } else if (legacyForecastData.length > 0) {
      // Legacy format
      const firstEntry = legacyForecastData[0];
      return {
        date: formatDate(firstEntry.stock_out_date),
        reorderQuantity: firstEntry.reorder_quantity,
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

  // Custom tooltip component
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: {
        month: string;
        sales: number;
        forecast: number;
        stockOut: number;
        lowerBound?: number;
        upperBound?: number;
        trend?: number;
        daily?: number;
        weekly?: number;
        stockOutDate?: string;
        reorderQuantity?: number;
      };
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const stockInfo = getStockOutInfo();

      return (
        <div className='bg-white p-4 border rounded-lg shadow-lg'>
          <p className='font-semibold text-gray-900 mb-2'>{`Date: ${label}`}</p>
          <div className='space-y-1 text-sm'>
            <p className='text-blue-600'>
              <span className='font-medium'>Forecast:</span> {data.forecast}{' '}
              units
            </p>
            <p className='text-gray-600'>
              <span className='font-medium'>Range:</span> {data.lowerBound} -{' '}
              {data.upperBound} units
            </p>

            {/* Show trend/seasonal data only for legacy format */}
            {legacyForecastData.length > 0 && data.trend !== undefined && (
              <>
                <p className='text-green-600'>
                  <span className='font-medium'>Trend:</span>{' '}
                  {data.trend > 0 ? '+' : ''}
                  {data.trend}
                </p>
                <p className='text-orange-600'>
                  <span className='font-medium'>Daily Effect:</span>{' '}
                  {data.daily}
                </p>
                <p className='text-purple-600'>
                  <span className='font-medium'>Weekly Effect:</span>{' '}
                  {data.weekly}
                </p>
              </>
            )}

            <hr className='my-2' />
            {data.stockOutDate && (
              <p className='text-red-600 font-medium'>
                Stock Out: {formatDate(data.stockOutDate)}
              </p>
            )}
            {data.reorderQuantity !== undefined && (
              <p className='text-indigo-600 font-medium'>
                Reorder Qty: {data.reorderQuantity} units
              </p>
            )}

            {/* Show additional metrics for new format */}
            {forecastResponse && stockInfo && (
              <>
                <hr className='my-2' />
                <p className='text-green-600 text-xs'>
                  <span className='font-medium'>Daily Demand:</span>{' '}
                  {stockInfo.averageDailyDemand} units/day
                </p>
                <p className='text-blue-600 text-xs'>
                  <span className='font-medium'>Current Stock:</span>{' '}
                  {stockInfo.currentStock} units
                </p>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

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
                disabled={productsLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      productsLoading
                        ? 'Loading products...'
                        : 'Select a product'
                    }
                  />
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
                size='sm'
                onClick={handleForceRefresh}
                disabled={loading}
                className='flex items-center gap-2'
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
                {forecastService.isCached(Number(selectedProductId))
                  ? 'Refresh'
                  : 'Load'}
              </Button>
            )}
          </div>

          {/* Cache Status Indicator */}
          {selectedProductId && (
            <div className='mt-3 text-sm text-muted-foreground'>
              {forecastService.isCached(Number(selectedProductId)) ? (
                <span className='text-green-600'>
                  ✅ Cached data (fast load) - Click refresh to retrain model
                </span>
              ) : (
                <span className='text-orange-600'>
                  ⏳ Will train model (may take time on first load)
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className='mb-6 border-destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className='flex items-center justify-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin mr-2' />
            <span>Loading forecast data...</span>
          </CardContent>
        </Card>
      )}

      {/* Forecast Results */}
      {!loading &&
        (forecastResponse || legacyForecastData.length > 0) &&
        selectedProduct && (
          <div className='space-y-6'>
            {/* Product Info and Key Metrics */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base'>
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <p className='font-medium'>{selectedProduct.name}</p>
                    <p className='text-sm text-muted-foreground'>
                      Current Stock: {selectedProduct.stock}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Price: ${selectedProduct.price}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {(() => {
                const stockOutInfo = getStockOutInfo();
                return stockOutInfo ? (
                  <Card>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-base flex items-center gap-2'>
                        <AlertCircle className='h-4 w-4' />
                        Stock Alert
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-2'>
                        <p className='text-sm'>Expected Stock Out:</p>
                        <p className='font-medium text-orange-600'>
                          {stockOutInfo.date}
                        </p>
                        <p className='text-sm'>Recommended Reorder:</p>
                        <p className='font-medium'>
                          {stockOutInfo.reorderQuantity} units
                        </p>

                        {/* Show additional metrics for new format */}
                        {forecastResponse &&
                          stockOutInfo.currentStock !== undefined && (
                            <>
                              <hr className='my-2' />
                              <p className='text-sm'>Current Stock:</p>
                              <p className='font-medium text-blue-600'>
                                {stockOutInfo.currentStock} units
                              </p>
                              <p className='text-sm'>Daily Demand:</p>
                              <p className='font-medium text-green-600'>
                                {stockOutInfo.averageDailyDemand} units/day
                              </p>
                              {stockOutInfo.reorderNow && (
                                <div className='mt-2 p-2 bg-red-50 rounded text-xs text-red-700'>
                                  ⚠️ Reorder recommended now! (Urgency:{' '}
                                  {stockOutInfo.urgency})
                                </div>
                              )}
                            </>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })()}

              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <TrendingUp className='h-4 w-4' />
                    Forecast Period
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <p className='text-sm'>From:</p>
                    <p className='font-medium'>
                      {forecastResponse
                        ? formatDate(forecastResponse.forecast_data[0]?.ds)
                        : formatDate(legacyForecastData[0]?.ds)}
                    </p>
                    <p className='text-sm'>To:</p>
                    <p className='font-medium'>
                      {forecastResponse
                        ? formatDate(
                            forecastResponse.forecast_data[
                              forecastResponse.forecast_data.length - 1
                            ]?.ds
                          )
                        : formatDate(
                            legacyForecastData[legacyForecastData.length - 1]
                              ?.ds
                          )}
                    </p>

                    {/* Show additional info for new format */}
                    {forecastResponse && (
                      <>
                        <hr className='my-2' />
                        <p className='text-sm'>Processing Time:</p>
                        <p className='font-medium text-green-600'>
                          {forecastResponse.processing_time.toFixed(2)}s
                        </p>
                        <p className='text-sm'>Confidence:</p>
                        <p className='font-medium text-blue-600'>
                          {(forecastResponse.confidence_interval * 100).toFixed(
                            0
                          )}
                          %
                        </p>
                        <div className='text-xs text-muted-foreground mt-1'>
                          {forecastResponse.cached
                            ? '💾 Served from cache'
                            : '🔄 Freshly generated'}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Forecast Data Graph */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5' />
                  Sales Forecast Chart
                </CardTitle>
                <CardDescription>
                  Interactive forecast visualization with detailed tooltips on
                  hover
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-96 w-full'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray='3 3' stroke='#e0e0e0' />
                      <XAxis
                        dataKey='date'
                        angle={-45}
                        textAnchor='end'
                        height={80}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        label={{
                          value: 'Forecast Sales',
                          angle: -90,
                          position: 'insideLeft',
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />

                      {/* Confidence Interval Area */}
                      <Line
                        type='monotone'
                        dataKey='lowerBound'
                        stroke='#3b82f6'
                        strokeWidth={1}
                        strokeDasharray='5 5'
                        dot={false}
                        strokeOpacity={0.5}
                      />
                      <Line
                        type='monotone'
                        dataKey='upperBound'
                        stroke='#3b82f6'
                        strokeWidth={1}
                        strokeDasharray='5 5'
                        dot={false}
                        strokeOpacity={0.5}
                      />

                      {/* Main Forecast Line */}
                      <Line
                        type='monotone'
                        dataKey='forecast'
                        stroke='#2563eb'
                        strokeWidth={3}
                        dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#1d4ed8' }}
                      />

                      {/* Trend Line */}
                      <Line
                        type='monotone'
                        dataKey='trend'
                        stroke='#10b981'
                        strokeWidth={2}
                        strokeDasharray='8 4'
                        dot={false}
                      />

                      {/* Zero Reference Line */}
                      <ReferenceLine
                        y={0}
                        stroke='#6b7280'
                        strokeDasharray='2 2'
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className='flex flex-wrap justify-center gap-6 mt-4 text-sm'>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-0.5 bg-blue-600'></div>
                    <span>Forecast</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-0.5 bg-green-500 border-dashed border-2 border-green-500'></div>
                    <span>Trend</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-0.5 bg-blue-400 border-dashed border-2 border-blue-400'></div>
                    <span>Confidence Interval</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Empty State */}
      {!loading && !selectedProductId && (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <TrendingUp className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-medium mb-2'>Select a Product</h3>
            <p className='text-muted-foreground text-center max-w-md'>
              Choose a product from the dropdown above to view its sales
              forecast and predictions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!loading &&
        selectedProductId &&
        !forecastResponse &&
        legacyForecastData.length === 0 &&
        !error && (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <AlertCircle className='h-12 w-12 text-muted-foreground mb-4' />
              <h3 className='text-lg font-medium mb-2'>No Forecast Data</h3>
              <p className='text-muted-foreground text-center max-w-md'>
                No forecast data is available for the selected product. This
                might be due to insufficient historical sales data.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
