export interface ForecastData {
  ds: string; // Date string in ISO format
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
  yhat: number; // Predicted value
  stock_out_date: string;
  reorder_quantity: number;
}

export interface ForecastResponse extends Array<ForecastData> {}

export interface ProductForecast {
  productId: number;
  productName: string;
  data: ForecastData[];
}
