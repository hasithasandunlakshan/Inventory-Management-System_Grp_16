# Azure Document Translation Setup - Complete Guide

## ✅ Service Status

- **ML Service**: Running on http://localhost:8080
- **CORS**: Properly configured for frontend access
- **Document Translation Endpoints**: Available and functional

## 🔧 Azure Document Translation Configuration

Since you mentioned you already have the Azure Translator service deployed, you need to configure the environment variables for **Document Translation**:

### 1. Create Environment File

Create a `.env` file in the `backend/mlservice/` directory:

```bash
# Azure Translator Configuration
AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com/
AZURE_TRANSLATOR_API_KEY=your_azure_translator_api_key_here
AZURE_TRANSLATOR_REGION=your_azure_region_here
```

### 2. Get Your Azure Translator Credentials

#### Option A: If using Azure Cognitive Services Translator

1. Go to Azure Portal → Cognitive Services → Translator
2. Copy the **Key** and **Region** from your resource
3. Use endpoint: `https://api.cognitive.microsofttranslator.com/`
4. **Important**: Ensure your Translator resource supports Document Translation (not just Text Translation)

#### Option B: If using Project Translator

1. Go to Azure Portal → Project Translator
2. Copy the **Key** and **Region** from your resource
3. Use endpoint: `https://projecttranslate.cognitiveservices.azure.com/`
4. **Note**: Project Translator is specifically designed for document translation

### 3. Update Your .env File

```bash
# For Azure Cognitive Services Translator
AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com/
AZURE_TRANSLATOR_API_KEY=your_key_here
AZURE_TRANSLATOR_REGION=your_region_here

# OR for Project Translator
AZURE_TRANSLATOR_ENDPOINT=https://projecttranslate.cognitiveservices.azure.com/
AZURE_TRANSLATOR_API_KEY=your_key_here
AZURE_TRANSLATOR_REGION=your_region_here
```

## 🧪 Testing the Setup

### 1. Test Service Health

```bash
curl http://localhost:8080/health
```

### 2. Test Document Translation (after adding credentials)

```bash
curl -X POST http://localhost:8080/translate/document \
  -H "Content-Type: application/json" \
  -d '{"source_url": "https://example.com/document.pdf", "target_language": "es"}'
```

### 3. Test CORS (for frontend)

```bash
curl -X OPTIONS http://localhost:8080/translate/text \
  -H "Origin: http://localhost:3000" \
  -v
```

## 🎯 Frontend Integration

The document translation feature is now available in:

- **Document Intelligence Page**: http://localhost:3000/ml-services/document-intelligence
- **Translation Tab**: Contains document translation tools for translating entire documents

## 🔄 Current Implementation

### Backend Features

- ✅ REST API integration (no SDK dependencies)
- ✅ CORS properly configured
- ✅ Mock service fallback when credentials not available
- ✅ Document translation endpoint
- ✅ Document translation status checking
- ✅ Asynchronous operation handling
- ✅ Language detection
- ✅ Supported languages endpoint

### Frontend Features

- ✅ Document translation interface
- ✅ Translation status monitoring
- ✅ Operation polling
- ✅ Translation history
- ✅ Language selection
- ✅ Real-time status updates

## 🚀 Next Steps

1. **Add your Azure credentials** to the `.env` file
2. **Restart the ML service** to load the new credentials
3. **Test the translation** in the frontend
4. **Verify real translations** are working

## 🛠️ Troubleshooting

### If translations return mock results:

- Check that your `.env` file has the correct Azure credentials
- Verify the API key is valid and has translation permissions
- Check the Azure region matches your resource

### If CORS errors occur:

- The service is already configured for CORS
- Make sure you're accessing from `http://localhost:3000`

### If service won't start:

- Check that port 8080 is available
- Verify all dependencies are installed: `pip install -r requirements.txt`

## 📝 API Endpoints

| Endpoint                          | Method | Description                       |
| --------------------------------- | ------ | --------------------------------- |
| `/health`                         | GET    | Service health check              |
| `/translate/test`                 | GET    | Translation service test          |
| `/translate/document`             | POST   | Translate document                |
| `/translate/document/status/{id}` | GET    | Check document translation status |
| `/translate/languages`            | GET    | Get supported languages           |
| `/translate/health`               | GET    | Translation service health        |

## 🎉 Success!

Once you add your Azure credentials, the translation service will be fully functional with real Azure Translator integration!
