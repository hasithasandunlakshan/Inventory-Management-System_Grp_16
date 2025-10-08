# Google Cloud Run Deployment Guide

## Prerequisites
1. **Google Cloud Account**: Sign up at https://cloud.google.com
2. **Google Cloud SDK**: Install from https://cloud.google.com/sdk/docs/install
3. **Docker**: Already installed ✅
4. **Google Cloud Project**: Create a new project in GCP Console

## Step-by-Step Deployment

### Step 1: Setup Google Cloud Account
1. Go to https://cloud.google.com
2. Sign up for free (includes $300 credit)
3. Create a new project in the GCP Console
4. Note your Project ID (you'll need this)

### Step 2: Install Google Cloud SDK
**For Windows:**
1. Download from: https://cloud.google.com/sdk/docs/install-sdk#windows
2. Run the installer
3. Restart PowerShell/Command Prompt
4. Verify installation: `gcloud version`

### Step 3: Configure Your Project
1. Open PowerShell in your project directory
2. Edit `deploy-cloudrun.ps1` and replace `"your-gcp-project-id"` with your actual project ID
3. Choose your preferred region (default: us-central1)

### Step 4: Deploy to Cloud Run

**Option A: Using PowerShell Script (Recommended for Windows)**
```powershell
# Navigate to your project directory
cd "C:\Users\PC\Desktop\SEM 5 Project\Inventory-Management-System_Grp_16\backend\ApiGateway"

# Run the deployment script
.\deploy-cloudrun.ps1
```

**Option B: Manual Commands**
```powershell
# Set variables (replace with your project ID)
$PROJECT_ID = "your-actual-project-id"
$SERVICE_NAME = "api-gateway"
$REGION = "us-central1"

# Authenticate
gcloud auth login

# Set project
gcloud config set project $PROJECT_ID

# Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com

# Build and deploy
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME --file Dockerfile.cloudrun .
gcloud run deploy $SERVICE_NAME --image gcr.io/$PROJECT_ID/$SERVICE_NAME --platform managed --region $REGION --allow-unauthenticated
```

## Cloud Run Configuration

### Resource Limits
- **Memory**: 1GB (sufficient for Spring Boot)
- **CPU**: 1 CPU unit
- **Concurrency**: 80 requests per instance
- **Timeout**: 300 seconds (5 minutes)
- **Scaling**: 0-10 instances (auto-scale to zero when not used)

### Environment Variables
- `SPRING_PROFILES_ACTIVE=cloudrun`
- `JWT_SECRET`: Your JWT signing secret
- Service URLs for other microservices (when deployed)

## Cost Optimization

### Cloud Run Pricing
- **CPU**: $0.00002400 per vCPU-second
- **Memory**: $0.00000250 per GB-second
- **Requests**: $0.40 per million requests
- **Free Tier**: 2 million requests/month, 400,000 GB-seconds, 200,000 vCPU-seconds

### Auto-scaling Benefits
- Scales to zero when not in use (no cost)
- Only pay for actual usage
- Handles traffic spikes automatically

## Service URLs Structure

After deployment, your services will have URLs like:
```
https://api-gateway-[hash]-uc.a.run.app
```

## Environment Variables for Other Services

When you deploy other microservices to Cloud Run, update these environment variables:

```yaml
USER_SERVICE_URL: https://user-service-[hash]-uc.a.run.app
PRODUCT_SERVICE_URL: https://product-service-[hash]-uc.a.run.app
ORDER_SERVICE_URL: https://order-service-[hash]-uc.a.run.app
SUPPLIER_SERVICE_URL: https://supplier-service-[hash]-uc.a.run.app
INVENTORY_SERVICE_URL: https://inventory-service-[hash]-uc.a.run.app
RESOURCE_SERVICE_URL: https://resource-service-[hash]-uc.a.run.app
```

## Monitoring and Management

### View Logs
```bash
gcloud run logs tail --service=api-gateway --region=us-central1
```

### Update Service
```bash
gcloud run services update api-gateway --region=us-central1 --set-env-vars="NEW_VAR=value"
```

### Scale Service
```bash
gcloud run services update api-gateway --region=us-central1 --max-instances=20
```

### Delete Service
```bash
gcloud run services delete api-gateway --region=us-central1
```

## Custom Domain (Optional)

1. **Map Custom Domain**:
   ```bash
   gcloud run domain-mappings create --service=api-gateway --domain=api.yourdomain.com --region=us-central1
   ```

2. **SSL Certificate**: Automatically provisioned by Google

## Security Features

- **HTTPS by default**: All Cloud Run services get HTTPS
- **IAM Integration**: Control access with Google Cloud IAM
- **Container Security**: Runs in Google's secure container runtime
- **Network Isolation**: Services are isolated by default

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Cloud Run
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: google-github-actions/setup-gcloud@v0
      with:
        project_id: ${{ secrets.GCP_PROJECT_ID }}
        service_account_key: ${{ secrets.GCP_SA_KEY }}
    - run: |
        gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/api-gateway --file Dockerfile.cloudrun .
        gcloud run deploy api-gateway --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/api-gateway --region us-central1
```

## Troubleshooting

### Common Issues

1. **Authentication Error**
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

2. **Permission Denied**
   - Ensure APIs are enabled
   - Check IAM permissions for your account

3. **Build Fails**
   - Check Dockerfile.cloudrun syntax
   - Verify Java 17 compatibility

4. **Service Not Accessible**
   - Check if `--allow-unauthenticated` flag was used
   - Verify region settings

### Health Checks
Cloud Run automatically monitors your service health using:
- Startup probes on port 8080
- Liveness probes via HTTP requests
- Your actuator health endpoint: `/actuator/health`

## Benefits of Cloud Run

✅ **Serverless**: No infrastructure management  
✅ **Auto-scaling**: Scales to zero, handles traffic spikes  
✅ **Cost-effective**: Pay only for usage  
✅ **Fast deployments**: Deploy in seconds  
✅ **HTTPS by default**: Built-in SSL certificates  
✅ **Container-native**: Use any language/framework  
✅ **Global**: Deploy to multiple regions easily