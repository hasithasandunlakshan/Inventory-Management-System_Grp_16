"""
Redis Configuration for ML Service - Choose Your Option
"""

# Option 1: Local Redis (when you install it)
LOCAL_REDIS_URL = "redis://localhost:6379"

# Option 2: Redis Cloud (FREE TIER) - YOUR ACTUAL DETAILS
# From: https://redis.com/try-free/
REDIS_CLOUD_HOST = "redis-18634.c321.us-east-1-2.ec2.redns.redis-cloud.com"
REDIS_CLOUD_PORT = "18634"
REDIS_CLOUD_USERNAME = "default"
REDIS_CLOUD_PASSWORD = "gQTgc94xp1OT2hILBizHmNmzI5a8Np3d"

# Build Redis Cloud URL (with username and password)
REDIS_CLOUD_URL = f"redis://{REDIS_CLOUD_USERNAME}:{REDIS_CLOUD_PASSWORD}@{REDIS_CLOUD_HOST}:{REDIS_CLOUD_PORT}"

# Choose which one to use:
# REDIS_URL = LOCAL_REDIS_URL      # For local Redis
REDIS_URL = REDIS_CLOUD_URL        # For Redis Cloud (update details above first!)

# Example of what Redis Cloud URL looks like:
# "redis://:abc123xyz@redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com:12345"

"""
TO USE REDIS CLOUD:
1. Go to https://redis.com/try-free/
2. Create free account
3. Get your Redis instance details
4. Replace REDIS_CLOUD_HOST, REDIS_CLOUD_PORT, REDIS_CLOUD_PASSWORD above
5. Your ML service will automatically connect to Redis Cloud!
"""