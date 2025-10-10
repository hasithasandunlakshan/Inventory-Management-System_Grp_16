# Quick Update Script for Order Service Environment Variables
# This script updates the Cloud Run service with new environment variables without rebuilding the image

param(
    [string]$ProjectId = "api-gateway-474511",
    [string]$ServiceName = "orderservice",
    [string]$Region = "us-central1"
)

$ErrorActionPreference = "Stop"

Write-Host "🔄 Updating Order Service environment variables..." -ForegroundColor Blue
Write-Host "Project ID: $ProjectId" -ForegroundColor Blue
Write-Host "Service Name: $ServiceName" -ForegroundColor Blue
Write-Host "Region: $Region" -ForegroundColor Blue

# Set project
gcloud config set project $ProjectId

# Get current environment variables with defaults
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

Write-Host "`n🔧 Updating environment variables..." -ForegroundColor Yellow

# Update the service with new environment variables
gcloud run services update $ServiceName `
  --region $Region `
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
  --set-env-vars "JPA_DDL_AUTO=$JpaDdlAuto"

# Get the service URL
$ServiceUrl = gcloud run services describe $ServiceName --region $Region --format "value(status.url)"

Write-Host "`n✅ Environment variables updated successfully!" -ForegroundColor Green
Write-Host "🌐 Service URL: $ServiceUrl" -ForegroundColor Green
Write-Host "📊 Health Check: $ServiceUrl/actuator/health" -ForegroundColor Green

Write-Host "`n⏱️ The service will restart automatically with the new configuration..." -ForegroundColor Yellow
Write-Host "Please wait a few minutes for the changes to take effect." -ForegroundColor Yellow

# Test the health endpoint after a short delay
Write-Host "`n🏥 Testing health endpoint in 30 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

try {
    $response = Invoke-WebRequest -Uri "$ServiceUrl/actuator/health" -Method Get -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Health check returned status code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Health check failed or service is still restarting..." -ForegroundColor Yellow
    Write-Host "Please check manually in a few minutes: $ServiceUrl/actuator/health" -ForegroundColor Yellow
}