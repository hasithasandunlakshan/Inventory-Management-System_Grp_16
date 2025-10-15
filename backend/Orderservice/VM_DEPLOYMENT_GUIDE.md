# Order Service - Google Cloud VM Deployment Guide

This guide provides complete instructions for deploying the Order Service to a Google Cloud VM instance.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Deployment Files](#deployment-files)
- [Configuration](#configuration)
- [Deployment Steps](#deployment-steps)
- [Post-Deployment](#post-deployment)
- [Management](#management)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

1. **Google Cloud SDK (gcloud CLI)**
   ```powershell
   # Download and install from: https://cloud.google.com/sdk/docs/install
   # After installation, authenticate:
   gcloud auth login
   gcloud config set project api-gateway-474511
   ```

2. **Java 17** (for local build)
   ```powershell
   # Check Java version
   java -version
   ```

3. **Maven** (included via Maven Wrapper in the project)

4. **Project Configuration**
   - Project ID: `api-gateway-474511`
   - Default VM Name: `orderservice-vm`
   - Default Zone: `us-central1-a`
   - Default Machine Type: `e2-medium`
   - Service Port: `8084`

## 🚀 Quick Start

### Option 1: Deploy with Default Settings

```powershell
# Navigate to the project directory
cd "c:\Users\PC\Desktop\SEM 5 Project\Inventory-Management-System_Grp_16\backend\Orderservice"

# Run the deployment script
.\deploy-to-vm.ps1
```

### Option 2: Deploy with Custom Settings

```powershell
.\deploy-to-vm.ps1 -ProjectId "api-gateway-474511" `
                    -VMName "orderservice-vm" `
                    -Zone "us-central1-a" `
                    -MachineType "e2-medium" `
                    -ServicePort "8084"
```

## 📁 Deployment Files

### Main Deployment Scripts

1. **`deploy-to-vm.ps1`** - Complete VM deployment script
   - Creates a new VM instance
   - Installs Java 17, Maven, and Docker
   - Sets up systemd service
   - Builds and deploys the application
   - Configures firewall rules

2. **`update-vm-service.ps1`** - Quick update script
   - Updates the service without recreating the VM
   - Rebuilds and redeploys the JAR file
   - Restarts the service

3. **`vm-logs.ps1`** - Log viewing script
   - View service logs
   - Follow logs in real-time

## ⚙️ Configuration

### VM Instance Configuration

The deployment script creates a VM with:
- **Machine Type**: `e2-medium` (2 vCPUs, 4 GB memory)
- **OS**: Ubuntu 22.04 LTS
- **Boot Disk**: 20 GB Standard Persistent Disk
- **Network Tags**: `orderservice`, `http-server`
- **Firewall**: Port 8084 open to the internet

### Application Configuration

The service uses configuration from `application.properties` or `application-cloud.properties`.

To customize environment variables, modify the systemd service:

```bash
# SSH to VM
gcloud compute ssh orderservice-vm --zone=us-central1-a

# Edit service file
sudo nano /etc/systemd/system/orderservice.service

# Add/modify environment variables under [Service] section
Environment="DATABASE_URL=jdbc:mysql://..."
Environment="KAFKA_BOOTSTRAP_SERVERS=..."
Environment="STRIPE_SECRET_KEY=..."

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart orderservice
```

## 📝 Deployment Steps

### Step 1: Prepare Your Environment

```powershell
# Authenticate with Google Cloud
gcloud auth login

# Set project
gcloud config set project api-gateway-474511

# Verify Java installation
java -version
```

### Step 2: Configure Application

Edit `src/main/resources/application.properties` or `application-cloud.properties` with your configuration:

```properties
# Database
spring.datasource.url=jdbc:mysql://your-host:port/database
spring.datasource.username=your-username
spring.datasource.password=your-password

# Kafka
spring.kafka.bootstrap-servers=your-kafka-server:9092

# User Service
user.service.url=https://your-user-service-url

# Stripe
stripe.secret.key=sk_test_your_key
stripe.api.key=sk_test_your_key
```

### Step 3: Run Deployment

```powershell
# Full deployment
.\deploy-to-vm.ps1
```

The script will:
1. ✅ Check prerequisites
2. ✅ Enable required Google Cloud APIs
3. ✅ Create firewall rules
4. ✅ Create VM instance with startup script
5. ✅ Build application locally
6. ✅ Copy JAR file to VM
7. ✅ Configure and start systemd service
8. ✅ Display connection information

### Step 4: Verify Deployment

After deployment completes, test the service:

```powershell
# Get VM IP
$IP = gcloud compute instances describe orderservice-vm --zone=us-central1-a --format="get(networkInterfaces[0].accessConfigs[0].natIP)"

# Test health endpoint
curl "http://${IP}:8084/actuator/health"
```

## 🔄 Post-Deployment

### Access the Service

Your service will be available at:
```
http://<VM_EXTERNAL_IP>:8084
```

Example endpoints:
- Health Check: `http://<VM_EXTERNAL_IP>:8084/actuator/health`
- Orders API: `http://<VM_EXTERNAL_IP>:8084/api/orders`

### Set up DNS (Optional)

For a custom domain:

1. Reserve a static IP:
   ```powershell
   gcloud compute addresses create orderservice-ip --region=us-central1
   ```

2. Attach to VM:
   ```powershell
   gcloud compute instances delete-access-config orderservice-vm --zone=us-central1-a
   gcloud compute instances add-access-config orderservice-vm --zone=us-central1-a --address=<STATIC_IP>
   ```

3. Configure DNS records in your domain provider

## 🛠️ Management

### Update the Service

When you make code changes:

```powershell
# Quick update (doesn't recreate VM)
.\update-vm-service.ps1
```

### View Logs

```powershell
# View recent logs
.\vm-logs.ps1

# Follow logs in real-time
.\vm-logs.ps1 -Follow
```

Or SSH directly:
```powershell
gcloud compute ssh orderservice-vm --zone=us-central1-a
sudo journalctl -u orderservice -f
```

### Service Management Commands

```powershell
# SSH to VM
gcloud compute ssh orderservice-vm --zone=us-central1-a

# Check service status
sudo systemctl status orderservice

# Restart service
sudo systemctl restart orderservice

# Stop service
sudo systemctl stop orderservice

# Start service
sudo systemctl start orderservice

# View logs
sudo journalctl -u orderservice -f
```

### Resource Management

```powershell
# Stop VM (to save costs)
gcloud compute instances stop orderservice-vm --zone=us-central1-a

# Start VM
gcloud compute instances start orderservice-vm --zone=us-central1-a

# Delete VM
gcloud compute instances delete orderservice-vm --zone=us-central1-a

# List all VMs
gcloud compute instances list
```

## 🐛 Troubleshooting

### Service Won't Start

1. Check service logs:
   ```bash
   sudo journalctl -u orderservice -n 100
   ```

2. Verify Java is installed:
   ```bash
   java -version
   ```

3. Check JAR file exists:
   ```bash
   ls -la /opt/orderservice/
   ```

4. Test JAR manually:
   ```bash
   sudo -u orderservice java -jar /opt/orderservice/orderservice.jar
   ```

### Cannot Connect to Service

1. Check service is running:
   ```bash
   sudo systemctl status orderservice
   ```

2. Verify firewall rules:
   ```powershell
   gcloud compute firewall-rules list --filter="name=allow-orderservice"
   ```

3. Check if service is listening:
   ```bash
   sudo netstat -tulpn | grep 8084
   ```

4. Test from within VM:
   ```bash
   curl localhost:8084/actuator/health
   ```

### Database Connection Issues

1. Check connection from VM:
   ```bash
   telnet your-db-host 27040
   ```

2. Verify environment variables:
   ```bash
   sudo systemctl cat orderservice
   ```

3. Update database configuration:
   ```bash
   sudo nano /etc/systemd/system/orderservice.service
   # Add/update DATABASE_URL
   sudo systemctl daemon-reload
   sudo systemctl restart orderservice
   ```

### High Memory Usage

Upgrade to larger machine type:
```powershell
# Stop VM
gcloud compute instances stop orderservice-vm --zone=us-central1-a

# Change machine type
gcloud compute instances set-machine-type orderservice-vm --machine-type=e2-standard-2 --zone=us-central1-a

# Start VM
gcloud compute instances start orderservice-vm --zone=us-central1-a
```

## 💰 Cost Optimization

### Estimated Costs (us-central1)

- **e2-medium** (2 vCPU, 4 GB RAM): ~$24/month
- **e2-small** (2 vCPU, 2 GB RAM): ~$13/month
- **Disk (20 GB Standard)**: ~$0.80/month
- **Network Egress**: Variable based on traffic

### Cost Saving Tips

1. **Stop VM when not in use**:
   ```powershell
   gcloud compute instances stop orderservice-vm --zone=us-central1-a
   ```

2. **Use preemptible VM** (for dev/test):
   ```powershell
   # Add --preemptible flag to create command
   ```

3. **Downgrade machine type** if resources not fully utilized

4. **Use Cloud Run** for serverless auto-scaling (scales to zero)

## 🔐 Security Best Practices

1. **Restrict Firewall Rules**:
   ```powershell
   # Allow only specific IPs
   gcloud compute firewall-rules update allow-orderservice --source-ranges=YOUR_IP/32
   ```

2. **Use Secrets Management**:
   - Store sensitive data in Google Secret Manager
   - Reference secrets in service configuration

3. **Enable SSL/TLS**:
   - Use Cloud Load Balancer with SSL certificate
   - Or configure Nginx reverse proxy with Let's Encrypt

4. **Regular Updates**:
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```

## 📚 Additional Resources

- [Google Cloud Compute Engine Documentation](https://cloud.google.com/compute/docs)
- [Systemd Service Management](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
- [Spring Boot Deployment Guide](https://docs.spring.io/spring-boot/docs/current/reference/html/deployment.html)

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review service logs: `.\vm-logs.ps1 -Follow`
3. SSH to VM and investigate: `gcloud compute ssh orderservice-vm --zone=us-central1-a`

---

**Happy Deploying! 🚀**
