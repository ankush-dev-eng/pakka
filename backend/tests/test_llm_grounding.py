from app.llm.grounding import validate_grounding

def test_grounding_valid():
    text = "Hey buddy, give me your password."
    llm_flags = [
        {
            "id": "llm_tone",
            "weight": 5,
            "evidence": [{"quote": "Hey buddy,"}]
        }
    ]
    valid = validate_grounding(text, llm_flags)
    assert len(valid) == 1
    assert valid[0]["weight"] == 5

def test_grounding_invalid():
    text = "Hey buddy, give me your password."
    llm_flags = [
        {
            "id": "llm_hallucination",
            "weight": 5,
            "evidence": [{"quote": "This quote is nowhere in the text"}]
        }
    ]
    valid = validate_grounding(text, llm_flags)
    assert len(valid) == 0

def test_grounding_weight_cap():
    text = "Quote 1 and Quote 2 and Quote 3"
    llm_flags = [
        {"id": "flag1", "weight": 6, "evidence": [{"quote": "Quote 1"}]},
        {"id": "flag2", "weight": 6, "evidence": [{"quote": "Quote 2"}]},
        {"id": "flag3", "weight": 6, "evidence": [{"quote": "Quote 3"}]}
    ]
    valid = validate_grounding(text, llm_flags)
    assert sum(f["weight"] for f in valid) == 10
    assert len(valid) == 2
    assert valid[0]["weight"] == 6
    assert valid[1]["weight"] == 4
