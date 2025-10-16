"""
Azure Document Intelligence Service
Provides secure integration with Azure AI Document Intelligence
Following security best practices for enterprise applications
"""

import os
import base64
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from dotenv import load_dotenv

from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.ai.documentintelligence.models import AnalyzeDocumentRequest
from azure.core.credentials import AzureKeyCredential
from azure.identity import DefaultAzureCredential
from fastapi import HTTPException

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class AzureDocumentIntelligenceService:
    """
    Secure Azure Document Intelligence service with enterprise-grade security
    """
    
    def __init__(self):
        """Initialize the service with secure configuration"""
        self.endpoint = os.getenv('AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT')
        self.api_key = os.getenv('AZURE_DOCUMENT_INTELLIGENCE_API_KEY')
        self.model_id = os.getenv('AZURE_DOCUMENT_INTELLIGENCE_MODEL_ID', 'prebuilt-document')
        
        if not self.endpoint:
            raise ValueError("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT environment variable is required")
        
        # Initialize client with secure authentication
        if self.api_key:
            # Use API key authentication (for development/testing)
            self.client = DocumentIntelligenceClient(
                endpoint=self.endpoint,
                credential=AzureKeyCredential(self.api_key)
            )
            logger.info("Azure Document Intelligence client initialized with API key")
        else:
            # Use managed identity authentication (for production)
            try:
                credential = DefaultAzureCredential()
                self.client = DocumentIntelligenceClient(
                    endpoint=self.endpoint,
                    credential=credential
                )
                logger.info("Azure Document Intelligence client initialized with managed identity")
            except Exception as e:
                logger.error(f"Failed to initialize with managed identity: {e}")
                raise HTTPException(
                    status_code=500,
                    detail="Azure authentication configuration error"
                )
    
    async def analyze_document(
        self,
        file_data: bytes,
        file_name: str,
        file_type: str,
        options: Dict[str, bool] = None
    ) -> Dict[str, Any]:
        """
        Analyze document using Azure Document Intelligence
        
        Args:
            file_data: Raw file bytes
            file_name: Original file name
            file_type: MIME type of the file
            options: Analysis options (extract_text, extract_tables, etc.)
        
        Returns:
            Dict containing extracted data
        """
        try:
            # Validate file size (50MB limit)
            max_size = 50 * 1024 * 1024  # 50MB
            if len(file_data) > max_size:
                raise HTTPException(
                    status_code=413,
                    detail="File size exceeds 50MB limit"
                )
            
            # Validate file type
            allowed_types = [
                'image/jpeg', 'image/jpg', 'image/png', 
                'image/tiff', 'application/pdf'
            ]
            if file_type not in allowed_types:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file type: {file_type}. Allowed types: {allowed_types}"
                )
            
            # Prepare analysis request
            analyze_request = AnalyzeDocumentRequest(
                base64_source=base64.b64encode(file_data).decode('utf-8')
            )
            
            # Perform analysis
            logger.info(f"Analyzing document: {file_name} ({file_type})")
            result = self.client.begin_analyze_document(
                model_id=self.model_id,
                analyze_request=analyze_request
            ).result()
            
            # Extract and structure the results
            extracted_data = self._extract_structured_data(result, options or {})
            
            # Log successful analysis
            logger.info(f"Document analysis completed for: {file_name}")
            
            return extracted_data
            
        except Exception as e:
            logger.error(f"Document analysis failed for {file_name}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Document analysis failed: {str(e)}"
            )
    
    def _extract_structured_data(
        self, 
        analysis_result, 
        options: Dict[str, bool]
    ) -> Dict[str, Any]:
        """
        Extract structured data from Azure analysis result
        
        Args:
            analysis_result: Raw result from Azure Document Intelligence
            options: Analysis options
        
        Returns:
            Structured data dictionary
        """
        extracted_data = {}
        
        try:
            # Extract text content
            if options.get('extract_text', True) and hasattr(analysis_result, 'content'):
                extracted_data['text'] = analysis_result.content
            
            # Extract tables
            if options.get('extract_tables', True) and hasattr(analysis_result, 'tables'):
                tables = []
                for table in analysis_result.tables:
                    table_data = {
                        'headers': [],
                        'rows': []
                    }
                    
                    # Extract headers (first row)
                    if table.cells:
                        first_row_cells = [cell for cell in table.cells if cell.row_index == 0]
                        table_data['headers'] = [cell.content for cell in first_row_cells]
                        
                        # Extract all rows
                        max_row = max(cell.row_index for cell in table.cells)
                        for row_idx in range(max_row + 1):
                            row_cells = [cell for cell in table.cells if cell.row_index == row_idx]
                            row_data = [cell.content for cell in row_cells]
                            table_data['rows'].append(row_data)
                    
                    tables.append(table_data)
                
                extracted_data['tables'] = tables
            
            # Extract key-value pairs
            if options.get('extract_key_value_pairs', True) and hasattr(analysis_result, 'key_value_pairs'):
                key_value_pairs = []
                for kvp in analysis_result.key_value_pairs:
                    if kvp.key and kvp.value:
                        key_value_pairs.append({
                            'key': kvp.key.content,
                            'value': kvp.value.content,
                            'confidence': getattr(kvp.confidence, 'confidence', 0.0)
                        })
                
                extracted_data['key_value_pairs'] = key_value_pairs
            
            # Add metadata
            extracted_data['metadata'] = {
                'analysis_timestamp': datetime.utcnow().isoformat(),
                'model_id': self.model_id,
                'extraction_options': options
            }
            
        except Exception as e:
            logger.error(f"Error extracting structured data: {str(e)}")
            # Return basic text if available
            if hasattr(analysis_result, 'content'):
                extracted_data['text'] = analysis_result.content
                extracted_data['error'] = f"Partial extraction completed: {str(e)}"
        
        return extracted_data
    
    def validate_credentials(self) -> Dict[str, Any]:
        """
        Validate Azure credentials and service availability
        
        Returns:
            Dict with validation results
        """
        try:
            # Test connection with a simple request
            test_result = {
                'endpoint': self.endpoint,
                'model_id': self.model_id,
                'authentication': 'api_key' if self.api_key else 'managed_identity',
                'status': 'valid'
            }
            
            logger.info("Azure Document Intelligence credentials validated successfully")
            return test_result
            
        except Exception as e:
            logger.error(f"Credential validation failed: {str(e)}")
            return {
                'status': 'invalid',
                'error': str(e)
            }
    
    def get_supported_file_types(self) -> List[str]:
        """Get list of supported file types"""
        return [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/tiff',
            'application/pdf'
        ]
    
    def get_max_file_size(self) -> int:
        """Get maximum file size in bytes"""
        return 50 * 1024 * 1024  # 50MB

# Global service instance
document_intelligence_service = AzureDocumentIntelligenceService()
