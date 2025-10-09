# Google Cloud Run Deployment Script for Order Service (PowerShell)
# Make sure to set your environment variables before running this script

param(
    [string]$ProjectId = "api-gateway-474511",
    [string]$ServiceName = "orderservice",
    [string]$Region = "us-central1",
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

# Configuration
$ImageName = "gcr.io/$ProjectId/$ServiceName"

Write-Host "🚀 Starting deployment of Order Service to Google Cloud Run" -ForegroundColor Blue
Write-Host "Project ID: $ProjectId" -ForegroundColor Blue
Write-Host "Service Name: $ServiceName" -ForegroundColor Blue
Write-Host "Region: $Region" -ForegroundColor Blue

# Check if required tools are installed
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow

try {
    gcloud --version | Out-Null
} catch {
    Write-Host "❌ gcloud CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Authenticate and set project
Write-Host "`n🔐 Setting up Google Cloud project..." -ForegroundColor Yellow
gcloud config set project $ProjectId
gcloud auth configure-docker

# Enable required APIs
Write-Host "`n🔧 Enabling required Google Cloud APIs..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build the Docker image
Write-Host "`n🏗️ Building Docker image..." -ForegroundColor Yellow
docker build -t "${ImageName}:latest" .

# Push the image to Google Container Registry
Write-Host "`n📤 Pushing image to Google Container Registry..." -ForegroundColor Yellow
docker push "${ImageName}:latest"

# Get environment variables with defaults
$DatabaseUrl = if ($env:DATABASE_URL) { $env:DATABASE_URL } else { "jdbc:mysql://avnadmin:AVNS_Ipqzq0kuyRjWpAdm_pc@mysql-38838f7f-sem5-project.f.aivencloud.com:27040/InventoryManagement?ssl-mode=REQUIRED" }
$DatabaseUsername = if ($env:DATABASE_USERNAME) { $env:DATABASE_USERNAME } else { "avnadmin" }
$DatabasePassword = if ($env:DATABASE_PASSWORD) { $env:DATABASE_PASSWORD } else { "AVNS_Ipqzq0kuyRjWpAdm_pc" }
$KafkaBootstrapServers = if ($env:KAFKA_BOOTSTRAP_SERVERS) { $env:KAFKA_BOOTSTRAP_SERVERS } else { "localhost:9092" }
$KafkaConsumerGroupId = if ($env:KAFKA_CONSUMER_GROUP_ID) { $env:KAFKA_CONSUMER_GROUP_ID } else { "order-service-group" }
$UserServiceUrl = if ($env:USER_SERVICE_URL) { $env:USER_SERVICE_URL } else { "http://localhost:8080" }
$StripeSecretKey = if ($env:STRIPE_SECRET_KEY) { $env:STRIPE_SECRET_KEY } else { "sk_test_51RruEkCMSVvAbN0Rd6H8EBCbzMQ7E3RXK7Icea1YwqlZncUXhCN1paovgMSTIFdnKiE3MwEWiA6cIRbcRXB2uTiE00JAGGuoSR" }
$StripeApiKey = if ($env:STRIPE_API_KEY) { $env:STRIPE_API_KEY } else { "sk_test_51RruEkCMSVvAbN0Rd6H8EBCbzMQ7E3RXK7Icea1YwqlZncUXhCN1paovgMSTIFdnKiE3MwEWiA6cIRbcRXB2uTiE00JAGGuoSR" }
$StripeWebhookSecret = if ($env:STRIPE_WEBHOOK_SECRET) { $env:STRIPE_WEBHOOK_SECRET } else { "whsec_YOUR_WEBHOOK_SECRET_HERE" }
$JpaShowSql = if ($env:JPA_SHOW_SQL) { $env:JPA_SHOW_SQL } else { "false" }
$JpaDdlAuto = if ($env:JPA_DDL_AUTO) { $env:JPA_DDL_AUTO } else { "update" }

# Deploy to Cloud Run
Write-Host "`n🚀 Deploying to Google Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
  --image "${ImageName}:latest" `
  --platform managed `
  --region $Region `
  --port $Port `
  --allow-unauthenticated `
  --set-env-vars "SPRING_PROFILES_ACTIVE=cloud" `
  --set-env-vars "DATABASE_URL=$DatabaseUrl" `
  --set-env-vars "DATABASE_USERNAME=$DatabaseUsername" `
  --set-env-vars "DATABASE_PASSWORD=$DatabasePassword" `
  --set-env-vars "KAFKA_BOOTSTRAP_SERVERS=$KafkaBootstrapServers" `
  --set-env-vars "KAFKA_CONSUMER_GROUP_ID=$KafkaConsumerGroupId" `
  --set-env-vars "USER_SERVICE_URL=$UserServiceUrl" `
  --set-env-vars "STRIPE_SECRET_KEY=$StripeSecretKey" `
  --set-env-vars "STRIPE_API_KEY=$StripeApiKey" `
  --set-env-vars "STRIPE_WEBHOOK_SECRET=$StripeWebhookSecret" `
  --set-env-vars "JPA_SHOW_SQL=$JpaShowSql" `
  --set-env-vars "JPA_DDL_AUTO=$JpaDdlAuto" `
  --memory 1Gi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --timeout 300 `
  --concurrency 80

# Get the service URL
$ServiceUrl = gcloud run services describe $ServiceName --region $Region --format "value(status.url)"

Write-Host "`n✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Service URL: $ServiceUrl" -ForegroundColor Green
Write-Host "📊 Health Check: $ServiceUrl/actuator/health" -ForegroundColor Green

# Test the health endpoint
Write-Host "`n🏥 Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ServiceUrl/actuator/health" -Method Get -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Health check returned status code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Health check failed or service is still starting up..." -ForegroundColor Yellow
    Write-Host "Please wait a few minutes and check manually: $ServiceUrl/actuator/health" -ForegroundColor Yellow
}

Write-Host "`n📝 Next Steps:" -ForegroundColor Blue
Write-Host "1. Update your Kafka configuration with the actual Kafka bootstrap servers"
Write-Host "2. Update USER_SERVICE_URL with the actual user service URL"
Write-Host "3. Configure your Stripe keys properly"
Write-Host "4. Test all endpoints to ensure everything works correctly"

Write-Host "`n🔧 To update environment variables later, use:" -ForegroundColor Blue
Write-Host "gcloud run services update $ServiceName --region $Region --set-env-vars KEY=VALUE"

Write-Host "`n📋 To view logs:" -ForegroundColor Blue
Write-Host "gcloud logging read `"resource.type=cloud_run_revision AND resource.labels.service_name=$ServiceName`" --limit 50 --format=`"table(timestamp,textPayload)`""