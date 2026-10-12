from app.core.scoring import calculate_score

def test_scoring_golden():
    # Everything normal
    trust, verdict = calculate_score({
        "fee_request": False,
        "urgency": False,
        "free_mail_sender": False
    })
    assert trust == 100
    assert verdict == "looks_pakka"

    # Only urgency (25 weight)
    trust, verdict = calculate_score({
        "urgency": True
    })
    # 1 - (1 - 0.25) = 0.25 risk -> 75 trust
    assert trust == 75
    assert verdict == "looks_pakka"

    # urgency (25) + free_mail_sender (50)
    trust, verdict = calculate_score({
        "urgency": True,
        "free_mail_sender": True
    })
    # p1 = 0.25, p2 = 0.50
    # product = (1-0.25)*(1-0.50) = 0.75 * 0.50 = 0.375
    # risk = 1 - 0.375 = 0.625 -> trust = 38
    assert trust == 38
    assert verdict == "likely_scam"

    # Hard cap check for fee_request
    # fee_request weight is 70 -> trust would normally be 30
    # but hard cap at 25 means trust = 25
    trust, verdict = calculate_score({
        "fee_request": True
    })
    assert trust == 25
    assert verdict == "likely_scam"
    
    # Hard cap check for money_forwarding (90 weight) -> normally 10
    trust, verdict = calculate_score({
        "money_forwarding": True
    })
    assert trust == 10
    assert verdict == "likely_scam"
