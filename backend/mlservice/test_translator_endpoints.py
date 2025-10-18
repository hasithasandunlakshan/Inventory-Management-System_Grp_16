#!/usr/bin/env python3
"""
Test script for Azure Translator endpoints
Tests all the new document translation endpoints
"""

import asyncio
import httpx
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8081"

async def test_endpoint(method: str, endpoint: str, data: Dict[Any, Any] = None) -> Dict[Any, Any]:
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        async with httpx.AsyncClient() as client:
            if method == "GET":
                response = await client.get(url)
            elif method == "POST":
                response = await client.post(url, json=data)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            print(f"✅ {method} {endpoint} - Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"   Response: {json.dumps(result, indent=2)[:200]}...")
                return result
            else:
                print(f"   Error: {response.text}")
                return {"error": response.text}
                
    except Exception as e:
        print(f"❌ {method} {endpoint} - Error: {str(e)}")
        return {"error": str(e)}

async def test_all_endpoints():
    """Test all translator endpoints"""
    print("🧪 Testing Azure Translator Endpoints")
    print("=" * 50)
    
    # Test health check
    print("\n1. Health Check")
    await test_endpoint("GET", "/translate/health")
    
    # Test supported languages
    print("\n2. Supported Languages")
    await test_endpoint("GET", "/translate/languages")
    
    # Test text translation
    print("\n3. Text Translation")
    await test_endpoint("POST", "/translate/text", {
        "text": "Hello, world!",
        "target_language": "es",
        "source_language": "en"
    })
    
    # Test batch text translation
    print("\n4. Batch Text Translation")
    await test_endpoint("POST", "/translate/text/batch", {
        "texts": ["Hello", "World", "Test"],
        "target_language": "fr",
        "source_language": "en"
    })
    
    # Test synchronous document translation
    print("\n5. Synchronous Document Translation")
    await test_endpoint("POST", "/translate/document/sync", {
        "source_url": "https://example.com/document.pdf",
        "target_language": "de",
        "source_language": "en"
    })
    
    # Test batch document translation
    print("\n6. Batch Document Translation")
    await test_endpoint("POST", "/translate/document/batch", {
        "inputs": [
            {
                "source": {"sourceUrl": "https://example.com/doc1.pdf"},
                "targets": [
                    {"targetUrl": "https://example.com/doc1_es.pdf", "language": "es"},
                    {"targetUrl": "https://example.com/doc1_fr.pdf", "language": "fr"}
                ]
            }
        ]
    })
    
    # Test get all translation jobs
    print("\n7. Get All Translation Jobs")
    await test_endpoint("GET", "/translate/document/jobs")
    
    # Test get specific job status (using mock job ID)
    print("\n8. Get Translation Job Status")
    await test_endpoint("GET", "/translate/document/jobs/test-job-123")
    
    # Test get job documents
    print("\n9. Get Job Documents Status")
    await test_endpoint("GET", "/translate/document/jobs/test-job-123/documents")
    
    # Test get specific document status
    print("\n10. Get Document Status")
    await test_endpoint("GET", "/translate/document/jobs/test-job-123/documents/doc-456")
    
    # Test legacy status check
    print("\n11. Legacy Status Check")
    await test_endpoint("GET", "/translate/document/status/legacy-operation-123")
    
    # Test language detection
    print("\n12. Language Detection")
    # Note: This would need to be tested with a form data request in a real scenario
    
    print("\n✅ All endpoint tests completed!")

if __name__ == "__main__":
    asyncio.run(test_all_endpoints())
