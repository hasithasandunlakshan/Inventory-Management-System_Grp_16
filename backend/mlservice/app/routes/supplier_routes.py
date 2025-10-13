from fastapi import APIRouter, HTTPException, Query
from typing import Dict
from app.services.cache_service import cache_service
from app.services.supplier_model_service import predict_supplier_performance
import logging

router = APIRouter(prefix="/supplier", tags=["supplier"])
logger = logging.getLogger(__name__)

@router.post("/predict/{supplier_id}")
async def predict_supplier(
    supplier_id: int,
    features: Dict,
    force_refresh: bool = Query(False, description="Force cache refresh")
):
    """Get supplier performance prediction with caching"""
    try:
        # Generate cache key
        cache_key = f"supplier_pred_{supplier_id}"
        
        # Check cache first (unless force refresh)
        if not force_refresh:
            cached = await cache_service.get_cached_forecast(cache_key)
            if cached:
                logger.info(f"Cache hit for supplier {supplier_id}")
                return cached

        # Get prediction
        prediction = predict_supplier_performance(features)
        
        # Cache the result
        await cache_service.set_cached_forecast(cache_key, prediction)
        
        return prediction
        
    except Exception as e:
        logger.error(f"Prediction failed for supplier {supplier_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")