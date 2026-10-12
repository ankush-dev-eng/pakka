from typing import List, Dict, Any

def validate_grounding(text: str, llm_flags: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Validates that every quote cited by the LLM appears verbatim in the input text.
    If a flag has invalid evidence, it is dropped.
    Also ensures LLM flags lower trust by at most 10 points combined.
    """
    valid_flags = []
    text_lower = text.lower()
    
    for flag in llm_flags:
        evidence = flag.get("evidence", [])
        is_valid = True
        
        # Must have at least one evidence quote to be grounded
        if not evidence:
            is_valid = False
        else:
            for ev in evidence:
                quote = ev.get("quote", "").lower()
                if quote not in text_lower:
                    is_valid = False
                    break
                    
        if is_valid:
            valid_flags.append(flag)
            
    # Cap total weight of valid LLM flags at 10
    total_weight = 0
    final_flags = []
    for flag in valid_flags:
        weight = flag.get("weight", 0)
        if total_weight + weight <= 10:
            final_flags.append(flag)
            total_weight += weight
        else:
            # If adding this flag exceeds 10, adjust its weight
            allowed_weight = 10 - total_weight
            if allowed_weight > 0:
                flag["weight"] = allowed_weight
                final_flags.append(flag)
                total_weight += allowed_weight
            # Stop adding flags once we hit 10
            if total_weight >= 10:
                break
                
    return final_flags
