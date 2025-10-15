# CI/CD Quick Reference Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Run Setup Script
```powershell
cd "c:\Users\PC\Desktop\SEM 5 Project\Inventory-Management-System_Grp_16\backend\Orderservice"
.\setup-github-actions.ps1
```

### Step 2: Add Secret to GitHub
1. Copy the key content from `github-actions-key.json`
2. Go to GitHub: `Settings` → `Secrets and variables` → `Actions`
3. Click `New repository secret`
4. Name: `GCP_SA_KEY`
5. Value: Paste the entire JSON content
6. Click `Add secret`

### Step 3: Delete Local Key
```powershell
Remove-Item github-actions-key.json
```

### Step 4: Push to Main Branch
```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

✅ Done! Your service will auto-deploy on every push to main.

---

## 📋 Commands Reference

### Manual Deployment Trigger
Go to GitHub → Actions → "Deploy Order Service to Google Cloud VM" → Run workflow

### Check Service Status
```powershell
gcloud compute ssh orderservice-vm --zone=us-central1-a --command="sudo systemctl status orderservice"
```

### View Logs
```powershell
gcloud compute ssh orderservice-vm --zone=us-central1-a --command="sudo journalctl -u orderservice -f"
```

### Get VM IP
```powershell
gcloud compute instances describe orderservice-vm --zone=us-central1-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

### Test Health Endpoint
```powershell
$VM_IP = gcloud compute instances describe orderservice-vm --zone=us-central1-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
curl "http://${VM_IP}:8084/actuator/health"
```

---

## 🔧 Troubleshooting

### Pipeline fails at authentication
```powershell
# Verify service account
gcloud iam service-accounts list --project=api-gateway-474511

# Re-run setup script
.\setup-github-actions.ps1
```

### SSH permission denied
```powershell
# Enable OS Login and grant permissions
gcloud compute instances add-metadata orderservice-vm --zone=us-central1-a --metadata=enable-oslogin=TRUE

gcloud compute instances add-iam-policy-binding orderservice-vm `
  --zone=us-central1-a `
  --member="serviceAccount:github-actions-deployer@api-gateway-474511.iam.gserviceaccount.com" `
  --role="roles/compute.osAdminLogin"
```

### Service won't start
```powershell
# SSH to VM and check
gcloud compute ssh orderservice-vm --zone=us-central1-a

# Check Java version
java -version

# Check service status
sudo systemctl status orderservice

# View logs
sudo journalctl -u orderservice -n 100
```

---

## 📁 Files Created

- `.github/workflows/deploy-to-vm.yml` - GitHub Actions workflow
- `CICD_SETUP_GUIDE.md` - Detailed setup guide
- `setup-github-actions.ps1` - Automated setup script
- `CICD_QUICK_REFERENCE.md` - This file

---

## 🎯 What Happens on Push

1. Code is pushed to `main` branch
2. GitHub Actions triggers the workflow
3. Application is built with Maven
4. JAR is uploaded to the VM
5. Service is restarted automatically
6. Health checks verify deployment
7. You get a notification (success/failure)

**Time:** ~5-10 minutes per deployment

---

## 🔐 Security Notes

⚠️ **Never commit the service account key file to Git!**

✅ Always delete `github-actions-key.json` after adding to GitHub

✅ Rotate keys regularly (every 90 days recommended)

✅ Use separate service accounts for prod/dev

---

## 📊 Monitoring

### View Deployment History
GitHub → Actions tab → Select workflow run

### Check Deployment Status
```powershell
# Get latest deployment info
$VM_IP = gcloud compute instances describe orderservice-vm --zone=us-central1-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
Write-Host "Service: http://${VM_IP}:8084"
Write-Host "Health: http://${VM_IP}:8084/actuator/health"
Write-Host "Orders API: http://${VM_IP}:8084/api/orders/all"
```

---

## 🆘 Support

Need help? Check:
1. GitHub Actions logs
2. VM service logs: `sudo journalctl -u orderservice`
3. Detailed guide: `CICD_SETUP_GUIDE.md`

---

**Last Updated:** October 15, 2025
