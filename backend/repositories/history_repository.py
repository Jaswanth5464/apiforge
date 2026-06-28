from typing import Optional
from sqlalchemy.orm import Session
from backend.models.history import History


class HistoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, limit: int = 100) -> list[History]:
        return (
            self.db.query(History)
            .order_by(History.timestamp.desc())
            .limit(limit)
            .all()
        )

    def get_by_id(self, history_id: str) -> Optional[History]:
        return self.db.query(History).filter(History.id == history_id).first()

    def create(self, data: dict) -> History:
        obj = History(**data)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, history_id: str) -> bool:
        obj = self.db.query(History).filter(History.id == history_id).first()
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True

    def clear_all(self) -> int:
        """Delete all history. Returns number of deleted rows."""
        count = self.db.query(History).count()
        self.db.query(History).delete()
        self.db.commit()
        return count

    def search(self, query: str) -> list[History]:
        return (
            self.db.query(History)
            .filter(History.url.ilike(f"%{query}%"))
            .order_by(History.timestamp.desc())
            .all()
        )
