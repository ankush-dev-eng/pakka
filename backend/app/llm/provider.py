from typing import List, Dict, Any, Protocol

class LLMProvider(Protocol):
    async def explain(self, text: str, rule_flags: List[Dict[str, Any]], lang: str) -> Dict[str, Any]:
        """
        Returns a dict containing:
        - new_flags: List of additional LLM-found flags (dict with id, title, reason, weight, source="llm", evidence)
        - next_steps: List of next step strings
        """
        pass
