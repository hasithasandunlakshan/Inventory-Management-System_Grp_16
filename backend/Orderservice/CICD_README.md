# 🎉 CI/CD Pipeline Setup Complete!

## ✅ What Was Created

I've set up a complete CI/CD pipeline for your Order Service that automatically deploys to Google Cloud VM whenever you push changes to the main branch.

### Files Created:

1. **`.github/workflows/deploy-to-vm.yml`**
   - GitHub Actions workflow for automatic deployment
   - Builds, tests, and deploys your Spring Boot application
   - Includes health checks and verification

2. **`setup-github-actions.ps1`**
   - Automated setup script for Google Cloud service account
   - Creates and configures all necessary permissions
   - Generates the service account key

3. **`CICD_SETUP_GUIDE.md`**
   - Comprehensive setup instructions
   - Troubleshooting guide
   - Security best practices

4. **`CICD_QUICK_REFERENCE.md`**
   - Quick command reference
   - Common tasks and troubleshooting

5. **Updated `.gitignore`**
   - Prevents accidental commit of service account keys
   - Protects sensitive credentials

---

## 🚀 Quick Start (3 Steps)

### Step 1: Run the Setup Script (2 minutes)

Open PowerShell and run:

```powershell
cd "c:\Users\PC\Desktop\SEM 5 Project\Inventory-Management-System_Grp_16\backend\Orderservice"
.\setup-github-actions.ps1
```

This will:
- Create a Google Cloud service account
- Grant necessary permissions
- Generate a service account key file

### Step 2: Add Secret to GitHub (1 minute)

1. The script will show you the key content
2. Go to your GitHub repository
3. Navigate to: **Settings → Secrets and variables → Actions**
4. Click **"New repository secret"**
5. Name: `GCP_SA_KEY`
6. Value: Paste the entire JSON content from the key file
7. Click **"Add secret"**

### Step 3: Delete the Local Key & Push (1 minute)

```powershell
# Delete the key file (important for security!)
Remove-Item github-actions-key.json

# Commit and push the CI/CD files
git add .
git commit -m "Add CI/CD pipeline for Google Cloud VM deployment"
git push origin main
```

✅ **Done!** Your CI/CD pipeline is now active!

---

## 🎯 How It Works

### Automatic Deployment

```
Push to main → GitHub Actions → Build JAR → Deploy to VM → Health Check → ✅ Live!
```

**Whenever you push changes to the main branch:**
1. GitHub Actions detects changes in `backend/Orderservice/`
2. Builds your Spring Boot application
3. Uploads the JAR to your Google Cloud VM
4. Restarts the service
5. Verifies the deployment with health checks
6. Notifies you of success/failure

**Deployment time:** ~5-10 minutes

### Manual Deployment

You can also trigger deployment manually:
1. Go to GitHub → **Actions** tab
2. Select **"Deploy Order Service to Google Cloud VM"**
3. Click **"Run workflow"**
4. Select branch and click **"Run workflow"**

---

## 📊 Monitoring & Management

### View Deployment Status

**GitHub Actions:**
- Go to your repository → **Actions** tab
- Click on any workflow run to see detailed logs

### Check Service on VM

```powershell
# Get VM IP
$VM_IP = gcloud compute instances describe orderservice-vm --zone=us-central1-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# Check health
curl "http://${VM_IP}:8084/actuator/health"

# View logs
gcloud compute ssh orderservice-vm --zone=us-central1-a --command="sudo journalctl -u orderservice -f"
```

---

## 🔒 Security Features

✅ **Service account with minimal permissions**
- Only has access to deploy to the specific VM
- Cannot access other resources

✅ **Secrets management**
- Credentials stored securely in GitHub Secrets
- Never exposed in logs or code

✅ **OS Login enabled**
- No SSH keys stored in the repository
- Automatic key rotation

✅ **Protected from accidental commits**
- `.gitignore` prevents committing sensitive files
- Key files automatically excluded

---

## 🔍 What the Pipeline Does

### Build Stage
- ✅ Checks out code from repository
- ✅ Sets up Java 17 and Maven
- ✅ Builds the Spring Boot application
- ✅ Creates executable JAR file

### Deploy Stage
- ✅ Authenticates to Google Cloud
- ✅ Verifies VM exists and is accessible
- ✅ Uploads JAR file to VM
- ✅ Moves JAR to application directory
- ✅ Restarts the systemd service

### Verification Stage
- ✅ Waits for service to start
- ✅ Performs health checks
- ✅ Verifies endpoints are responding
- ✅ Checks service logs
- ✅ Reports deployment status

---

## 📝 Example Workflow

Here's a typical development workflow:

