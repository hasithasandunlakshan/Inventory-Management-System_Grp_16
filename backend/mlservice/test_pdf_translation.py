#!/usr/bin/env python3
"""
Test script for PDF translation functionality
"""

import asyncio
import os
from app.services.pdf_translator_service import get_pdf_translator_service

async def test_pdf_translation():
    """Test PDF translation service"""
    print("Testing PDF Translation Service...")
    
    # Get the service
    pdf_translator = get_pdf_translator_service()
    
    # Test credential validation
    print("\n1. Testing credential validation...")
    validation = pdf_translator.validate_credentials()
    print(f"Validation result: {validation}")
    
    # Test with a sample PDF (if available)
    print("\n2. Testing PDF translation...")
    
    # Create a simple test PDF content (this would normally be a real PDF file)
    # For testing purposes, we'll create a mock PDF content
    test_pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF"
    
    try:
        result = await pdf_translator.translate_pdf_document(
            pdf_file=test_pdf_content,
            target_language="es",
            source_language="en"
        )
        
        print(f"Translation result: {result}")
        print(f"Status: {result.get('status')}")
        print(f"Total pages: {result.get('total_pages')}")
        print(f"Translated pages: {result.get('translated_pages')}")
        
        if result.get('pages'):
            print(f"First page translation: {result['pages'][0].get('translated_text', 'N/A')[:100]}...")
        
    except Exception as e:
        print(f"Translation test failed: {e}")
    
    print("\nPDF Translation test completed!")

if __name__ == "__main__":
    asyncio.run(test_pdf_translation())
