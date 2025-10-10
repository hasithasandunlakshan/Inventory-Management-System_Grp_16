# Complete Kafka Deployment Guide for Inventory Management System

## 🎯 Overview
This guide will help you deploy Kafka on Google Cloud VM with all your existing topics and connect your Cloud Run services to it.

## 📋 Prerequisites
- Google Cloud SDK installed and configured
- Docker installed (for testing)
- Appropriate GCP permissions for VM creation and firewall rules
- Your Cloud Run services (Order Service, User Service, API Gateway) already deployed

## 🚀 Step 1: Deploy Kafka VM

### Option A: Using PowerShell (Windows)
```powershell
# Navigate to deployment directory
cd gcp-kafka-deployment

# Update the script with your project ID
# Edit create-kafka-vm.ps1 and replace "your-project-id" with your actual project ID

# Deploy Kafka VM
.\create-kafka-vm.ps1 -ProjectId "your-actual-project-id"
```

### Option B: Using Bash (Linux/WSL)
```bash
# Navigate to deployment directory
cd gcp-kafka-deployment

# Make scripts executable
chmod +x *.sh

# Update the script with your project ID
# Edit create-kafka-vm.sh and replace "your-project-id" with your actual project ID

# Deploy Kafka VM
./create-kafka-vm.sh
```

## 📊 Step 2: Verify Kafka Deployment

After deployment, you should see output like:
```
✅ Kafka deployment completed!

📋 Connection Details:
   Kafka Bootstrap Servers: 34.123.45.67:9092
   Zookeeper: 34.123.45.67:2181
   Kafka UI: http://34.123.45.67:8088
```

### Test the deployment:
```powershell
# PowerShell
.\test-kafka-connection.ps1 34.123.45.67

# Bash
./test-kafka-connection.sh 34.123.45.67
```

## 🔧 Step 3: Update Service Configurations

Update all your microservices to connect to the new Kafka instance:

```powershell
# PowerShell
.\update-service-configs.ps1 -KafkaServerIp "34.123.45.67"

# Bash  
./update-service-configs.sh 34.123.45.67
```

This will update:
- ✅ Order Service configuration
- ✅ Product Service configuration  
- ✅ Notification Service configuration
- ✅ Resource Service configuration
- ✅ User Service configuration
- ✅ Docker Compose files

## 🏗️ Step 4: Rebuild and Redeploy Services

### Rebuild Docker Images
```bash
# Order Service
cd ../backend/Orderservice
docker build -t gcr.io/your-project-id/orderservice:latest .
docker push gcr.io/your-project-id/orderservice:latest

# Product Service  
cd ../productservice
docker build -t gcr.io/your-project-id/productservice:latest .
docker push gcr.io/your-project-id/productservice:latest

# Notification Service
cd ../notificationservice
docker build -t gcr.io/your-project-id/notificationservice:latest .
docker push gcr.io/your-project-id/notificationservice:latest

# Resource Service
cd ../resourseservice
docker build -t gcr.io/your-project-id/resourceservice:latest .
docker push gcr.io/your-project-id/resourceservice:latest

# User Service
cd ../userservice
docker build -t gcr.io/your-project-id/userservice:latest .
docker push gcr.io/your-project-id/userservice:latest
```

### Update Cloud Run Services
```bash
# Update Order Service
gcloud run services update orderservice \
    --image gcr.io/your-project-id/orderservice:latest \
    --region us-central1

# Update Product Service
gcloud run services update productservice \
    --image gcr.io/your-project-id/productservice:latest \
    --region us-central1

# Update Notification Service  
gcloud run services update notificationservice \
    --image gcr.io/your-project-id/notificationservice:latest \
    --region us-central1

# Update Resource Service
gcloud run services update resourceservice \
    --image gcr.io/your-project-id/resourceservice:latest \
    --region us-central1

# Update User Service
gcloud run services update userservice \
    --image gcr.io/your-project-id/userservice:latest \
    --region us-central1
```

