import pytest
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

def test_empty_and_whitespace(client):
    # Empty string should return 400 based on analyze.py
    resp = client.post("/api/analyze", data={"text": "", "lang": "en"})
    assert resp.status_code == 400

    resp = client.post("/api/analyze", data={"text": "   \n  \t ", "lang": "en"})
    assert resp.status_code == 400

def test_random_gibberish(client):
    # "jagftmmt" is gibberish
    resp = client.post("/api/analyze", data={"text": "jagftmmt", "lang": "en"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["verdict"] == "insufficient_information"

def test_short_meaningless_phrase(client):
    resp = client.post("/api/analyze", data={"text": "hi there", "lang": "en"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["verdict"] == "insufficient_information"
