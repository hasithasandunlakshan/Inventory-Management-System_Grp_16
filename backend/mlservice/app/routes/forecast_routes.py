from fastapi import APIRouter
from typing import List
from app.services.forecast_service import get_forecast_for_product

router = APIRouter()

@router.get("/{product_id}")
def forecast_product(product_id: int):
    return get_forecast_for_product(product_id)