## 🔍 Step 5: Verify Kafka Integration

### Check Topics
```bash
# List all topics
./manage-kafka-topics.sh 34.123.45.67 list

# Check topic details
./manage-kafka-topics.sh 34.123.45.67 describe inventory-reservation-request
```

### Monitor Consumer Groups
```bash
# Check consumer groups
./manage-kafka-topics.sh 34.123.45.67 groups
```

### Test Topic Communication
```bash
# Test a specific topic
./manage-kafka-topics.sh 34.123.45.67 test order-notifications
```

## 📊 Kafka Topics in Your System

| Topic Name | Producer | Consumer | Purpose |
|------------|----------|----------|---------|
| `inventory-reservation-request` | Order Service | Product Service | Inventory reservation requests |
| `inventory-reservation-response` | Product Service | Order Service | Inventory reservation responses |
| `order-notifications` | Order Service | Notification Service | Order status notifications |
| `driver-profile-created-events` | Resource Service | User Service | Driver profile creation events |
| `inventory-notifications` | Product Service | Notification Service | Inventory-related notifications |
| `payment-notifications` | Order Service | Notification Service | Payment-related notifications |

## 🛡️ Security and Network Configuration

### Firewall Rules Created
- **Port 9092**: Kafka broker communication
- **Port 2181**: Zookeeper communication  
- **Port 8088**: Kafka UI web interface

### Current Security Level
- ⚠️ **Development**: Open to all IPs (0.0.0.0/0)
- 🔒 **Production**: Restrict to specific IP ranges

### Production Security Recommendations
```bash
# Create restricted firewall rule
gcloud compute firewall-rules create kafka-server-ports-restricted \
    --allow tcp:9092,tcp:2181 \
    --source-ranges 10.0.0.0/8,172.16.0.0/12,192.168.0.0/16 \
    --target-tags kafka-server \
    --description "Restrict Kafka access to private networks"

# Delete the open rule (after testing)
gcloud compute firewall-rules delete kafka-server-ports
```

## 🔧 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check VM status: `gcloud compute instances list`
   - Verify firewall rules: `gcloud compute firewall-rules list`
   - Test port connectivity: `telnet VM_IP 9092`

2. **Services Can't Connect to Kafka**
   - Verify configuration files were updated
   - Check Cloud Run service logs
   - Ensure services were rebuilt and redeployed

3. **Topics Not Found**
   - Check if topics were created: `./manage-kafka-topics.sh VM_IP list`
   - Recreate topics: `./manage-kafka-topics.sh VM_IP create`

### Debug Commands
```bash
# SSH into Kafka VM
gcloud compute ssh kafka-server --zone us-central1-a

# Check Docker containers
sudo docker ps

# Check Kafka logs
sudo docker logs kafka
sudo docker logs zookeeper

# Check topic details
sudo docker exec kafka kafka-topics --list --bootstrap-server localhost:9092
```

## 📈 Monitoring and Maintenance

### Access Kafka UI
Open your browser and go to: `http://VM_EXTERNAL_IP:8088`

Features available:
- Topic management
- Consumer group monitoring
- Message browsing
- Cluster health status

### Backup Strategy
```bash
# SSH into VM
gcloud compute ssh kafka-server --zone us-central1-a

# Create backup
sudo tar -czf kafka-backup-$(date +%Y%m%d).tar.gz ~/kafka-data ~/zookeeper-data

# Upload to Cloud Storage
gsutil cp kafka-backup-*.tar.gz gs://your-backup-bucket/kafka-backups/
```

## 🎉 Completion Checklist

- [ ] Kafka VM deployed and running
- [ ] All required topics created
- [ ] Service configurations updated
- [ ] Docker images rebuilt and pushed
- [ ] Cloud Run services updated
- [ ] Kafka connectivity tested
- [ ] Kafka UI accessible
- [ ] Consumer groups active

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review Cloud Run service logs
3. Test Kafka connectivity using provided scripts
4. Verify topic and consumer group status in Kafka UI