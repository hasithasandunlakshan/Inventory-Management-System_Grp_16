# ML Services Integration

## Overview

This document describes the Machine Learning services integration in the Inventory Management System, specifically focusing on Azure Document Intelligence for automated document processing.

## Features

### 🧠 ML Services Dashboard

- Centralized access to all ML capabilities
- Service health monitoring
- Usage analytics and insights

### 📄 Document Intelligence

- **Text Extraction**: Extract text from images and PDFs
- **Table Recognition**: Identify and extract tabular data
- **Key-Value Pairs**: Extract structured data from forms
- **Layout Analysis**: Understand document structure
- **Multi-format Support**: JPG, PNG, PDF, TIFF

## Architecture

### Frontend Components

```
src/
├── app/ml-services/
│   ├── page.tsx                    # ML Services dashboard
│   └── document-intelligence/
│       └── page.tsx                # Document Intelligence interface
├── components/ml/
│   └── DocumentIntelligenceTest.tsx # Service testing component
└── lib/services/
    └── documentIntelligenceService.ts # Secure API client
```

### Backend Services

```
backend/mlservice/
├── app/
│   ├── main.py                     # FastAPI application
│   ├── routes/
│   │   └── document_intelligence_routes.py # API endpoints
│   └── services/
│       └── azure_document_intelligence.py # Azure integration
└── requirements.txt                # Python dependencies
```

## Security Implementation

### 🔐 Security Features

- **Azure Managed Identity**: Production authentication
- **API Key Authentication**: Development fallback
- **JWT Token Validation**: Request authentication
- **Input Validation**: File type and size validation
- **Data Sanitization**: Output cleaning and validation
- **HTTPS Encryption**: Secure data transmission

### 🛡️ Best Practices

- No direct Azure API calls from frontend
- All requests routed through secure backend proxy
- Comprehensive error handling and logging
- Rate limiting and abuse protection
- Audit trail for all operations

## Getting Started

### Prerequisites

- Azure subscription with Document Intelligence access
- Node.js 18+ and npm
- Python 3.8+
- Redis (optional, for caching)

### Quick Setup

1. **Configure Azure Resources**

   ```bash
   # Create Document Intelligence resource
   az cognitiveservices account create \
     --name inventory-doc-intel \
     --resource-group your-rg \
     --location eastus \
     --kind FormRecognizer \
     --sku S0
   ```

2. **Set Environment Variables**

   ```bash
   # Backend (.env)
   AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
   AZURE_DOCUMENT_INTELLIGENCE_API_KEY=your-api-key

   # Frontend (.env.local)
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```

3. **Install Dependencies**

   ```bash
   # Backend
   cd backend/mlservice
   pip install -r requirements.txt

   # Frontend
   cd frontend/inventory-management-system
   npm install
   ```

4. **Start Services**

   ```bash
   # Start ML service
   cd backend/mlservice
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

   # Start API Gateway
   cd backend/ApiGateway
   mvn spring-boot:run

   # Start Frontend
   cd frontend/inventory-management-system
   npm run dev
   ```

## Usage

### Document Intelligence Workflow

1. **Navigate to ML Services**
   - Go to `/ml-services` in the application
   - Click on "Document Intelligence"

2. **Upload Document**
   - Drag and drop or click to select file
   - Supported formats: JPG, PNG, PDF, TIFF
   - Maximum size: 50MB

3. **Configure Analysis**
   - Choose extraction options:
     - ✅ Extract text content
     - ✅ Extract tables
     - ✅ Extract key-value pairs

4. **Process Document**
   - Click "Analyze Document"
   - Wait for Azure AI processing
   - View results in organized tabs

5. **Export Results**
   - Download extracted data as JSON
   - Copy specific content
   - Save for further processing

### API Endpoints

#### Health Check

```http
GET /api/ml/document-intelligence/health
```

#### Analyze Document

```http
POST /api/ml/document-intelligence/analyze
Content-Type: application/x-www-form-urlencoded

file_data=base64-encoded-file
file_name=document.pdf
file_type=application/pdf
file_size=12345
extract_text=true
extract_tables=true
extract_key_value_pairs=true
```

#### Get Capabilities

```http
GET /api/ml/document-intelligence/capabilities
```

## Configuration

### Environment Variables

#### Backend (ML Service)

```bash
# Azure Configuration
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_API_KEY=your-api-key  # Optional for managed identity
AZURE_DOCUMENT_INTELLIGENCE_MODEL_ID=prebuilt-document

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379
```

#### Frontend

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### Azure Configuration

#### Required Permissions

- **Cognitive Services User**: Access to Document Intelligence
- **Storage Blob Data Reader**: For file access (if using blob storage)
- **Key Vault Secrets User**: For secure key management

#### Network Configuration

- Enable private endpoints for production
- Configure network security groups
- Set up firewall rules for Azure services

## Monitoring and Logging

### Application Insights

- Performance monitoring
- Error tracking
- Usage analytics
- Custom metrics

### Log Analytics

- Centralized logging
- Security event monitoring
- Audit trail analysis
- Alert configuration

### Health Checks

- Service availability
- Azure service status
- Performance metrics
- Error rates

## Troubleshooting

### Common Issues

#### 1. Authentication Errors

**Problem**: 401 Unauthorized responses
**Solution**:

- Verify Azure credentials
- Check managed identity configuration
- Validate API key (if using)

#### 2. File Upload Failures

**Problem**: File upload errors
**Solution**:

- Check file size (max 50MB)
- Verify file type (JPG, PNG, PDF, TIFF)
- Ensure proper base64 encoding

#### 3. Service Unavailable

**Problem**: 503 Service Unavailable
**Solution**:

- Check Azure service status
- Verify network connectivity
- Review service quotas

#### 4. Analysis Failures

**Problem**: Document analysis errors
**Solution**:

- Check document quality
- Verify file format
- Review Azure service logs

### Debug Tools

#### Frontend Testing

- Use the built-in test component
- Check browser developer tools
- Verify network requests

#### Backend Testing

```bash
# Test health endpoint
curl -X GET "http://localhost:8000/api/ml/document-intelligence/health"

# Test capabilities
curl -X GET "http://localhost:8000/api/ml/document-intelligence/capabilities"
```

## Performance Optimization

### Caching Strategy

- Cache analysis results for identical documents
- Use Redis for session management
- Implement request deduplication

### Cost Optimization

- Use appropriate Azure SKU
- Implement usage quotas
- Monitor and alert on costs
- Cache frequently accessed data

### Scaling

- Horizontal scaling with load balancers
- Vertical scaling based on usage
- Auto-scaling policies
- CDN for static assets

## Security Considerations

### Data Protection

- Encryption in transit and at rest
- Secure key management
- Data retention policies
- GDPR compliance

### Access Control

- Role-based permissions
- Multi-factor authentication
- API rate limiting
- Audit logging

### Network Security

- Private endpoints
- VPC integration
- Firewall rules
- DDoS protection

## Support and Resources

### Documentation

- [Azure Document Intelligence](https://docs.microsoft.com/azure/applied-ai-services/form-recognizer/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)

### Community

- GitHub Issues
- Stack Overflow
- Azure Community Forums
- Microsoft Q&A

### Professional Support

- Azure Support Plans
- Microsoft Consulting Services
- Partner Support
- Custom Development

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainer**: Development Team  
**Next Review**: March 2025
