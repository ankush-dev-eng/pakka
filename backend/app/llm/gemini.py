import json
import os
from typing import List, Dict, Any
from app.llm.provider import LLMProvider

try:
    from google import genai
    from pydantic import BaseModel, Field
except ImportError:
    genai = None
    BaseModel = object
    Field = lambda **kwargs: None

class LLMEvidence(BaseModel):
    start: int = 0
    end: int = 0
    quote: str

class LLMFlag(BaseModel):
    id: str
    title: str
    reason: str
    weight: int
    source: str = "llm"
    evidence: List[LLMEvidence]

class LLMResponse(BaseModel):
    new_flags: List[LLMFlag]
    next_steps: List[str]

class GeminiProvider(LLMProvider):
    def __init__(self):
        self.client = genai.Client() if genai else None
        self.model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

    async def explain(self, text: str, rule_flags: List[Dict[str, Any]], lang: str) -> Dict[str, Any]:
        if not self.client:
            # Fallback if SDK not installed
            return {"new_flags": [], "next_steps": []}

        prompt = f"""
        Analyze this text for scam indicators. 
        Language to output: {lang}
        
        Text:
        {text}
        
        Already found rule flags:
        {json.dumps(rule_flags)}
        
        Add any additional flags if needed, and next steps. 
        Ensure all quotes are exactly from the text.
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=LLMResponse,
                ),
            )
            if hasattr(response, "parsed") and response.parsed:
                parsed = response.parsed
                if hasattr(parsed, "model_dump"):
                    return parsed.model_dump()
                elif hasattr(parsed, "dict"):
                    return parsed.dict()
            if getattr(response, "text", None):
                data = json.loads(response.text)
                if isinstance(data, dict):
                    return {
                        "new_flags": data.get("new_flags", []),
                        "next_steps": data.get("next_steps", ["Verify carefully"]),
                    }
        except Exception:
            pass

        return {"new_flags": [], "next_steps": ["Verify carefully"]}
