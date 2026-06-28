import logging
from sqlalchemy.orm import Session
from backend.database.base import engine, Base
from backend.models import collection, environment, history, request, tab  # noqa: F401

logger = logging.getLogger(__name__)


def create_tables() -> None:
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully.")


def drop_tables() -> None:
    """Drop all database tables (use with caution)."""
    Base.metadata.drop_all(bind=engine)


def seed_database(db: Session) -> None:
    """Seed the database with initial data if empty."""
    from backend.seed.seed_data import run_seed
    run_seed(db)
