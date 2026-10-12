import yaml
from pathlib import Path
from typing import List, Dict, Any, Tuple

from app.intel.lookalike import is_lookalike
from app.intel.domain_age import get_domain_age_days

DATA_DIR = Path(__file__).parent.parent / "data"
RED_FLAGS_FILE = DATA_DIR / "red_flags.yaml"

RED_FLAGS = {}

def load_red_flags():
    global RED_FLAGS
    if not RED_FLAGS and RED_FLAGS_FILE.exists():
        with open(RED_FLAGS_FILE, "r", encoding="utf-8") as f:
            RED_FLAGS = yaml.safe_load(f)

def _contains_any(text: str, category: str) -> bool:
    load_red_flags()
    text = text.lower()
    phrases = []
    if category in RED_FLAGS and "phrases" in RED_FLAGS[category]:
        for lang in RED_FLAGS[category]["phrases"].values():
            phrases.extend(lang)
            
    for p in phrases:
        if p.lower() in text:
            return True
    return False

def detect_fee_request(text: str) -> bool:
    return _contains_any(text, "fee_request")

def detect_free_mail_sender(domains: List[str]) -> bool:
    free_mails = {"gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "proton.me", "rediffmail.com"}
    for d in domains:
        if d.lower() in free_mails:
            return True
    return False

def detect_lookalike_domain(domains: List[str]) -> bool:
    for d in domains:
        if is_lookalike(d):
            return True
    return False

async def detect_new_domain(domains: List[str]) -> bool:
    for d in domains:
        age = await get_domain_age_days(d)
        if age is not None and age < 90:
            return True
    return False

def detect_no_interview(text: str) -> bool:
    return _contains_any(text, "no_interview")

def detect_urgency(text: str) -> bool:
    return _contains_any(text, "urgency")

def detect_offchat_only(text: str) -> bool:
    import re
    if _contains_any(text, "offchat_only"):
        return True
    # Match common telegram handles or links (ensure @ is not part of an email address)
    if re.search(r'(?i)\b(?:t\.me/|(?:(?<![\w\.-])@))[a-z0-9_]{5,32}\b', text):
        return True
    return False

def detect_money_forwarding(text: str) -> bool:
    return _contains_any(text, "money_forwarding")

def detect_unrealistic_pay(amounts: List[int]) -> bool:
    # Example heuristic: if internship stipend > 50,000 or fresher > 2,500,000
    # For now, just trigger if we see huge numbers like > 2500000 
    for amount in amounts:
        if amount > 2500000:
            return True
    return False

def detect_certificate_social_demand(text: str) -> bool:
    return _contains_any(text, "certificate_social_demand")

def detect_vague_company(text: str) -> bool:
    return _contains_any(text, "vague_company")

def detect_community_reported(senders: List[str]) -> bool:
    # In a real implementation this would check the DB
    # We will simulate it by returning False unless a specific scam email is passed
    return "scammer@scam.com" in senders

async def run_all_detectors(text: str, domains: List[str], amounts: List[int], senders: List[str]) -> Dict[str, bool]:
    results = {
        "fee_request": detect_fee_request(text),
        "free_mail_sender": detect_free_mail_sender(domains),
        "lookalike_domain": detect_lookalike_domain(domains),
        "new_domain": await detect_new_domain(domains),
        "no_interview": detect_no_interview(text),
        "urgency": detect_urgency(text),
        "offchat_only": detect_offchat_only(text),
        "money_forwarding": detect_money_forwarding(text),
        "unrealistic_pay": detect_unrealistic_pay(amounts),
        "certificate_social_demand": detect_certificate_social_demand(text),
        "vague_company": detect_vague_company(text),
        "community_reported": detect_community_reported(senders)
    }
    return results
