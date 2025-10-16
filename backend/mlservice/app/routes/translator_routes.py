"""
Azure Translator API Routes
Provides endpoints for document and text translation
"""

from fastapi import APIRouter, HTTPException, Form, File, UploadFile, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List
import logging

from app.services.azure_translator_service import get_translator_service

router = APIRouter(prefix="/translate", tags=["Translation"])

logger = logging.getLogger(__name__)

# Add explicit OPTIONS handler for CORS preflight
@router.options("/{path:path}")
async def options_handler(request: Request, path: str):
    """Handle CORS preflight requests"""
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With, Origin",
            "Access-Control-Max-Age": "86400"
        }
    )

class TranslationRequest(BaseModel):
    text: str = Field(..., description="Text to translate")
    target_language: str = Field(..., description="Target language code (e.g., 'es', 'fr')")
    source_language: Optional[str] = Field(None, description="Source language code (auto-detect if None)")

class DocumentTranslationRequest(BaseModel):
    source_url: str = Field(..., description="URL or path to source document")
    target_language: str = Field(..., description="Target language code")
    source_language: Optional[str] = Field(None, description="Source language code")

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    timestamp: str
    confidence: Optional[float] = None

class BatchTranslationRequest(BaseModel):
    texts: List[str] = Field(..., description="List of texts to translate")
    target_language: str = Field(..., description="Target language code")
    source_language: Optional[str] = Field(None, description="Source language code")

