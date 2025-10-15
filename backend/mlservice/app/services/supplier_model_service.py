import joblib
from typing import Dict
import logging
import os

logger = logging.getLogger(__name__)

# Model path in Cloud Storage
MODEL_BUCKET = "inventory-ml-models"
MODEL_PATH = "supplier/supplier_performance_model.pkl"

# Load model from Cloud Storage
def load_model():
    try:
        from google.cloud import storage
        
        client = storage.Client()
        bucket = client.bucket(MODEL_BUCKET)
        blob = bucket.blob(MODEL_PATH)
        
        # Download to temp file
        local_path = "/tmp/supplier_model.pkl"
        blob.download_to_filename(local_path)
        
        # Load model
        model = joblib.load(local_path)
        logger.info("Successfully loaded supplier model from Cloud Storage")
        return model
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        raise

def predict_supplier_performance(features: Dict) -> Dict:
    """Make prediction using the supplier performance model"""
    try:
        # Lazy load model if not already loaded
        if not hasattr(predict_supplier_performance, "model"):
            predict_supplier_performance.model = load_model()
            
        # Preprocess features
        # TODO: Add feature preprocessing logic here
        
        # Make prediction
        prediction = predict_supplier_performance.model.predict([features])[0]
        
        return {
            "performance_score": float(prediction),
            "features_used": features,
            "model_version": "1.0.0"
        }
        
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise