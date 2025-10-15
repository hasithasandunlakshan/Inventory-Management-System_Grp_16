# CI/CD Pipeline for Order Service - Google Cloud VM Deployment

This document explains how to set up and use the GitHub Actions CI/CD pipeline for automatic deployment to Google Cloud VM.

## 🎯 Overview

The CI/CD pipeline automatically deploys the Order Service to your Google Cloud VM whenever changes are pushed to the `main` branch in the `backend/Orderservice/` directory.

### What the Pipeline Does

1. ✅ Checks out the code
2. ✅ Sets up Java 17 and Maven
3. ✅ Builds the Spring Boot application
4. ✅ Authenticates to Google Cloud
5. ✅ Verifies the VM exists
6. ✅ Uploads the JAR file to the VM
7. ✅ Deploys and restarts the service
8. ✅ Performs health checks
9. ✅ Verifies the deployment

## 📋 Prerequisites

### 1. Google Cloud Service Account

You need a service account with permissions to:
- Access Compute Engine instances
- SSH to VMs
- Read VM metadata

### 2. VM Requirements

Your VM should already be set up with:
- Java 17 installed
- Application directory at `/opt/orderservice`
- Systemd service configured
- User `orderservice` created
- Port 8084 open

## 🔧 Setup Instructions

### Step 1: Create a Service Account

Run this in your local terminal (PowerShell or Google Cloud Shell):

```powershell
# Set your project ID
$PROJECT_ID = "api-gateway-474511"
$SA_NAME = "github-actions-deployer"
$SA_EMAIL = "${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Create the service account
gcloud iam service-accounts create $SA_NAME `
  --display-name="GitHub Actions Deployer" `
  --project=$PROJECT_ID

# Grant necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:${SA_EMAIL}" `
  --role="roles/compute.instanceAdmin.v1"

gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:${SA_EMAIL}" `
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:${SA_EMAIL}" `
  --role="roles/compute.osLogin"

# Create and download the service account key
gcloud iam service-accounts keys create github-actions-key.json `
  --iam-account=$SA_EMAIL `
  --project=$PROJECT_ID

Write-Host "✅ Service account created successfully!" -ForegroundColor Green
Write-Host "📄 Key saved to: github-actions-key.json" -ForegroundColor Cyan
```

### Step 2: Add GitHub Secrets

1. **Navigate to your GitHub repository**
   - Go to `Settings` → `Secrets and variables` → `Actions`

2. **Add the following secret:**

   **Secret Name:** `GCP_SA_KEY`
   
   **Secret Value:** 
   - Open the `github-actions-key.json` file
   - Copy the entire JSON content
   - Paste it as the secret value

   ```powershell
   # To view the key content (PowerShell)
   Get-Content github-actions-key.json
   ```

3. **Security Note:** 
   - ⚠️ Never commit the `github-actions-key.json` file to Git
   - ⚠️ Delete the local key file after adding to GitHub: `Remove-Item github-actions-key.json`

### Step 3: Enable OS Login on Your VM (if not already enabled)

```powershell
# Enable OS Login on the VM
gcloud compute instances add-metadata orderservice-vm `
  --zone=us-central1-a `
  --metadata=enable-oslogin=TRUE

# Grant OS Login permissions to the service account
$SA_EMAIL = "github-actions-deployer@api-gateway-474511.iam.gserviceaccount.com"

gcloud compute instances add-iam-policy-binding orderservice-vm `
  --zone=us-central1-a `
  --member="serviceAccount:${SA_EMAIL}" `
  --role="roles/compute.osAdminLogin"
```

### Step 4: Update GitHub Workflow Path (if needed)

If your repository structure is different, update the `paths` in `.github/workflows/deploy-to-vm.yml`:

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'backend/Orderservice/**'  # Update this path if different
```

## 🚀 Usage

### Automatic Deployment

The pipeline triggers automatically when you push changes to the `main` branch:

```bash
git add .
git commit -m "Update order service"
git push origin main
```

### Manual Deployment

You can also trigger the deployment manually from GitHub:

1. Go to your repository on GitHub
2. Click on `Actions` tab
3. Select `Deploy Order Service to Google Cloud VM`
4. Click `Run workflow`
5. Select the branch and click `Run workflow`

## 📊 Monitoring Deployments

### View Deployment Status

1. Go to the `Actions` tab in your GitHub repository
2. Click on the latest workflow run
3. View detailed logs for each step

### Check Service on VM

```powershell
# SSH to the VM
gcloud compute ssh orderservice-vm --zone=us-central1-a

