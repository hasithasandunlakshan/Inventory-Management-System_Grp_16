# Google Cloud Run Deployment Script for UserService (PowerShell)
# Project ID: api-gateway-474511

param(
    [string]$Region = "us-central1"
)

$PROJECT_ID = "api-gateway-474511"
$SERVICE_NAME = "userservice"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

Write-Host "=== Google Cloud Run Deployment Script ===" -ForegroundColor Green
Write-Host "Project ID: $PROJECT_ID"
Write-Host "Service Name: $SERVICE_NAME"
Write-Host "Region: $Region"
Write-Host "Image: $IMAGE_NAME"

# Check if gcloud is authenticated
Write-Host "Checking Google Cloud authentication..." -ForegroundColor Yellow
$activeAccount = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
if (-not $activeAccount) {
    Write-Host "Please authenticate with Google Cloud first:" -ForegroundColor Red
    Write-Host "gcloud auth login"
    exit 1
}

# Set the project
Write-Host "Setting project to $PROJECT_ID..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

# Enable required APIs
Write-Host "Enabling required Google Cloud APIs..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and push the Docker image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t ${IMAGE_NAME}:latest .

Write-Host "Configuring Docker for Google Cloud..." -ForegroundColor Yellow
gcloud auth configure-docker

Write-Host "Pushing Docker image to Google Container Registry..." -ForegroundColor Yellow
docker push ${IMAGE_NAME}:latest

# Deploy to Cloud Run
Write-Host "Deploying to Google Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $SERVICE_NAME `
  --image ${IMAGE_NAME}:latest `
  --platform managed `
  --region $Region `
  --allow-unauthenticated `
  --port 8080 `
  --memory 1Gi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --timeout 300s `
  --concurrency 100 `
  --set-env-vars "SPRING_PROFILES_ACTIVE=production" `
  --set-env-vars "SERVER_PORT=8080" `
  --set-env-vars "SPRING_DATASOURCE_URL=jdbc:mysql://mysql-38838f7f-sem5-project.f.aivencloud.com:27040/InventoryManagement?sslMode=REQUIRED&serverTimezone=UTC&tcpKeepAlive=true" `
  --set-env-vars "SPRING_DATASOURCE_USERNAME=avnadmin" `
  --set-env-vars "SPRING_DATASOURCE_PASSWORD=AVNS_Ipqzq0kuyRjWpAdm_pc" `
  --set-env-vars "JWT_SECRET=mySecretKeyForJWTTokenGenerationAndValidationThatIsAtLeast512BitsLongToMeetHS512AlgorithmRequirementsForSecureTokenSigning" `
  --set-env-vars "JWT_EXPIRATION=86400000"

# Get the service URL
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --platform managed --region $Region --format 'value(status.url)'

Write-Host "=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Service URL: $SERVICE_URL" -ForegroundColor Cyan
Write-Host "Health Check: $SERVICE_URL/actuator/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "gcloud logs tail --follow --format=json --filter=`"resource.labels.service_name=$SERVICE_NAME`""
Write-Host ""
Write-Host "To update the service:" -ForegroundColor Yellow
Write-Host "gcloud run services replace cloudrun-service.yaml --region $Region"