# UserService - Google Cloud Run Deployment

This document provides instructions for deploying the UserService to Google Cloud Run.

## Prerequisites

1. **Google Cloud SDK**: Install the Google Cloud SDK and authenticate
   ```bash
   # Install gcloud CLI (if not already installed)
   # Visit: https://cloud.google.com/sdk/docs/install
   
   # Authenticate
   gcloud auth login
   
   # Set your project
   gcloud config set project api-gateway-474511
   ```

2. **Docker**: Ensure Docker is installed and running on your system

3. **Java 21**: The application requires Java 21 (already configured in Dockerfile)

## Project Configuration

- **Project ID**: `api-gateway-474511`
- **Service Name**: `userservice`
- **Default Region**: `us-central1`
- **Container Port**: `8080`

## Quick Deployment

### Option 1: Using PowerShell Script (Recommended for Windows)
```powershell
.\deploy-to-cloudrun.ps1
```

### Option 2: Using Bash Script
```bash
chmod +x deploy-to-cloudrun.sh
./deploy-to-cloudrun.sh
```

### Option 3: Manual Deployment Steps

1. **Build the application**:
   ```bash
   mvn clean package -DskipTests
   ```

2. **Build Docker image**:
   ```bash
   docker build -t gcr.io/api-gateway-474511/userservice:latest .
   ```

3. **Configure Docker for GCR**:
   ```bash
   gcloud auth configure-docker
   ```

4. **Push image to Google Container Registry**:
   ```bash
   docker push gcr.io/api-gateway-474511/userservice:latest
   ```

5. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy userservice \
     --image gcr.io/api-gateway-474511/userservice:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8080 \
     --memory 1Gi \
     --cpu 1 \
     --set-env-vars "SPRING_PROFILES_ACTIVE=production"
   ```

## Environment Variables

The service uses the following environment variables:

- `SPRING_PROFILES_ACTIVE`: Set to "production"
- `SERVER_PORT`: Set to "8080"
- `SPRING_DATASOURCE_URL`: MySQL database connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRATION`: JWT token expiration time
- `SPRING_KAFKA_BOOTSTRAP_SERVERS`: Kafka bootstrap servers

## Health Checks

The service exposes health check endpoints:
- `/actuator/health` - General health status
- `/actuator/health/readiness` - Readiness probe
- `/actuator/health/liveness` - Liveness probe

## Monitoring and Logs

### View Logs
```bash
gcloud logs tail --follow --filter="resource.labels.service_name=userservice"
```

### Service Information
```bash
gcloud run services describe userservice --region us-central1
```

## Configuration Updates

### Update Environment Variables
```bash
gcloud run services update userservice \
  --region us-central1 \
  --set-env-vars "NEW_VAR=value"
```

### Update Resource Limits
```bash
gcloud run services update userservice \
  --region us-central1 \
  --memory 2Gi \
  --cpu 2
```

### Deploy New Version
```bash
# Build new image with different tag
docker build -t gcr.io/api-gateway-474511/userservice:v2 .
docker push gcr.io/api-gateway-474511/userservice:v2

# Update service
gcloud run services update userservice \
  --region us-central1 \
  --image gcr.io/api-gateway-474511/userservice:v2
```

## Important Notes

1. **Database Connection**: The service connects to an external MySQL database. Ensure the database is accessible from Google Cloud Run.

2. **Kafka Configuration**: Currently configured for localhost:9092. You'll need to update this with your cloud Kafka instance details.

3. **Security**: Consider using Google Secret Manager for sensitive environment variables like database passwords and JWT secrets.

4. **Scaling**: The service is configured with:
   - Min instances: 0 (scales to zero)
   - Max instances: 10
   - Concurrency: 100 requests per instance

5. **Cost Optimization**: The service scales to zero when not in use to minimize costs.

## Troubleshooting

### Common Issues

1. **Build Failures**: Ensure Java 21 is available in your build environment
2. **Database Connection**: Verify database credentials and network connectivity
3. **Memory Issues**: Increase memory allocation if the service runs out of memory
4. **Timeout Issues**: Increase timeout settings for slow database operations

### Debug Commands
```bash
# Check service status
gcloud run services list

# View recent logs
gcloud logs read --limit=50 --filter="resource.labels.service_name=userservice"

# Test health endpoint
curl https://your-service-url/actuator/health
```

## Next Steps

1. Set up Google Secret Manager for sensitive configuration
2. Configure custom domain mapping
3. Set up monitoring and alerting
4. Configure CI/CD pipeline for automated deployments
5. Update Kafka configuration for cloud deployment