#!/usr/bin/env python3
"""
Test script for Azure Translator service
Run this to test if the translator service is working
"""

import asyncio
import sys
import os

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.azure_translator_service import get_translator_service

async def test_translator():
    """Test the translator service"""
    print("🧪 Testing Azure Translator Service...")
    
    try:
        # Get translator service
        translator = get_translator_service()
        print(f"✅ Translator service initialized: {type(translator).__name__}")
        
        # Test text translation
        print("\n📝 Testing text translation...")
        result = await translator.translate_text(
            text="Hello, how are you?",
            target_language="es"
        )
        print(f"✅ Translation result: {result}")
        
        # Test health check
        print("\n🏥 Testing health check...")
        health = translator.validate_credentials()
        print(f"✅ Health check: {health}")
        
        # Test supported languages
        print("\n🌍 Testing supported languages...")
        languages = translator.get_supported_languages()
        print(f"✅ Supported languages count: {len(languages)}")
        
        print("\n🎉 All tests passed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = asyncio.run(test_translator())
    sys.exit(0 if success else 1)
