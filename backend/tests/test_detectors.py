import pytest
from app.intel.detectors import (
    detect_fee_request,
    detect_free_mail_sender,
    detect_unrealistic_pay,
    run_all_detectors
)

def test_fee_request():
    assert detect_fee_request("Pay the registration fee.")
    assert detect_fee_request("पंजीकरण शुल्क")
    assert not detect_fee_request("Here is your offer letter.")

def test_free_mail():
    assert detect_free_mail_sender(["gmail.com"])
    assert not detect_free_mail_sender(["tcs.com"])

def test_unrealistic_pay():
    assert detect_unrealistic_pay([3000000])
    assert not detect_unrealistic_pay([50000])

@pytest.mark.asyncio
async def test_run_all():
    text = "Pay the registration fee within 24 hours. No interview required."
    domains = ["gmail.com"]
    amounts = [50000]
    senders = ["random@gmail.com"]
    
    results = await run_all_detectors(text, domains, amounts, senders)
    assert results["fee_request"] == True
    assert results["urgency"] == True
    assert results["no_interview"] == True
    assert results["free_mail_sender"] == True
    assert results["lookalike_domain"] == False
