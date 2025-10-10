import { ForecastResponse, LegacyForecastData } from '../types/forecast';

const FORECAST_API_BASE_URL = 'http://localhost:8000';

// In-memory cache for forecast data
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const forecastCache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

export const forecastService = {
  async getForecastByProductId(
    productId: number,
    cacheTTL: number = DEFAULT_TTL
  ): Promise<ForecastResponse | LegacyForecastData[]> {
    const cacheKey = `forecast_${productId}`;
    const now = Date.now();

    // Check cache first
    const cached = forecastCache.get(cacheKey);
    if (cached && now - cached.timestamp < cached.ttl) {
      console.log(
        `🎯 Cache hit for product ${productId} (cached: ${cached.data.cached || 'unknown'})`
      );
      return cached.data;
    }

    try {
      console.log(
        `🔄 Cache miss - fetching forecast for product ${productId} (may trigger model training)`
      );
      const response = await fetch(
        `${FORECAST_API_BASE_URL}/forecast/${productId}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch forecast: ${response.status} ${response.statusText}`
        );
      }

      const rawData = await response.json();

      // Store full response in cache
      forecastCache.set(cacheKey, {
        data: rawData,
        timestamp: now,
        ttl: cacheTTL,
      });

      console.log(
        `💾 Cached forecast for product ${productId} for ${cacheTTL / 1000 / 60} minutes (processing time: ${rawData.processing_time || 'unknown'}s)`
      );
      return rawData;
    } catch (error) {
      console.error('Failed to fetch forecast from backend:', error);
      throw new Error('Failed to fetch forecast - backend not available');
    }
  },

  // Clear cache for a specific product
  clearCache(productId: number): void {
    const cacheKey = `forecast_${productId}`;
    const deleted = forecastCache.delete(cacheKey);
    if (deleted) {
      console.log(`🗑️ Cleared cache for product ${productId}`);
    }
  },

  // Clear all cache
  clearAllCache(): void {
    const size = forecastCache.size;
    forecastCache.clear();
    console.log(`🗑️ Cleared all forecast cache (${size} entries)`);
  },

  // Get cache information for debugging
  getCacheInfo() {
    const now = Date.now();
    return Array.from(forecastCache.entries()).map(([key, value]) => ({
      key,
      productId: key.replace('forecast_', ''),
      cachedAt: new Date(value.timestamp).toLocaleString(),
      ttl: `${value.ttl / 1000 / 60} minutes`,
      remainingTime: Math.max(0, value.ttl - (now - value.timestamp)),
      remainingMinutes: Math.max(
        0,
        Math.round((value.ttl - (now - value.timestamp)) / 1000 / 60)
      ),
      isExpired: now - value.timestamp >= value.ttl,
    }));
  },

  // Check if a product forecast is cached and valid
  isCached(productId: number): boolean {
    const cacheKey = `forecast_${productId}`;
    const cached = forecastCache.get(cacheKey);
    if (!cached) return false;

    const now = Date.now();
    return now - cached.timestamp < cached.ttl;
  },
};
