from typing import List, Optional, Literal, Dict
from pydantic import BaseModel, Field

class Quote(BaseModel):
    start: int
    end: int
    quote: str

class Flag(BaseModel):
    id: str
    title: str
    reason: str
    weight: int
    source: Literal["rule", "llm"]
    evidence: List[Quote] = []

class Entities(BaseModel):
    emails: List[str] = []
    domains: List[str] = []
    phones: List[str] = []
    urls: List[str] = []
    amounts: List[str] = []
    handles: List[str] = []

class DomainIntel(BaseModel):
    domain: str
    age_days: int
    verified: bool

class AnalysisResult(BaseModel):
    id: str
    input_kind: Literal["text", "pdf", "image", "url"]
    text: str
    trust: int
    verdict: Literal["looks_pakka", "be_careful", "likely_scam"]
    flags: List[Flag] = []
    entities: Entities = Field(default_factory=Entities)
    next_steps: List[str] = []
    domain_intel: List[DomainIntel] = []
    llm_mode: Literal["mock", "gemini"]
    lang: Literal["en", "hi", "bn"]
    elapsed_ms: int
