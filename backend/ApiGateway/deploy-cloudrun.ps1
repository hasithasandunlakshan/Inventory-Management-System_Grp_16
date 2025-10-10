# Google Cloud Run Deployment Script (PowerShell)
# API Gateway with Order Service Integration

# Set your project variables
$PROJECT_ID = "api-gateway-474511"
$SERVICE_NAME = "api-gateway"
$REGION = "us-central1"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

Write-Host "=== Google Cloud Run Deployment ===" -ForegroundColor Green
Write-Host "Project ID: $PROJECT_ID" -ForegroundColor Yellow
Write-Host "Service Name: $SERVICE_NAME" -ForegroundColor Yellow
Write-Host "Region: $REGION" -ForegroundColor Yellow

# Check if gcloud is installed
try {
    gcloud version
    Write-Host "Google Cloud SDK is installed" -ForegroundColor Green
} catch {
    Write-Host "Error: Google Cloud SDK is not installed." -ForegroundColor Red
    Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}

# Authenticate with Google Cloud
Write-Host "Authenticating with Google Cloud..." -ForegroundColor Blue
gcloud auth login

# Set the project
Write-Host "Setting project..." -ForegroundColor Blue
gcloud config set project $PROJECT_ID

# Enable required APIs
Write-Host "Enabling required APIs..." -ForegroundColor Blue
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Configure Docker authentication
Write-Host "Configuring Docker authentication..." -ForegroundColor Blue
gcloud auth configure-docker

# Build and deploy using Cloud Build
Write-Host "Building and deploying to Cloud Run..." -ForegroundColor Blue
gcloud builds submit --tag $IMAGE_NAME .

# Deploy to Cloud Run
Write-Host "Deploying service..." -ForegroundColor Blue
gcloud run deploy $SERVICE_NAME `
    --image $IMAGE_NAME `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --set-env-vars "SPRING_PROFILES_ACTIVE=cloudrun" `
    --set-env-vars "JWT_SECRET=mySecretKeyForJWTTokenGenerationAndValidationThatIsAtLeast512BitsLongToMeetHS512AlgorithmRequirementsForSecureTokenSigning" `
    --set-env-vars "USER_SERVICE_URL=https://userservice-337812374841.us-central1.run.app" `
    --set-env-vars "PRODUCT_SERVICE_URL=https://product-service-337812374841.us-central1.run.app" `
    --set-env-vars "ORDER_SERVICE_URL=https://orderservice-337812374841.us-central1.run.app" `
    --set-env-vars "SUPPLIER_SERVICE_URL=https://supplier-service-337812374841.us-central1.run.app" `
    --set-env-vars "INVENTORY_SERVICE_URL=https://inventory-service-337812374841.us-central1.run.app" `
    --set-env-vars "RESOURCE_SERVICE_URL=https://resource-service-337812374841.us-central1.run.app" `
    --set-env-vars "HEALTH_SERVICE_URL=https://api-gateway-337812374841.us-central1.run.app" `
    --memory "1Gi" `
    --cpu "1" `
    --concurrency "80" `
    --timeout "300" `
    --max-instances "10" `
    --min-instances "0"

# Get service URL
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)"

Write-Host "=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Service URL: $SERVICE_URL" -ForegroundColor Cyan
Write-Host "Health Check: $SERVICE_URL/actuator/health" -ForegroundColor Cyan
Write-Host "Gateway Health: $SERVICE_URL/gateway/health" -ForegroundColor Cyan