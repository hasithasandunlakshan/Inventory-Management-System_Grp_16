# Azure Translator Setup Guide

This guide explains how to set up Azure Translator service for the Inventory Management System.

## Prerequisites

1. Azure subscription
2. Azure Translator resource created
3. API key and endpoint from Azure Translator service

## Environment Variables

Add the following environment variables to your deployment configuration:

### Required Variables

```bash
# Azure Translator Configuration
# Option 1: Text Translation API (recommended for most use cases)
AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com/
AZURE_TRANSLATOR_API_KEY=your-api-key-here
AZURE_TRANSLATOR_REGION=global

# Option 2: Project Translator (for large-scale projects)
# AZURE_TRANSLATOR_ENDPOINT=https://projecttranslate.cognitiveservices.azure.com/
```

### Optional Variables

```bash
# For production deployments with managed identity
AZURE_TRANSLATOR_USE_MANAGED_IDENTITY=true
```

## Azure Translator Resource Setup

### 1. Create Azure Translator Resource

1. Go to Azure Portal
2. Create a new resource
3. Search for "Translator" or "Cognitive Services"
4. Select "Translator" service
5. Configure:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Your resource group
   - **Region**: Choose a region close to your users
   - **Pricing Tier**: Select appropriate tier for your needs
   - **Name**: Give it a descriptive name

### 2. Get API Key and Endpoint

1. Go to your Translator resource in Azure Portal
2. Navigate to "Keys and Endpoint" in the left menu
3. Copy:
   - **Key 1** or **Key 2** (use as `AZURE_TRANSLATOR_API_KEY`)
   - **Endpoint** (use as `AZURE_TRANSLATOR_ENDPOINT`)

### 3. Configure Region

- Set `AZURE_TRANSLATOR_REGION` to your resource region (e.g., "eastus", "westus2")
- Use "global" for global deployment

## Deployment Configuration

### Local Development

Create a `.env` file in the `backend/mlservice/` directory:

```bash
# Azure Translator Configuration
AZURE_TRANSLATOR_ENDPOINT=https://your-translator-resource.cognitiveservices.azure.com/
AZURE_TRANSLATOR_API_KEY=your-api-key-here
AZURE_TRANSLATOR_REGION=global
```

### Docker Deployment

Update your `docker-compose.yml` or deployment scripts:

```yaml
environment:
  - AZURE_TRANSLATOR_ENDPOINT=https://your-translator-resource.cognitiveservices.azure.com/
  - AZURE_TRANSLATOR_API_KEY=your-api-key-here
  - AZURE_TRANSLATOR_REGION=global
```

### Cloud Run Deployment

Update your Cloud Run service configuration:

```bash
gcloud run deploy ml-forecast-service \
  --set-env-vars="AZURE_TRANSLATOR_ENDPOINT=https://your-translator-resource.cognitiveservices.azure.com/" \
  --set-env-vars="AZURE_TRANSLATOR_API_KEY=your-api-key-here" \
  --set-env-vars="AZURE_TRANSLATOR_REGION=global"
```

## Supported Languages

The service supports 100+ languages including:

### Common Languages

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Chinese Simplified (zh-Hans)
- Japanese (ja)
- Korean (ko)
- Arabic (ar)
- Portuguese (pt)
- Russian (ru)
- Italian (it)
- Dutch (nl)
- Polish (pl)
- Turkish (tr)
- Hindi (hi)

### Full Language List

See the `/translate/languages` endpoint for the complete list of supported languages.

## API Endpoints

### Text Translation

```bash
POST /translate/text
{
  "text": "Hello, how are you?",
  "target_language": "es",
  "source_language": "en"
}
```

### Batch Translation

```bash
POST /translate/text/batch
{
  "texts": ["Hello", "Goodbye", "Thank you"],
  "target_language": "es"
}
```

### Document Translation

```bash
POST /translate/document
{
  "source_url": "https://example.com/document.pdf",
  "target_language": "es"
}
```

### Health Check

```bash
GET /translate/health
```

### Supported Languages

```bash
GET /translate/languages
```

## Usage Examples

### Frontend Integration

```typescript
import { translatorService } from "@/lib/services/translatorService";

// Translate text
const result = await translatorService.translateText({
  text: "Product description",
  target_language: "es",
});

// Batch translate
const batchResult = await translatorService.translateTextBatch({
  texts: ["Hello", "World"],
  target_language: "fr",
});
```

### Backend Integration

```python
from app.services.azure_translator_service import translator_service

# Translate text
result = await translator_service.translate_text(
    text="Hello world",
    target_language="es"
)

# Translate document
result = await translator_service.translate_document(
    source_url="https://example.com/doc.pdf",
    target_language="fr"
)
```

## Security Best Practices

### 1. API Key Management

- Store API keys in secure environment variables
- Use Azure Key Vault for production deployments
- Rotate keys regularly
- Never commit API keys to version control

### 2. Managed Identity (Production)

For production deployments, consider using Azure Managed Identity:

```python
# Set environment variable
AZURE_TRANSLATOR_USE_MANAGED_IDENTITY=true
# Remove AZURE_TRANSLATOR_API_KEY
```

### 3. Network Security

- Use private endpoints when possible
- Configure firewall rules
- Monitor API usage and costs

## Monitoring and Costs

### Cost Management

- Monitor character usage through Azure Portal
- Set up billing alerts
- Use appropriate pricing tier for your needs

### Monitoring

- Check service health: `GET /translate/health`
- Monitor API usage in Azure Portal
- Set up alerts for high usage

## Troubleshooting

### Common Issues

1. **Authentication Error**

   - Verify API key is correct
   - Check endpoint URL format
   - Ensure resource is active

2. **Language Not Supported**

   - Check supported languages: `GET /translate/languages`
   - Use correct language codes

3. **Rate Limiting**
   - Check your pricing tier limits
   - Implement retry logic with exponential backoff

### Debug Mode

Enable debug logging by setting:

```bash
LOG_LEVEL=DEBUG
```

## Testing

### Health Check

```bash
curl -X GET "https://your-ml-service-url/translate/health"
```

### Test Translation

```bash
curl -X POST "https://your-ml-service-url/translate/text" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, world!",
    "target_language": "es"
  }'
```

## Support

For issues with Azure Translator service:

1. Check Azure service status
2. Review Azure documentation
3. Contact Azure support if needed

For issues with this implementation:

1. Check logs for error messages
2. Verify environment variables
3. Test with health check endpoint
