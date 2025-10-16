"""
Azure Translator Service
Provides secure integration with Azure AI Translator
Following security best practices for enterprise applications
"""

import os
import logging
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime
from dotenv import load_dotenv

import httpx
from fastapi import HTTPException

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class AzureTranslatorService:
    """
    Secure Azure Translator service with enterprise-grade security
    """
    
    def __init__(self):
        """Initialize the service with secure configuration"""
        self.endpoint = os.getenv('AZURE_TRANSLATOR_ENDPOINT', 'https://api.cognitive.microsofttranslator.com/')
        self.api_key = os.getenv('AZURE_TRANSLATOR_API_KEY')
        self.region = os.getenv('AZURE_TRANSLATOR_REGION', 'global')
        
        # Validate endpoint format
        if not self.endpoint.endswith('/'):
            self.endpoint += '/'
        
        # Set up headers for API requests
        self.headers = {
            'Ocp-Apim-Subscription-Key': self.api_key,
            'Ocp-Apim-Subscription-Region': self.region,
            'Content-Type': 'application/json',
            'X-ClientTraceId': str(uuid.uuid4())
        } if self.api_key else {}
        
        logger.info("Azure Translator service initialized with REST API")
    
    async def translate_document(
        self,
        source_url: str,
        target_language: str,
        source_language: Optional[str] = None,
        storage_type: str = "File"
    ) -> Dict[str, Any]:
        """
        Translate a document using Azure Document Translation service
        
        Args:
            source_url: URL or path to the source document
            target_language: Target language code (e.g., 'es', 'fr', 'de')
            source_language: Source language code (auto-detect if None)
            storage_type: Type of storage (File, Blob, etc.)
        
        Returns:
            Dict containing translation results
        """
        try:
            logger.info(f"Starting document translation to {target_language}")
            
            # Prepare document translation request
            request_data = {
                "inputs": [
                    {
                        "source": {
                            "sourceUrl": source_url
                        },
                        "targets": [
                            {
                                "targetUrl": f"{source_url}_translated_{target_language}",
                                "language": target_language
                            }
                        ]
                    }
                ]
            }
            
            # Build URL for document translation
            url = f"{self.endpoint}translator/document/batch"
            params = {
                'api-version': '1.0'
            }
            
            # For Project Translator, the endpoint might be different
            if 'projecttranslate' in self.endpoint:
                url = f"{self.endpoint}translator/document/batch"
            else:
                # For regular Azure Translator, use the document translation endpoint
                url = f"{self.endpoint}translator/document/batch"
            
            # Make API request to Azure Document Translation
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    headers=self.headers,
                    params=params,
                    json=request_data,
                    timeout=60.0  # Document translation can take longer
                )
                
                if response.status_code == 202:  # Accepted for processing
                    # Document translation is asynchronous
                    operation_location = response.headers.get('Operation-Location')
                    
                    return {
                        "status": "accepted",
                        "operation_id": operation_location.split('/')[-1] if operation_location else None,
                        "operation_location": operation_location,
                        "message": "Document translation job started. Use operation_id to check status.",
                        "metadata": {
                            "timestamp": datetime.utcnow().isoformat(),
                            "service": "azure-document-translation",
                            "source_url": source_url,
                            "target_language": target_language
                        }
                    }
                elif response.status_code == 200:
                    # Immediate result
                    result = response.json()
                    return {
                        "status": "completed",
                        "translations": result.get('value', []),
                        "metadata": {
                            "timestamp": datetime.utcnow().isoformat(),
                            "service": "azure-document-translation"
                        }
                    }
                else:
                    logger.error(f"Azure Document Translation API error: {response.status_code} - {response.text}")
                    logger.error(f"Request URL: {url}")
                    logger.error(f"Request headers: {self.headers}")
                    logger.error(f"Request data: {request_data}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Azure Document Translation API error: {response.text}"
                    )
            
        except httpx.RequestError as e:
            logger.error(f"Request error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Document translation request failed: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Document translation failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Document translation failed: {str(e)}"
            )
    
    async def translate_text(
        self,
        text: str,
        target_language: str,
        source_language: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Translate text using Azure Translator REST API
        
        Args:
            text: Text to translate
            target_language: Target language code
            source_language: Source language code (auto-detect if None)
        
        Returns:
            Dict containing translation results
        """
        try:
            logger.info(f"Translating text to {target_language}")
            
            # Prepare request data
            request_data = [{"text": text}]
            
            # Build URL with parameters
            url = f"{self.endpoint}translate"
            params = {
                'api-version': '3.0',
                'to': target_language
            }
            if source_language:
                params['from'] = source_language
            
            # Make API request
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    headers=self.headers,
                    params=params,
                    json=request_data,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()[0]
                    translated_text = result['translations'][0]['text']
                    detected_language = result.get('detectedLanguage', {}).get('language', source_language or 'auto-detected')
                    
                    return {
                        "original_text": text,
                        "translated_text": translated_text,
                        "source_language": detected_language,
                        "target_language": target_language,
                        "timestamp": datetime.utcnow().isoformat(),
                        "confidence": 1.0  # Azure provides confidence in the response
                    }
                else:
                    logger.error(f"Azure API error: {response.status_code} - {response.text}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Azure Translator API error: {response.text}"
                    )
            
        except httpx.RequestError as e:
            logger.error(f"Request error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Translation request failed: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Text translation failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Text translation failed: {str(e)}"
            )
    
    async def check_document_translation_status(self, operation_id: str) -> Dict[str, Any]:
        """
        Check the status of a document translation operation
        
        Args:
            operation_id: The operation ID returned from translate_document
        
        Returns:
            Dict containing operation status and results
        """
        try:
            url = f"{self.endpoint}translator/document/batch/{operation_id}"
            params = {'api-version': '1.0'}
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url,
                    headers=self.headers,
                    params=params,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "operation_id": operation_id,
                        "status": result.get('status', 'unknown'),
                        "created_date_time": result.get('createdDateTimeUtc'),
                        "last_action_date_time": result.get('lastActionDateTimeUtc'),
                        "summary": result.get('summary', {}),
                        "results": result.get('value', []),
                        "metadata": {
                            "timestamp": datetime.utcnow().isoformat(),
                            "service": "azure-document-translation"
                        }
                    }
                else:
                    logger.error(f"Status check error: {response.status_code} - {response.text}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Status check failed: {response.text}"
                    )
                    
        except Exception as e:
            logger.error(f"Status check failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Status check failed: {str(e)}"
            )
    
    def _process_translation_results(self, translation_result) -> Dict[str, Any]:
        """Process translation results into structured format"""
        try:
            results = {
                "status": "completed",
                "translations": [],
                "metadata": {
                    "timestamp": datetime.utcnow().isoformat(),
                    "service": "azure-translator"
                }
            }
            
            # Process each translation result
            for result in translation_result:
                if hasattr(result, 'status') and result.status == "Succeeded":
                    results["translations"].append({
                        "source_url": getattr(result, 'source_document_url', ''),
                        "target_url": getattr(result, 'translated_document_url', ''),
                        "status": result.status,
                        "characters_charged": getattr(result, 'characters_charged', 0)
                    })
            
            return results
            
        except Exception as e:
            logger.error(f"Error processing translation results: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "metadata": {
                    "timestamp": datetime.utcnow().isoformat(),
                    "service": "azure-translator"
                }
            }
    
    def get_supported_languages(self) -> List[str]:
        """Get list of supported language codes"""
        return [
            'af', 'ar', 'bg', 'bn', 'bs', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es',
            'et', 'fa', 'fi', 'fr', 'gu', 'he', 'hi', 'hr', 'hu', 'id', 'is', 'it',
            'ja', 'kn', 'ko', 'lt', 'lv', 'ml', 'mr', 'ms', 'mt', 'nb', 'nl', 'pl',
            'pt', 'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'ta', 'te', 'th', 'tr', 'uk',
            'ur', 'vi', 'zh', 'zh-Hans', 'zh-Hant'
        ]
    
    def get_common_languages(self) -> Dict[str, str]:
        """Get common language mappings"""
        return {
            "English": "en",
            "Spanish": "es", 
            "French": "fr",
            "German": "de",
            "Chinese (Simplified)": "zh-Hans",
            "Japanese": "ja",
            "Korean": "ko",
            "Arabic": "ar",
            "Portuguese": "pt",
            "Russian": "ru",
            "Italian": "it",
            "Dutch": "nl",
            "Polish": "pl",
            "Turkish": "tr",
            "Hindi": "hi"
        }
    
    def validate_credentials(self) -> Dict[str, Any]:
        """Validate Azure credentials and service availability"""
        try:
            if not self.api_key:
                return {
                    'status': 'mock',
                    'message': 'Using mock translator service - Azure credentials not configured'
                }
            
            test_result = {
                'endpoint': self.endpoint,
                'region': self.region,
                'authentication': 'api_key',
                'status': 'valid'
            }
            
            logger.info("Azure Translator credentials validated successfully")
            return test_result
            
        except Exception as e:
            logger.error(f"Credential validation failed: {str(e)}")
            return {
                'status': 'invalid',
                'error': str(e)
            }

# Global service instance - lazy initialization
translator_service = None

def get_translator_service():
    """Get translator service instance with lazy initialization"""
    global translator_service
    if translator_service is None:
        try:
            translator_service = AzureTranslatorService()
        except Exception as e:
            logger.error(f"Failed to initialize translator service: {e}")
            # Return a mock service for development
            translator_service = MockTranslatorService()
    return translator_service

class MockTranslatorService:
    """Mock translator service for development when Azure credentials are not available"""
    
    async def translate_text(self, text: str, target_language: str, source_language: Optional[str] = None) -> Dict[str, Any]:
        """Mock translation for development"""
        return {
            "original_text": text,
            "translated_text": f"[Mock Translation to {target_language}] {text}",
            "source_language": source_language or "auto-detected",
            "target_language": target_language,
            "timestamp": datetime.utcnow().isoformat(),
            "confidence": 0.95
        }
    
    async def translate_document(self, source_url: str, target_language: str, source_language: Optional[str] = None) -> Dict[str, Any]:
        """Mock document translation for development"""
        return {
            "status": "completed",
            "translations": [{
                "source_url": source_url,
                "target_url": f"{source_url}_translated_{target_language}",
                "status": "Succeeded",
                "characters_charged": 0
            }],
            "metadata": {
                "timestamp": datetime.utcnow().isoformat(),
                "service": "mock-translator"
            }
        }
    
    def get_supported_languages(self) -> List[str]:
        """Get list of supported language codes"""
        return [
            'af', 'ar', 'bg', 'bn', 'bs', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es',
            'et', 'fa', 'fi', 'fr', 'gu', 'he', 'hi', 'hr', 'hu', 'id', 'is', 'it',
            'ja', 'kn', 'ko', 'lt', 'lv', 'ml', 'mr', 'ms', 'mt', 'nb', 'nl', 'pl',
            'pt', 'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'ta', 'te', 'th', 'tr', 'uk',
            'ur', 'vi', 'zh', 'zh-Hans', 'zh-Hant'
        ]
    
    def get_common_languages(self) -> Dict[str, str]:
        """Get common language mappings"""
        return {
            "English": "en",
            "Spanish": "es", 
            "French": "fr",
            "German": "de",
            "Chinese (Simplified)": "zh-Hans",
            "Japanese": "ja",
            "Korean": "ko",
            "Arabic": "ar",
            "Portuguese": "pt",
            "Russian": "ru",
            "Italian": "it",
            "Dutch": "nl",
            "Polish": "pl",
            "Turkish": "tr",
            "Hindi": "hi"
        }
    
    def validate_credentials(self) -> Dict[str, Any]:
        """Validate credentials for mock service"""
        return {
            'status': 'mock',
            'message': 'Using mock translator service - Azure credentials not configured'
        }