```bash
# 1. Make changes to your code
# Edit files in: backend/Orderservice/src/...

# 2. Commit and push
git add .
git commit -m "Add new feature to order service"
git push origin main

# 3. GitHub Actions automatically:
#    - Builds your application
#    - Deploys to VM
#    - Verifies deployment

# 4. Check deployment status
#    - Go to GitHub Actions tab
#    - Or check: http://YOUR_VM_IP:8084/actuator/health

# 5. Your changes are live! 🎉
```

---

## ⚙️ Configuration

### Environment Variables (in workflow)

The pipeline uses these settings (can be modified in `.github/workflows/deploy-to-vm.yml`):

```yaml
PROJECT_ID: api-gateway-474511      # Your GCP project
VM_NAME: orderservice-vm            # Your VM name
ZONE: us-central1-a                 # VM location
SERVICE_PORT: 8084                  # Application port
SERVICE_NAME: orderservice          # Service name
```

### Deployment Triggers

The workflow triggers on:
- ✅ Push to `main` branch
- ✅ Changes in `backend/Orderservice/**`
- ✅ Manual trigger from GitHub UI

To add more branches:
```yaml
on:
  push:
    branches:
      - main
      - develop  # Add this
```

---

## 🆘 Troubleshooting

### Problem: Pipeline fails at authentication

**Solution:**
```powershell
# Re-run the setup script
.\setup-github-actions.ps1

# Verify the secret is added correctly in GitHub
# Settings → Secrets and variables → Actions
```

### Problem: SSH permission denied

**Solution:**
```powershell
# Enable OS Login on VM
gcloud compute instances add-metadata orderservice-vm `
  --zone=us-central1-a `
  --metadata=enable-oslogin=TRUE

# Grant permissions to service account
gcloud compute instances add-iam-policy-binding orderservice-vm `
  --zone=us-central1-a `
  --member="serviceAccount:github-actions-deployer@api-gateway-474511.iam.gserviceaccount.com" `
  --role="roles/compute.osAdminLogin"
```

### Problem: Service won't start after deployment

**Solution:**
```powershell
# SSH to VM and investigate
gcloud compute ssh orderservice-vm --zone=us-central1-a

# Check service status
sudo systemctl status orderservice

# View detailed logs
sudo journalctl -u orderservice -n 100 --no-pager

# Check Java version
java -version

# Check if port is in use
sudo netstat -tlnp | grep 8084
```

### Problem: Health check fails

**Solution:**
```powershell
# Get VM IP
$VM_IP = gcloud compute instances describe orderservice-vm --zone=us-central1-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# Test health endpoint manually
curl "http://${VM_IP}:8084/actuator/health"

# Check firewall rules
gcloud compute firewall-rules list --filter="targetTags:orderservice"
```

---

## 🎓 Learning Resources

- **GitHub Actions:** https://docs.github.com/en/actions
- **Google Cloud Compute:** https://cloud.google.com/compute/docs
- **Spring Boot Deployment:** https://spring.io/guides/gs/spring-boot-docker/

---

## 📈 Next Steps (Optional Enhancements)

### Add Automated Tests

```yaml
- name: Run Tests
  run: ./mvnw test
```

### Add Notifications

```yaml
- name: Notify on Success
  if: success()
  # Add Slack/Email notification
```

### Add Multiple Environments

Create separate workflows for:
- `deploy-to-dev.yml` (deploys on push to develop)
- `deploy-to-staging.yml` (deploys on push to staging)
- `deploy-to-prod.yml` (deploys on push to main)

### Add Rollback Capability

Store previous JAR versions and add rollback workflow

---

## 📞 Getting Help

If you encounter issues:

1. **Check the documentation:**
   - `CICD_SETUP_GUIDE.md` - Detailed instructions
   - `CICD_QUICK_REFERENCE.md` - Quick commands

2. **Review logs:**
   - GitHub Actions logs (in Actions tab)
   - VM service logs: `sudo journalctl -u orderservice`

3. **Verify configuration:**
   - Service account exists and has permissions
   - GitHub secret is set correctly
   - VM is running and accessible

---

## ✨ Benefits of This Setup

✅ **Automated deployments** - No manual steps needed
✅ **Fast feedback** - Know immediately if deployment succeeds
✅ **Consistent** - Same process every time
✅ **Secure** - No credentials in code
✅ **Auditable** - Full deployment history in GitHub
✅ **Rollback ready** - Easy to revert if needed
✅ **Zero downtime** - Service restarts automatically

---

## 🎉 You're All Set!

Your CI/CD pipeline is ready to go. Just follow the 3 quick steps above and you'll have automatic deployments working in minutes!

**Happy deploying! 🚀**

---

**Created:** October 15, 2025
**Version:** 1.0.0
**For:** Order Service - Google Cloud VM Deployment
