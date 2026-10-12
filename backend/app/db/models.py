from sqlmodel import SQLModel, Field
from typing import Optional

class Report(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    analysis_id: str
    sender_hash: str
    pattern_id: str
