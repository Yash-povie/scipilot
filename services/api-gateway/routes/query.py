from fastapi import APIRouter, Request, Depends
from fastapi.responses import StreamingResponse
import httpx
import os
from auth import get_current_user

router = APIRouter(prefix="/query")
AGENT_SERVICE_URL = os.getenv("AGENT_SERVICE_URL", "http://agent-service:8001")

@router.post("/stream")
async def query_stream(request: Request, user: dict = Depends(get_current_user)):
    body = await request.body()
    
    async def sse_proxy():
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST", 
                f"{AGENT_SERVICE_URL}/stream", 
                content=body,
                headers={"Content-Type": "application/json"}
            ) as response:
                async for chunk in response.aiter_bytes():
                    yield chunk

    return StreamingResponse(sse_proxy(), media_type="text/event-stream")
