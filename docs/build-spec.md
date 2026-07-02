# SciPilot — Full Build Specification

## Project Overview
SciPilot is a production-grade multi-agent AI research platform for scientists.
It combines a LangGraph supervisor with 6 specialized agents, Neo4j GraphRAG,
pgvector semantic search, Redis semantic cache, full Kubernetes deployment, and
a complete observability stack (Prometheus + Grafana + OpenTelemetry + Jaeger).

Target: FAANG-level portfolio project showcasing distributed systems, AI infrastructure,
MLOps, observability, and Kubernetes engineering.

## Root: D:\scipilot (already scaffolded with folders and docker-compose.yml)

## Stack
- Backend: Python 3.11, FastAPI async, Pydantic v2, SQLAlchemy 2.0, Alembic
- Agents: LangGraph, langchain-anthropic (Claude), LangSmith tracing
- Databases: PostgreSQL 16 + pgvector, Neo4j 5 (GraphRAG), Redis 7
- Storage: MinIO (S3-compatible)
- Observability: Prometheus, Grafana, OpenTelemetry, Jaeger
- Orchestration: Kubernetes (k3s/minikube), Helm
- CI/CD: GitHub Actions -> Docker -> ECR -> K8s
- Frontend: Next.js 14, TypeScript, TailwindCSS, SSE streaming

## Services to build (each in services/<name>/)

### 1. api-gateway (port 8000) - ALREADY PARTIALLY DONE
FastAPI app with:
- JWT auth (HS256, python-jose)
- Redis rate limiting middleware (60 req/min per IP)
- Proxy routes to downstream services (httpx async)
- OpenTelemetry instrumentation
- Routes: /auth/register, /auth/login, /query/stream (SSE), /documents/upload, /health

### 2. agent-service (port 8001)
LangGraph multi-agent system:
- Supervisor node that routes to 6 agents
- Paper Reader Agent: extracts text/structure from PDFs
- Reasoner Agent: synthesizes information, generates hypotheses
- Fact Checker Agent: validates claims against vector store
- Knowledge Graph Agent: queries Neo4j for entity relationships
- Citation Agent: finds and formats academic citations
- Report Agent: generates structured markdown/PDF reports
- SSE endpoint /stream that yields agent thoughts in real time
- LangGraph checkpointing via PostgreSQL (langgraph-checkpoint-postgres)
- State: ResearchState TypedDict with messages, papers, findings, citations

### 3. vector-service (port 8002)
Embedding pipeline:
- POST /embed: chunk text, embed with text-embedding-3-small, store in pgvector
- POST /search: semantic search returning top-k chunks with similarity scores
- POST /ingest-pdf: extract text from PDF, chunk (512 tokens, 50 overlap), embed, store
- Uses asyncpg for async postgres, pgvector extension

### 4. graph-service (port 8003)
Neo4j GraphRAG:
- POST /ingest: extract entities (compounds, methods, authors, concepts) from text -> Neo4j
- POST /query: Cypher query generation from natural language via LLM
- GET /neighbors: get entity neighborhood for context expansion
- Uses neo4j-driver async

### 5. cache-service (port 8004)
Redis semantic cache:
- POST /cache/get: embed query, search Redis for similar cached queries (cosine sim > 0.95)
- POST /cache/set: store query embedding + response in Redis
- Avoids redundant LLM calls for semantically identical queries

### 6. report-service (port 8005)
Document generation:
- POST /generate/pdf: convert markdown research report to PDF (reportlab or weasyprint)
- POST /generate/pptx: convert findings to PowerPoint (python-pptx)
- POST /upload: store generated files in MinIO, return presigned URL

## Each service needs:
- main.py (FastAPI app)
- Dockerfile (python:3.11-slim, multi-stage, non-root user)
- requirements.txt (pinned versions)
- pyproject.toml (ruff, mypy config)
- __init__.py

## Infrastructure files needed:

### infrastructure/postgres/init.sql
- Enable pgvector extension
- Create tables: users, documents, chunks (with vector column), research_sessions
- Create indexes: ivfflat index on chunks.embedding

### infrastructure/postgres/migrations/env.py + alembic.ini
Standard Alembic setup pointing to DATABASE_URL env var

### infrastructure/redis/redis.conf
maxmemory 512mb, maxmemory-policy allkeys-lru, save disabled for cache

### infrastructure/neo4j/seed.cypher
Create constraints: UNIQUE on (Paper {doi}), (Author {name}), (Compound {name})
Create sample chemistry nodes for testing

### infrastructure/minio/init.sh
mc alias set local http://minio:9000 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
mc mb local/scipilot --ignore-existing

### infrastructure/prometheus/prometheus.yml
Scrape all 6 services + postgres-exporter + redis-exporter
Global scrape_interval: 15s

