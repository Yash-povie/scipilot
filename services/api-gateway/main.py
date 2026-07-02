from fastapi import FastAPI
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from middleware import RateLimitMiddleware
from routes.health import router as health_router
from routes.auth import router as auth_router
from routes.query import router as query_router
from routes.documents import router as documents_router

app = FastAPI(title="api-gateway")

app.add_middleware(RateLimitMiddleware)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(query_router)
app.include_router(documents_router)

FastAPIInstrumentor.instrument_app(app)
