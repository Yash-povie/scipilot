# SciPilot — AI Research Platform

> **"The research OS that scientists actually need."** A multi-agent scientific intelligence platform that reads, reasons over, fact-checks, and synthesises knowledge across thousands of research papers — with a full production infrastructure stack.

[![CI](https://github.com/your-username/scipilot/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/scipilot/actions)
[![Python](https://img.shields.io/badge/python-3.11-blue.svg)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)

---

## What Problem This Solves

Scientific research is drowning in its own output. A researcher asking "What are the ADMET limitations of current JAK inhibitors?" must:

1. Search PubMed and get 2,000 results
2. Open 40 papers manually
3. Read, cross-reference, and extract relevant findings
4. Verify facts across sources and build citations
5. Write a synthesis

This takes **days**. SciPilot does it in **minutes** — privately, with citations, with fact-checking, on your own infrastructure. No proprietary data leaves your environment.

This is not "chat with PDFs." It is a multi-agent reasoning pipeline where specialised agents collaborate: one reads, one reasons, one fact-checks, one maps the knowledge graph, one builds citations, one writes the report.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Next.js 14 Frontend  (SSE streaming — live agent output) │
│  Research · Documents · Knowledge Graph · Reports         │
└───────────────────────┬──────────────────────────────────┘
                        │ JWT-authenticated REST + SSE
                        ▼
┌──────────────────────────────────────────────────────────┐
│  API Gateway  (FastAPI)                                   │
│  JWT auth · Rate limiting (Redis) · CORS · OTel tracing  │
│  Routes: /auth  /query  /documents  /health              │
└──────┬────────┬────────┬────────┬────────┬───────────────┘
       │        │        │        │        │
       ▼        ▼        ▼        ▼        ▼
┌─────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│  Agent  │ │Vector│ │Cache │ │Graph │ │Report│
│ Service │ │Service│ │Service│ │Service│ │Service│
└────┬────┘ └──────┘ └──────┘ └──────┘ └──────┘
     │
     │  LangGraph Supervisor
     ▼
┌──────────────────────────────────────────────┐
│  PaperReader → Reasoner → FactChecker →      │
│  KnowledgeGraph → Citation → Report          │
│                                              │
│  Each agent is a LangGraph node.             │
│  The Supervisor sequences them and           │
│  routes FINISH when complete.                │
└──────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────────────┐
│  Data Layer                                            │
│  PostgreSQL + pgvector   (documents, embeddings)       │
│  Neo4j                   (knowledge graph — GraphRAG)  │
│  Redis                   (semantic similarity cache)   │
│  MinIO                   (PDFs, reports, artifacts)    │
└────────────────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────────────┐
│  Observability                                         │
│  Prometheus · Grafana · OpenTelemetry · Jaeger         │
└────────────────────────────────────────────────────────┘
```

---

## The 6 Agents

| Agent | Role | What it does |
|---|---|---|
| **PaperReader** | Document analyst | Extracts findings, methodologies, data, and conclusions from ingested papers |
| **Reasoner** | Synthesis engine | Cross-references findings, identifies patterns, generates key insights |
| **FactChecker** | Verifier | Flags what is well-supported, what needs caveats, what is uncertain |
| **KnowledgeGraph** | Entity mapper | Extracts entities, relationships, and connected concepts for Neo4j |
| **Citation** | Reference builder | Maps claims to source documents with citation links |
| **Report** | Writer | Produces the final structured synthesis with full citations |

The **Supervisor** orchestrates them in sequence: PaperReader → Reasoner → FactChecker → KnowledgeGraph → Citation → Report → FINISH. Built with LangGraph `StateGraph` with conditional routing.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14, TypeScript, TailwindCSS | SSE streaming UI, research + document + report views |
| API Gateway | FastAPI, JWT (HS256), slowapi | Auth, rate limiting, CORS, OTel instrumentation |
| Agents | LangGraph, Groq API (llama-3.3-70b) | Multi-agent supervisor orchestration |
| Vector DB | PostgreSQL 15 + pgvector | Semantic document search (dense retrieval) |
| Graph DB | Neo4j | Knowledge graph — entity + relationship storage (GraphRAG) |
| Semantic cache | Redis | Embedding-based cache: similar queries skip LLM entirely |
| Object storage | MinIO | PDF uploads, report artifacts |
| Observability | Prometheus, Grafana, OpenTelemetry, Jaeger | Metrics, dashboards, distributed traces |
| Orchestration | Kubernetes (k8s manifests included) | Production deployment with HPA |
| CI/CD | GitHub Actions | test → lint → build → docker |
| Migrations | Alembic | PostgreSQL schema versioning |

---

## Repository Structure

```
scipilot/
│
├── frontend/                        # Next.js 14 + TailwindCSS
│   ├── app/
│   │   ├── research/page.tsx        # Main query interface (SSE streaming)
│   │   ├── documents/page.tsx       # PDF upload + document library
│   │   ├── knowledge-graph/page.tsx # Neo4j graph visualisation
│   │   └── reports/page.tsx         # Saved research reports
│   ├── components/
│   │   ├── AgentStream.tsx          # Live SSE agent thought stream
│   │   ├── KnowledgeGraph.tsx       # D3/force graph component
│   │   ├── PaperUpload.tsx          # Drag-drop PDF ingestion
│   │   ├── ReportViewer.tsx         # Formatted report renderer
│   │   └── Sidebar.tsx
│   └── Dockerfile
│
├── services/
│   ├── api-gateway/                 # FastAPI — JWT, rate limit, CORS, OTel
│   │   ├── main.py
│   │   ├── auth.py                  # JWT creation + validation
│   │   ├── middleware.py            # Rate limit middleware (Redis)
│   │   └── routes/
│   │       ├── auth.py              # POST /auth/login, /auth/refresh
│   │       ├── query.py             # POST /query  (kicks off agent pipeline)
│   │       ├── documents.py         # POST /documents/upload
│   │       └── health.py
│   │
│   ├── agent-service/               # LangGraph multi-agent pipeline
│   │   ├── main.py                  # FastAPI + SSE streaming endpoint
│   │   └── agents/
│   │       ├── graph.py             # StateGraph with supervisor routing
│   │       ├── nodes.py             # All 6 agent node functions
│   │       └── state.py             # ResearchState TypedDict
│   │
│   ├── vector-service/              # Embedding pipeline + pgvector search
│   │   └── main.py                  # /embed, /search, /ingest
│   │
│   ├── cache-service/               # Redis semantic similarity cache
│   │   └── main.py                  # /cache/get, /cache/set (embedding match)
│   │
│   ├── graph-service/               # Neo4j GraphRAG
│   │   └── main.py                  # /graph/query, /graph/ingest
│   │
│   └── report-service/              # PDF/PowerPoint report generation
│       └── main.py                  # /report/generate, /report/export
│
├── infrastructure/
│   ├── postgres/
│   │   ├── init.sql                 # pgvector extension, schema bootstrap
│   │   └── migrations/              # Alembic versions
│   ├── redis/redis.conf
│   ├── neo4j/seed.cypher            # Seed graph with domain ontology
│   ├── minio/init.sh
│   ├── prometheus/
│   │   ├── prometheus.yml
│   │   └── alert_rules.yml          # High latency + error rate alerts
│   ├── grafana/
│   │   ├── datasources.yml
│   │   └── dashboards/scipilot.json # Pre-built SciPilot dashboard
│   └── jaeger/otel-collector.yml
│
├── kubernetes/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── deployments/                 # One Deployment per service
│   ├── services/                    # ClusterIP per service
│   ├── hpa/hpa-agent-service.yaml   # HPA on agent-service (CPU 70%)
│   ├── ingress/ingress.yaml         # nginx ingress with TLS
│   ├── pvc/                         # PersistentVolumeClaims for stateful infra
│   └── secrets/secrets.yaml
│
├── tests/
│   ├── unit/test_agents.py          # LangGraph node unit tests
│   ├── integration/test_api.py      # API endpoint integration tests
│   └── e2e/test_research_flow.py    # Full research query E2E test
│
├── benchmarks/benchmark.py          # Token cost, latency, cache hit rate
├── docs/
│   ├── architecture.md
│   ├── build-spec.md
│   └── runbook.md
├── docker-compose.yml
├── Makefile
└── .env.example
```

---

## Services & Ports

| Service | Port | Description |
|---|---|---|
| `frontend` | **3000** | Next.js research UI |
| `api-gateway` | **8000** | Main entry point — JWT auth, rate limiting, routing |
| `agent-service` | **8001** | LangGraph pipeline, SSE streaming |
| `vector-service` | **8002** | Embedding + pgvector semantic search |
| `cache-service` | **8003** | Redis semantic cache |
| `graph-service` | **8004** | Neo4j GraphRAG |
| `report-service` | **8005** | Report generation (PDF/PPTX) |
| `postgres` | 5432 | Documents + embeddings |
| `neo4j` | 7474 (UI), 7687 (bolt) | Knowledge graph |
| `redis` | 6379 | Semantic cache |
| `minio` | 9000 (API), 9001 (UI) | Object storage |
| `jaeger` | 16686 | Trace UI |
| `prometheus` | 9090 | Metrics |
| `grafana` | **3001** | Dashboards |

---

## Quick Start

```bash
# 1. Clone and configure
git clone https://github.com/your-username/scipilot
cd scipilot
cp .env.example .env
# Edit .env: add GROQ_API_KEY, OPENAI_API_KEY (for embeddings)

# 2. Start full stack
docker-compose up -d

# 3. Upload papers and run a query
curl -X POST http://localhost:8000/documents/upload \
  -F "file=@paper.pdf"

curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the ADMET limitations of JAK inhibitors?"}'

# 4. Open frontend
open http://localhost:3000

# 5. View traces
open http://localhost:16686  # Jaeger
open http://localhost:3001   # Grafana (admin/admin)
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key — powers all 6 agents (llama-3.3-70b-versatile) |
| `OPENAI_API_KEY` | OpenAI API key — used by vector-service for embeddings |
| `JWT_SECRET` | Secret for JWT signing |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `NEO4J_URI` | Neo4j bolt URI |
| `NEO4J_PASSWORD` | Neo4j password |
| `MINIO_ENDPOINT` | MinIO endpoint |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |

---

## How the LangGraph Pipeline Works

```
User Query
    │
    ▼
Supervisor (decides who goes next)
    │
    ├─► PaperReader   — reads ingested documents, extracts structured findings
    │       │
    ├─► Reasoner      — synthesises PaperReader output into key insights
    │       │
    ├─► FactChecker   — verifies claims, flags uncertainty, adds caveats
    │       │
    ├─► KnowledgeGraph — extracts entities/relationships → writes to Neo4j
    │       │
    ├─► Citation      — maps every claim to its source document
    │       │
    └─► Report        — produces final structured synthesis with citations
            │
            ▼
        FINISH → SSE stream to frontend
```

State is shared across all agents via `ResearchState` (TypedDict). Each agent appends to `messages` and `findings`. The supervisor uses conditional edges to advance the sequence. LangGraph checkpointing via PostgreSQL enables persistent research sessions.

---

## Semantic Cache (Redis)

Before every query hits the LangGraph pipeline, the cache-service checks whether a semantically similar query was already answered:

1. Embed the incoming query
2. Check Redis for a cached embedding within cosine similarity threshold (0.92)
3. If match found → return cached result instantly (no LLM cost)
4. If miss → run full pipeline, cache the result

Cache hit rates above 30% eliminate significant LLM spend on repeated research patterns.

---

## Kubernetes Deployment

```bash
# Apply all manifests
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secrets/secrets.yaml
kubectl apply -f kubernetes/pvc/
kubectl apply -f kubernetes/deployments/
kubectl apply -f kubernetes/services/
kubectl apply -f kubernetes/hpa/
kubectl apply -f kubernetes/ingress/

# Verify
kubectl get pods -n scipilot
kubectl get hpa -n scipilot
```

The HPA scales `agent-service` between 2 and 10 replicas based on CPU utilisation (target: 70%).

---

## Running Tests

```bash
pip install -r services/agent-service/requirements.txt pytest pytest-asyncio
pytest tests/ -v
```

---

## What Makes This Different From "Chat With PDFs"

| Generic RAG app | SciPilot |
|---|---|
| Single LLM call | 6-agent pipeline with specialised roles |
| Basic cosine search | GraphRAG (Neo4j entities + pgvector) |
| No fact-checking | Dedicated FactChecker agent with uncertainty flags |
| No caching | Redis semantic cache (embedding-based, not exact-match) |
| Cloud API required | Runs entirely on private infrastructure |
| No observability | Prometheus + Grafana + Jaeger across 6 services |
| Demo only | Production K8s manifests with HPA, PVC, ingress, secrets |