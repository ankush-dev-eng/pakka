import pytest
import json
import os
from pathlib import Path
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import get_session
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

def test_fixtures_accuracy(client):
    fixtures_dir = Path("tests/fixtures/offers")
    # If run from root vs backend
    if not fixtures_dir.exists():
        fixtures_dir = Path("backend/tests/fixtures/offers")
        
    fixtures = list(fixtures_dir.glob("*.json"))
    assert len(fixtures) == 25, f"Expected 25 fixtures, found {len(fixtures)}"
    
    matches = 0
    total = len(fixtures)
    genuine_false_positives = 0
    
    for file in fixtures:
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        response = client.post("/api/analyze", data={"text": data['text'], "lang": "en"})
        assert response.status_code == 200
        result = response.json()
        
        expected_verdict = data['expected_verdict']
        actual_verdict = result['verdict']
        
        if actual_verdict == expected_verdict:
            matches += 1
        else:
            print(f"Fixture {file.name} failed: expected {expected_verdict}, got {actual_verdict}. Score: {result['score']}, Flags: {result['flags']}, LLM Flags: {result['llm_flags']}")
            
        if expected_verdict == 'looks_pakka' and actual_verdict == 'likely_scam':
            genuine_false_positives += 1
            
        # Optional: check must_flag and must_not_flag if present
        
    accuracy = (matches / total) * 100
    
    # The requirement is >= 90% accuracy and 0 false positives on genuine fixtures
    assert accuracy >= 90.0, f"Accuracy {accuracy}% is below 90%"
    assert genuine_false_positives == 0, f"Found {genuine_false_positives} genuine fixtures marked as likely_scam"
