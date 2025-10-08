import pandas as pd
from prophet import Prophet
from app.utils.db import get_db_connection
from datetime import datetime, timedelta
from app.config import LEAD_TIME, SAFETY_STOCK

def get_forecast_for_product(product_id: int):
    conn = get_db_connection()
    query = f"""
        SELECT DATE(o.order_date) AS ds, SUM(oi.quantity) AS y
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        WHERE oi.product_id = {product_id}
        GROUP BY DATE(o.order_date)
        ORDER BY ds
    """
    df = pd.read_sql(query, conn)
    conn.close()

    if df.empty:
        return {"error": "No sales data for this product"}

    model = Prophet(daily_seasonality=True)
    model.fit(df)

    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)

    # Example stock-out & reorder calculation
    current_stock = 50  # fetch from Product table dynamically
    
    # Calculate key metrics
    avg_demand = forecast['yhat'].mean()
    reorder_quantity = int(avg_demand * LEAD_TIME + SAFETY_STOCK)
    stock_out_date = datetime.today() + timedelta(days=LEAD_TIME)
    
    # Prepare forecast data for frontend (map Prophet fields to expected fields)
    forecast_tail = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper', 'trend']].tail(30)
    
    # Transform data to match frontend expectations
    forecast_records = []
    for _, row in forecast_tail.iterrows():
        forecast_records.append({
            "date": row['ds'].strftime('%Y-%m-%d') if hasattr(row['ds'], 'strftime') else str(row['ds']),
            "predicted_demand": round(row['yhat'], 2),
            "lower_bound": round(row['yhat_lower'], 2),
            "upper_bound": round(row['yhat_upper'], 2),
            "trend": round(row['trend'], 2),
            # Add backward compatibility
            "ds": row['ds'].strftime('%Y-%m-%d') if hasattr(row['ds'], 'strftime') else str(row['ds']),
            "yhat": round(row['yhat'], 2),
            "yhat_lower": round(row['yhat_lower'], 2),
            "yhat_upper": round(row['yhat_upper'], 2)
        })
    
    # Return structured forecast data (dictionary, not list)
    return {
        "product_id": product_id,
        "forecast_data": forecast_records,
        "metrics": {
            "average_daily_demand": round(avg_demand, 2),
            "total_forecast_30_days": round(forecast['yhat'].tail(30).sum(), 2),
            "reorder_quantity": reorder_quantity,
            "current_stock": current_stock,
            "estimated_stock_out_date": stock_out_date.isoformat()
        },
        "recommendations": {
            "reorder_now": current_stock < reorder_quantity,
            "urgency": "high" if current_stock < avg_demand * 7 else "normal"
        }
    }
