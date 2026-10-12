import pytest
from app.intel.lookalike import is_lookalike
from app.intel.domain_age import get_domain_age_days

def test_is_lookalike():
    # Exact match is not a lookalike
    assert not is_lookalike("tcs.com")
    
    # Typos (distance <= 2)
    assert is_lookalike("tcs.co")
    assert is_lookalike("tc-s.com")
    assert is_lookalike("amzon.com")
    assert is_lookalike("rnicrosoft.com") # Note: string distance is 2
    
    # Completely unrelated
    assert not is_lookalike("example.com")
    assert not is_lookalike("random-startup.io")

@pytest.mark.asyncio
async def test_domain_age():
    # This actually hits the network, but rdap shouldn't crash if it fails
    # Let's test a known old domain
    age = await get_domain_age_days("google.com")
    if age is not None:
        assert age > 9000  # Registered in 1997
        
    # Let's test a non-existent or invalid domain
    age_invalid = await get_domain_age_days("thisdomainshouldnotexist123456789.com")
    assert age_invalid is None
