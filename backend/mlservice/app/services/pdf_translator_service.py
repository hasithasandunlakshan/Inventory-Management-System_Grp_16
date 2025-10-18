"""
PDF Translation Service using OpenAI API
Processes PDF documents page by page and translates using OpenAI
"""

import os
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from dotenv import load_dotenv
import PyPDF2
import openai
from fastapi import HTTPException
import io

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class PDFTranslatorService:
    """
    PDF Translation service using OpenAI API for page-by-page translation
    """
    
    def __init__(self):
        """Initialize the service with OpenAI configuration"""
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.openai_client = None
        
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
            self.openai_client = openai.OpenAI(api_key=self.openai_api_key)
            logger.info("OpenAI PDF Translator service initialized")
        else:
            logger.warning("OpenAI API key not found - using mock service")
    
    async def translate_pdf_document(
        self,
        pdf_file: bytes,
        target_language: str,
        source_language: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Translate a PDF document page by page using OpenAI
        
        Args:
            pdf_file: PDF file content as bytes
            target_language: Target language code (e.g., 'es', 'fr', 'de')
            source_language: Source language code (optional)
        
        Returns:
            Dict containing translation results for all pages
        """
        try:
            logger.info(f"Starting PDF translation to {target_language}")
            
            # Extract text from PDF page by page
            pages_text = self._extract_pdf_text(pdf_file)
            
            if not pages_text:
                raise HTTPException(
                    status_code=400,
                    detail="No text found in PDF document"
                )
            
            # Translate each page
            translated_pages = []
            for page_num, page_text in enumerate(pages_text, 1):
                if page_text.strip():  # Only translate non-empty pages
                    translated_text = await self._translate_text_with_openai(
                        page_text, target_language, source_language
                    )
                    translated_pages.append({
                        "page_number": page_num,
                        "original_text": page_text,
                        "translated_text": translated_text,
                        "character_count": len(page_text)
                    })
                else:
                    translated_pages.append({
                        "page_number": page_num,
                        "original_text": "",
                        "translated_text": "",
                        "character_count": 0
                    })
            
            # Combine all translated text
            combined_translation = "\n\n".join([
                page["translated_text"] for page in translated_pages 
                if page["translated_text"]
            ])
            
            return {
                "status": "completed",
                "total_pages": len(pages_text),
                "translated_pages": len([p for p in translated_pages if p["translated_text"]]),
                "source_language": source_language or "auto-detected",
                "target_language": target_language,
                "pages": translated_pages,
                "combined_translation": combined_translation,
                "metadata": {
                    "timestamp": datetime.utcnow().isoformat(),
                    "service": "openai-pdf-translator",
                    "total_characters": sum(page["character_count"] for page in translated_pages)
                }
            }
            
        except Exception as e:
            logger.error(f"PDF translation failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"PDF translation failed: {str(e)}"
            )
    
    def _extract_pdf_text(self, pdf_file: bytes) -> List[str]:
        """
        Extract text from PDF file page by page
        
        Args:
            pdf_file: PDF file content as bytes
        
        Returns:
            List of text content for each page
        """
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file))
            pages_text = []
            
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                pages_text.append(text)
            
            logger.info(f"Extracted text from {len(pages_text)} pages")
            return pages_text
            
        except Exception as e:
            logger.error(f"PDF text extraction failed: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to extract text from PDF: {str(e)}"
            )
    
    async def _translate_text_with_openai(
        self,
        text: str,
        target_language: str,
        source_language: Optional[str] = None
    ) -> str:
        """
        Translate text using OpenAI API
        
        Args:
            text: Text to translate
            target_language: Target language code
            source_language: Source language code (optional)
        
        Returns:
            Translated text
        """
        try:
            if not self.openai_client:
                # Return mock translation if OpenAI is not configured
                return f"[Mock Translation to {target_language}] {text[:100]}..."
            
            # Create translation prompt
            language_names = {
                'en': 'English',
                'es': 'Spanish',
                'fr': 'French',
                'de': 'German',
                'zh': 'Chinese',
                'ja': 'Japanese',
                'ko': 'Korean',
                'ar': 'Arabic',
                'pt': 'Portuguese',
                'ru': 'Russian',
                'it': 'Italian',
                'hi': 'Hindi',
                'pl': 'Polish',
                'tr': 'Turkish'
            }
            
            target_lang_name = language_names.get(target_language, target_language)
            source_lang_name = language_names.get(source_language, source_language) if source_language else "the detected source language"
            
            prompt = f"""Translate the following text from {source_lang_name} to {target_lang_name}. 
            Maintain the original formatting, structure, and meaning. 
            If the text contains technical terms, proper names, or specific terminology, preserve them appropriately.
            
            Text to translate:
            {text}
            
            Translation:"""
            
            response = self.openai_client.chat.completions.create(
                model="gpt-5-mini-2025-08-07",
                messages=[
                    {
                        "role": "system",
                        "content": f"You are a professional translator. Translate text from {source_lang_name} to {target_lang_name} while maintaining accuracy, context, and formatting."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                # max_completion_tokens=4000,
                temperature=1
            )
            
            translated_text = response.choices[0].message.content.strip()
            logger.info(f"Translated text chunk (length: {len(text)} -> {len(translated_text)})")
            return translated_text
            
        except Exception as e:
            logger.error(f"OpenAI translation failed: {str(e)}")
            # Return mock translation as fallback
            return f"[Translation Error - Mock] {text[:100]}..."
    
    def validate_credentials(self) -> Dict[str, Any]:
        """Validate OpenAI credentials and service availability"""
        try:
            if not self.openai_api_key:
                return {
                    'status': 'mock',
                    'message': 'Using mock PDF translator service - OpenAI credentials not configured'
                }
            
            # Test OpenAI connection
            if self.openai_client:
                # Simple test request
                test_response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": "Hello"}],
                    max_tokens=10
                )
                
                return {
                    'status': 'valid',
                    'message': 'OpenAI PDF translator service is ready',
                    'model': 'gpt-3.5-turbo'
                }
            else:
                return {
                    'status': 'invalid',
                    'message': 'OpenAI client not initialized'
                }
                
        except Exception as e:
            logger.error(f"OpenAI credential validation failed: {str(e)}")
            return {
                'status': 'invalid',
                'error': str(e)
            }

# Global service instance - lazy initialization
pdf_translator_service = None

def get_pdf_translator_service():
    """Get PDF translator service instance with lazy initialization"""
    global pdf_translator_service
    if pdf_translator_service is None:
        try:
            pdf_translator_service = PDFTranslatorService()
        except Exception as e:
            logger.error(f"Failed to initialize PDF translator service: {e}")
            # Return a mock service for development
            pdf_translator_service = MockPDFTranslatorService()
    return pdf_translator_service

class MockPDFTranslatorService:
    """Mock PDF translator service for development when OpenAI credentials are not available"""
    
    async def translate_pdf_document(
        self,
        pdf_file: bytes,
        target_language: str,
        source_language: Optional[str] = None
    ) -> Dict[str, Any]:
        """Mock PDF translation for development"""
        try:
            # Extract text from PDF for mock response
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file))
            pages_text = []
            
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                pages_text.append(text)
            
            # Create mock translated pages
            translated_pages = []
            for page_num, page_text in enumerate(pages_text, 1):
                mock_translation = f"[Mock Translation to {target_language}] {page_text[:200]}..."
                translated_pages.append({
                    "page_number": page_num,
                    "original_text": page_text,
                    "translated_text": mock_translation,
                    "character_count": len(page_text)
                })
            
            combined_translation = "\n\n".join([
                page["translated_text"] for page in translated_pages 
                if page["translated_text"]
            ])
            
            return {
                "status": "completed",
                "total_pages": len(pages_text),
                "translated_pages": len(translated_pages),
                "source_language": source_language or "auto-detected",
                "target_language": target_language,
                "pages": translated_pages,
                "combined_translation": combined_translation,
                "metadata": {
                    "timestamp": datetime.utcnow().isoformat(),
                    "service": "mock-pdf-translator",
                    "total_characters": sum(page["character_count"] for page in translated_pages)
                }
            }
            
        except Exception as e:
            logger.error(f"Mock PDF translation failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "metadata": {
                    "timestamp": datetime.utcnow().isoformat(),
                    "service": "mock-pdf-translator"
                }
            }
    
    def validate_credentials(self) -> Dict[str, Any]:
        """Validate credentials for mock service"""
        return {
            'status': 'mock',
            'message': 'Using mock PDF translator service - OpenAI credentials not configured'
        }
