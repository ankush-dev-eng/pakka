from typing import List, Dict, Any
from app.llm.provider import LLMProvider

class MockLLMProvider(LLMProvider):
    async def explain(self, text: str, rule_flags: List[Dict[str, Any]], lang: str) -> Dict[str, Any]:
        # Return some mock data for demo purposes
        new_flags = [
            {
                "id": "llm_tone",
                "title": "Unprofessional Tone",
                "reason": "The email uses unprofessional language and lacks corporate formatting.",
                "weight": 10,
                "source": "llm",
                "evidence": [{"start": 0, "end": 10, "quote": "Hey buddy,"}]
            }
        ] if "Hey buddy," in text else []
        
        return {
            "new_flags": new_flags,
            "next_steps": [
                "Verify the sender's identity through official channels.",
                "Do not click on any suspicious links."
            ]
        }
