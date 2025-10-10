@echo off
REM Deployment script for ML Forecast Service to Google Cloud Run

set PROJECT_ID=api-gateway-474511
set SERVICE_NAME=ml-forecast-service
set REGION=us-central1
set IMAGE_NAME=gcr.io/%PROJECT_ID%/%SERVICE_NAME%

echo 🚀 Deploying ML Forecast Service to Google Cloud Run
echo Project: %PROJECT_ID%
echo Service: %SERVICE_NAME%
echo Region: %REGION%
echo Image: %IMAGE_NAME%

REM Check if gcloud is installed
gcloud --version >nul 2>&1
if errorlevel 1 (
    echo ❌ gcloud CLI is not installed. Please install it first.
    echo Visit: https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

REM Set the project
echo 📋 Setting project...
gcloud config set project %PROJECT_ID%

REM Enable required APIs
echo 🔧 Enabling required APIs...
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

REM Build the Docker image
echo 🏗️ Building Docker image...
gcloud builds submit --tag %IMAGE_NAME%

REM Deploy to Cloud Run
echo 🚀 Deploying to Cloud Run...
gcloud run deploy %SERVICE_NAME% ^
    --image %IMAGE_NAME% ^
    --platform managed ^
    --region %REGION% ^
    --allow-unauthenticated ^
    --port 8080 ^
    --memory 4Gi ^
    --cpu 2 ^
    --max-instances 10 ^
    --min-instances 0 ^
    --timeout 300 ^
    --concurrency 10 ^
    --set-env-vars="REDIS_URL=redis://default:gQTgc94xp1OT2hILBizHmNmzI5a8Np3d@redis-18634.c321.us-east-1-2.ec2.redns.redis-cloud.com:18634"

echo ✅ Deployment completed!

REM Get the service URL
for /f %%i in ('gcloud run services describe %SERVICE_NAME% --region=%REGION% --format="value(status.url)"') do set SERVICE_URL=%%i
echo 🌐 Service URL: %SERVICE_URL%

echo.
echo 🎉 ML Forecast Service is now deployed!
echo 📊 Health Check: %SERVICE_URL%/health
echo 📚 API Docs: %SERVICE_URL%/docs
echo 🔍 Forecast API: %SERVICE_URL%/forecast/{product_id}

pause