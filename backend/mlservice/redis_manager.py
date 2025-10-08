#!/usr/bin/env python3
"""
Redis Database Management Script
Access and manage your Redis cache data
"""

import asyncio
import redis.asyncio as redis
import json
from datetime import datetime
import sys

class RedisManager:
    def __init__(self, redis_url=None):
        if redis_url is None:
            # Import Redis Cloud URL from config
            try:
                from redis_config import REDIS_CLOUD_URL
                self.redis_url = REDIS_CLOUD_URL
            except ImportError:
                self.redis_url = "redis://localhost:6379"
        else:
            self.redis_url = redis_url
        self.client = None
    
    async def connect(self):
        """Connect to Redis"""
        try:
            self.client = redis.from_url(self.redis_url, decode_responses=True)
            await self.client.ping()
            print("✅ Connected to Redis successfully!")
            return True
        except Exception as e:
            print(f"❌ Failed to connect to Redis: {e}")
            return False
    
    async def show_all_keys(self):
        """Show all keys in Redis"""
        try:
            keys = await self.client.keys("*")
            print(f"\n📊 Total keys in Redis: {len(keys)}")
            
            if keys:
                print("\n🔑 All Keys:")
                for i, key in enumerate(keys, 1):
                    ttl = await self.client.ttl(key)
                    if ttl == -1:
                        ttl_info = "No expiry"
                    elif ttl == -2:
                        ttl_info = "Expired"
                    else:
                        ttl_info = f"{ttl}s remaining"
                    print(f"  {i}. {key} ({ttl_info})")
            else:
                print("  No keys found")
        except Exception as e:
            print(f"❌ Error getting keys: {e}")
    
    async def show_forecast_keys(self):
        """Show only forecast cache keys"""
        try:
            keys = await self.client.keys("forecast:*")
            print(f"\n📈 Forecast cache keys: {len(keys)}")
            
            if keys:
                for i, key in enumerate(keys, 1):
                    value = await self.client.get(key)
                    ttl = await self.client.ttl(key)
                    
                    if value:
                        try:
                            data = json.loads(value)
                            product_id = data.get('product_id', 'Unknown')
                            forecast_days = data.get('forecast_days', 'Unknown')
                            cached_at = data.get('cached_at', 'Unknown')
                            
                            ttl_info = f"{ttl}s" if ttl > 0 else "Expired"
                            print(f"  {i}. {key}")
                            print(f"     Product: {product_id}, Days: {forecast_days}")
                            print(f"     Cached: {cached_at}, TTL: {ttl_info}")
                        except json.JSONDecodeError:
                            print(f"  {i}. {key} (Invalid JSON data)")
                    print()
            else:
                print("  No forecast cache found")
        except Exception as e:
            print(f"❌ Error getting forecast keys: {e}")
    
    async def get_key_value(self, key):
        """Get and display value for a specific key"""
        try:
            value = await self.client.get(key)
            if value:
                print(f"\n🔍 Value for key '{key}':")
                try:
                    # Try to parse as JSON for better formatting
                    data = json.loads(value)
                    print(json.dumps(data, indent=2))
                except json.JSONDecodeError:
                    print(value)
                
                # Show TTL
                ttl = await self.client.ttl(key)
                if ttl == -1:
                    print("⏰ TTL: No expiry")
                elif ttl == -2:
                    print("⏰ TTL: Expired")
                else:
                    print(f"⏰ TTL: {ttl} seconds remaining")
            else:
                print(f"❌ Key '{key}' not found")
        except Exception as e:
            print(f"❌ Error getting key value: {e}")
    
    async def delete_key(self, key):
        """Delete a specific key"""
        try:
            result = await self.client.delete(key)
            if result:
                print(f"✅ Deleted key: {key}")
            else:
                print(f"❌ Key not found: {key}")
        except Exception as e:
            print(f"❌ Error deleting key: {e}")
    
    async def clear_all_forecast_cache(self):
        """Clear all forecast cache entries"""
        try:
            keys = await self.client.keys("forecast:*")
            if keys:
                result = await self.client.delete(*keys)
                print(f"✅ Cleared {result} forecast cache entries")
            else:
                print("No forecast cache entries to clear")
        except Exception as e:
            print(f"❌ Error clearing cache: {e}")
    
    async def redis_info(self):
        """Show Redis server information"""
        try:
            info = await self.client.info()
            print("\n📊 Redis Server Info:")
            print(f"  Version: {info.get('redis_version', 'Unknown')}")
            print(f"  Memory Used: {info.get('used_memory_human', 'Unknown')}")
            print(f"  Connected Clients: {info.get('connected_clients', 'Unknown')}")
            print(f"  Total Connections: {info.get('total_connections_received', 'Unknown')}")
            print(f"  Commands Processed: {info.get('total_commands_processed', 'Unknown')}")
            
            # Database info
            db_info = info.get('db0', {})
            if db_info:
                keys_count = db_info.get('keys', 0)
                expires_count = db_info.get('expires', 0)
                print(f"  Database 0: {keys_count} keys, {expires_count} with expiry")
            
        except Exception as e:
            print(f"❌ Error getting Redis info: {e}")
    
    async def close(self):
        """Close Redis connection"""
        if self.client:
            await self.client.close()

async def main():
    """Main interactive menu"""
    manager = RedisManager()
    
    if not await manager.connect():
        return
    
    while True:
        print("\n" + "="*50)
        print("🔴 REDIS DATABASE MANAGER")
        print("="*50)
        print("1. Show all keys")
        print("2. Show forecast cache keys")
        print("3. Get key value")
        print("4. Delete key")
        print("5. Clear all forecast cache")
        print("6. Redis server info")
        print("0. Exit")
        print("-"*50)
        
        try:
            choice = input("Enter your choice (0-6): ").strip()
            
            if choice == "0":
                print("👋 Goodbye!")
                break
            elif choice == "1":
                await manager.show_all_keys()
            elif choice == "2":
                await manager.show_forecast_keys()
            elif choice == "3":
                key = input("Enter key name: ").strip()
                if key:
                    await manager.get_key_value(key)
            elif choice == "4":
                key = input("Enter key name to delete: ").strip()
                if key:
                    confirm = input(f"Are you sure you want to delete '{key}'? (y/N): ").strip().lower()
                    if confirm == 'y':
                        await manager.delete_key(key)
            elif choice == "5":
                confirm = input("Are you sure you want to clear ALL forecast cache? (y/N): ").strip().lower()
                if confirm == 'y':
                    await manager.clear_all_forecast_cache()
            elif choice == "6":
                await manager.redis_info()
            else:
                print("❌ Invalid choice. Please try again.")
                
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
    
    await manager.close()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")