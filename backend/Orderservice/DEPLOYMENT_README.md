# Order Service - Google Cloud Run Deployment

This document provides instructions for deploying the Order Service to Google Cloud Run.

## Prerequisites

1. **Google Cloud SDK**: Install and configure the Google Cloud SDK
   ```bash
   # Install gcloud CLI
   # Follow instructions at: https://cloud.google.com/sdk/docs/install
   
   # Authenticate
   gcloud auth login
   gcloud auth configure-docker
   ```

2. **Docker**: Install Docker Desktop or Docker Engine

3. **Environment Variables**: Set up your environment variables (see `.env.template`)

## Project Configuration

- **Project ID**: `api-gateway-474511`
- **Service Name**: `orderservice`
- **Default Region**: `us-central1`
- **Default Port**: `8080`

## Files Overview

- `Dockerfile` - Multi-stage Docker build for the Spring Boot application
- `.dockerignore` - Excludes unnecessary files from the Docker build context
- `application-cloud.properties` - Cloud-ready configuration with environment variables
- `deploy-to-cloudrun.ps1` - PowerShell deployment script for Windows
- `deploy-to-cloudrun.sh` - Bash deployment script for Linux/Mac
- `update-env-vars.ps1` - Quick update script for environment variables only
- `.env.template` - Template for environment variables

## Deployment Steps

### Step 1: Set Environment Variables

1. Copy the environment template:
   ```powershell
   cp .env.template .env
   ```

2. Edit `.env` with your actual values:
   ```bash
   # Database Configuration
   DATABASE_URL=jdbc:mysql://your-db-host:port/database?ssl-mode=REQUIRED
   DATABASE_USERNAME=your-username
   DATABASE_PASSWORD=your-password
   
   # Kafka Configuration
   KAFKA_BOOTSTRAP_SERVERS=your-kafka-bootstrap-servers:9092
   
   # Service URLs
   USER_SERVICE_URL=https://your-user-service-url
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_API_KEY=sk_test_your_stripe_api_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

3. Load environment variables in PowerShell:
   ```powershell
   # Load environment variables from .env file
   Get-Content .env | ForEach-Object {
       if ($_ -match '^([^=]+)=(.*)$') {
           [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
       }
   }
   ```

### Step 2: Deploy to Cloud Run

Run the deployment script:

```powershell
# For Windows (PowerShell)
.\deploy-to-cloudrun.ps1

# For Linux/Mac (Bash)
chmod +x deploy-to-cloudrun.sh
./deploy-to-cloudrun.sh
```

### Step 3: Update Environment Variables (Optional)

To update only the environment variables without rebuilding:

```powershell
# Load your updated environment variables first, then run:
.\update-env-vars.ps1
```

## Environment Variables Reference

### Database Configuration
- `DATABASE_URL` - JDBC URL for MySQL database
- `DATABASE_USERNAME` - Database username
- `DATABASE_PASSWORD` - Database password
- `JPA_DDL_AUTO` - Hibernate DDL mode (default: update)
- `JPA_SHOW_SQL` - Show SQL queries (default: false)

### Kafka Configuration
- `KAFKA_BOOTSTRAP_SERVERS` - Kafka bootstrap servers
- `KAFKA_CONSUMER_GROUP_ID` - Consumer group ID (default: order-service-group)
- `KAFKA_AUTO_OFFSET_RESET` - Auto offset reset (default: earliest)
- `KAFKA_SECURITY_PROTOCOL` - Security protocol (PLAINTEXT, SASL_SSL, etc.)
- `KAFKA_SASL_MECHANISM` - SASL mechanism (PLAIN, SCRAM-SHA-256, etc.)
- `KAFKA_SASL_JAAS_CONFIG` - JAAS configuration for authentication

### Service URLs
- `USER_SERVICE_URL` - URL of the User Service

### Stripe Configuration
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_API_KEY` - Stripe API key  
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### Server Configuration
- `PORT` - Server port (default: 8080)

## Post-Deployment

1. **Health Check**: Test the health endpoint
   ```bash
   curl https://your-service-url/actuator/health
   ```

2. **View Logs**: Monitor application logs
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=orderservice" --limit 50
   ```

3. **Update Configuration**: Use the update script to change environment variables
   ```powershell
   # Set new environment variables
   $env:KAFKA_BOOTSTRAP_SERVERS = "new-kafka-url:9092"
   $env:USER_SERVICE_URL = "https://new-user-service-url"
   
   # Update the service
   .\update-env-vars.ps1
   ```

## Useful Commands

### View Service Details
```bash
gcloud run services describe orderservice --region us-central1
```

### View Service Logs
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=orderservice" --limit 50 --format="table(timestamp,textPayload)"
```

### Update Single Environment Variable
```bash
gcloud run services update orderservice --region us-central1 --set-env-vars KAFKA_BOOTSTRAP_SERVERS=new-kafka-url:9092
```

### Scale Service
```bash
gcloud run services update orderservice --region us-central1 --min-instances 1 --max-instances 20
```

### Delete Service
```bash
gcloud run services delete orderservice --region us-central1
```

## Troubleshooting

### Common Issues

1. **Build Failures**: Check Docker build logs and ensure all dependencies are available
2. **Service Not Starting**: Check environment variables and database connectivity
3. **Health Check Failures**: Verify that the application is binding to the correct port (8080)
4. **Kafka Connection Issues**: Ensure Kafka bootstrap servers are accessible from Cloud Run

### Debug Steps

1. Check service logs:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=orderservice" --limit 20
   ```

2. Test database connectivity:
   ```bash
   # Test from local machine or Cloud Shell
   mysql -h your-db-host -P port -u username -p
   ```

3. Verify environment variables:
   ```bash
   gcloud run services describe orderservice --region us-central1 --format="export" | grep env
   ```

## Security Notes

- Never commit actual secrets to version control
- Use Google Secret Manager for sensitive data in production
- Regularly rotate API keys and database passwords
- Review IAM permissions for the Cloud Run service