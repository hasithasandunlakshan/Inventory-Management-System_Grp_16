#!/bin/bash
# Deployment script for ML Forecast Service to Google Cloud Run

set -e

# Configuration
PROJECT_ID="api-gateway-474511"
SERVICE_NAME="ml-forecast-service"
REGION="us-central1"  # Change if needed
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying ML Forecast Service to Google Cloud Run"
echo "Project: ${PROJECT_ID}"
echo "Service: ${SERVICE_NAME}"
echo "Region: ${REGION}"
echo "Image: ${IMAGE_NAME}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set the project
echo "📋 Setting project..."
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build the Docker image
echo "🏗️  Building Docker image..."
gcloud builds submit --tag ${IMAGE_NAME}

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --port 8080 \
    --memory 4Gi \
    --cpu 2 \
    --max-instances 10 \
    --min-instances 0 \
    --timeout 300 \
    --concurrency 10 \
    --set-env-vars="REDIS_URL=redis://default:gQTgc94xp1OT2hILBizHmNmzI5a8Np3d@redis-18634.c321.us-east-1-2.ec2.redns.redis-cloud.com:18634"

echo "✅ Deployment completed!"

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")
echo "🌐 Service URL: ${SERVICE_URL}"

# Test the deployment
echo "🧪 Testing deployment..."
curl -s "${SERVICE_URL}/health" | jq '.' || echo "Service is starting up..."

echo ""
echo "🎉 ML Forecast Service is now deployed!"
echo "📊 Health Check: ${SERVICE_URL}/health"
echo "📚 API Docs: ${SERVICE_URL}/docs"
echo "🔍 Forecast API: ${SERVICE_URL}/forecast/{product_id}"