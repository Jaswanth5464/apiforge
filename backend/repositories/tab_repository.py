from typing import Optional
from sqlalchemy.orm import Session
from backend.models.tab import RequestTab
from backend.schemas.runner import TabCreate, TabUpdate


class TabRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[RequestTab]:
        return self.db.query(RequestTab).order_by(RequestTab.order_idx).all()

    def get_by_id(self, tab_id: str) -> Optional[RequestTab]:
        return self.db.query(RequestTab).filter(RequestTab.id == tab_id).first()

    def create(self, data: TabCreate) -> RequestTab:
        obj = RequestTab(**data.model_dump())
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, tab_id: str, data: TabUpdate) -> Optional[RequestTab]:
        obj = self.db.query(RequestTab).filter(RequestTab.id == tab_id).first()
        if not obj:
            return None
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(obj, field, value)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, tab_id: str) -> bool:
        obj = self.db.query(RequestTab).filter(RequestTab.id == tab_id).first()
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True

    def delete_all(self) -> None:
        self.db.query(RequestTab).delete()
        self.db.commit()
