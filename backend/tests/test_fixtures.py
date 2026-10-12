import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import StaticPool
import asyncio

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

def test_genuine_fixture(client):
    text = "Your interview for Software Engineer is scheduled for tomorrow at 10 AM. Please find the Google Meet link attached. HR Dept, Google."
    response = client.post("/api/analyze", data={"text": text, "lang": "en"})
    assert response.status_code == 200
    assert response.json()["verdict"] == "looks_pakka"

def test_scam_fixture(client):
    text = "Pay ₹2000 registration fee for the training program via UPI to proceed with your selection. Contact @HR_Recruit on Telegram."
    response = client.post("/api/analyze", data={"text": text, "lang": "en"})
    assert response.status_code == 200
    assert response.json()["verdict"] == "likely_scam"
