from fastapi import FastAPI, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from langchain_core.messages import HumanMessage
import asyncio
import json
import io
import hashlib

app = FastAPI(title="agent-service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from agents.graph import create_graph
graph = create_graph()

_context_store: dict[str, str] = {}

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "agent-service"}

@app.post("/upload-context")
async def upload_context(file: UploadFile = File(...)):
    content = await file.read()
    session_id = hashlib.md5(content).hexdigest()[:12]

    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(content))
        pages_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text and text.strip():
                pages_text.append(text.strip())
        extracted = "\n\n".join(pages_text)
    except Exception as e:
        extracted = f"[PDF extraction error: {e}]"

    if not extracted or len(extracted) < 50:
        extracted = "[No readable text could be extracted from this PDF]"

    _context_store[session_id] = f"[Document: {file.filename}]\n\n{extracted}"
    return {
        "session_id": session_id,
        "filename": file.filename,
        "chars": len(extracted),
        "pages": len(extracted.split("\n\n"))
    }

@app.get("/stream")
async def stream_agent(query: str, request: Request, session_id: str = ""):
    context = _context_store.get(session_id, "")

    async def event_generator():
        full_query = query
        if context:
            # Send first 6000 chars of doc — enough for Groq context window
            full_query = f"{query}\n\n=== DOCUMENT CONTENT ===\n{context[:6000]}"

        initial_state = {
            "messages": [HumanMessage(content=full_query)],
            "query": full_query,
            "papers": [],
            "findings": [],
            "citations": [],
            "next": "PaperReader"
        }

        SKIP = {"supervisor", "__end__"}

        async for output in graph.astream(initial_state):
            for node_name, state_update in output.items():
                if node_name in SKIP:
                    continue
                messages = state_update.get("messages", [])
                if not messages:
                    continue

                if await request.is_disconnected():
                    return

                yield {
                    "event": "message",
                    "data": json.dumps({
                        "agent": node_name,
                        "content": messages[-1].content
                    })
                }
                await asyncio.sleep(0.2)

        yield {
            "event": "message",
            "data": json.dumps({"type": "end"})
        }

    return EventSourceResponse(event_generator())