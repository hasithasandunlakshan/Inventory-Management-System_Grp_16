# Kafka Deployment Guide

This directory contains multiple deployment options for your Kafka setup.

## Deployment Options

### Option 1: GitHub Codespaces (Recommended for Development) ✅
**Best for:** Development, testing, team collaboration

- ✅ **Free tier:** 60 hours/month
- ✅ **No local setup:** Everything in the cloud
- ✅ **Easy sharing:** Team members can create their own Codespaces
- ✅ **Port forwarding:** Automatic URLs for all services

📖 **See:** `CODESPACES_SETUP.md` for complete guide

**Quick Start:**
```bash
# After creating a Codespace from your repo
cd gcp-kafka-deployment
chmod +x start-codespaces.sh
./start-codespaces.sh
```

### Option 2: Google Cloud Platform VM (Production)
**Best for:** Production deployments with persistent data

- ✅ **Always available:** No auto-sleep
- ✅ **Persistent storage:** Data survives restarts
- ✅ **Scalable:** Adjust resources as needed
- ✅ **Static IP:** Consistent connection endpoint

📖 **See:** `COMPLETE_DEPLOYMENT_GUIDE.md` for GCP setup

**Quick Start:**
```bash
./deploy-kafka-simple.ps1 -ProjectId "your-project-id"
```

### Option 3: Local Development
**Best for:** Offline development

**Quick Start:**
```bash
docker-compose -f docker-compose-simple.yml up -d
```

## Which Option Should You Choose?

| Use Case | Recommended Option |
|----------|-------------------|
| Learning & Development | GitHub Codespaces |
| Team Collaboration | GitHub Codespaces |
| Testing Before Production | GitHub Codespaces |
| Production Deployment | GCP VM |
| Offline Development | Local Docker |
| CI/CD Pipeline | GCP VM or Cloud Service |

## Files in This Directory

**Codespaces Setup:**
- `.devcontainer/devcontainer.json` - Codespaces configuration
- `docker-compose-codespaces.yml` - Docker Compose for Codespaces
- `start-codespaces.sh` - Start script for Codespaces
- `CODESPACES_SETUP.md` - Complete Codespaces guide

**GCP VM Setup:**
- `docker-compose-gcp.yml` - Docker Compose for GCP VM
- `deploy-kafka-simple.ps1` - PowerShell deployment script
- `setup-kafka.sh` - VM setup script
- `COMPLETE_DEPLOYMENT_GUIDE.md` - Complete GCP guide

**Local Development:**
- `docker-compose-simple.yml` - Simple local setup

**Utilities:**
- `test-kafka-connection.ps1` - Test Kafka connectivity
- `spring-kafka-config-template.properties` - Spring Boot config template
- `kafka-topics-config.yaml` - Topic configurations

## Getting Started

### For GitHub Codespaces (Easiest):

1. Push this repo to GitHub
2. Click **Code** → **Codespaces** → **Create codespace**
3. Wait for environment to build
4. Run: `./start-codespaces.sh`
5. Access Kafka UI from PORTS tab

### For GCP VM:
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