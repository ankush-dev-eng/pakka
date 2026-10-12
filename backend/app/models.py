import uuid
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Column
from sqlalchemy.types import JSON
from typing import Optional, List, Dict, Any

def get_utc_now():
    return datetime.now(timezone.utc)

class AnalysisRecord(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=get_utc_now)
    
    text: str
    lang: str
    
    # Store JSON arrays for flags, llm_flags, and next_steps
    flags: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    llm_flags: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    next_steps: List[str] = Field(default=[], sa_column=Column(JSON))
    
    score: int
    verdict: str
    
    # User feedback
    reported_scam: bool = Field(default=False)
    reported_genuine: bool = Field(default=False)
