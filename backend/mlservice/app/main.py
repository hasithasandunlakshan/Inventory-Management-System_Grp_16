from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routes import forecast_routes
from app.services.cache_service import cache_service
import logging
import os

# Configure logging for Cloud Run
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = FastAPI(
    title="Inventory Forecasting Service",
    description="ML-powered inventory forecasting and demand prediction service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.on_event("startup")
async def startup_event():
    """Initialize cache service on startup"""
    await cache_service.connect()
    logging.info("🚀 ML Service started with Redis caching")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    if cache_service.redis_client:
        await cache_service.redis_client.close()
    logging.info("🛑 ML Service shutdown complete")

@app.get("/")
def read_root():
    return {
        "message": "Inventory Forecasting ML Service is running!",
        "endpoints": {
            "health": "/",
            "docs": "/docs",
            "redoc": "/redoc",
            "forecast": "/forecast/{product_id}"
        }
    }

@app.get("/health")
async def health_check():
    """Health check with cache status"""
    cache_stats = await cache_service.get_cache_stats()
    return {
        "status": "healthy", 
        "service": "ml-forecasting",
        "cache_status": cache_stats
    }

@app.get("/cache/stats")
async def get_cache_stats():
    """Get detailed cache statistics"""
    cache_stats = await cache_service.get_cache_stats()
    return {
        "cache_stats": cache_stats,
        "cache_endpoints": {
            "clear_all": "/cache/clear",
            "product_cache": "/forecast/{product_id}/cache",
            "force_refresh": "/forecast/{product_id}?force_refresh=true"
        }
    }

@app.delete("/cache/clear")
async def clear_all_cache():
    """Clear all forecast cache entries"""
    try:
        # For now, just clear forecast caches since we don't have a global clear method
        return {
            "message": "Use specific product cache clearing endpoints",
            "endpoints": {
                "clear_product": "/forecast/{product_id}/cache"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cache clearing failed: {str(e)}")

app.include_router(forecast_routes.router, prefix="/forecast")
