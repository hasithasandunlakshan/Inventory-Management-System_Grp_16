# Cloud Run Deployment Checklist

## Pre-Deployment Setup

### ✅ Google Cloud Account
- [ ] Sign up at https://cloud.google.com (free $300 credit)
- [ ] Create a new Google Cloud Project
- [ ] Note your Project ID: ________________
- [ ] Enable billing (required for Cloud Run)

### ✅ Install Google Cloud SDK
- [ ] Download from: https://cloud.google.com/sdk/docs/install-sdk#windows
- [ ] Install and restart PowerShell
- [ ] Test: `gcloud version`
- [ ] Authenticate: `gcloud auth login`

### ✅ Project Configuration
- [ ] Edit `deploy-cloudrun.ps1`
- [ ] Replace `"your-gcp-project-id"` with your actual Project ID
- [ ] Choose your region (default: us-central1)

## Deployment Process

### ✅ Deploy to Cloud Run
- [ ] Open PowerShell in project directory
- [ ] Run: `.\deploy-cloudrun.ps1`
- [ ] Follow authentication prompts
- [ ] Wait for build and deployment (5-10 minutes)

### ✅ Verify Deployment
- [ ] Note the service URL: ________________
- [ ] Test health endpoint: `[SERVICE_URL]/actuator/health`
- [ ] Check logs: `gcloud run logs tail --service=api-gateway`

## Post-Deployment Configuration

### ✅ Environment Variables (when other services are ready)
- [ ] USER_SERVICE_URL: ________________
- [ ] PRODUCT_SERVICE_URL: ________________
- [ ] ORDER_SERVICE_URL: ________________
- [ ] SUPPLIER_SERVICE_URL: ________________
- [ ] INVENTORY_SERVICE_URL: ________________
- [ ] RESOURCE_SERVICE_URL: ________________

### ✅ Update Service with New Variables
```powershell
gcloud run services update api-gateway --region=us-central1 --set-env-vars="USER_SERVICE_URL=https://user-service-url"
```

## Monitoring & Management

### ✅ Essential Commands
- [ ] View logs: `gcloud run logs tail --service=api-gateway --region=us-central1`
- [ ] Update service: `gcloud run services update api-gateway --region=us-central1`
- [ ] Check status: `gcloud run services describe api-gateway --region=us-central1`

### ✅ Cost Monitoring
- [ ] Check billing dashboard regularly
- [ ] Set up billing alerts
- [ ] Monitor usage in Cloud Console

## Security & Best Practices

### ✅ Security Configuration
- [ ] Verify JWT_SECRET is secure
- [ ] Consider authentication for production
- [ ] Review IAM permissions
- [ ] Enable audit logging

### ✅ Performance Optimization
- [ ] Monitor response times
- [ ] Adjust memory/CPU if needed
- [ ] Configure appropriate scaling limits
- [ ] Set up health checks

## Important Information to Save

**Google Cloud Project:**
- Project ID: ________________
- Project Number: ________________
- Region: ________________

**Service Details:**
- Service Name: api-gateway
- Service URL: ________________
- Health Check: ________________/actuator/health

**Useful Commands:**
```powershell
# Deploy updates
gcloud builds submit --tag gcr.io/PROJECT_ID/api-gateway --file Dockerfile.cloudrun .
gcloud run deploy api-gateway --image gcr.io/PROJECT_ID/api-gateway --region us-central1

# View logs
gcloud run logs tail --service=api-gateway --region=us-central1

# Update environment variables
gcloud run services update api-gateway --region=us-central1 --set-env-vars="VAR_NAME=value"

# Scale service
gcloud run services update api-gateway --region=us-central1 --max-instances=20

# Delete service
gcloud run services delete api-gateway --region=us-central1
```

## Troubleshooting Checklist

### ✅ Common Issues
- [ ] **Auth issues**: Run `gcloud auth login`
- [ ] **Permission errors**: Check IAM roles
- [ ] **Build failures**: Verify Dockerfile.cloudrun
- [ ] **Service not accessible**: Check `--allow-unauthenticated` flag
- [ ] **Timeout errors**: Increase timeout limit

### ✅ Verification Steps
- [ ] Service shows "READY" status
- [ ] Health endpoint returns {"status":"UP"}
- [ ] Logs show successful startup
- [ ] No error messages in Cloud Console

## Cost Estimate

**Free Tier Monthly:**
- 2 million requests
- 400,000 GB-seconds
- 200,000 vCPU-seconds

**Typical API Gateway Usage:**
- Small traffic: $0-5/month
- Medium traffic: $5-20/month
- High traffic: $20-100/month

**Auto-scaling Benefits:**
- Scales to zero when not used
- No idle costs
- Handles traffic spikes automatically

---

**Estimated Setup Time:** 20-30 minutes for first deployment

**Next Steps After Deployment:**
1. Deploy other microservices to Cloud Run
2. Update service URLs in environment variables
3. Set up custom domain (optional)
4. Configure CI/CD pipeline
5. Set up monitoring and alerting