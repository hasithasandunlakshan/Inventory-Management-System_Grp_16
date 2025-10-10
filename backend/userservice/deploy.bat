@echo off
REM Simple batch script to deploy UserService to Google Cloud Run

echo === UserService Cloud Run Deployment ===
echo Project: api-gateway-474511
echo.

echo Checking Docker...
docker --version
if %ERRORLEVEL% NEQ 0 (
    echo Error: Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo.
echo Building Docker image...
docker build -t gcr.io/api-gateway-474511/userservice:latest .
if %ERRORLEVEL% NEQ 0 (
    echo Error: Docker build failed.
    pause
    exit /b 1
)

echo.
echo Configuring Docker for Google Cloud...
gcloud auth configure-docker
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to configure Docker for Google Cloud.
    pause
    exit /b 1
)

echo.
echo Pushing image to Google Container Registry...
docker push gcr.io/api-gateway-474511/userservice:latest
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to push Docker image.
    pause
    exit /b 1
)

echo.
echo Deploying to Google Cloud Run...
gcloud run deploy userservice --image gcr.io/api-gateway-474511/userservice:latest --platform managed --region us-central1 --allow-unauthenticated --port 8080 --memory 1Gi --cpu 1 --min-instances 0 --max-instances 10 --timeout 300s --concurrency 100 --set-env-vars "SPRING_PROFILES_ACTIVE=production,SERVER_PORT=8080"

if %ERRORLEVEL% NEQ 0 (
    echo Error: Cloud Run deployment failed.
    pause
    exit /b 1
)

echo.
echo === Deployment Complete ===
echo Getting service URL...
gcloud run services describe userservice --platform managed --region us-central1 --format "value(status.url)"

echo.
echo Deployment finished successfully!
echo Health check endpoint: [SERVICE_URL]/actuator/health
pause