"""
Document Intelligence API Routes
Secure endpoints for Azure Document Intelligence integration
"""

import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import base64

from app.services.azure_document_intelligence import document_intelligence_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ml/document-intelligence", tags=["Document Intelligence"])

class DocumentAnalysisRequest(BaseModel):
    """Request model for document analysis"""
    file: Dict[str, Any] = Field(..., description="File data and metadata")
    options: Dict[str, bool] = Field(default_factory=dict, description="Analysis options")
    timestamp: str = Field(..., description="Request timestamp")

class DocumentAnalysisResponse(BaseModel):
    """Response model for document analysis"""
    success: bool
    data: Dict[str, Any] = Field(default_factory=dict)
    error: str = Field(default="")
    metadata: Dict[str, Any] = Field(default_factory=dict)

@router.post("/analyze", response_model=DocumentAnalysisResponse)
async def analyze_document(
    file_data: str = Form(..., description="Base64 encoded file data"),
    file_name: str = Form(..., description="Original file name"),
    file_type: str = Form(..., description="MIME type of the file"),
    file_size: int = Form(..., description="File size in bytes"),
    extract_text: bool = Form(True, description="Extract text content"),
    extract_tables: bool = Form(True, description="Extract table data"),
    extract_key_value_pairs: bool = Form(True, description="Extract key-value pairs")
):
    """
    Analyze document using Azure Document Intelligence
    
    Security features:
    - Input validation and sanitization
    - File size and type validation
    - Secure Azure API integration
    - Error handling and logging
    """
    try:
        # Validate and decode file data
        try:
            file_bytes = base64.b64decode(file_data)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid base64 file data: {str(e)}"
            )
        
        # Validate file size
        if file_size != len(file_bytes):
            raise HTTPException(
                status_code=400,
                detail="File size mismatch between metadata and actual data"
            )
        
        # Prepare analysis options
        options = {
            'extract_text': extract_text,
            'extract_tables': extract_tables,
            'extract_key_value_pairs': extract_key_value_pairs
        }
        
        # Perform document analysis
        logger.info(f"Starting document analysis for: {file_name}")
        result = await document_intelligence_service.analyze_document(
            file_data=file_bytes,
            file_name=file_name,
            file_type=file_type,
            options=options
        )
        
        logger.info(f"Document analysis completed successfully for: {file_name}")
        
        return DocumentAnalysisResponse(
            success=True,
            data=result,
            metadata={
                'file_name': file_name,
                'file_type': file_type,
                'file_size': file_size,
                'analysis_options': options
            }
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Unexpected error in document analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """
    Health check endpoint for document intelligence service
    """
    try:
        # Validate Azure credentials
        validation_result = document_intelligence_service.validate_credentials()
        
        return {
            "status": "healthy",
            "service": "document-intelligence",
            "azure_status": validation_result,
            "supported_file_types": document_intelligence_service.get_supported_file_types(),
            "max_file_size_mb": document_intelligence_service.get_max_file_size() // (1024 * 1024)
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail=f"Service unhealthy: {str(e)}"
        )

@router.get("/capabilities")
async def get_capabilities():
    """
    Get service capabilities and configuration
    """
    return {
        "service_name": "Azure Document Intelligence",
        "version": "1.0.0",
        "capabilities": {
            "text_extraction": True,
            "table_extraction": True,
            "key_value_extraction": True,
            "form_analysis": True,
            "layout_analysis": True
        },
        "supported_file_types": document_intelligence_service.get_supported_file_types(),
        "max_file_size_mb": document_intelligence_service.get_max_file_size() // (1024 * 1024),
        "security_features": [
            "Azure managed identity authentication",
            "Input validation and sanitization",
            "File size and type validation",
            "Secure API key management",
            "Error handling and logging"
        ]
    }

@router.post("/validate-file")
async def validate_file(
    file_name: str = Form(...),
    file_type: str = Form(...),
    file_size: int = Form(...)
):
    """
    Validate file before processing
    """
    try:
        # Check file type
        supported_types = document_intelligence_service.get_supported_file_types()
        if file_type not in supported_types:
            return {
                "valid": False,
                "error": f"Unsupported file type: {file_type}",
                "supported_types": supported_types
            }
        
        # Check file size
        max_size = document_intelligence_service.get_max_file_size()
        if file_size > max_size:
            return {
                "valid": False,
                "error": f"File size exceeds limit: {file_size} bytes > {max_size} bytes",
                "max_size_mb": max_size // (1024 * 1024)
            }
        
        return {
            "valid": True,
            "file_name": file_name,
            "file_type": file_type,
            "file_size": file_size
        }
        
    except Exception as e:
        logger.error(f"File validation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"File validation failed: {str(e)}"
        )
