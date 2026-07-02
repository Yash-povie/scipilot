import os
import io
import tiktoken
import asyncpg
from pgvector.asyncpg import register_vector
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from openai import AsyncOpenAI
from pypdf import PdfReader
from contextlib import asynccontextmanager

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/scipilot")
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", "dummy"))

pool: asyncpg.Pool = None

async def init_connection(conn):
    await register_vector(conn)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global pool
    pool = await asyncpg.create_pool(DATABASE_URL, init=init_connection)
    yield
    if pool:
        await pool.close()

app = FastAPI(title="vector-service", lifespan=lifespan)

class HealthResponse(BaseModel):
    status: str
    service: str

class EmbedRequest(BaseModel):
    text: str
    document_id: Optional[str] = None

class EmbedResponse(BaseModel):
    id: int
    embedding: List[float]

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5

class SearchResult(BaseModel):
    id: int
    text: str
    score: float
    document_id: Optional[str]

@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok", service="vector-service")

async def get_embedding(text: str) -> List[float]:
    response = await client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

@app.post("/embed", response_model=EmbedResponse)
async def embed(req: EmbedRequest):
    emb = await get_embedding(req.text)
    async with pool.acquire() as conn:
        row_id = await conn.fetchval(
            "INSERT INTO chunks (text, embedding, document_id) VALUES ($1, $2, $3) RETURNING id",
            req.text, emb, req.document_id
        )
    return EmbedResponse(id=row_id, embedding=emb)

@app.post("/search", response_model=List[SearchResult])
async def search(req: SearchRequest):
    emb = await get_embedding(req.query)
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, text, document_id, 1 - (embedding <=> $1) AS score
            FROM chunks
            ORDER BY embedding <=> $1
            LIMIT $2
            """,
            emb, req.top_k
        )
    return [
        SearchResult(
            id=row["id"],
            text=row["text"],
            score=row["score"],
            document_id=row["document_id"]
        ) for row in rows
    ]

def chunk_text(text: str, chunk_size=512, overlap=50) -> List[str]:
    enc = tiktoken.get_encoding("cl100k_base")
    tokens = enc.encode(text)
    chunks = []
    i = 0
    while i < len(tokens):
        chunk_tokens = tokens[i:i + chunk_size]
        chunks.append(enc.decode(chunk_tokens))
        if i + chunk_size >= len(tokens):
            break
        i += chunk_size - overlap
    return chunks

@app.post("/ingest-pdf")
async def ingest_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDFs are supported")
    
    content = await file.read()
    reader = PdfReader(io.BytesIO(content))
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
            
    chunks = chunk_text(text, 512, 50)
    
    results = []
    document_id = file.filename
    for chunk in chunks:
        emb = await get_embedding(chunk)
        async with pool.acquire() as conn:
            row_id = await conn.fetchval(
                "INSERT INTO chunks (text, embedding, document_id) VALUES ($1, $2, $3) RETURNING id",
                chunk, emb, document_id
            )
            results.append(row_id)
            
    return {"status": "success", "chunks_inserted": len(results)}

FastAPIInstrumentor.instrument_app(app)
