"""
FarmMate Asynchronous Redis Cache Utility
Provides fast key-value caching for OpenWeatherMap telemetry and market price predictions with graceful offline fallbacks.
"""
import os
import json
import logging
from typing import Optional, Any

logger = logging.getLogger("farmmate.cache")

class RedisCacheManager:
    def __init__(self):
        self.host = os.getenv("REDIS_HOST", "localhost")
        self.port = int(os.getenv("REDIS_PORT", 6379))
        self.db = int(os.getenv("REDIS_DB", 0))
        self.password = os.getenv("REDIS_PASSWORD", None)
        self._client = None
        self._is_disabled = False

    async def get_client(self):
        if self._is_disabled:
            return None
        if self._client is None:
            try:
                import redis.asyncio as aioredis  # type: ignore
                self._client = aioredis.Redis(
                    host=self.host,
                    port=self.port,
                    db=self.db,
                    password=self.password,
                    decode_responses=True,
                    socket_timeout=2.0
                )
                # Test ping connection
                await self._client.ping()
                logger.info(f"Connected to Redis cache at {self.host}:{self.port}")
            except Exception as e:
                logger.warning(f"Redis cache unavailable ({e}). Operating in memory/direct mode.")
                self._is_disabled = True
                self._client = None
        return self._client

    async def get_json(self, key: str) -> Optional[Any]:
        try:
            client = await self.get_client()
            if not client:
                return None
            data = await client.get(key)
            if data:
                logger.debug(f"Cache HIT for key: {key}")
                return json.loads(data)
            logger.debug(f"Cache MISS for key: {key}")
            return None
        except Exception as e:
            logger.warning(f"Redis GET failed for key '{key}': {e}")
            return None

    async def set_json(self, key: str, value: Any, ttl_seconds: int = 900) -> bool:
        try:
            client = await self.get_client()
            if not client:
                return False
            serialized = json.dumps(value)
            await client.set(key, serialized, ex=ttl_seconds)
            logger.debug(f"Cache SET for key: {key} (TTL: {ttl_seconds}s)")
            return True
        except Exception as e:
            logger.warning(f"Redis SET failed for key '{key}': {e}")
            return False

# Global cache instance
cache_manager = RedisCacheManager()
