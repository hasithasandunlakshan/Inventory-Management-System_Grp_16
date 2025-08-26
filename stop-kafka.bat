@echo off
echo 🛑 Stopping Kafka-based Inventory Management System...

echo 📦 Stopping Kafka containers...
docker-compose down

echo ✅ All services stopped!
echo.
echo 💡 To restart, run: start-kafka.bat
pause
