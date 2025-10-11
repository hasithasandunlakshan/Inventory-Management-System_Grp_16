#!/bin/bash

# Script to run end-to-end tests for the Inventory Management System

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=====================================${NC}"
echo -e "${YELLOW}Inventory Management System E2E Tests${NC}"
echo -e "${YELLOW}=====================================${NC}"

# Check if services are running
echo -e "\nChecking if required services are running..."

# Check frontend
FRONTEND_RUNNING=$(lsof -i:3000 -t)
if [ -z "$FRONTEND_RUNNING" ]; then
  echo -e "${RED}Frontend service is not running on port 3000${NC}"
  echo -e "${YELLOW}Starting frontend service...${NC}"
  # Uncomment the next line to automatically start the frontend
  # cd ../frontend/inventory-management-system && npm run dev &
  echo -e "${YELLOW}Please start the frontend manually before running tests${NC}"
else
  echo -e "${GREEN}Frontend service is running on port 3000${NC}"
fi

# Check API Gateway
API_RUNNING=$(lsof -i:8080 -t)
if [ -z "$API_RUNNING" ]; then
  echo -e "${RED}API Gateway is not running on port 8080${NC}"
  echo -e "${YELLOW}Please start the API Gateway manually before running tests${NC}"
else
  echo -e "${GREEN}API Gateway is running on port 8080${NC}"
fi

echo -e "\nRunning E2E tests...\n"

# Run tests with Maven
mvn clean test

# Check if tests passed
if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}✅ All tests passed!${NC}"
  
  # Check if screenshots directory exists and list screenshots
  if [ -d "target/screenshots" ]; then
    echo -e "\n${YELLOW}Screenshots captured:${NC}"
    ls -la target/screenshots
    
    # Get the most recent screenshot
    LATEST_SCREENSHOT=$(ls -t target/screenshots | head -1)
    echo -e "\n${YELLOW}Latest screenshot: ${NC}target/screenshots/$LATEST_SCREENSHOT"
  fi
  
  echo -e "\n${YELLOW}E2E Testing Evidence Report has been created at:${NC}"
  echo "e2e-testing-evidence.md"
else
  echo -e "\n${RED}❌ Some tests failed. Please check the output above for details.${NC}"
fi