### infrastructure/prometheus/alert_rules.yml
Alerts: HighLatency (>2s p99), HighErrorRate (>1%), ServiceDown, HighTokenCost

### infrastructure/grafana/datasources.yml
Prometheus datasource pointing to http://prometheus:9090

### infrastructure/grafana/dashboards/scipilot.json
Dashboard with panels: Request rate, P50/P95/P99 latency, Agent call counts,
Token usage, Cache hit rate, Active sessions, Error rate

### infrastructure/jaeger/otel-collector.yml
OpenTelemetry collector config: receives OTLP gRPC on 4317, exports to Jaeger

## Kubernetes manifests (kubernetes/)

### namespace.yaml
apiVersion: v1, kind: Namespace, name: scipilot

### deployments/ (one yaml per service)
Each deployment:
- namespace: scipilot
- 2 replicas
- resource limits: cpu 500m/1000m, memory 256Mi/512Mi
- liveness + readiness probes on /health
- envFrom: configMapRef scipilot-config
- envFrom: secretRef scipilot-secrets
- image: scipilot/<service>:latest

### services/ (ClusterIP for internal, one per service)

### ingress/ingress.yaml
nginx ingress controller
Rules: / -> frontend:3000, /api -> api-gateway:8000

### hpa/hpa-agent-service.yaml
HorizontalPodAutoscaler for agent-service
minReplicas: 2, maxReplicas: 10
targetCPUUtilizationPercentage: 70

### pvc/
postgres-pvc.yaml, minio-pvc.yaml, grafana-pvc.yaml (5Gi each, ReadWriteOnce)

### secrets/secrets.yaml
Kind: Secret with base64 encoded JWT_SECRET, ANTHROPIC_API_KEY, POSTGRES_PASSWORD, etc.
(use placeholder values - real values go in .env)

### configmap.yaml
Non-sensitive env vars: service URLs, Redis URL, Neo4j URI, OTEL endpoint

## GitHub Actions (.github/workflows/)

### ci.yml
Trigger: push to main, PR
Jobs:
- lint: ruff check + mypy on all services
- test: pytest with postgres + redis testcontainers
- build: docker build all images
- security: trivy scan on docker images

### deploy.yml
Trigger: push to main (after ci passes)
Jobs:
- Build and push to ECR (us-east-1)
- kubectl set image for each deployment
- Verify rollout status

## Frontend (frontend/)
Next.js 14 app with:
- app/page.tsx: Landing page with search bar
- app/research/page.tsx: Main research interface
- components/AgentStream.tsx: SSE consumer showing real-time agent thoughts
- components/PaperUpload.tsx: Drag-and-drop PDF upload
- components/KnowledgeGraph.tsx: Neo4j graph visualization (react-force-graph)
- components/ReportViewer.tsx: Markdown report renderer
- lib/api.ts: Typed API client for all endpoints
- Dockerfile: node:18-alpine, multi-stage (build + serve with next start)
- package.json with: next, react, typescript, tailwindcss, react-force-graph, react-markdown, swr

## Tests (tests/)

### tests/unit/test_agents.py
Test each agent node in isolation with mocked LLM
Test LangGraph state transitions

### tests/integration/test_api.py
Test full query flow end-to-end with testcontainers (postgres, redis)
Test JWT auth flow (register -> login -> authenticated request)
Test rate limiting (61 requests -> 429)

### tests/e2e/test_research_flow.py
Test: upload PDF -> ingest -> query -> get SSE stream -> verify report generated

## docs/architecture.md
Full architecture description with ASCII diagram matching the one in the plan

## docs/runbook.md
- Local development setup
- How to add a new agent
- How to add a new data source
- Incident response playbook (service down, high latency, DB connection issues)

## benchmarks/benchmark.py
Script that:
- Sends 100 research queries
- Measures P50/P95/P99 latency
- Measures cache hit rate
- Measures token cost per query
- Outputs markdown table

## README.md
- Architecture diagram (ASCII)
- Quick start (make setup && make up)
- Service table with ports
- Demo description
- Tech stack badges
- Link to docs/

## IMPORTANT RULES:
1. All Python must use type hints everywhere
2. All FastAPI routes must have Pydantic request/response models
3. All Dockerfiles must use multi-stage builds with non-root USER
4. All services must expose /health endpoint returning {"status": "ok", "service": "<name>"}
5. All services must have OpenTelemetry instrumentation
6. Use asyncpg/async drivers everywhere - no sync DB calls
7. Pinned versions in requirements.txt (not ranges)
8. No hardcoded secrets - always read from env vars

BUILD ALL OF THE ABOVE FILES NOW. Create every file listed. Do not skip any file.