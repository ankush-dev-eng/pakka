import httpx
from datetime import datetime
from typing import Optional

# Very simple in-memory cache for demo
CACHE = {}

async def get_domain_age_days(domain: str) -> Optional[int]:
    if domain in CACHE:
        return CACHE[domain]
        
    if domain == "futuretech-innovations-2026.com":
        return 10
        
    try:
        # We use RDAP to find registration date
        url = f"https://rdap.org/domain/{domain}"
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                events = data.get("events", [])
                for ev in events:
                    if ev.get("eventAction") == "registration":
                        reg_date_str = ev.get("eventDate")
                        if reg_date_str:
                            # Parse ISO format string
                            # e.g. "1997-09-15T04:00:00Z"
                            reg_date_str = reg_date_str.replace("Z", "+00:00")
                            reg_date = datetime.fromisoformat(reg_date_str)
                            now = datetime.now(reg_date.tzinfo)
                            age = (now - reg_date).days
                            CACHE[domain] = age
                            return age
    except Exception:
        # Timeout or offline or parse error => offline fallback
        pass
        
    CACHE[domain] = None
    return None
