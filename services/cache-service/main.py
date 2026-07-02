import os
import json
import math
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
import redis.asyncio as redis
from openai import AsyncOpenAI
from contextlib import asynccontextmanager

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "dummy")

client = AsyncOpenAI(api_key=OPENAI_API_KEY)
redis_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    yield
    if redis_client:
        await redis_client.close()

app = FastAPI(title="cache-service", lifespan=lifespan)

class HealthResponse(BaseModel):
    status: str
    service: str

class CacheGetRequest(BaseModel):
    query: str

class CacheGetResponse(BaseModel):
    found: bool
    response: Optional[str] = None
    similarity: Optional[float] = None

class CacheSetRequest(BaseModel):
    query: str
    response: str

class CacheSetResponse(BaseModel):
    status: str

@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok", service="cache-service")

async def get_embedding(text: str) -> list[float]:
    res = await client.embeddings.create(input=text, model="text-embedding-3-small")
    return res.data[0].embedding

def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    dot = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)

@app.post("/cache/get", response_model=CacheGetResponse)
async def cache_get(req: CacheGetRequest) -> CacheGetResponse:
    emb = await get_embedding(req.query)
    
    best_sim = -1.0
    best_resp = None
    
    async for key in redis_client.scan_iter("cache:*"):
        data_str = await redis_client.get(key)
        if data_str:
            data = json.loads(data_str)
            cached_emb = data.get("embedding")
            if cached_emb:
                sim = cosine_similarity(emb, cached_emb)
                if sim > best_sim:
                    best_sim = sim
                    best_resp = data.get("response")
                    
    if best_sim > 0.95 and best_resp:
        return CacheGetResponse(found=True, response=best_resp, similarity=best_sim)
        
    return CacheGetResponse(found=False)

@app.post("/cache/set", response_model=CacheSetResponse)
async def cache_set(req: CacheSetRequest) -> CacheSetResponse:
    emb = await get_embedding(req.query)
    key = f"cache:{hash(req.query)}"
    
    payload = {
        "query": req.query,
        "response": req.response,
        "embedding": emb
    }
    
    await redis_client.setex(key, 3600, json.dumps(payload))
    return CacheSetResponse(status="saved")

FastAPIInstrumentor.instrument_app(app)
