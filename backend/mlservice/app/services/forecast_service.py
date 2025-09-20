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
    forecast['stock_out_date'] = datetime.today() + timedelta(days=LEAD_TIME)
    forecast['reorder_quantity'] = int(forecast['yhat'].mean() * LEAD_TIME + SAFETY_STOCK)

    return forecast.to_dict('records')
