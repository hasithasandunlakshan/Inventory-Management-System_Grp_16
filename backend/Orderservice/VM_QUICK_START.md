# Order Service VM Deployment - Quick Reference

## 🚀 Deploy to VM (First Time)

```powershell
.\deploy-to-vm.ps1
```

This will:
- Create a new VM instance in GCP
- Install Java 17 and dependencies
- Build and deploy your application
- Set up systemd service
- Configure firewall rules

**Deployment takes ~3-5 minutes**

---

## 🔄 Update Existing Service

```powershell
.\update-vm-service.ps1
```

Use this when you make code changes. Much faster than full redeployment.

---

## 🛠️ Common Management Tasks

### Check Status
```powershell
.\manage-vm.ps1 -Action info
```

### View Logs
```powershell
# View recent logs
.\vm-logs.ps1

# Follow logs in real-time
.\vm-logs.ps1 -Follow
```

### Restart Service
```powershell
.\manage-vm.ps1 -Action restart
```

### SSH to VM
```powershell
.\manage-vm.ps1 -Action ssh
```

### Start/Stop VM
```powershell
# Stop VM (saves money when not in use)
.\manage-vm.ps1 -Action stop

# Start VM
.\manage-vm.ps1 -Action start
```

---

## 🌐 Access Your Service

After deployment, your service will be available at:

```
http://<VM_EXTERNAL_IP>:8084
```

### Find Your IP
```powershell
.\manage-vm.ps1 -Action info
```

### Test Endpoints
```powershell
# Get the IP first
$IP = gcloud compute instances describe orderservice-vm --zone=us-central1-a --format="get(networkInterfaces[0].accessConfigs[0].natIP)"

# Health check
curl "http://${IP}:8084/actuator/health"

# Orders endpoint
curl "http://${IP}:8084/api/orders"
```

---

## ⚠️ Troubleshooting

### Service not responding?
```powershell
# Check service status
.\manage-vm.ps1 -Action status

# View logs for errors
.\vm-logs.ps1 -Follow
```

### Need to restart?
```powershell
.\manage-vm.ps1 -Action restart
```

### Database connection issues?
```powershell
# SSH to VM and check config
.\manage-vm.ps1 -Action ssh

# Then run:
sudo systemctl status orderservice
sudo journalctl -u orderservice -n 100
```

---

## 💰 Cost Management

### Stop VM when not in use
```powershell
.\manage-vm.ps1 -Action stop
```

### Delete VM completely
```powershell
.\manage-vm.ps1 -Action delete
```

**Current VM Cost:** ~$24/month (e2-medium, us-central1)

---

## 📋 Important Files

- `deploy-to-vm.ps1` - Full deployment script
- `update-vm-service.ps1` - Quick update script
- `manage-vm.ps1` - VM management operations
- `vm-logs.ps1` - View service logs
- `VM_DEPLOYMENT_GUIDE.md` - Complete documentation

---

## 🆘 Quick Help

**Project ID:** `api-gateway-474511`  
**VM Name:** `orderservice-vm`  
**Zone:** `us-central1-a`  
**Port:** `8084`

**Need more help?** See `VM_DEPLOYMENT_GUIDE.md` for detailed documentation.
