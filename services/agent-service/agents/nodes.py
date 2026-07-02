import os
from langchain_groq import ChatGroq
from langchain_core.messages import AIMessage
from .state import ResearchState

def get_llm():
    return ChatGroq(
        model=os.getenv("LLM_MODEL", "llama-3.3-70b-versatile"),
        api_key=os.getenv("GROQ_API_KEY", ""),
        temperature=0.3,
    )

members = ["PaperReader", "Reasoner", "FactChecker", "KnowledgeGraph", "Citation", "Report"]

async def supervisor_node(state: ResearchState):
    seq = ["PaperReader", "Reasoner", "FactChecker", "KnowledgeGraph", "Citation", "Report", "FINISH"]
    cur = state.get("next")
    if not cur or cur not in seq:
        return {"next": "PaperReader"}
    idx = seq.index(cur)
    return {"next": seq[idx + 1] if idx + 1 < len(seq) else "FINISH"}

async def paper_reader_node(state: ResearchState):
    llm = get_llm()
    query = state.get("query", "")
    r = await llm.ainvoke([
        ("system", "You are a scientific paper reader and document analyst. Extract and summarize the most important findings, methodologies, data, and conclusions from the provided document context. Be specific and structured. Do not repeat the prefix like [PaperReader]."),
        ("human", query)
    ])
    return {"messages": [AIMessage(content=r.content, name="PaperReader")]}

async def reasoner_node(state: ResearchState):
    llm = get_llm()
    query = state.get("query", "")
    prior_msgs = state.get("messages", [])
    prior = "\n\n".join(m.content for m in prior_msgs[-3:] if hasattr(m, "content"))
    r = await llm.ainvoke([
        ("system", "You are a deep reasoning agent. Synthesize the findings below into key insights, patterns, and implications. Be analytical and specific. Output clean prose with headers where appropriate."),
        ("human", f"Original query: {query}\n\nFindings so far:\n{prior}\n\nProvide your synthesis and key insights.")
    ])
    return {"messages": [AIMessage(content=r.content, name="Reasoner")], "findings": [r.content]}

async def fact_checker_node(state: ResearchState):
    llm = get_llm()
    query = state.get("query", "")
    findings = state.get("findings", [])
    r = await llm.ainvoke([
        ("system", "You are a scientific fact checker. Review the findings and identify: what is well-supported, what needs caveats, and what claims are uncertain. Be direct and structured."),
        ("human", f"Query: {query}\n\nFindings to verify:\n{chr(10).join(findings)}\n\nProvide a fact-check analysis.")
    ])
    return {"messages": [AIMessage(content=r.content, name="FactChecker")]}

async def knowledge_graph_node(state: ResearchState):
    llm = get_llm()
    query = state.get("query", "")
    r = await llm.ainvoke([
        ("system", "You are a knowledge graph agent. Identify the key entities, concepts, and relationships from this research. Present as a structured list of: Entities, Key Relationships, and Connected Concepts."),
        ("human", f"Query: {query}\n\nMap the knowledge graph for this topic.")
    ])
    return {"messages": [AIMessage(content=r.content, name="KnowledgeGraph")]}

async def citation_node(state: ResearchState):
    llm = get_llm()
    query = state.get("query", "")
    r = await llm.ainvoke([
        ("system", "You are a citation agent. Generate 4-6 highly relevant academic citations in APA format for this research topic. Also note any citations found in the document context."),
        ("human", f"Query: {query}\n\nGenerate citations.")
    ])
    return {"messages": [AIMessage(content=r.content, name="Citation")], "citations": [r.content]}

async def report_node(state: ResearchState):
    llm = get_llm()
    query = state.get("query", "")
    findings = "\n\n".join(state.get("findings", []))
    citations = "\n".join(state.get("citations", []))
    r = await llm.ainvoke([
        ("system", "You are a research report writer. Write a clear, structured research summary using markdown headers. Include: ## Executive Summary, ## Key Findings, ## Critical Analysis, ## Conclusions. Be thorough and professional."),
        ("human", f"Research question: {query}\n\nFindings:\n{findings}\n\nCitations:\n{citations}\n\nWrite the final report.")
    ])
    return {"messages": [AIMessage(content=r.content, name="Report")]}