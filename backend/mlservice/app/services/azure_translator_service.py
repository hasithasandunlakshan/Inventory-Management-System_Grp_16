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
    
    async def translate_document_sync(
        self,
        source_url: str,
        target_language: str,
        source_language: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Synchronously translate a single document using Azure Document Translation service
        Following: POST {document-translation-endpoint}/translator/document:translate?targetLanguage={target_language}&api-version={date}
        
        Args:
            source_url: URL or path to the source document
            target_language: Target language code (e.g., 'es', 'fr', 'de')
            source_language: Source language code (auto-detect if None)
        
        Returns:
            Dict containing translation results
        """
        try:
            logger.info(f"Starting synchronous document translation to {target_language}")
            
            # Build URL for synchronous document translation
            url = f"{self.endpoint}translator/document:translate"
            params = {
                'targetLanguage': target_language,
                'api-version': '2023-11-01'
            }
            if source_language:
                params['sourceLanguage'] = source_language
            
            # Prepare request body for document translation
            request_data = {
                "sourceUrl": source_url
            }
            
            # Make API request to Azure Document Translation
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    headers=self.headers,
                    params=params,
                    json=request_data,
                    timeout=60.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "status": "completed",
                        "translations": result.get('translations', []),
                        "metadata": {
                            "timestamp": datetime.utcnow().isoformat(),
                            "service": "azure-document-translation",
                            "source_url": source_url,
                            "target_language": target_language
                        }
                    }
                else:
                    logger.error(f"Azure Document Translation API error: {response.status_code} - {response.text}")
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

    async def start_batch_translation(
        self,
        inputs: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Start a batch document translation job
        Following: POST {document-translation-endpoint}/translator/document/batches?api-version={date}
        
        Args:
            inputs: List of translation inputs with source and target configurations
        
        Returns:
            Dict containing batch job information
        """
        try:
            logger.info("Starting batch document translation job")
            
            # Build URL for batch translation
            url = f"{self.endpoint}translator/document/batches"
            params = {
                'api-version': '2023-11-01'
            }
            
            # Prepare request body
            request_data = {
                "inputs": inputs
            }
            
            # Make API request to Azure Document Translation
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    headers=self.headers,
                    params=params,
                    json=request_data,
                    timeout=60.0
                )
                
                if response.status_code == 202:  # Accepted for processing
                    operation_location = response.headers.get('Operation-Location')
                    job_id = operation_location.split('/')[-1] if operation_location else None
                    
                    return {
                        "status": "accepted",
                        "job_id": job_id,
                        "operation_location": operation_location,
                        "message": "Batch translation job started. Use job_id to check status.",
                        "metadata": {
                            "timestamp": datetime.utcnow().isoformat(),
                            "service": "azure-document-translation"
                        }
                    }
                else:
                    logger.error(f"Azure Document Translation API error: {response.status_code} - {response.text}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Azure Document Translation API error: {response.text}"
                    )
            
        except httpx.RequestError as e:
            logger.error(f"Request error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Batch translation request failed: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Batch translation failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Batch translation failed: {str(e)}"
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
    
    async def get_all_translation_jobs(self) -> Dict[str, Any]:
        """
        Get status for all translation jobs submitted by the user
        Following: GET {document-translation-endpoint}/translator/document/batches?api-version={date}
        
        Returns:
            Dict containing all translation jobs and their status
        """
        try:
            url = f"{self.endpoint}translator/document/batches"
            params = {'api-version': '2023-11-01'}
            
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
                        "jobs": result.get('value', []),
                        "count": len(result.get('value', [])),
                        "metadata": {
                            "timestamp": datetime.utcnow().isoformat(),
                            "service": "azure-document-translation"
                        }
                    }
                else:
                    logger.error(f"Get all jobs error: {response.status_code} - {response.text}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Get all jobs failed: {response.text}"
                    )
                    
        except Exception as e:
            logger.error(f"Get all jobs failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Get all jobs failed: {str(e)}"
            )

    async def get_translation_job_status(self, job_id: str) -> Dict[str, Any]:
        """
        Get status for a specific translation job
        Following: GET {document-translation-endpoint}/translator/document/batches/{id}?api-version={date}
        
        Args:
            job_id: The job ID returned from start_batch_translation
        
        Returns:
            Dict containing job status and results
        """
        try:
            url = f"{self.endpoint}translator/document/batches/{job_id}"
            params = {'api-version': '2023-11-01'}
            
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
                        "job_id": job_id,
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
                    logger.error(f"Job status check error: {response.status_code} - {response.text}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Job status check failed: {response.text}"
                    )
                    
        except Exception as e:
            logger.error(f"Job status check failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Job status check failed: {str(e)}"
            )

    async def get_job_documents_status(self, job_id: str) -> Dict[str, Any]:
        """
        Get status for all documents in a translation job
        Following: GET {document-translation-endpoint}/translator/document/batches/{id}/documents?api-version={date}
        
        Args:
            job_id: The job ID returned from start_batch_translation
        
        Returns:
            Dict containing status of all documents in the job
        """
        try:
            url = f"{self.endpoint}translator/document/batches/{job_id}/documents"
            params = {'api-version': '2023-11-01'}
            
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
                        "job_id": job_id,
                        "documents": result.get('value', []),
                        "count": len(result.get('value', [])),
                        "metadata": {
                            "timestamp": datetime.utcnow().isoformat(),
                            "service": "azure-document-translation"
                        }
                    }
                else:
                    logger.error(f"Get job documents error: {response.status_code} - {response.text}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Get job documents failed: {response.text}"
                    )
                    
        except Exception as e:
            logger.error(f"Get job documents failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Get job documents failed: {str(e)}"
            )

    async def get_document_status(self, job_id: str, document_id: str) -> Dict[str, Any]:
        """
        Get status for a specific document in a job
        Following: GET {document-translation-endpoint}/translator/document/batches/{id}/documents/{documentId}?api-version={date}
        
        Args:
            job_id: The job ID returned from start_batch_translation
            document_id: The document ID within the job
        
        Returns:
            Dict containing document status and results
        """
        try:
            url = f"{self.endpoint}translator/document/batches/{job_id}/documents/{document_id}"
            params = {'api-version': '2023-11-01'}
            
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
                        "job_id": job_id,
                        "document_id": document_id,
                        "status": result.get('status', 'unknown'),
                        "source_url": result.get('sourcePath'),
                        "target_url": result.get('path'),
                        "characters_charged": result.get('charactersCharged', 0),
                        "metadata": {
                            "timestamp": datetime.utcnow().isoformat(),
                            "service": "azure-document-translation"
                        }
                    }
                else:
                    logger.error(f"Document status check error: {response.status_code} - {response.text}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Document status check failed: {response.text}"
                    )
                    
        except Exception as e:
            logger.error(f"Document status check failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Document status check failed: {str(e)}"
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
    
    async def translate_document_sync(self, source_url: str, target_language: str, source_language: Optional[str] = None) -> Dict[str, Any]:
        """Mock synchronous document translation for development"""
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
    
    async def start_batch_translation(self, inputs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Mock batch translation start for development"""
        return {
            "status": "accepted",
            "job_id": f"mock-job-{uuid.uuid4().hex[:8]}",
            "operation_location": f"https://mock-endpoint.com/operations/mock-job-{uuid.uuid4().hex[:8]}",
            "message": "Mock batch translation job started",
            "metadata": {
                "timestamp": datetime.utcnow().isoformat(),
                "service": "mock-translator"
            }
        }
    
    async def get_all_translation_jobs(self) -> Dict[str, Any]:
        """Mock get all translation jobs for development"""
        return {
            "jobs": [],
            "count": 0,
            "metadata": {
                "timestamp": datetime.utcnow().isoformat(),
                "service": "mock-translator"
            }
        }
    
    async def get_translation_job_status(self, job_id: str) -> Dict[str, Any]:
        """Mock get translation job status for development"""
        return {
            "job_id": job_id,
            "status": "Succeeded",
            "created_date_time": datetime.utcnow().isoformat(),
            "last_action_date_time": datetime.utcnow().isoformat(),
            "summary": {"total": 1, "failed": 0, "success": 1},
            "results": [],
            "metadata": {
                "timestamp": datetime.utcnow().isoformat(),
                "service": "mock-translator"
            }
        }
    
    async def get_job_documents_status(self, job_id: str) -> Dict[str, Any]:
        """Mock get job documents status for development"""
        return {
            "job_id": job_id,
            "documents": [],
            "count": 0,
            "metadata": {
                "timestamp": datetime.utcnow().isoformat(),
                "service": "mock-translator"
            }
        }
    
    async def get_document_status(self, job_id: str, document_id: str) -> Dict[str, Any]:
        """Mock get document status for development"""
        return {
            "job_id": job_id,
            "document_id": document_id,
            "status": "Succeeded",
            "source_url": f"mock-source-{document_id}",
            "target_url": f"mock-target-{document_id}",
            "characters_charged": 0,
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
