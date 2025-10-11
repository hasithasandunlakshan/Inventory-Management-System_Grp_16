#!/bin/bash

# Script to run service integration tests for the Inventory Management System

set -e  # Exit on error

# Print colored output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Running Integration Tests for IMS Services${NC}"
echo -e "${BLUE}=========================================${NC}"

# Directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Function to run tests for a service
run_service_tests() {
  service=$1
  echo -e "\n${BLUE}Running tests for $service...${NC}"
  
  cd "$DIR/backend/$service"
  
  if [ -f "pom.xml" ]; then
    mvn test -Dspring.profiles.active=integration
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ $service integration tests passed${NC}"
    else
      echo -e "${RED}✗ $service integration tests failed${NC}"
      failed_services="$failed_services $service"
    fi
  else
    echo -e "${RED}No pom.xml found for $service${NC}"
  fi
}

# Initialize failed services list
failed_services=""

# Run tests for each service
run_service_tests "Orderservice"
run_service_tests "inventoryservice"
run_service_tests "productservice"
run_service_tests "userservice"
run_service_tests "notificationservice"
run_service_tests "supplierservice"

# Run cross-service integration tests
echo -e "\n${BLUE}Running cross-service integration tests...${NC}"
cd "$DIR/integration-tests"

if [ -f "pom.xml" ]; then
  mvn verify -Pintegration-test
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Cross-service integration tests passed${NC}"
  else
    echo -e "${RED}✗ Cross-service integration tests failed${NC}"
    failed_services="$failed_services cross-service"
  fi
else
  echo -e "${BLUE}Skipping cross-service tests (pom.xml not found)${NC}"
fi

# Summary
echo -e "\n${BLUE}=========================================${NC}"
echo -e "${BLUE}Integration Test Summary${NC}"
echo -e "${BLUE}=========================================${NC}"

if [ -z "$failed_services" ]; then
  echo -e "${GREEN}All integration tests passed!${NC}"
  exit 0
else
  echo -e "${RED}The following tests failed: $failed_services${NC}"
  exit 1
fi
