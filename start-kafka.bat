@echo off
echo 🚀 Starting Kafka-based Inventory Management System...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)
echo ✅ Docker is running

echo.
echo 📦 Starting Kafka containers...
docker-compose up -d

echo.
echo ⏳ Waiting for Kafka to be ready...
timeout /t 30 /nobreak >nul

echo.
echo 📋 Creating Kafka topics...
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --create --if-not-exists --topic inventory-reservation-request --partitions 3 --replication-factor 1 2>nul
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --create --if-not-exists --topic inventory-reservation-response --partitions 3 --replication-factor 1 2>nul

echo.
echo 📊 Listing created topics:
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list

echo.
echo ✅ Kafka setup complete!
echo.
echo 🎛️  Kafka UI: http://localhost:8080
echo 📊 Product Service will run on: http://localhost:8083
echo 🛒 Order Service will run on: http://localhost:8084
echo.
echo 📋 Next steps:
echo 1. Open new terminal and run: cd backend/productservice ^&^& mvnw spring-boot:run
echo 2. Open another terminal and run: cd backend/Orderservice ^&^& mvnw spring-boot:run
echo 3. Access Kafka UI at http://localhost:8080
echo.
pause
