#!/bin/bash

# Google Cloud Run Deployment Script for Order Service
# Make sure to set your environment variables before running this script

set -e  # Exit on any error

# Configuration
PROJECT_ID="api-gateway-474511"
SERVICE_NAME="orderservice"
REGION="us-central1"  # Change this to your preferred region
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
PORT=8080

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting deployment of Order Service to Google Cloud Run${NC}"
echo -e "${BLUE}Project ID: ${PROJECT_ID}${NC}"
echo -e "${BLUE}Service Name: ${SERVICE_NAME}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"

# Check if required tools are installed
echo -e "\n${YELLOW}📋 Checking prerequisites...${NC}"
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed. Please install it first.${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install it first.${NC}"
    exit 1
fi

# Authenticate and set project
echo -e "\n${YELLOW}🔐 Setting up Google Cloud project...${NC}"
gcloud config set project ${PROJECT_ID}
gcloud auth configure-docker

# Enable required APIs
echo -e "\n${YELLOW}🔧 Enabling required Google Cloud APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build the Docker image
echo -e "\n${YELLOW}🏗️ Building Docker image...${NC}"
docker build -t ${IMAGE_NAME}:latest .

# Push the image to Google Container Registry
echo -e "\n${YELLOW}📤 Pushing image to Google Container Registry...${NC}"
docker push ${IMAGE_NAME}:latest

# Deploy to Cloud Run
echo -e "\n${YELLOW}🚀 Deploying to Google Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --port ${PORT} \
  --allow-unauthenticated \
  --set-env-vars "SPRING_PROFILES_ACTIVE=cloud" \
  --set-env-vars "PORT=${PORT}" \
  --set-env-vars "DATABASE_URL=${DATABASE_URL:-jdbc:mysql://avnadmin:AVNS_Ipqzq0kuyRjWpAdm_pc@mysql-38838f7f-sem5-project.f.aivencloud.com:27040/InventoryManagement?ssl-mode=REQUIRED}" \
  --set-env-vars "DATABASE_USERNAME=${DATABASE_USERNAME:-avnadmin}" \
  --set-env-vars "DATABASE_PASSWORD=${DATABASE_PASSWORD:-AVNS_Ipqzq0kuyRjWpAdm_pc}" \
  --set-env-vars "KAFKA_BOOTSTRAP_SERVERS=${KAFKA_BOOTSTRAP_SERVERS:-localhost:9092}" \
  --set-env-vars "KAFKA_CONSUMER_GROUP_ID=${KAFKA_CONSUMER_GROUP_ID:-order-service-group}" \
  --set-env-vars "USER_SERVICE_URL=${USER_SERVICE_URL:-http://localhost:8080}" \
  --set-env-vars "STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-sk_test_51RruEkCMSVvAbN0Rd6H8EBCbzMQ7E3RXK7Icea1YwqlZncUXhCN1paovgMSTIFdnKiE3MwEWiA6cIRbcRXB2uTiE00JAGGuoSR}" \
  --set-env-vars "STRIPE_API_KEY=${STRIPE_API_KEY:-sk_test_51RruEkCMSVvAbN0Rd6H8EBCbzMQ7E3RXK7Icea1YwqlZncUXhCN1paovgMSTIFdnKiE3MwEWiA6cIRbcRXB2uTiE00JAGGuoSR}" \
  --set-env-vars "STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-whsec_YOUR_WEBHOOK_SECRET_HERE}" \
  --set-env-vars "JPA_SHOW_SQL=${JPA_SHOW_SQL:-false}" \
  --set-env-vars "JPA_DDL_AUTO=${JPA_DDL_AUTO:-update}" \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --concurrency 80

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Service URL: ${SERVICE_URL}${NC}"
echo -e "${GREEN}📊 Health Check: ${SERVICE_URL}/actuator/health${NC}"

# Test the health endpoint
echo -e "\n${YELLOW}🏥 Testing health endpoint...${NC}"
if curl -f "${SERVICE_URL}/actuator/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${YELLOW}⚠️ Health check failed or service is still starting up...${NC}"
    echo -e "${YELLOW}Please wait a few minutes and check manually: ${SERVICE_URL}/actuator/health${NC}"
fi

echo -e "\n${BLUE}📝 Next Steps:${NC}"
echo -e "1. Update your Kafka configuration with the actual Kafka bootstrap servers"
echo -e "2. Update USER_SERVICE_URL with the actual user service URL"
echo -e "3. Configure your Stripe keys properly"
echo -e "4. Test all endpoints to ensure everything works correctly"

echo -e "\n${BLUE}🔧 To update environment variables later, use:${NC}"
echo -e "gcloud run services update ${SERVICE_NAME} --region ${REGION} --set-env-vars KEY=VALUE"

echo -e "\n${BLUE}📋 To view logs:${NC}"
echo -e "gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=${SERVICE_NAME}\" --limit 50 --format=\"table(timestamp,textPayload)\""