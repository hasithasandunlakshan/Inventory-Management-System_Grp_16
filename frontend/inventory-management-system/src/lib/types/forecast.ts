export interface ForecastDataPoint {
  ds: string; // Date string
  yhat: number; // Predicted value
  yhat_lower: number;
  yhat_upper: number;
}

export interface ForecastMetrics {
  average_daily_demand: number;
  total_forecast_30_days: number;
  reorder_quantity: number;
  current_stock: number;
  estimated_stock_out_date: string;
}

export interface ForecastRecommendations {
  reorder_now: boolean;
  urgency: 'low' | 'normal' | 'high' | 'critical';
}

export interface ForecastResponse {
  product_id: number;
  forecast_data: ForecastDataPoint[];
  metrics: ForecastMetrics;
  recommendations: ForecastRecommendations;
  forecast_days: number;
  confidence_interval: number;
  processing_time: number;
  cached: boolean;
  cache_key: string;
  served_at: number;
}

// Legacy support for old format
export interface LegacyForecastData {
  ds: string;
  trend: number;
  yhat_lower: number;
  yhat_upper: number;
  trend_lower: number;
  trend_upper: number;
  additive_terms: number;
  additive_terms_lower: number;
  additive_terms_upper: number;
  daily: number;
  daily_lower: number;
  daily_upper: number;
  weekly: number;
  weekly_lower: number;
  weekly_upper: number;
  multiplicative_terms: number;
  multiplicative_terms_lower: number;
  multiplicative_terms_upper: number;
  yhat: number;
  stock_out_date: string;
  reorder_quantity: number;
}

export interface ProductForecast {
  productId: number;
  productName: string;
  data: ForecastDataPoint[];
  metrics?: ForecastMetrics;
  recommendations?: ForecastRecommendations;
}
