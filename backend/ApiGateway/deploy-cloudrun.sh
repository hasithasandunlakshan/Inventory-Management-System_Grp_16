#!/bin/bash

# Google Cloud Run Deployment Script for API Gateway
echo "=== Google Cloud Run Deployment Script ==="

# Set your project variables
PROJECT_ID="your-gcp-project-id"
SERVICE_NAME="api-gateway"
REGION="us-central1"  # Change to your preferred region
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "Project ID: $PROJECT_ID"
echo "Service Name: $SERVICE_NAME"
echo "Region: $REGION"
echo "Image Name: $IMAGE_NAME"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: Google Cloud SDK is not installed."
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed."
    echo "Please install Docker first."
    exit 1
fi

# Authenticate with Google Cloud (if not already done)
echo "Checking Google Cloud authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "Please authenticate with Google Cloud:"
    gcloud auth login
fi

# Set the project
echo "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "Enabling required Google Cloud APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Configure Docker to use gcloud as a credential helper
echo "Configuring Docker authentication..."
gcloud auth configure-docker

# Build the Docker image using Cloud Build (recommended for Cloud Run)
echo "Building Docker image using Google Cloud Build..."
gcloud builds submit --tag $IMAGE_NAME --file Dockerfile.cloudrun .

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars="SPRING_PROFILES_ACTIVE=cloudrun" \
    --set-env-vars="JWT_SECRET=mySecretKeyForJWTTokenGenerationAndValidationThatIsAtLeast512BitsLongToMeetHS512AlgorithmRequirementsForSecureTokenSigning" \
    --memory="1Gi" \
    --cpu="1" \
    --concurrency="80" \
    --timeout="300" \
    --max-instances="10" \
    --min-instances="0"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo "=== Deployment Complete ==="
echo "Service URL: $SERVICE_URL"
echo "Health Check: $SERVICE_URL/actuator/health"
echo ""
echo "Useful commands:"
echo "  - View logs: gcloud run logs tail --service=$SERVICE_NAME --region=$REGION"
echo "  - Update service: gcloud run services update $SERVICE_NAME --region=$REGION"
echo "  - Delete service: gcloud run services delete $SERVICE_NAME --region=$REGION"