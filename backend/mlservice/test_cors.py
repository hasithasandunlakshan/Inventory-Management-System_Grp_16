#!/usr/bin/env python3
"""
CORS Test Script for ML Service
Tests CORS configuration and translator endpoints
"""

import requests
import json
import sys

def test_cors_headers():
    """Test CORS headers for different endpoints"""
    base_url = "http://localhost:8080"
    
    print("🧪 Testing CORS Configuration...")
    print("=" * 50)
    
    # Test endpoints
    endpoints = [
        "/",
        "/health", 
        "/translate/health",
        "/translate/test",
        "/translate/languages"
    ]
    
    for endpoint in endpoints:
        url = f"{base_url}{endpoint}"
        print(f"\n📡 Testing: {url}")
        
        try:
            # Test GET request
            response = requests.get(url, timeout=5)
            print(f"  ✅ GET {response.status_code}")
            
            # Check CORS headers
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            print(f"  🌐 CORS Headers: {cors_headers}")
            
        except requests.exceptions.RequestException as e:
            print(f"  ❌ Error: {e}")
    
    # Test OPTIONS request (CORS preflight)
    print(f"\n🔄 Testing OPTIONS request (CORS preflight)...")
    try:
        options_response = requests.options(
            f"{base_url}/translate/text",
            headers={
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            },
            timeout=5
        )
        print(f"  ✅ OPTIONS {options_response.status_code}")
        print(f"  🌐 CORS Headers: {dict(options_response.headers)}")
        
    except requests.exceptions.RequestException as e:
        print(f"  ❌ OPTIONS Error: {e}")
    
    # Test POST request (actual translation)
    print(f"\n📝 Testing POST request (translation)...")
    try:
        post_response = requests.post(
            f"{base_url}/translate/text",
            headers={
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:3000'
            },
            json={
                'text': 'Hello, world!',
                'target_language': 'es'
            },
            timeout=10
        )
        print(f"  ✅ POST {post_response.status_code}")
        if post_response.status_code == 200:
            result = post_response.json()
            print(f"  📄 Response: {result}")
        else:
            print(f"  ❌ Error Response: {post_response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"  ❌ POST Error: {e}")

def test_service_availability():
    """Test if the service is running"""
    print("\n🏥 Testing Service Availability...")
    print("=" * 50)
    
    try:
        response = requests.get("http://localhost:8080/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Service is running: {data}")
            return True
        else:
            print(f"  ❌ Service returned status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Service not available: {e}")
        print(f"  💡 Make sure to start the service with:")
        print(f"     cd backend/mlservice")
        print(f"     python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload")
        return False

def main():
    """Main test function"""
    print("🚀 ML Service CORS Test")
    print("=" * 50)
    
    # Test service availability first
    if not test_service_availability():
        print("\n❌ Service is not running. Please start it first.")
        sys.exit(1)
    
    # Test CORS configuration
    test_cors_headers()
    
    print("\n🎉 CORS Test Complete!")
    print("\n💡 If you see CORS errors in the browser:")
    print("   1. Make sure the service is running on port 8080")
    print("   2. Check browser console for detailed error messages")
    print("   3. Try refreshing the page")
    print("   4. Check if any firewall is blocking the connection")

if __name__ == "__main__":
    main()
