# PDF Translation Workflow Guide

## Overview

This document describes the new AI-powered PDF translation workflow that processes PDF documents page by page using OpenAI API.

## Architecture

### Backend Components

1. **PDF Translator Service** (`app/services/pdf_translator_service.py`)

   - Extracts text from PDF files page by page using PyPDF2
   - Sends each page to OpenAI API for translation
   - Combines all translated pages into a single result
   - Supports both real OpenAI API and mock service for development

2. **New API Endpoint** (`/translate/document/pdf`)
   - Accepts PDF file uploads
   - Processes PDFs page by page
   - Returns structured translation results

### Frontend Components

1. **Enhanced DocumentTranslatorCard**

   - Toggle for AI-powered PDF translation
   - Rich UI for displaying translation results
   - Page-by-page view with original and translated text
   - Download functionality for complete translation

2. **Updated TranslatorService**
   - New `translatePDFDocument()` method
   - TypeScript interfaces for PDF translation results

## Workflow Steps

### 1. PDF Upload and Processing

```
User uploads PDF → Backend validates file type → Extract text page by page
```

### 2. OpenAI Translation

```
For each page:
  - Send text + instructions to OpenAI API
  - Receive translated text
  - Store page results
```

### 3. Result Assembly

```
Combine all translated pages → Return structured JSON response
```

### 4. Frontend Display

```
Show translation statistics → Display combined translation → Allow page-by-page view → Enable download
```

## API Endpoints

### POST `/translate/document/pdf`

**Request:**

- `file`: PDF file (multipart/form-data)
- `target_language`: Target language code (e.g., 'es', 'fr')
- `source_language`: Source language code (optional)

**Response:**

```json
{
  "status": "completed",
  "total_pages": 3,
  "translated_pages": 3,
  "source_language": "en",
  "target_language": "es",
  "pages": [
    {
      "page_number": 1,
      "original_text": "Hello World",
      "translated_text": "Hola Mundo",
      "character_count": 11
    }
  ],
  "combined_translation": "Hola Mundo\n\n...",
  "metadata": {
    "timestamp": "2024-01-01T00:00:00Z",
    "service": "openai-pdf-translator",
    "total_characters": 150
  }
}
```

## Configuration

### Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# ML Service URL (Frontend)
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:8081
```

### Dependencies

**Backend:**

- `PyPDF2==3.0.1` - PDF text extraction
- `openai==1.3.0` - OpenAI API integration

**Frontend:**

- Existing UI components (Switch, Tabs, Textarea, etc.)

## Usage Examples

### Backend Testing

```python
# Test the PDF translation service
python test_pdf_translation.py
```

### Frontend Integration

```typescript
// Use the new PDF translation method
const result = await translatorService.translatePDFDocument(
  pdfFile,
  "es", // target language
  "en" // source language (optional)
);
```

## Features

### Backend Features

- ✅ PDF text extraction page by page
- ✅ OpenAI API integration with custom prompts
- ✅ Structured translation results
- ✅ Mock service for development
- ✅ Error handling and validation
- ✅ Support for multiple languages

### Frontend Features

- ✅ Toggle between legacy and AI translation
- ✅ Rich translation results display
- ✅ Page-by-page view with side-by-side comparison
- ✅ Combined translation view
- ✅ Download functionality
- ✅ Translation statistics
- ✅ Copy to clipboard

## Error Handling

### Backend Errors

- Invalid file type (non-PDF)
- PDF extraction failures
- OpenAI API errors
- Network timeouts

### Frontend Errors

- File upload validation
- API response handling
- User-friendly error messages

## Performance Considerations

### Backend

- PDF processing time scales with document size
- OpenAI API rate limits apply
- Memory usage for large PDFs

### Frontend

- Large translation results may impact UI performance
- Pagination for very long documents
- Efficient rendering of page-by-page view

## Security

### API Security

- File type validation
- File size limits
- OpenAI API key protection

### Data Privacy

- No persistent storage of PDF content
- Temporary processing only
- Secure API communication

## Development

### Mock Service

When OpenAI API key is not configured, the service automatically falls back to a mock implementation that:

- Extracts text from PDFs
- Returns mock translations
- Maintains the same API interface

### Testing

```bash
# Run the test script
cd backend/mlservice
python test_pdf_translation.py
```

## Deployment

### Backend

1. Install dependencies: `pip install -r requirements.txt`
2. Set environment variables
3. Deploy as usual

### Frontend

1. No additional dependencies required
2. Uses existing UI components
3. Backward compatible with legacy translation

## Troubleshooting

### Common Issues

1. **PDF extraction fails**

   - Check PDF format compatibility
   - Verify PyPDF2 installation

2. **OpenAI API errors**

   - Verify API key configuration
   - Check rate limits
   - Review API usage

3. **Frontend display issues**
   - Check TypeScript interfaces
   - Verify UI component imports
   - Test with different PDF sizes

### Debug Mode

Enable detailed logging in the PDF translator service for troubleshooting.

## Future Enhancements

- [ ] Support for more document formats
- [ ] Batch PDF processing
- [ ] Translation quality scoring
- [ ] Custom translation prompts
- [ ] Progress tracking for large documents
- [ ] Caching for repeated translations
