import re
from app.core.schema import Entities

def extract_entities(text: str) -> Entities:
    # Emails
    emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    
    # Domains (derived from emails for simplicity, and URLs)
    domains = list(set([e.split('@')[1] for e in emails]))
    
    # URLs
    raw_urls = re.findall(r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+', text)
    urls = [u.rstrip('.,?!') for u in raw_urls]
    for u in urls:
        domain_match = re.search(r'https?://([^/]+)', u)
        if domain_match:
            domains.append(domain_match.group(1))
            
    domains = list(set(domains))
    
    # Phones: crude extraction for Indian numbers
    phones = re.findall(r'(?:\+91|0)?[789]\d{9}', text)
    
    # Amounts: rupees
    amounts = re.findall(r'(?:Rs\.?|₹|INR)\s*[\d,]+(?:LPA)?|[\d,]+\s*(?:LPA|lakh)', text, re.IGNORECASE)
    
    # Handles: Telegram/WhatsApp (crude heuristic)
    handles = re.findall(r'(?:t\.me/|@)[a-zA-Z0-9_]{5,32}', text)
    
    return Entities(
        emails=emails,
        domains=domains,
        phones=phones,
        urls=urls,
        amounts=amounts,
        handles=handles
    )
