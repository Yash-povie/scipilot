import os
import time
import redis.asyncio as aioredis
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

RATE_LIMIT = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

_redis = None


async def get_redis():
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(REDIS_URL, decode_responses=True)
    return _redis


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        if request.url.path in ("/health", "/docs", "/openapi.json"):
            return await call_next(request)

        client_ip = request.client.host
        r = await get_redis()
        key = f"rate:{client_ip}:{int(time.time() // 60)}"
        count = await r.incr(key)
        if count == 1:
            await r.expire(key, 60)

        if count > RATE_LIMIT:
            return JSONResponse(
                status_code=429,
                content={"detail": f"Rate limit exceeded: {RATE_LIMIT} req/min"},
                headers={"Retry-After": "60"},
            )
        return await call_next(request)