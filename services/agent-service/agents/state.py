from typing import TypedDict, Annotated, Sequence, List
import operator
from langchain_core.messages import BaseMessage

class ResearchState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    papers: List[str]
    findings: List[str]
    citations: List[str]
    next: str
    query: str