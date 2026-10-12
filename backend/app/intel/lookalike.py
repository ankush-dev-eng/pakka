import json
from pathlib import Path
from rapidfuzz import distance

COMPANIES_FILE = Path(__file__).parent.parent / "data" / "companies.json"
KNOWN_DOMAINS = {}

def load_domains():
    global KNOWN_DOMAINS
    if not KNOWN_DOMAINS and COMPANIES_FILE.exists():
        with open(COMPANIES_FILE, "r") as f:
            KNOWN_DOMAINS = json.load(f)

def is_lookalike(domain: str) -> bool:
    load_domains()
    domain = domain.lower()
    
    # Not a lookalike if it's the exact real domain
    if domain in KNOWN_DOMAINS:
        return False
        
    # Check for homoglyph/hyphenated or distance <= 2
    for known in KNOWN_DOMAINS:
        if domain == known: continue
        
        # Levenshtein distance <= 2
        dist = distance.Levenshtein.distance(domain, known)
        if dist <= 2:
            return True
            
        # Check if stripped of hyphens it equals known
        if domain.replace("-", "") == known:
            return True
            
    return False
