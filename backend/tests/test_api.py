import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.schema import AnalysisResult
from app.db.database import get_session
from app.models import AnalysisRecord
from app.api.analyze import limiter

limiter.enabled = False

@pytest.fixture(name="client")
def client_fixture():
    engine = create_engine(
        "sqlite://", 
        connect_args={"check_same_thread": False}, 
        poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    
    def get_session_override():
        with Session(engine) as session:
            yield session
            
    app.dependency_overrides[get_session] = get_session_override
    
    with TestClient(app) as client:
        yield client
        
    app.dependency_overrides.clear()

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_schema_valid():
    data = {
        "id": "123",
        "input_kind": "text",
        "text": "test",
        "trust": 80,
        "verdict": "looks_pakka",
        "flags": [],
        "entities": {},
        "next_steps": [],
        "domain_intel": [],
        "llm_mode": "mock",
        "lang": "en",
        "elapsed_ms": 10
    }
    result = AnalysisResult(**data)
    assert result.trust == 80

def test_analyze_empty_text(client):
    # Sending spaces resolves to a string, but the strip() logic in analyze.py will catch it
    response = client.post("/api/analyze", data={"text": "   ", "lang": "en"})
    assert response.status_code == 400
    assert "Text cannot be empty" in response.json()["detail"]

def test_analyze_valid_text(client):
    response = client.post("/api/analyze", data={"text": "Hey buddy, give me some fee", "lang": "en"})
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["verdict"] in ["looks_pakka", "be_careful", "likely_scam"]

def test_analyze_multipart_formdata_regression(client):
    # Regression test: Ensure backend can handle multipart/form-data payloads 
    # even when only text is provided (similar to browser FormData)
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = (
        f"--{boundary}\r\n"
        'Content-Disposition: form-data; name="text"\r\n\r\n'
        'Check this test multipart text\r\n'
        f"--{boundary}\r\n"
        'Content-Disposition: form-data; name="lang"\r\n\r\n'
        'en\r\n'
        f"--{boundary}--\r\n"
    )
    headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}"
    }
    response = client.post("/api/analyze", content=body.encode("utf-8"), headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data

def test_analyze_conflicting_inputs(client):
    # Should fail if both text and url are provided
    response = client.post("/api/analyze", data={"text": "Hello", "url": "http://example.com", "lang": "en"})
    assert response.status_code == 400
    assert "Exactly one of text, url, or file must be provided" in response.json()["detail"]

def test_analyze_missing_inputs(client):
    # Should fail if neither text, url, nor file is provided
    response = client.post("/api/analyze", data={"lang": "en"})
    assert response.status_code == 400
    assert "Exactly one of text, url, or file must be provided" in response.json()["detail"]

def test_get_analysis(client):
    resp1 = client.post("/api/analyze", data={"text": "Hello", "lang": "en"})
    record_id = resp1.json()["id"]
    
    resp2 = client.get(f"/api/analyze/{record_id}")
    assert resp2.status_code == 200
    assert resp2.json()["id"] == record_id

def test_report_feedback(client):
    resp1 = client.post("/api/analyze", data={"text": "Hello", "lang": "en"})
    record_id = resp1.json()["id"]
    
    resp2 = client.post(f"/api/report/{record_id}", json={"type": "scam"})
    assert resp2.status_code == 200
    assert resp2.json()["status"] == "ok"
    
    resp3 = client.get(f"/api/analyze/{record_id}")
    assert resp3.json()["reported_scam"] == True

def test_report_pack(client):
    resp1 = client.post("/api/analyze", data={"text": "Hello", "lang": "en"})
    record_id = resp1.json()["id"]
    
    resp2 = client.get(f"/api/report-pack/{record_id}")
    assert resp2.status_code == 200
    assert "html" in resp2.json()

def test_stats(client):
    resp1 = client.get("/api/stats")
    assert resp1.status_code == 200
    assert "total_analyzed" in resp1.json()
