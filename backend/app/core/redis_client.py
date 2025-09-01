import os
import redis.asyncio as aredis
import redis as r

# This module provides a singleton client for both async (FastAPI) and sync (Celery) contexts.

# URL for Redis connection, configured for Docker networking by default.
REDIS_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")

# The channel used for streaming agent messages from the worker to the web server.
STREAM_CHANNEL = "onwrk-agent-stream"

# Asynchronous client for the FastAPI application (e.g., for the pubsub listener).
# decode_responses=True ensures that we receive strings, not bytes.
async_redis_client = aredis.from_url(REDIS_URL, decode_responses=True)

# Synchronous client for the Celery tasks.
sync_redis_client = r.from_url(REDIS_URL, decode_responses=True)
