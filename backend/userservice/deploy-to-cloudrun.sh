#!/bin/bash

# Google Cloud Run Deployment Script for UserService
# Project ID: api-gateway-474511

set -e

PROJECT_ID="api-gateway-474511"
SERVICE_NAME="userservice"
REGION="us-central1"  # Change this to your preferred region
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "=== Google Cloud Run Deployment Script ==="
echo "Project ID: $PROJECT_ID"
echo "Service Name: $SERVICE_NAME"
echo "Region: $REGION"
echo "Image: $IMAGE_NAME"

# Check if gcloud is authenticated
echo "Checking Google Cloud authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "Please authenticate with Google Cloud first:"
    echo "gcloud auth login"
    exit 1
fi

# Set the project
echo "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "Enabling required Google Cloud APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and push the Docker image
echo "Building Docker image..."
docker build -t $IMAGE_NAME:latest .

echo "Configuring Docker for Google Cloud..."
gcloud auth configure-docker

echo "Pushing Docker image to Google Container Registry..."
docker push $IMAGE_NAME:latest

# Deploy to Cloud Run
echo "Deploying to Google Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300s \
  --concurrency 100 \
  --set-env-vars "SPRING_PROFILES_ACTIVE=production" \
  --set-env-vars "SERVER_PORT=8080" \
  --set-env-vars "SPRING_DATASOURCE_URL=jdbc:mysql://mysql-38838f7f-sem5-project.f.aivencloud.com:27040/InventoryManagement?sslMode=REQUIRED&serverTimezone=UTC&tcpKeepAlive=true" \
  --set-env-vars "SPRING_DATASOURCE_USERNAME=avnadmin" \
  --set-env-vars "SPRING_DATASOURCE_PASSWORD=AVNS_Ipqzq0kuyRjWpAdm_pc" \
  --set-env-vars "JWT_SECRET=mySecretKeyForJWTTokenGenerationAndValidationThatIsAtLeast512BitsLongToMeetHS512AlgorithmRequirementsForSecureTokenSigning" \
  --set-env-vars "JWT_EXPIRATION=86400000"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

echo "=== Deployment Complete ==="
echo "Service URL: $SERVICE_URL"
echo "Health Check: $SERVICE_URL/actuator/health"
echo ""
echo "To view logs:"
echo "gcloud logs tail --follow --format=json --filter=\"resource.labels.service_name=$SERVICE_NAME\""
echo ""
echo "To update the service:"
echo "gcloud run services replace cloudrun-service.yaml --region $REGION"