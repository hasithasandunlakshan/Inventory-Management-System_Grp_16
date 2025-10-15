# Order Service - VM Deployment Summary

## 📦 What I've Created for You

I've set up a complete VM deployment solution for your Order Service with the following files:

### 1. **deploy-to-vm.ps1** - Main Deployment Script
   - Creates a new Google Cloud VM instance
   - Installs Java 17, Maven, and Docker
   - Configures systemd service for auto-start
   - Builds your application and deploys it
   - Sets up firewall rules for port 8084
   - Provides complete status and connection information

### 2. **update-vm-service.ps1** - Quick Update Script
   - Updates service without recreating VM
   - Faster for code changes
   - Rebuilds JAR and redeploys

### 3. **manage-vm.ps1** - VM Management Tool
   - Start/stop VM
   - Restart service
   - Check status
   - SSH access
   - VM information
   - Delete VM

### 4. **vm-logs.ps1** - Log Viewer
   - View service logs
   - Follow logs in real-time

### 5. **VM_DEPLOYMENT_GUIDE.md** - Complete Documentation
   - Detailed deployment instructions
   - Configuration guide
   - Troubleshooting tips
   - Cost optimization advice

### 6. **VM_QUICK_START.md** - Quick Reference
   - Common commands at a glance
   - Quick troubleshooting
   - Essential information

## 🚀 How to Deploy

### Prerequisites Checklist
- [x] Google Cloud SDK installed
- [x] Project ID: `api-gateway-474511`
- [x] Java 17 (for local build)
- [x] Authenticated with Google Cloud

### Deployment Steps

1. **Open PowerShell and navigate to your project:**
   ```powershell
   cd "c:\Users\PC\Desktop\SEM 5 Project\Inventory-Management-System_Grp_16\backend\Orderservice"
   ```

2. **Authenticate with Google Cloud:**
   ```powershell
   gcloud auth login
   gcloud config set project api-gateway-474511
   ```

3. **Run the deployment script:**
   ```powershell
   .\deploy-to-vm.ps1
   ```

4. **Wait for deployment to complete (3-5 minutes)**

5. **Test your service:**
   ```powershell
   # The script will display your VM's IP address
   # Test with:
   curl http://<YOUR_VM_IP>:8084/actuator/health
   ```

## 🎯 What the Script Does

1. ✅ Checks prerequisites (gcloud, docker)
2. ✅ Sets up Google Cloud project
3. ✅ Enables required APIs (Compute Engine, Logging)
4. ✅ Creates firewall rule for port 8084
5. ✅ Creates VM instance with:
   - Ubuntu 22.04 LTS
   - Machine Type: e2-medium (2 vCPUs, 4 GB RAM)
   - 20 GB boot disk
6. ✅ Installs Java 17 on VM
7. ✅ Builds your Spring Boot application
8. ✅ Copies JAR to VM
9. ✅ Creates systemd service for auto-start
10. ✅ Starts the service
11. ✅ Displays connection info

## 📊 VM Configuration

**Default Settings:**
- **VM Name:** orderservice-vm
- **Zone:** us-central1-a
- **Machine Type:** e2-medium (2 vCPU, 4 GB memory)
- **OS:** Ubuntu 22.04 LTS
- **Disk:** 20 GB Standard Persistent Disk
- **Port:** 8084
- **Auto-start:** Enabled (service starts on VM boot)

**Customization:**
```powershell
.\deploy-to-vm.ps1 -VMName "my-vm" `
                    -Zone "us-east1-b" `
                    -MachineType "e2-standard-2" `
                    -ServicePort "8080"
```

## 🔧 Post-Deployment Management

### Update Your Code
```powershell
# Make code changes, then:
.\update-vm-service.ps1
```

### View Logs
```powershell
# Last 100 lines
.\vm-logs.ps1

# Follow in real-time
.\vm-logs.ps1 -Follow
```

### Check Status
```powershell
.\manage-vm.ps1 -Action status
```

### Get VM Info
```powershell
.\manage-vm.ps1 -Action info
```

### Restart Service
```powershell
.\manage-vm.ps1 -Action restart
```

### SSH to VM
```powershell
.\manage-vm.ps1 -Action ssh
```

## 💰 Cost Estimation

**Monthly costs (us-central1):**
- VM (e2-medium): ~$24/month
- Disk (20 GB): ~$0.80/month
- **Total: ~$25/month**

**Save money:**
```powershell
# Stop VM when not in use
.\manage-vm.ps1 -Action stop

# Start when needed
.\manage-vm.ps1 -Action start
```

## 🌐 Accessing Your Service

After deployment, your service will be available at:
```
http://<VM_EXTERNAL_IP>:8084
```

### Available Endpoints:
- Health: `http://<IP>:8084/actuator/health`
- Orders: `http://<IP>:8084/api/orders`
- Other Spring Boot endpoints...

### Find Your IP:
```powershell
.\manage-vm.ps1 -Action info
```

## 🔐 Security Notes

The deployment includes:
- ✅ Dedicated service user (non-root)
- ✅ Firewall rule for port 8084
- ✅ Systemd service with automatic restart
- ✅ Health checks configured

**Recommended improvements:**
1. Restrict firewall to specific IPs
2. Set up SSL/TLS with reverse proxy
3. Use Google Secret Manager for sensitive data
4. Enable Cloud Logging and Monitoring

## 🐛 Common Issues & Solutions

### 1. Service Won't Start
```powershell
# Check logs
.\vm-logs.ps1

# Check status
.\manage-vm.ps1 -Action status
```

### 2. Can't Connect
```powershell
# Verify firewall
gcloud compute firewall-rules list --filter="name=allow-orderservice"

# Test from VM
.\manage-vm.ps1 -Action ssh
curl localhost:8084/actuator/health
```

### 3. Database Connection Issues
- Verify database URL in `application.properties`
- Check network connectivity from VM
- Update environment variables in systemd service

### 4. Out of Memory
```powershell
# Upgrade VM
gcloud compute instances stop orderservice-vm --zone=us-central1-a
gcloud compute instances set-machine-type orderservice-vm --machine-type=e2-standard-2 --zone=us-central1-a
gcloud compute instances start orderservice-vm --zone=us-central1-a
```

## 📚 Next Steps

1. **Deploy your service:**
   ```powershell
   .\deploy-to-vm.ps1
   ```

2. **Test the endpoints:**
   ```powershell
   # Get IP
   .\manage-vm.ps1 -Action info
   
   # Test
   curl http://<IP>:8084/actuator/health
   ```

3. **Monitor logs:**
   ```powershell
   .\vm-logs.ps1 -Follow
   ```

4. **Update as needed:**
   ```powershell
   # Make changes, then:
   .\update-vm-service.ps1
   ```

## 📖 Documentation

- **Quick Start:** `VM_QUICK_START.md`
- **Full Guide:** `VM_DEPLOYMENT_GUIDE.md`
- **This Summary:** `VM_DEPLOYMENT_SUMMARY.md`

## 🆘 Need Help?

1. Check `VM_DEPLOYMENT_GUIDE.md` for detailed documentation
2. View logs: `.\vm-logs.ps1 -Follow`
3. Check status: `.\manage-vm.ps1 -Action status`
4. SSH to VM: `.\manage-vm.ps1 -Action ssh`

---

## 🎉 Ready to Deploy!

Your Order Service is ready for VM deployment. Simply run:

```powershell
.\deploy-to-vm.ps1
```

And you'll have your service running on Google Cloud in minutes!

**Good luck! 🚀**
