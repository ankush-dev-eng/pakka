from sqlmodel import SQLModel, create_engine, Session

# Import models to ensure they are registered with SQLModel metadata
import app.models
import app.db.models

from app.config import settings

engine = create_engine(settings.DATABASE_URL, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
