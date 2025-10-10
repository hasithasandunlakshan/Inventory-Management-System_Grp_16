# UserService Docker Deployment

This directory contains Docker configuration files for the UserService microservice.

## 📁 Files Overview

- `Dockerfile` - Multi-stage Docker build configuration
- `docker-compose.yml` - Docker Compose configuration for easy deployment
- `.dockerignore` - Files to exclude from Docker build context
- `build-and-run.sh` - Linux/Mac build and run script
- `build-and-run.bat` - Windows build and run script

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Start the service
docker-compose up -d

# View logs
docker-compose logs -f userservice

# Stop the service
docker-compose down
```

### Option 2: Using Build Scripts

**Linux/Mac:**
```bash
chmod +x build-and-run.sh
./build-and-run.sh
```

**Windows:**
```cmd
build-and-run.bat
```

### Option 3: Manual Docker Commands

```bash
# Build the image
docker build -t userservice:latest .

# Run the container
docker run -d \
    --name userservice \
    -p 8080:8080 \
    -e SPRING_DATASOURCE_URL="jdbc:mysql://mysql-38838f7f-sem5-project.f.aivencloud.com:27040/InventoryManagement?sslMode=REQUIRED&serverTimezone=UTC&tcpKeepAlive=true" \
    -e SPRING_DATASOURCE_USERNAME="avnadmin" \
    -e SPRING_DATASOURCE_PASSWORD="AVNS_Ipqzq0kuyRjWpAdm_pc" \
    -e JWT_SECRET="mySecretKeyForJWTTokenGenerationAndValidationThatIsAtLeast512BitsLongToMeetHS512AlgorithmRequirementsForSecureTokenSigning" \
    -e JWT_EXPIRATION="86400000" \
    userservice:latest
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | MySQL database connection URL | Required |
| `SPRING_DATASOURCE_USERNAME` | Database username | `avnadmin` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRATION` | JWT expiration time (ms) | `86400000` |
| `SERVER_PORT` | Application port | `8080` |
| `JAVA_OPTS` | JVM options | `-Xmx512m -Xms256m -XX:+UseG1GC` |

### Port Mapping

- **Container Port**: 8080
- **Host Port**: 8080
- **URL**: http://localhost:8080

## 🏥 Health Check

The container includes a health check endpoint:

```bash
# Check health status
curl http://localhost:8080/actuator/health

# Or using Docker
docker inspect --format='{{.State.Health.Status}}' userservice
```

## 📊 Monitoring

### View Logs
```bash
# Real-time logs
docker logs -f userservice

# Last 100 lines
docker logs --tail 100 userservice

# With timestamps
docker logs -t userservice
```

### Container Status
```bash
# Check if container is running
docker ps | grep userservice

# Container resource usage
docker stats userservice
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 8080
   netstat -tulpn | grep :8080
   
   # Stop existing container
   docker stop userservice
   ```

2. **Database Connection Issues**
   - Verify database credentials
   - Check network connectivity to Aiven MySQL
   - Ensure SSL certificates are valid

3. **Container Won't Start**
   ```bash
   # Check container logs
   docker logs userservice
   
   # Run interactively for debugging
   docker run -it --rm userservice:latest /bin/sh
   ```

### Useful Commands

```bash
# Remove container and image
docker stop userservice && docker rm userservice
docker rmi userservice:latest

# Clean up unused Docker resources
docker system prune -f

# Rebuild without cache
docker build --no-cache -t userservice:latest .
```

## 🏗️ Docker Image Details

### Base Images
- **Build Stage**: `maven:3.9.6-eclipse-temurin-21`
- **Runtime Stage**: `eclipse-temurin:21-jre-alpine`

### Security Features
- Non-root user execution
- Minimal Alpine Linux base
- Multi-stage build to reduce image size
- Health checks for container monitoring

### Image Size Optimization
- Multi-stage build removes build dependencies
- Alpine Linux base image
- Only necessary runtime dependencies included

## 🔗 Integration

This UserService container can be integrated with:

- **API Gateway**: Route requests to `http://userservice:8080`
- **Load Balancer**: Multiple instances behind load balancer
- **Service Mesh**: For advanced networking and security
- **Kubernetes**: Deploy as Kubernetes deployment

## 📝 Notes

- The container runs as a non-root user for security
- Health checks are configured to monitor service availability
- JVM is optimized for container environments
- Database connections use connection pooling (HikariCP)
