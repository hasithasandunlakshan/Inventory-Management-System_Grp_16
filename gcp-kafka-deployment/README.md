# Kafka VM Deployment Instructions

## Prerequisites
1. Google Cloud SDK installed and configured
2. Appropriate permissions for creating VMs and firewall rules
3. A Google Cloud Project with billing enabled

## Deployment Steps

### 1. Update Configuration
Edit `create-kafka-vm.sh` and update these variables:
```bash
PROJECT_ID="your-actual-project-id"  # Replace with your GCP project ID
ZONE="us-central1-a"                 # Change if you prefer a different zone
```

### 2. Make Scripts Executable
```bash
chmod +x create-kafka-vm.sh
chmod +x setup-kafka.sh
```

### 3. Deploy Kafka VM
```bash
./create-kafka-vm.sh
```

This script will:
- Create firewall rules for Kafka ports (9092, 2181, 8088)
- Create a new VM instance
- Install Docker and Docker Compose
- Deploy Kafka, Zookeeper, and Kafka UI
- Create necessary topics
- Save connection details to `kafka-connection-details.txt`

### 4. Verify Deployment
After deployment, you can:
- Access Kafka UI at: `http://[EXTERNAL_IP]:8088`
- Connect to Kafka at: `[EXTERNAL_IP]:9092`
- Test the connection using the provided test scripts

## Security Considerations

### Production Recommendations:
1. **Restrict Firewall Rules**: Instead of `0.0.0.0/0`, use specific IP ranges for your Cloud Run services
2. **Use Internal Load Balancer**: For production, consider using Google Cloud's internal load balancer
3. **Enable Authentication**: Configure SASL authentication for Kafka
4. **Use Managed Kafka**: Consider Google Cloud Pub/Sub or Confluent Cloud for production

### Network Security:
```bash
# Example: Restrict access to specific Cloud Run regions
gcloud compute firewall-rules create kafka-server-ports-restricted \
    --allow tcp:9092,tcp:2181 \
    --source-ranges 10.0.0.0/8,172.16.0.0/12,192.168.0.0/16 \
    --target-tags kafka-server \
    --description "Restrict Kafka access to private networks"
```

## Monitoring and Maintenance

### Check Service Status
```bash
# SSH into the VM
gcloud compute ssh kafka-server --zone=us-central1-a

# Check running containers
sudo docker-compose ps

# View logs
sudo docker-compose logs kafka
sudo docker-compose logs zookeeper
```

### Backup and Recovery
```bash
# Backup Kafka data (run on VM)
sudo tar -czf kafka-backup-$(date +%Y%m%d).tar.gz ~/kafka-data ~/zookeeper-data

# Copy backup to Cloud Storage
gsutil cp kafka-backup-*.tar.gz gs://your-backup-bucket/kafka-backups/
```

## Troubleshooting

### Common Issues:
1. **VM not accessible**: Check firewall rules and VM status
2. **Kafka not starting**: Check disk space and memory
3. **Connection refused**: Verify external IP in advertised listeners

### Debug Commands:
```bash
# Check VM logs
gcloud compute instances get-serial-port-output kafka-server --zone=us-central1-a

# Test Kafka connectivity
telnet [EXTERNAL_IP] 9092

# List Kafka topics
sudo docker exec kafka kafka-topics --list --bootstrap-server localhost:29092
```