# Azure Document Intelligence Setup Guide

## Prerequisites

- Azure subscription with appropriate permissions
- Azure CLI installed and configured
- Node.js and npm installed
- Python 3.8+ installed

## Step 1: Create Azure Document Intelligence Resource

### 1.1 Create Resource Group

```bash
az group create --name rg-inventory-ml --location eastus
```

### 1.2 Create Document Intelligence Resource

```bash
az cognitiveservices account create \
  --name inventory-doc-intelligence \
  --resource-group rg-inventory-ml \
  --location eastus \
  --kind FormRecognizer \
  --sku S0 \
  --yes
```

### 1.3 Get Endpoint and Key

```bash
# Get endpoint
az cognitiveservices account show \
  --name inventory-doc-intelligence \
  --resource-group rg-inventory-ml \
  --query "properties.endpoint" \
  --output tsv

# Get API key
az cognitiveservices account keys list \
  --name inventory-doc-intelligence \
  --resource-group rg-inventory-ml \
  --query "key1" \
  --output tsv
```

## Step 2: Configure Environment Variables

### 2.1 Backend Configuration

Create `.env` file in `backend/mlservice/`:

```bash
# Azure Document Intelligence
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://inventory-doc-intelligence.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_API_KEY=your-api-key-here
AZURE_DOCUMENT_INTELLIGENCE_MODEL_ID=prebuilt-document

# Redis Configuration (if using)
REDIS_URL=redis://localhost:6379
```

### 2.2 Frontend Configuration

Create `.env.local` file in `frontend/inventory-management-system/`:

```bash
# API Gateway URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Step 3: Install Dependencies

### 3.1 Backend Dependencies

```bash
cd backend/mlservice
pip install -r requirements.txt
```

### 3.2 Frontend Dependencies

```bash
cd frontend/inventory-management-system
npm install
```

## Step 4: Deploy Services

### 4.1 Deploy ML Service

```bash
cd backend/mlservice

# For local development
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# For production (using Docker)
docker build -t ml-service .
docker run -p 8000:8000 --env-file .env ml-service
```

### 4.2 Deploy API Gateway

```bash
cd backend/ApiGateway
mvn clean package
java -jar target/ApiGateway-1.0.0.jar
```

### 4.3 Deploy Frontend

```bash
cd frontend/inventory-management-system
npm run build
npm start
```

## Step 5: Test the Integration

### 5.1 Test ML Service Health

```bash
curl -X GET "http://localhost:8000/api/ml/document-intelligence/health"
```

### 5.2 Test Document Analysis

```bash
curl -X POST "http://localhost:8000/api/ml/document-intelligence/analyze" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "file_data=base64-encoded-file" \
  -d "file_name=test.pdf" \
  -d "file_type=application/pdf" \
  -d "file_size=12345"
```

### 5.3 Test Frontend Integration

1. Navigate to `http://localhost:3000/ml-services`
2. Click on "Document Intelligence"
3. Upload a test document
4. Verify extraction results

## Step 6: Production Deployment

### 6.1 Azure Container Instances

```bash
# Create container registry
az acr create --name inventorymlregistry --resource-group rg-inventory-ml --sku Basic

# Build and push image
az acr build --registry inventorymlregistry --image ml-service:latest .

# Deploy container
az container create \
  --resource-group rg-inventory-ml \
  --name ml-service-container \
  --image inventorymlregistry.azurecr.io/ml-service:latest \
  --cpu 1 \
  --memory 2 \
  --ports 8000 \
  --environment-variables \
    AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://inventory-doc-intelligence.cognitiveservices.azure.com/ \
    AZURE_DOCUMENT_INTELLIGENCE_API_KEY=your-api-key
```

### 6.2 Azure App Service

```bash
# Create App Service plan
az appservice plan create \
  --name inventory-ml-plan \
  --resource-group rg-inventory-ml \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --name inventory-ml-app \
  --resource-group rg-inventory-ml \
  --plan inventory-ml-plan \
  --runtime "PYTHON|3.9"

# Configure app settings
az webapp config appsettings set \
  --name inventory-ml-app \
  --resource-group rg-inventory-ml \
  --settings \
    AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://inventory-doc-intelligence.cognitiveservices.azure.com/ \
    AZURE_DOCUMENT_INTELLIGENCE_API_KEY=your-api-key
```

## Step 7: Security Configuration

### 7.1 Enable Managed Identity

```bash
# Enable system-assigned managed identity
az webapp identity assign \
  --name inventory-ml-app \
  --resource-group rg-inventory-ml

# Grant permissions to Document Intelligence
az role assignment create \
  --assignee $(az webapp identity show --name inventory-ml-app --resource-group rg-inventory-ml --query principalId -o tsv) \
  --role "Cognitive Services User" \
  --scope $(az cognitiveservices account show --name inventory-doc-intelligence --resource-group rg-inventory-ml --query id -o tsv)
```

### 7.2 Configure Network Security

```bash
# Create virtual network
az network vnet create \
  --name vnet-inventory \
  --resource-group rg-inventory-ml \
  --address-prefix 10.0.0.0/16

# Create subnet
az network vnet subnet create \
  --name subnet-ml \
  --vnet-name vnet-inventory \
  --resource-group rg-inventory-ml \
  --address-prefix 10.0.1.0/24
```

## Step 8: Monitoring and Logging

### 8.1 Enable Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app inventory-ml-insights \
  --location eastus \
  --resource-group rg-inventory-ml

# Get instrumentation key
az monitor app-insights component show \
  --app inventory-ml-insights \
  --resource-group rg-inventory-ml \
  --query instrumentationKey \
  --output tsv
```

### 8.2 Configure Log Analytics

```bash
# Create Log Analytics workspace
az monitor log-analytics workspace create \
  --workspace-name inventory-ml-logs \
  --resource-group rg-inventory-ml \
  --location eastus
```

## Troubleshooting

### Common Issues

#### 1. Authentication Errors

```bash
# Check managed identity
az webapp identity show --name inventory-ml-app --resource-group rg-inventory-ml

# Verify permissions
az role assignment list --assignee <principal-id>
```

#### 2. Network Connectivity

```bash
# Test endpoint connectivity
curl -I https://inventory-doc-intelligence.cognitiveservices.azure.com/

# Check firewall rules
az network nsg rule list --resource-group rg-inventory-ml --nsg-name <nsg-name>
```

#### 3. File Upload Issues

- Verify file size limits (50MB max)
- Check supported file types (JPG, PNG, PDF, TIFF)
- Ensure proper base64 encoding

### Support Resources

- [Azure Document Intelligence Documentation](https://docs.microsoft.com/azure/applied-ai-services/form-recognizer/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## Cost Optimization

### 1. Use Appropriate SKU

- **F0**: Free tier (20 transactions/month)
- **S0**: Standard tier (pay-per-transaction)
- **S1**: Standard tier with higher limits

### 2. Implement Caching

- Cache analysis results for identical documents
- Use Redis for session management
- Implement request deduplication

### 3. Monitor Usage

- Set up billing alerts
- Monitor API usage patterns
- Implement usage quotas

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Next Review**: March 2025
