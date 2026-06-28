from typing import Optional
from sqlalchemy.orm import Session
from backend.models.request import Request
from backend.schemas.request import RequestCreate, RequestUpdate
import uuid


class RequestRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Request]:
        return self.db.query(Request).order_by(Request.created_at).all()

    def get_by_id(self, request_id: str) -> Optional[Request]:
        return self.db.query(Request).filter(Request.id == request_id).first()

    def get_by_collection(self, collection_id: str) -> list[Request]:
        return (
            self.db.query(Request)
            .filter(Request.collection_id == collection_id)
            .order_by(Request.created_at)
            .all()
        )

    def get_by_folder(self, folder_id: str) -> list[Request]:
        return (
            self.db.query(Request)
            .filter(Request.folder_id == folder_id)
            .order_by(Request.created_at)
            .all()
        )

    def get_favorites(self) -> list[Request]:
        return (
            self.db.query(Request)
            .filter(Request.is_favorite == True)  # noqa: E712
            .order_by(Request.updated_at.desc())
            .all()
        )

    def create(self, data: RequestCreate) -> Request:
        obj = Request(
            **{k: v for k, v in data.model_dump().items()},
        )
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, request_id: str, data: RequestUpdate) -> Optional[Request]:
        obj = self.db.query(Request).filter(Request.id == request_id).first()
        if not obj:
            return None
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(obj, field, value)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, request_id: str) -> bool:
        obj = self.db.query(Request).filter(Request.id == request_id).first()
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True

    def duplicate(self, request_id: str) -> Optional[Request]:
        original = self.db.query(Request).filter(Request.id == request_id).first()
        if not original:
            return None
        clone = Request(
            id=str(uuid.uuid4()),
            collection_id=original.collection_id,
            folder_id=original.folder_id,
            name=f"{original.name} (Copy)",
            method=original.method,
            url=original.url,
            params=original.params,
            headers=original.headers,
            body_type=original.body_type,
            body_content=original.body_content,
            auth_type=original.auth_type,
            auth_data=original.auth_data,
            description=original.description,
            is_favorite=False,
        )
        self.db.add(clone)
        self.db.commit()
        self.db.refresh(clone)
        return clone

    def move(self, request_id: str, collection_id: str, folder_id: Optional[str]) -> Optional[Request]:
        obj = self.db.query(Request).filter(Request.id == request_id).first()
        if not obj:
            return None
        obj.collection_id = collection_id  # type: ignore
        obj.folder_id = folder_id  # type: ignore
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def search(self, query: str) -> list[Request]:
        return (
            self.db.query(Request)
            .filter(
                Request.name.ilike(f"%{query}%") | Request.url.ilike(f"%{query}%")
            )
            .all()
        )
