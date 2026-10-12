from typing import List, Dict, Any
from app.llm.provider import LLMProvider

class MockLLMProvider(LLMProvider):
    async def explain(self, text: str, rule_flags: List[Dict[str, Any]], lang: str) -> Dict[str, Any]:
        # Return some mock data for demo purposes
        quote = "Hey buddy,"
        start = text.find(quote)
        if start != -1:
            new_flags = [
                {
                    "id": "llm_tone",
                    "title": "Unprofessional Tone",
                    "reason": "The email uses unprofessional language and lacks corporate formatting.",
                    "weight": 10,
                    "source": "llm",
                    "evidence": [{"start": start, "end": start + len(quote), "quote": quote}]
                }
            ]
        else:
            new_flags = []

        if lang == "hi":
            next_steps = [
                "आधिकारिक चैनलों के माध्यम से प्रेषक की पहचान सत्यापित करें।",
                "किसी भी संदिग्ध लिंक पर क्लिक न करें।"
            ]
        elif lang == "bn":
            next_steps = [
                "অফিসিয়াল চ্যানেলের মাধ্যমে প্রেরকের পরিচয় যাচাই করুন।",
                "কোনো সন্দেহজনক লিঙ্কে ক্লিক করবেন না।"
            ]
        else:
            next_steps = [
                "Verify the sender's identity through official channels.",
                "Do not click on any suspicious links."
            ]
        
        return {
            "new_flags": new_flags,
            "next_steps": next_steps
        }
