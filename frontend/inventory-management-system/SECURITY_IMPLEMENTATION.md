# Security Implementation Guide

## Overview

This document outlines the secure implementation of Azure Document Intelligence in the Inventory Management System using Next.js API routes as a backend proxy.

## Security Architecture

### 🔐 Current Implementation

- **API Keys**: Stored in environment variables (never in code)
- **Backend Proxy**: Next.js API routes handle Azure API calls
- **Client Security**: No Azure credentials exposed to browser
- **Validation**: Server-side file validation and sanitization

### 🛡️ Security Features

#### 1. Environment Variable Management

```bash
# .env.local (never commit to version control)
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_API_KEY=your-api-key-here
AZURE_DOCUMENT_INTELLIGENCE_MODEL_ID=prebuilt-document
```

#### 2. Backend Proxy Pattern

```
Frontend (Browser)
    ↓ (No credentials)
Next.js API Route (/api/ml/document-intelligence)
    ↓ (Server-side credentials)
Azure Document Intelligence API
    ↓ (Results)
Next.js API Route (sanitized response)
    ↓ (Clean data)
Frontend (Display results)
```

#### 3. Input Validation

- File type validation (JPG, PNG, PDF, TIFF)
- File size limits (50MB maximum)
- Base64 encoding validation
- Content sanitization

## Setup Instructions

### 1. Environment Configuration

#### Create Environment File

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your Azure credentials
nano .env.local
```

#### Required Variables

```bash
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://sem5project.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_API_KEY=your-api-key-here
AZURE_DOCUMENT_INTELLIGENCE_MODEL_ID=prebuilt-document
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 2. Azure Configuration

#### Get Azure Credentials

1. Go to Azure Portal
2. Navigate to your Document Intelligence resource
3. Go to "Keys and Endpoint"
4. Copy Key 1 or Key 2
5. Copy the endpoint URL

#### Update Environment Variables

Replace the placeholder values in `.env.local` with your actual Azure credentials.

### 3. Testing the Implementation

#### Health Check

```bash
curl -X GET "http://localhost:3000/api/ml/document-intelligence"
```

#### Document Analysis

```bash
curl -X POST "http://localhost:3000/api/ml/document-intelligence" \
  -H "Content-Type: application/json" \
  -d '{
    "file": {
      "name": "test.pdf",
      "type": "application/pdf",
      "size": 12345,
      "data": "base64-encoded-file-data"
    },
    "options": {
      "extractText": true,
      "extractTables": true,
      "extractKeyValuePairs": true
    }
  }'
```

## Security Best Practices

### 🔒 API Key Management

#### Development

- Store keys in `.env.local` (not committed to git)
- Use different keys for different environments
- Rotate keys regularly

#### Production

- Use Azure Key Vault for production
- Implement managed identity when possible
- Set up key rotation policies

### 🛡️ Additional Security Measures

#### 1. Authentication & Authorization

```typescript
// Add to API route for production
export async function POST(request: NextRequest) {
  // Add authentication check
  const user = await authenticateUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Add role-based access control
  if (!user.roles.includes('MANAGER') && !user.roles.includes('ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Continue with document analysis...
}
```

#### 2. Rate Limiting

```typescript
// Add rate limiting to prevent abuse
const rateLimit = new Map();

export async function POST(request: NextRequest) {
  const clientIP = request.ip;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10; // 10 requests per minute

  if (rateLimit.has(clientIP)) {
    const requests = rateLimit.get(clientIP);
    const recentRequests = requests.filter(
      (time: number) => now - time < windowMs
    );

    if (recentRequests.length >= maxRequests) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    recentRequests.push(now);
    rateLimit.set(clientIP, recentRequests);
  } else {
    rateLimit.set(clientIP, [now]);
  }

  // Continue with document analysis...
}
```

#### 3. Input Sanitization

```typescript
// Enhanced input validation
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Remove special characters
    .substring(0, 255); // Limit length
}

function validateFileType(mimeType: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/tiff',
    'application/pdf',
  ];
  return allowedTypes.includes(mimeType);
}
```

## Deployment Security

### 🌐 Cloud Platform Deployment

#### Environment Variables

```bash
# Production environment variables
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_API_KEY=your-production-key
AZURE_DOCUMENT_INTELLIGENCE_MODEL_ID=prebuilt-document
```

#### Azure App Service

```bash
# Set environment variables in Azure App Service
az webapp config appsettings set \
  --name your-app-name \
  --resource-group your-resource-group \
  --settings \
    AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/ \
    AZURE_DOCUMENT_INTELLIGENCE_API_KEY=your-production-key
```

#### Vercel Deployment

```bash
# Set environment variables in Vercel dashboard
# Or use Vercel CLI
vercel env add AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT
vercel env add AZURE_DOCUMENT_INTELLIGENCE_API_KEY
```

### 🔐 Production Security Checklist

- [ ] API keys stored in environment variables
- [ ] `.env.local` added to `.gitignore`
- [ ] Production keys different from development
- [ ] API rate limiting implemented
- [ ] Authentication/authorization added
- [ ] Input validation enhanced
- [ ] Error messages sanitized
- [ ] Logging and monitoring configured
- [ ] SSL/TLS enabled
- [ ] CORS properly configured

## Monitoring and Logging

### 📊 Security Monitoring

#### Application Insights

```typescript
// Add telemetry for security events
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  },
});

// Log security events
appInsights.trackEvent({
  name: 'DocumentAnalysisRequest',
  properties: {
    userId: user.id,
    fileType: file.type,
    fileSize: file.size,
  },
});
```

#### Error Logging

```typescript
// Enhanced error logging
export async function POST(request: NextRequest) {
  try {
    // Document analysis logic...
  } catch (error) {
    // Log error details (without sensitive data)
    console.error('Document analysis failed:', {
      error: error.message,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      // Don't log file content or API keys
    });

    return NextResponse.json(
      { success: false, error: 'Document analysis failed' },
      { status: 500 }
    );
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading

```bash
# Check if variables are set
echo $AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT

# Restart development server
npm run dev
```

#### 2. API Key Invalid

```bash
# Test API key directly
curl -X POST "https://your-resource.cognitiveservices.azure.com/formrecognizer/documentModels/prebuilt-document:analyze?api-version=2023-07-31" \
  -H "Ocp-Apim-Subscription-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"base64Source": "dGVzdA=="}'
```

#### 3. CORS Issues

```typescript
// Add CORS headers if needed
export async function POST(request: NextRequest) {
  const response = await processDocument(request);

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', 'https://yourdomain.com');
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return response;
}
```

## Security Updates

### 🔄 Regular Maintenance

#### Monthly Tasks

- [ ] Review API key usage
- [ ] Check for security updates
- [ ] Review access logs
- [ ] Update dependencies

#### Quarterly Tasks

- [ ] Rotate API keys
- [ ] Security audit
- [ ] Penetration testing
- [ ] Update security documentation

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Next Review**: March 2025