# Check service status
sudo systemctl status orderservice

# View recent logs
sudo journalctl -u orderservice -n 50 -f

# Check if service is running
curl http://localhost:8084/actuator/health
```

### Get VM IP

```powershell
gcloud compute instances describe orderservice-vm `
  --zone=us-central1-a `
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

## 🔍 Troubleshooting

### Pipeline Fails at Authentication

**Error:** `Failed to authenticate to Google Cloud`

**Solution:**
1. Verify the `GCP_SA_KEY` secret is correctly set
2. Ensure the JSON key is valid
3. Check service account has required permissions

```powershell
# Verify service account exists
gcloud iam service-accounts list --project=api-gateway-474511

# Check service account permissions
gcloud projects get-iam-policy api-gateway-474511 `
  --flatten="bindings[].members" `
  --filter="bindings.members:github-actions-deployer@api-gateway-474511.iam.gserviceaccount.com"
```

### Pipeline Fails at SSH

**Error:** `Permission denied (publickey)`

**Solution:**
1. Ensure OS Login is enabled on the VM
2. Grant OS Login permissions to the service account

```powershell
# Enable OS Login
gcloud compute instances add-metadata orderservice-vm `
  --zone=us-central1-a `
  --metadata=enable-oslogin=TRUE

# Grant permissions
gcloud compute instances add-iam-policy-binding orderservice-vm `
  --zone=us-central1-a `
  --member="serviceAccount:github-actions-deployer@api-gateway-474511.iam.gserviceaccount.com" `
  --role="roles/compute.osAdminLogin"
```

### Service Doesn't Start

**Error:** Service fails health check

**Solution:**
1. Check VM has enough resources
2. Verify Java 17 is installed
3. Check application logs

```bash
# SSH to VM
gcloud compute ssh orderservice-vm --zone=us-central1-a

# Check Java version
java -version

# Check service status
sudo systemctl status orderservice

# View detailed logs
sudo journalctl -u orderservice -n 100 --no-pager

# Check if port is listening
sudo netstat -tlnp | grep 8084
```

### Build Fails

**Error:** Maven build fails

**Solution:**
1. Check if dependencies are available
2. Run build locally first
3. Review Maven logs in GitHub Actions

```powershell
# Test build locally
cd backend/Orderservice
.\mvnw clean package -DskipTests
```

## 🔐 Security Best Practices

1. **Service Account Permissions**
   - Grant only minimum required permissions
   - Use separate service accounts for different environments
   - Regularly rotate service account keys

2. **Secrets Management**
   - Never commit credentials to Git
   - Use GitHub Secrets for sensitive data
   - Rotate secrets regularly

3. **VM Security**
   - Keep OS and packages updated
   - Use firewall rules to restrict access
   - Enable OS Login instead of SSH keys
   - Use service accounts with minimal permissions

4. **Application Security**
   - Don't hardcode credentials in application.properties
   - Use environment variables
   - Enable HTTPS for production

## 📝 Workflow Configuration

### Environment Variables

Update these in `.github/workflows/deploy-to-vm.yml` if needed:

```yaml
env:
  PROJECT_ID: api-gateway-474511      # Your GCP project ID
  VM_NAME: orderservice-vm            # Your VM name
  ZONE: us-central1-a                 # Your VM zone
  SERVICE_PORT: 8084                  # Application port
  SERVICE_NAME: orderservice          # Service name
```

### Deployment Triggers

The workflow is triggered by:
- Push to `main` branch with changes in `backend/Orderservice/**`
- Manual trigger via GitHub Actions UI

### Customize Triggers

```yaml
on:
  push:
    branches:
      - main
      - develop  # Add more branches
    paths:
      - 'backend/Orderservice/**'
  pull_request:  # Add PR checks
    branches:
      - main
  workflow_dispatch:  # Manual trigger
```

## 🎯 Next Steps

### Add Tests to Pipeline

```yaml
- name: Run Tests
  working-directory: ./backend/Orderservice
  run: ./mvnw test
```

### Add Code Quality Checks

```yaml
- name: Run SonarQube Analysis
  uses: sonarsource/sonarqube-scan-action@master
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Add Slack Notifications

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Google Cloud Compute Engine](https://cloud.google.com/compute/docs)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)

## 🆘 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review GitHub Actions logs
3. Check VM logs: `sudo journalctl -u orderservice`
4. Verify VM status: `gcloud compute instances describe orderservice-vm --zone=us-central1-a`

---

**Last Updated:** October 15, 2025
**Version:** 1.0.0