@router.post("/text", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """
    Translate text from one language to another
    
    - **text**: Text content to translate
    - **target_language**: Target language code (e.g., 'es', 'fr', 'de')
    - **source_language**: Source language code (optional, auto-detect if not provided)
    """
    try:
        logger.info(f"Text translation request: {request.target_language}")
        
        translator_service = get_translator_service()
        result = await translator_service.translate_text(
            text=request.text,
            target_language=request.target_language,
            source_language=request.source_language
        )
        
        return TranslationResponse(**result)
        
    except Exception as e:
        logger.error(f"Text translation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/text/batch")
async def translate_text_batch(request: BatchTranslationRequest):
    """
    Translate multiple texts at once
    
    - **texts**: List of texts to translate
    - **target_language**: Target language code
    - **source_language**: Source language code (optional)
    """
    try:
        logger.info(f"Batch text translation request: {len(request.texts)} texts to {request.target_language}")
        
        results = []
        translator_service = get_translator_service()
        for text in request.texts:
            result = await translator_service.translate_text(
                text=text,
                target_language=request.target_language,
                source_language=request.source_language
            )
            results.append(result)
        
        return {
            "translations": results,
            "total_count": len(results),
            "target_language": request.target_language,
            "timestamp": result.get('timestamp')
        }
        
    except Exception as e:
        logger.error(f"Batch text translation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/document")
async def translate_document(
    file: UploadFile = File(...),
    target_language: str = Form(...),
    source_language: str = Form(None)
):
    """
    Translate a document from one language to another
    
    - **file**: Uploaded document file
    - **target_language**: Target language code
    - **source_language**: Source language code (optional)
    """
    try:
        logger.info(f"Document translation request: {file.filename} -> {target_language}")
        
        # For now, we'll simulate the document translation process
        # In a real implementation, you would:
        # 1. Save the uploaded file to temporary storage
        # 2. Upload it to Azure Blob Storage
        # 3. Submit translation job to Azure Document Translation
        # 4. Return operation ID for status tracking
        
        # Simulate processing time
        import asyncio
        await asyncio.sleep(1)
        
        # Generate a mock operation ID
        import uuid
        operation_id = str(uuid.uuid4())
        
        result = {
            "status": "accepted",
            "operation_id": operation_id,
            "message": "Document translation job started. Use operation_id to check status.",
            "metadata": {
                "timestamp": "2024-01-01T00:00:00Z",
                "service": "azure-document-translation",
                "filename": file.filename,
                "target_language": target_language,
                "source_language": source_language
            }
        }
        
        return JSONResponse(content=result)
        
    except Exception as e:
        logger.error(f"Document translation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/document/status/{operation_id}")
async def check_document_translation_status(operation_id: str):
    """
    Check the status of a document translation operation
    
    - **operation_id**: The operation ID returned from document translation
    """
    try:
        logger.info(f"Checking document translation status: {operation_id}")
        
        # For demo purposes, simulate different statuses based on operation_id
        import random
        import time
        
        # Simulate different statuses
        statuses = ["NotStarted", "Running", "Succeeded", "Failed"]
        weights = [0.1, 0.3, 0.5, 0.1]  # More likely to be completed
        
        # Use operation_id to get consistent results
        hash_val = hash(operation_id) % 100
        if hash_val < 10:
            status = "NotStarted"
        elif hash_val < 40:
            status = "Running"
        elif hash_val < 90:
            status = "Succeeded"
        else:
            status = "Failed"
        
        result = {
            "operation_id": operation_id,
            "status": status,
            "created_date_time": "2024-01-01T00:00:00Z",
            "last_action_date_time": "2024-01-01T00:01:00Z",
            "summary": {
                "total": 1,
                "failed": 0 if status != "Failed" else 1,
                "success": 1 if status == "Succeeded" else 0,
                "in_progress": 1 if status == "Running" else 0,
                "not_yet_started": 1 if status == "NotStarted" else 0
            },
            "results": [
                {
                    "path": f"translated_document_{operation_id[:8]}.pdf",
                    "status": status,
                    "to": "es",
                    "created_date_time_utc": "2024-01-01T00:00:00Z",
                    "last_action_date_time_utc": "2024-01-01T00:01:00Z"
                }
            ] if status in ["Succeeded", "Failed"] else [],
            "metadata": {
                "timestamp": "2024-01-01T00:01:00Z",
                "service": "azure-document-translation"
            }
        }
        
        return JSONResponse(content=result)
        
    except Exception as e:
        logger.error(f"Status check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/languages")
async def get_supported_languages():
    """Get list of supported language codes and common languages"""
    try:
        translator_service = get_translator_service()
        languages = translator_service.get_supported_languages()
        common_languages = translator_service.get_common_languages()
        
        return {
            "supported_languages": languages,
            "total_count": len(languages),
            "common_languages": common_languages,
            "usage_examples": {
                "text_translation": "/translate/text",
                "document_translation": "/translate/document",
                "batch_translation": "/translate/text/batch"
            }
        }
    except Exception as e:
        logger.error(f"Failed to get supported languages: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def translator_health_check():
    """Health check for Azure Translator service"""
    try:
        translator_service = get_translator_service()
        validation_result = translator_service.validate_credentials()
        return {
            "service": "azure-translator",
            "status": "healthy" if validation_result.get('status') in ['valid', 'mock'] else "unhealthy",
            "validation": validation_result,
            "cors_enabled": True,
            "endpoints": {
                "text_translation": "/translate/text",
                "document_translation": "/translate/document",
                "languages": "/translate/languages"
            }
        }
    except Exception as e:
        logger.error(f"Translator health check failed: {str(e)}")
        return {
            "service": "azure-translator",
            "status": "unhealthy",
            "error": str(e)
        }

@router.get("/test")
async def test_endpoint():
    """Simple test endpoint to verify service is working"""
    return {
        "message": "Translator service is working!",
        "status": "ok",
        "cors_enabled": True
    }

@router.post("/detect")
async def detect_language(text: str = Form(...)):
    """
    Detect the language of the provided text
    
    - **text**: Text to analyze for language detection
    """
    try:
        logger.info(f"Language detection request for text: {text[:50]}...")
        
        # This is a simplified implementation
        # In production, you would use Azure's language detection API
        detected_language = "en"  # Default to English for now
        
        return {
            "text": text,
            "detected_language": detected_language,
            "confidence": 0.85,
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
    except Exception as e:
        logger.error(f"Language detection failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
