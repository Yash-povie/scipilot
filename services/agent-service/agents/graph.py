from langgraph.graph import StateGraph, START, END
from .state import ResearchState
from .nodes import (
    supervisor_node,
    paper_reader_node,
    reasoner_node,
    fact_checker_node,
    knowledge_graph_node,
    citation_node,
    report_node,
    members
)

def create_graph():
    workflow = StateGraph(ResearchState)
    
    # Add nodes
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("PaperReader", paper_reader_node)
    workflow.add_node("Reasoner", reasoner_node)
    workflow.add_node("FactChecker", fact_checker_node)
    workflow.add_node("KnowledgeGraph", knowledge_graph_node)
    workflow.add_node("Citation", citation_node)
    workflow.add_node("Report", report_node)

    # All workers report back to supervisor
    for member in members:
        workflow.add_edge(member, "supervisor")
    
    # Supervisor decides the next node
    # It routes to the agent specified in the "next" field
    conditional_map = {k: k for k in members}
    conditional_map["FINISH"] = END
    
    workflow.add_conditional_edges("supervisor", lambda x: x["next"], conditional_map)
    
    # Start at the supervisor
    workflow.add_edge(START, "supervisor")
    
    # For a persistent graph, we would use PostgreSQL checkpointing here.
    # e.g., memory = AsyncPostgresSaver.from_conn_string(os.getenv("DATABASE_URL"))
    # compiled = workflow.compile(checkpointer=memory)
    
    return workflow.compile()
