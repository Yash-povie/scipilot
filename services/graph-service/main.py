import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from neo4j import AsyncGraphDatabase
from anthropic import AsyncAnthropic
from contextlib import asynccontextmanager

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://neo4j:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

anthropic_client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY", "dummy"))
neo4j_driver = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global neo4j_driver
    neo4j_driver = AsyncGraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    yield
    if neo4j_driver:
        await neo4j_driver.close()

app = FastAPI(title="graph-service", lifespan=lifespan)

class HealthResponse(BaseModel):
    status: str
    service: str

class GraphIngestRequest(BaseModel):
    text: str

class GraphIngestResponse(BaseModel):
    nodes_created: int
    relationships_created: int

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    query: str
    results: List[Dict[str, Any]]

class NeighborhoodResponse(BaseModel):
    neighbors: List[Dict[str, Any]]

@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok", service="graph-service")

@app.post("/ingest", response_model=GraphIngestResponse)
async def ingest(req: GraphIngestRequest):
    prompt = f"""Extract entities (types: Compound, Method, Author, Concept) and relationships from the following text.
Return ONLY valid JSON matching this schema:
{{
  "nodes": [{{"id": "unique_str", "type": "Concept", "name": "Deep Learning"}}],
  "relationships": [{{"source_id": "id1", "target_id": "id2", "type": "USES"}}]
}}
Text: {req.text}"""

    response = await anthropic_client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}]
    )
    
    try:
        text = response.content[0].text
        start_idx = text.find('{')
        end_idx = text.rfind('}') + 1
        data = json.loads(text[start_idx:end_idx])
        nodes = data.get("nodes", [])
        relationships = data.get("relationships", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse LLM response: {str(e)}")

    nodes_created = 0
    rels_created = 0
    
    async with neo4j_driver.session() as session:
        for node in nodes:
            label = node.get("type", "Concept").replace(" ", "")
            name = node.get("name", "")
            node_id = node.get("id", name)
            
            # Label parameterization not supported natively so we inject it safely
            query = f"MERGE (n:`{label}` {{id: $id}}) SET n.name = $name"
            await session.run(query, id=node_id, name=name)
            nodes_created += 1
            
        for rel in relationships:
            source = rel.get("source_id")
            target = rel.get("target_id")
            rel_type = rel.get("type", "RELATED_TO").upper().replace(" ", "_")
            
            query = f"""
            MATCH (a {{id: $source}})
            MATCH (b {{id: $target}})
            MERGE (a)-[r:`{rel_type}`]->(b)
            """
            await session.run(query, source=source, target=target)
            rels_created += 1

    return GraphIngestResponse(nodes_created=nodes_created, relationships_created=rels_created)

@app.post("/query", response_model=QueryResponse)
async def query_graph(req: QueryRequest):
    prompt = f"""You are a Neo4j Cypher expert. 
Our graph has nodes with labels: Compound, Method, Author, Concept. 
Write a read-only Cypher query to answer the following question. 
Output ONLY the raw Cypher query string without any markdown formatting or explanation.
Question: {req.question}"""

    response = await anthropic_client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )
    
    cypher_query = response.content[0].text.strip()
    if cypher_query.startswith("```"):
        lines = cypher_query.split("\n")
        cypher_query = "\n".join(lines[1:-1]) if lines[-1].startswith("```") else "\n".join(lines[1:])
    
    results = []
    try:
        async with neo4j_driver.session() as session:
            result = await session.run(cypher_query)
            records = await result.data()
            results = records
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to execute Cypher query: {str(e)}\nQuery was: {cypher_query}")
        
    return QueryResponse(query=cypher_query, results=results)

@app.get("/neighbors/{entity}", response_model=NeighborhoodResponse)
async def get_neighbors(entity: str):
    query = """
    MATCH (n)-[r*1..2]-(m)
    WHERE n.name = $entity OR n.id = $entity
    // Return just the unique neighbors within 2 hops
    RETURN DISTINCT m.name as neighbor, m.id as neighbor_id, labels(m) as labels
    LIMIT 50
    """
    
    try:
        async with neo4j_driver.session() as session:
            result = await session.run(query, entity=entity)
            records = await result.data()
            return NeighborhoodResponse(neighbors=records)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch neighbors: {str(e)}")

FastAPIInstrumentor.instrument_app(app)
