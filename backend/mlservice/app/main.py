from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import forecast_routes

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
def health_check():
    return {"status": "healthy", "service": "ml-forecasting"}

app.include_router(forecast_routes.router, prefix="/forecast")
