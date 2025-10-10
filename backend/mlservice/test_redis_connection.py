#!/usr/bin/env python3
"""
Test Redis Cloud Connection
"""

import asyncio
import redis.asyncio as redis
from redis_config import REDIS_CLOUD_URL

async def test_redis_connection():
    """Test Redis Cloud connection"""
    print(f"🔗 Testing Redis Cloud connection...")
    print(f"URL: {REDIS_CLOUD_URL[:50]}...") # Don't show full password
    
    try:
        # Connect to Redis Cloud
        client = redis.from_url(
            REDIS_CLOUD_URL, 
            decode_responses=True,
            socket_connect_timeout=10,
            socket_timeout=10
        )
        
        # Test connection
        print("📡 Connecting to Redis Cloud...")
        await client.ping()
        print("✅ Redis Cloud connection successful!")
        
        # Test basic operations
        print("\n🧪 Testing basic operations...")
        
        # Set a test value
        await client.set("test:connection", "Hello Redis Cloud!", ex=60)
        print("✅ SET operation successful")
        
        # Get the test value
        value = await client.get("test:connection")
        print(f"✅ GET operation successful: {value}")
        
        # Get server info
        info = await client.info()
        print(f"\n📊 Redis Server Info:")
        print(f"   Version: {info.get('redis_version', 'Unknown')}")
        print(f"   Memory: {info.get('used_memory_human', 'Unknown')}")
        print(f"   Connected clients: {info.get('connected_clients', 'Unknown')}")
        
        # Clean up test key
        await client.delete("test:connection")
        print("🧹 Cleaned up test data")
        
        await client.close()
        print("\n🎉 Redis Cloud is ready for your ML service!")
        return True
        
    except Exception as e:
        print(f"❌ Redis Cloud connection failed: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(test_redis_connection())