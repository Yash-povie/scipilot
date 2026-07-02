from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
import httpx
import os
from auth import get_current_user

router = APIRouter(prefix="/documents")
VECTOR_SERVICE_URL = os.getenv("VECTOR_SERVICE_URL", "http://vector-service:8002")
GRAPH_SERVICE_URL = os.getenv("GRAPH_SERVICE_URL", "http://graph-service:8003")

@router.post("/upload")
async def upload_document(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDFs are supported")
    
    content = await file.read()
    
    async with httpx.AsyncClient() as client:
        # Send to vector service
        vec_res = await client.post(
            f"{VECTOR_SERVICE_URL}/ingest-pdf",
            files={"file": (file.filename, content, file.content_type)}
        )
        # Send to graph service
        graph_res = await client.post(
            f"{GRAPH_SERVICE_URL}/ingest",
            files={"file": (file.filename, content, file.content_type)}
        )
        
    return {
        "vector_status": vec_res.status_code,
        "graph_status": graph_res.status_code
    }
