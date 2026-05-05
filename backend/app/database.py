from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import get_settings
import os

settings = get_settings()

# SQLite specific connection options
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {
        "check_same_thread": False,
        "timeout": 30,
    }

try:
    print(f"[Database] Connecting to: {settings.DATABASE_URL}")
    engine = create_engine(
        settings.DATABASE_URL, 
        connect_args=connect_args, 
        echo=settings.DEBUG,
        pool_pre_ping=True,
    )
    print("[Database] Engine created successfully")
except Exception as e:
    print(f"[Database] Error creating engine: {e}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
