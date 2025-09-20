from fastapi import FastAPI
from app.routes import forecast_routes

app = FastAPI(title="Inventory Forecasting Service")

app.include_router(forecast_routes.router, prefix="/forecast")
