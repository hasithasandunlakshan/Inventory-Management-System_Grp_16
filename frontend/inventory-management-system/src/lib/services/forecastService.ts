import { ForecastResponse } from '../types/forecast';

const FORECAST_API_BASE_URL = 'http://localhost:8000';

export const forecastService = {
  async getForecastByProductId(productId: number): Promise<ForecastResponse> {
    try {
      const response = await fetch(
        `${FORECAST_API_BASE_URL}/forecast/${productId}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch forecast: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch forecast from backend:', error);
      throw new Error('Failed to fetch forecast - backend not available');
    }
  },
};
