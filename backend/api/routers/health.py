from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.base import get_db

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("/")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "ok",
        "database": db_status,
        "version": "1.0.0",
    }
