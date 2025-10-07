# API Gateway Docker Deployment

This directory contains Docker configuration files for the API Gateway microservice.

## 📁 Files Overview

- `Dockerfile` - Multi-stage Docker build configuration
- `docker-compose.yml` - Docker Compose configuration for API Gateway and dependent services
- `.dockerignore` - Files to exclude from Docker build context

## 🚀 Quick Start

### Option 1: API Gateway Only

```bash
# Build and run API Gateway only
docker build -t api-gateway:latest .
docker run -d --name api-gateway -p 8090:8090 api-gateway:latest
```

### Option 2: Complete Stack with Docker Compose (Recommended)

```bash
# Start API Gateway with dependent services
docker-compose up -d

# View logs
docker-compose logs -f api-gateway

# Stop all services
docker-compose down
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_APPLICATION_NAME` | Application name | `ApiGateway` |
| `SERVER_PORT` | Gateway port | `8090` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRATION` | JWT expiration time (ms) | `86400000` |
| `USER_SERVICE_URL` | User service URL | `http://userservice:8080` |
| `RESOURCE_SERVICE_URL` | Resource service URL | `http://resourseservice:8086` |
| `ORDER_SERVICE_URL` | Order service URL | `http://orderservice:8084` |
| `JAVA_OPTS` | JVM options | `-Xmx512m -Xms256m -XX:+UseG1GC` |

### Port Mapping

- **Container Port**: 8090
- **Host Port**: 8090
- **URL**: http://localhost:8090

## 🛣️ API Gateway Routes

### Authentication Routes
- `POST /api/auth/login` - User login (Public)
- `POST /api/auth/signup` - User registration (Public)
- `GET /api/auth/**` - Protected auth endpoints (JWT required)
- `GET /api/admin/**` - Admin endpoints (JWT required)
- `GET /api/secure/**` - Secure user endpoints (JWT required)

### Service Routes
- `GET /api/products/**` - Product service (Public)
- `GET /api/categories/**` - Categories service (Public)
- `GET /api/orders/**` - Order service (JWT required)
- `GET /api/payments/**` - Payment service (JWT required)
- `GET /api/revenue/**` - Revenue service (JWT required)
- `GET /api/inventory/**` - Inventory service (JWT required)
- `GET /api/stock-alerts/**` - Stock alerts (JWT required)
- `GET /api/suppliers/**` - Supplier service (JWT required)
- `GET /api/delivery-logs/**` - Delivery logs (JWT required)
- `GET /api/purchase-orders/**` - Purchase orders (JWT required)
- `GET /api/resources/drivers` - Driver list (Public GET)
- `GET /api/resources/drivers/available` - Available drivers (Public GET)
- `GET /api/resources/drivers/**` - Driver management (JWT required)
- `GET /api/resources/vehicles/**` - Vehicle management (JWT required)
- `GET /api/resources/assignments/**` - Assignment management (JWT required)

### Health Check
- `GET /health` - Gateway health check

## 🏥 Health Check

The container includes a health check endpoint:

```bash
# Check health status
curl http://localhost:8090/health

# Or using Docker
docker inspect --format='{{.State.Health.Status}}' api-gateway
```

## 📊 Monitoring

### View Logs
```bash
# Real-time logs
docker logs -f api-gateway

# Last 100 lines
docker logs --tail 100 api-gateway

# With timestamps
docker logs -t api-gateway
```

### Container Status
```bash
# Check if container is running
docker ps | grep api-gateway

# Container resource usage
docker stats api-gateway
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 8090
   netstat -tulpn | grep :8090
   
   # Stop existing container
   docker stop api-gateway
   ```

2. **Service Connection Issues**
   - Verify dependent services are running
   - Check service URLs in environment variables
   - Ensure network connectivity between containers

3. **JWT Authentication Issues**
   - Verify JWT_SECRET matches across all services
   - Check JWT token format and expiration
   - Ensure proper role-based access control

4. **Container Won't Start**
   ```bash
   # Check container logs
   docker logs api-gateway
   
   # Run interactively for debugging
   docker run -it --rm api-gateway:latest /bin/sh
   ```

### Useful Commands

```bash
# Remove container and image
docker stop api-gateway && docker rm api-gateway
docker rmi api-gateway:latest

# Clean up unused Docker resources
docker system prune -f

# Rebuild without cache
docker build --no-cache -t api-gateway:latest .

# Test API Gateway routes
curl -X GET http://localhost:8090/health
curl -X POST http://localhost:8090/api/auth/login -H "Content-Type: application/json" -d '{"username":"test","password":"test"}'
```

## 🏗️ Docker Image Details

### Base Images
- **Build Stage**: `maven:3.9.6-eclipse-temurin-17`
- **Runtime Stage**: `eclipse-temurin:17-jre-alpine`

### Security Features
- Non-root user execution
- Minimal Alpine Linux base
- Multi-stage build to reduce image size
- Health checks for container monitoring

### Image Size Optimization
- Multi-stage build removes build dependencies
- Alpine Linux base image
- Only necessary runtime dependencies included

## 🔗 Service Dependencies

The API Gateway depends on these services:

### Required Services
- **User Service** (Port 8080) - Authentication and user management
- **Resource Service** (Port 8086) - Drivers, vehicles, assignments
- **Order Service** (Port 8084) - Orders and payments

### Optional Services
- **Product Service** (Port 8083) - Products and categories
- **Inventory Service** (Port 8085) - Inventory and stock alerts
- **Supplier Service** (Port 8082) - Suppliers and delivery logs

## 🌐 Integration

This API Gateway container can be integrated with:

- **Load Balancer**: Multiple instances behind load balancer
- **Service Mesh**: For advanced networking and security
- **Kubernetes**: Deploy as Kubernetes deployment
- **Reverse Proxy**: Nginx or similar for SSL termination

## 📝 Notes

- The container runs as a non-root user for security
- Health checks are configured to monitor service availability
- JVM is optimized for container environments
- Routes are configured for role-based access control
- Service discovery uses Docker Compose networking

## 🔐 Security Considerations

- JWT tokens are validated for all protected routes
- Role-based access control is enforced
- Non-root user execution
- Minimal attack surface with Alpine Linux
- Health checks for monitoring service availability
