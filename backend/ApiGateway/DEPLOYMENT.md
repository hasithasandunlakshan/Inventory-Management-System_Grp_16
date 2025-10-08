# API Gateway Docker Deployment Guide

## Prerequisites
- Oracle VM with Linux (Oracle Linux, CentOS, or RHEL)
- Internet connection for downloading Docker and dependencies

## Deployment Steps

### 1. Transfer Files to Oracle VM
Transfer your entire ApiGateway project folder to your Oracle VM using one of these methods:

**Option A: Using SCP (from your local machine)**
```bash
scp -r "C:\Users\PC\Desktop\SEM 5 Project\Inventory-Management-System_Grp_16\backend\ApiGateway" username@your-oracle-vm-ip:/home/username/
```

**Option B: Using Git (if your project is in a repository)**
```bash
git clone your-repository-url
cd Inventory-Management-System_Grp_16/backend/ApiGateway
```

### 2. Connect to Oracle VM
```bash
ssh username@your-oracle-vm-ip
```

### 3. Navigate to Project Directory
```bash
cd /home/username/ApiGateway
```

### 4. Make Deploy Script Executable
```bash
chmod +x deploy.sh
```

### 5. Run Deployment Script
```bash
./deploy.sh
```

The script will:
- Install Docker and Docker Compose if not present
- Create a Docker network for your services
- Build the API Gateway Docker image
- Start the service using Docker Compose

### 6. Verify Deployment
After deployment, verify the service is running:
```bash
curl http://localhost:8090/actuator/health
```

## Manual Docker Commands (Alternative)

If you prefer to run commands manually:

### Build Docker Image
```bash
docker build -t api-gateway:latest .
```

### Run Container
```bash
docker run -d \
  --name api-gateway-service \
  -p 8090:8090 \
  -e SPRING_PROFILES_ACTIVE=docker \
  api-gateway:latest
```

### Using Docker Compose
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f api-gateway

# Stop services
docker-compose down
```

## Configuration

### Environment Variables
The application uses these environment variables (set in docker-compose.yml):
- `JWT_SECRET`: JWT signing secret
- `USER_SERVICE_URL`: User service endpoint
- `PRODUCT_SERVICE_URL`: Product service endpoint
- `ORDER_SERVICE_URL`: Order service endpoint
- `SUPPLIER_SERVICE_URL`: Supplier service endpoint
- `INVENTORY_SERVICE_URL`: Inventory service endpoint
- `RESOURCE_SERVICE_URL`: Resource service endpoint

### Network Configuration
- The service runs on port 8090
- Uses a Docker network called `inventory-network`
- Communicates with other microservices through this network

## Troubleshooting

### Check Service Status
```bash
docker-compose ps
```

### View Logs
```bash
docker-compose logs -f api-gateway
```

### Restart Service
```bash
docker-compose restart api-gateway
```

### Access Container Shell
```bash
docker exec -it api-gateway-service bash
```

### Check Network Connectivity
```bash
docker network ls
docker network inspect inventory-network
```

## Firewall Configuration (Oracle Linux)

If you need to access the service from external machines:

```bash
# Open port 8090
sudo firewall-cmd --permanent --add-port=8090/tcp
sudo firewall-cmd --reload
```

## Service URLs

After deployment, your API Gateway will be accessible at:
- Internal: `http://localhost:8090`
- External: `http://your-oracle-vm-ip:8090`

## Health Check

The service includes health check endpoints:
- Health: `http://your-oracle-vm-ip:8090/actuator/health`
- Info: `http://your-oracle-vm-ip:8090/actuator/info`