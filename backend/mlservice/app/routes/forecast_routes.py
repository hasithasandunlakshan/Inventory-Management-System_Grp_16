from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.forecast_service import get_forecast_for_product
from app.services.cache_service import cache_service
import time
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/{product_id}")
async def forecast_product(
    product_id: int,
    days: int = Query(30, ge=1, le=365, description="Number of days to forecast"),
    confidence_interval: float = Query(0.95, ge=0.8, le=0.99, description="Confidence interval"),
    force_refresh: bool = Query(False, description="Force cache refresh")
):
    """Get inventory forecast with intelligent Redis caching"""
    
    try:
        # Generate cache key based on parameters
        params = {
            "days": days, 
            "confidence_interval": confidence_interval
        }
        cache_key = cache_service.generate_cache_key(str(product_id), params)
        
        # Check cache first (unless force refresh is requested)
        if not force_refresh:
            cached_result = await cache_service.get_cached_forecast(cache_key)
            if cached_result:
                cached_result["cached"] = True
                cached_result["cache_key"] = cache_key
                cached_result["served_at"] = time.time()
                return cached_result
        
        # Cache miss - generate forecast
        start_time = time.time()
        logger.info(f"🔄 Generating forecast for product {product_id}")
        
        # Call the original forecast service
        forecast_data = get_forecast_for_product(product_id)
        
        # Enhance the result with caching metadata
        processing_time = round(time.time() - start_time, 3)
        
        # Check if frontend expects just the forecast array
        if isinstance(forecast_data.get('forecast_data'), list):
            # Return in frontend-compatible format
            enhanced_result = {
                "forecast_data": forecast_data['forecast_data'],  # Array for .map()
                "product_id": product_id,
                "forecast_days": days,
                "confidence_interval": confidence_interval,
                "metrics": forecast_data.get('metrics', {}),
                "recommendations": forecast_data.get('recommendations', {}),
            "processing_time": processing_time,
            "cached": False,
            "cache_key": cache_key,
            "served_at": time.time()
        }
        
        # Cache the result with appropriate TTL
        cache_ttl = cache_service.calculate_ttl(days)
        await cache_service.set_cached_forecast(cache_key, enhanced_result, cache_ttl)
        
        return enhanced_result
        
    except Exception as e:
        logger.error(f"❌ Forecast generation failed for product {product_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")

@router.delete("/{product_id}/cache")
async def clear_product_cache(product_id: int):
    """Clear all cached forecasts for a specific product"""
    try:
        deleted_count = await cache_service.invalidate_product_cache(str(product_id))
        return {
            "message": f"Cache cleared for product {product_id}",
            "deleted_entries": deleted_count
        }
    except Exception as e:
        logger.error(f"❌ Cache clearing failed for product {product_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cache clearing failed: {str(e)}")

@router.get("/{product_id}/cache/status")
async def get_cache_status(product_id: int):
    """Get cache status for a specific product"""
    try:
        cache_stats = await cache_service.get_cache_stats()
        return {
            "product_id": product_id,
            "cache_stats": cache_stats,
            "cache_backend": "Redis with in-memory fallback"
        }
    except Exception as e:
        logger.error(f"❌ Cache status check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cache status check failed: {str(e)}")

@router.get("/cache/stats")
async def get_overall_cache_stats():
    """Get overall cache statistics"""
    try:
        stats = await cache_service.get_cache_stats()
        return {
            "cache_stats": stats,
            "endpoints": {
                "clear_product_cache": "/forecast/{product_id}/cache",
                "get_product_cache_status": "/forecast/{product_id}/cache/status",
                "force_refresh": "/forecast/{product_id}?force_refresh=true"
            }
        }
    except Exception as e:
        logger.error(f"❌ Cache stats retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cache stats retrieval failed: {str(e)}")
