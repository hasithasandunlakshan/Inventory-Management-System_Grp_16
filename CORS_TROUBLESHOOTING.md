# CORS Troubleshooting Guide

## 🚨 **CORS Error Fix**

The error you're seeing indicates that the ML service at `http://localhost:8080` is either:

1. Not running
2. Not accessible
3. Has CORS configuration issues
4. **403 Forbidden on OPTIONS** - CORS preflight request is being blocked

## 🔧 **Step-by-Step Fix**

### **1. Check if ML Service is Running**

First, verify the ML service is running:

```bash
# Check if the service is running
curl http://localhost:8080/health

# Should return:
# {
#   "status": "healthy",
#   "service": "ml-forecasting",
#   "cache_status": {...},
#   "cors_enabled": true
# }
```

### **2. Start the ML Service**

If the service is not running, start it:

```bash
# Navigate to ML service directory
cd backend/mlservice

# Install dependencies
pip install -r requirements.txt

# Start the service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

### **3. Test the Translator Endpoint**

Test the translator endpoint directly:

```bash
# Test health check
curl http://localhost:8080/translate/health

# Test text translation
curl -X POST "http://localhost:8080/translate/text" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "target_language": "es"}'
```

### **4. Run the Test Script**

Use the provided test script:

```bash
cd backend/mlservice
python test_translator.py
```

## 🛠️ **Common Issues & Solutions**

### **Issue 1: Service Not Running**

**Error**: `net::ERR_FAILED`
**Solution**: Start the ML service on port 8080

### **Issue 2: Wrong Port**

**Error**: Connection refused
**Solution**: Check if service is running on correct port

### **Issue 3: Azure Credentials Missing**

**Error**: Service initialization fails
**Solution**: The service now uses a mock translator when Azure credentials are missing

### **Issue 4: CORS Headers Missing**

**Error**: `No 'Access-Control-Allow-Origin' header`
**Solution**: CORS is already configured to allow all origins

### **Issue 5: 403 Forbidden on OPTIONS**

**Error**: `Status Code 403 Forbidden` on OPTIONS request
**Solution**: Added explicit OPTIONS handler and improved CORS configuration

## 🔍 **Debugging Steps**

### **1. Check Service Status**

```bash
# Check if port 8080 is in use
lsof -i :8080

# Check service logs
tail -f logs/ml-service.log
```

### **2. Test with curl**

```bash
# Test basic connectivity
curl -v http://localhost:8080/

# Test CORS headers
curl -v -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:8080/translate/text
```

### **3. Check Browser Network Tab**

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try the translation
4. Check the request/response headers

## 🚀 **Quick Start Commands**

### **Start ML Service**

```bash
cd backend/mlservice
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

### **Start Frontend**

```bash
cd frontend/inventory-management-system
npm run dev
```

### **Test Translation**

1. Go to `http://localhost:3000/ml-services/document-intelligence`
2. Click "Translation" tab
3. Try translating some text

## 🔧 **Environment Variables**

Create `.env` file in `backend/mlservice/`:

```bash
# For development (mock translator)
# No Azure credentials needed - will use mock service

# For production (real Azure Translator)
# Option 1: Text Translation API (recommended)
AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com/
AZURE_TRANSLATOR_API_KEY=your-api-key-here
AZURE_TRANSLATOR_REGION=global

# Option 2: Project Translator (for advanced use cases)
# AZURE_TRANSLATOR_ENDPOINT=https://projecttranslate.cognitiveservices.azure.com/
```

## 📊 **Expected Behavior**

### **With Mock Service (No Azure Credentials)**

- Service starts successfully
- Translation returns mock results
- Health check shows "mock" status

### **With Azure Credentials**

- Service connects to Azure Translator
- Real translations are performed
- Health check shows "valid" status

## 🆘 **Still Having Issues?**

### **Check Service Logs**

```bash
# Look for error messages in the console
python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload --log-level debug
```

### **Verify Port Availability**

```bash
# Check if port 8080 is free
netstat -an | grep 8080
```

### **Test Different Port**

If port 8080 is occupied, try a different port:

```bash
# Start on different port
python -m uvicorn app.main:app --host 0.0.0.0 --port 8081 --reload
```

Then update frontend environment:

```bash
# In frontend/.env.local
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:8081
```

## ✅ **Success Indicators**

When everything is working, you should see:

1. **ML Service**: `http://localhost:8080/health` returns healthy status
2. **Frontend**: Translation works without CORS errors
3. **Browser**: No red errors in console
4. **Network**: Successful POST requests to `/translate/text`

The service is now configured to work with or without Azure credentials, using a mock translator for development! 🎉
