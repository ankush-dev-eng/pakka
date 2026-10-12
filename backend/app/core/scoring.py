import yaml
from pathlib import Path
from typing import Dict, List, Tuple

DATA_DIR = Path(__file__).parent.parent / "data"
RED_FLAGS_FILE = DATA_DIR / "red_flags.yaml"

def calculate_score(triggered_flags: Dict[str, bool], llm_flags: List[Dict] = None) -> Tuple[int, str]:
    if not RED_FLAGS_FILE.exists():
        return 100, "looks_pakka"

    with open(RED_FLAGS_FILE, "r", encoding="utf-8") as f:
        red_flags_config = yaml.safe_load(f)

    product_term = 1.0
    for flag_id, triggered in triggered_flags.items():
        if triggered and flag_id in red_flags_config:
            weight = red_flags_config[flag_id].get("weight", 0)
            p_i = weight / 100.0
            product_term *= (1.0 - p_i)
            
    if llm_flags:
        for flag in llm_flags:
            weight = flag.get("weight", 0)
            p_i = weight / 100.0
            product_term *= (1.0 - p_i)
            
    risk = 1.0 - product_term
    trust = round(100 * (1 - risk))
    
    # Hard limits
    if triggered_flags.get("fee_request") or triggered_flags.get("money_forwarding"):
        trust = min(trust, 25)
        
    if trust >= 70:
        verdict = "looks_pakka"
    elif 40 <= trust <= 69:
        verdict = "be_careful"
    else:
        verdict = "likely_scam"
        
    return trust, verdict
