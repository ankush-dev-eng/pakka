import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_empty_and_whitespace():
    # Empty string should return 400 based on analyze.py
    resp = client.post("/api/analyze", data={"text": "", "lang": "en"})
    assert resp.status_code == 400

    resp = client.post("/api/analyze", data={"text": "   \n  \t ", "lang": "en"})
    assert resp.status_code == 400

def test_random_gibberish():
    # "jagftmmt" is gibberish
    resp = client.post("/api/analyze", data={"text": "jagftmmt", "lang": "en"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["verdict"] == "insufficient_information"

def test_short_meaningless_phrase():
    resp = client.post("/api/analyze", data={"text": "hi there", "lang": "en"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["verdict"] == "insufficient_information"
