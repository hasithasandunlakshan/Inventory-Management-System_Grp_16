# Notification Service Deployment Scripts for Google Cloud VM

This directory contains deployment scripts and configuration files for deploying the Notification Service to Google Cloud VM.

## Prerequisites

1. **Google Cloud SDK**: Install and configure gcloud CLI
2. **Project Setup**: Ensure you have access to project `api-gateway-474511`
3. **Authentication**: Run `gcloud auth login` and `gcloud config set project api-gateway-474511`

## Files Description

- `deploy-to-gcp.sh`: Main deployment script that creates VM and deploys the service
- `setup-vm.sh`: VM setup script that installs Java and configures the service
- `notification-service.service`: Systemd service configuration
- `Dockerfile`: Docker configuration (for containerized deployment)

## Deployment Steps

### Option 1: Direct VM Deployment (Recommended)

1. Make scripts executable:
   ```bash
   chmod +x deploy/deploy-to-gcp.sh
   chmod +x deploy/setup-vm.sh
   ```

2. Run deployment:
   ```bash
   ./deploy/deploy-to-gcp.sh
   ```

### Option 2: Manual Deployment

1. **Build the application:**
   ```bash
   ./mvnw clean package -DskipTests
   ```

2. **Create VM:**
   ```bash
   gcloud compute instances create notification-service-vm \
     --project=api-gateway-474511 \
     --zone=us-central1-a \
     --machine-type=e2-medium \
     --image-family=ubuntu-2004-lts \
     --image-project=ubuntu-os-cloud \
     --tags=notification-service
   ```

3. **Create firewall rule:**
   ```bash
   gcloud compute firewall-rules create allow-notification-service \
     --direction=INGRESS \
     --priority=1000 \
     --network=default \
     --action=ALLOW \
     --rules=tcp:8087 \
     --target-tags=notification-service
   ```

4. **Copy files and setup:**
   ```bash
   gcloud compute scp target/notificationservice-0.0.1-SNAPSHOT.jar notification-service-vm:~/app.jar --zone=us-central1-a
   gcloud compute scp deploy/setup-vm.sh notification-service-vm:~/setup-vm.sh --zone=us-central1-a
   gcloud compute scp deploy/notification-service.service notification-service-vm:~/notification-service.service --zone=us-central1-a
   
   gcloud compute ssh notification-service-vm --zone=us-central1-a --command="chmod +x ~/setup-vm.sh && ~/setup-vm.sh"
   ```

## Configuration

The service is already configured to connect to:
- **Kafka Bootstrap Servers**: `34.16.102.169:9092`
- **Database**: Cloud MySQL Database (Aiven)
- **Port**: `8087`

## Service Management

Once deployed, you can manage the service using:

```bash
# SSH into VM
gcloud compute ssh notification-service-vm --zone=us-central1-a

# Check service status
sudo systemctl status notification-service

# View logs
sudo journalctl -u notification-service -f

# Restart service
sudo systemctl restart notification-service

# Stop service
sudo systemctl stop notification-service
```

## Endpoints

After deployment, the service will be available at:
- **Health Check**: `http://[EXTERNAL_IP]:8087/health`
- **WebSocket Test**: `http://[EXTERNAL_IP]:8087/websocket-test.html`
- **Notifications API**: `http://[EXTERNAL_IP]:8087/api/notifications`

## Monitoring

- **System monitoring**: `htop` (installed on VM)
- **Service logs**: `sudo journalctl -u notification-service -f`
- **Application logs**: Check Spring Boot logs in the journal

## Troubleshooting

1. **Service not starting**: Check logs with `sudo journalctl -u notification-service -f`
2. **Connection issues**: Verify firewall rules and VM external IP
3. **Kafka connection**: Ensure Kafka server at `34.16.102.169:9092` is accessible
4. **Database connection**: Verify MySQL connection string and credentials

## Kafka Topics

The service listens to these Kafka topics:
- `order-notifications`
- `inventory-notifications` 
- `payment-notifications`
- `user-events`
- `product-stock-updates`
- `order-status-updates`