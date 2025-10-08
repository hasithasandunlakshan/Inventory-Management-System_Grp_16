import json
import hashlib
from typing import Any, Optional, Dict
import redis.asyncio as redis
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        """Initialize cache service with Redis connection"""
        # Import Redis Cloud config when available
        try:
            from redis_config import REDIS_URL
            self.redis_url = REDIS_URL
        except ImportError:
            self.redis_url = redis_url
        self.redis_client = None
        self._connection_attempts = 0
        self.max_connection_attempts = 3
        self.fallback_cache = {}  # In-memory fallback
        
    async def connect(self):
        """Establish Redis connection with fallback to in-memory cache"""
        if self.redis_client is None and self._connection_attempts < self.max_connection_attempts:
            try:
                self.redis_client = redis.from_url(
                    self.redis_url, 
                    encoding="utf-8", 
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5
                )
                # Test connection
                await self.redis_client.ping()
                logger.info("✅ Redis connection established")
                return True
            except Exception as e:
                self._connection_attempts += 1
                logger.warning(f"⚠️ Redis connection failed (attempt {self._connection_attempts}): {e}")
                if self._connection_attempts >= self.max_connection_attempts:
                    logger.warning("📝 Falling back to in-memory cache")
                return False
        return self.redis_client is not None
    
    def generate_cache_key(self, product_id: str, params: Dict = None) -> str:
        """Generate a unique cache key based on product_id and parameters"""
        key_data = f"forecast:{product_id}"
        if params:
            # Sort params for consistent key generation
            param_str = json.dumps(params, sort_keys=True)
            param_hash = hashlib.md5(param_str.encode()).hexdigest()
            key_data += f":{param_hash}"
        return key_data
    
    async def get_cached_forecast(self, cache_key: str) -> Optional[Dict]:
        """Get cached forecast result"""
        # Try Redis first
        if await self.connect():
            try:
                cached_data = await self.redis_client.get(cache_key)
                if cached_data:
                    result = json.loads(cached_data)
                    logger.info(f"🎯 Cache HIT (Redis): {cache_key}")
                    return result
            except Exception as e:
                logger.error(f"Redis get error: {e}")
        
        # Fallback to in-memory cache
        if cache_key in self.fallback_cache:
            entry = self.fallback_cache[cache_key]
            if datetime.now() < entry['expires_at']:
                logger.info(f"🎯 Cache HIT (Memory): {cache_key}")
                return entry['data']
            else:
                # Expired entry
                del self.fallback_cache[cache_key]
        
        logger.info(f"❌ Cache MISS: {cache_key}")
        return None
    
    async def set_cached_forecast(self, cache_key: str, data: Dict, ttl: int = 3600):
        """Cache forecast result with TTL"""
        # Try Redis first
        if await self.connect():
            try:
                await self.redis_client.setex(
                    cache_key, 
                    ttl, 
                    json.dumps(data, default=str)
                )
                logger.info(f"💾 Cached to Redis: {cache_key} (TTL: {ttl}s)")
                return
            except Exception as e:
                logger.error(f"Redis set error: {e}")
        
        # Fallback to in-memory cache
        expires_at = datetime.now() + timedelta(seconds=ttl)
        self.fallback_cache[cache_key] = {
            'data': data,
            'expires_at': expires_at
        }
        logger.info(f"💾 Cached to Memory: {cache_key} (TTL: {ttl}s)")
        
        # Simple cleanup - remove expired entries (keep max 100 entries)
        if len(self.fallback_cache) > 100:
            now = datetime.now()
            expired_keys = [k for k, v in self.fallback_cache.items() if now >= v['expires_at']]
            for key in expired_keys:
                del self.fallback_cache[key]
    
    async def invalidate_product_cache(self, product_id: str):
        """Invalidate all cache entries for a specific product"""
        deleted_count = 0
        
        # Try Redis first
        if await self.connect():
            try:
                pattern = f"forecast:{product_id}*"
                keys = []
                async for key in self.redis_client.scan_iter(match=pattern):
                    keys.append(key)
                
                if keys:
                    deleted_count = await self.redis_client.delete(*keys)
                    logger.info(f"🗑️ Invalidated {deleted_count} Redis cache entries for product {product_id}")
            except Exception as e:
                logger.error(f"Redis invalidation error: {e}")
        
        # Fallback: clean in-memory cache
        pattern = f"forecast:{product_id}"
        keys_to_delete = [k for k in self.fallback_cache.keys() if k.startswith(pattern)]
        for key in keys_to_delete:
            del self.fallback_cache[key]
            deleted_count += 1
        
        if keys_to_delete:
            logger.info(f"🗑️ Invalidated {len(keys_to_delete)} memory cache entries for product {product_id}")
        
        return deleted_count
    
    async def get_cache_stats(self) -> Dict:
        """Get cache statistics"""
        stats = {
            "redis_connected": False,
            "memory_cache_size": len(self.fallback_cache),
            "connection_attempts": self._connection_attempts
        }
        
        if await self.connect():
            try:
                info = await self.redis_client.info()
                stats.update({
                    "redis_connected": True,
                    "redis_keys": info.get('db0', {}).get('keys', 0) if 'db0' in info else 0,
                    "redis_memory": info.get('used_memory_human', 'Unknown')
                })
            except Exception as e:
                logger.error(f"Error getting Redis stats: {e}")
        
        return stats
    
    def calculate_ttl(self, forecast_days: int) -> int:
        """Calculate appropriate TTL based on forecast horizon"""
        if forecast_days <= 7:
            return 3600  # 1 hour for short-term forecasts
        elif forecast_days <= 30:
            return 21600  # 6 hours for medium-term forecasts
        else:
            return 86400  # 24 hours for long-term forecasts

# Global cache service instance
cache_service = CacheService()