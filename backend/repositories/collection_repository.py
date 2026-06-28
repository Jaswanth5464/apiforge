from typing import Optional
from sqlalchemy.orm import Session, selectinload
from backend.models.collection import Collection, Folder
from backend.schemas.collection import CollectionCreate, CollectionUpdate, FolderCreate, FolderUpdate


class CollectionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Collection]:
        return (
            self.db.query(Collection)
            .options(selectinload(Collection.folders))
            .order_by(Collection.created_at)
            .all()
        )

    def get_by_id(self, collection_id: str) -> Optional[Collection]:
        return (
            self.db.query(Collection)
            .options(selectinload(Collection.folders))
            .filter(Collection.id == collection_id)
            .first()
        )

    def create(self, data: CollectionCreate) -> Collection:
        obj = Collection(**data.model_dump())
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, collection_id: str, data: CollectionUpdate) -> Optional[Collection]:
        obj = self.db.query(Collection).filter(Collection.id == collection_id).first()
        if not obj:
            return None
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(obj, field, value)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, collection_id: str) -> bool:
        obj = self.db.query(Collection).filter(Collection.id == collection_id).first()
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True

    def search(self, query: str) -> list[Collection]:
        return (
            self.db.query(Collection)
            .filter(Collection.name.ilike(f"%{query}%"))
            .all()
        )


class FolderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_collection(self, collection_id: str) -> list[Folder]:
        return (
            self.db.query(Folder)
            .filter(Folder.collection_id == collection_id)
            .order_by(Folder.order_idx)
            .all()
        )

    def get_by_id(self, folder_id: str) -> Optional[Folder]:
        return self.db.query(Folder).filter(Folder.id == folder_id).first()

    def create(self, data: FolderCreate) -> Folder:
        obj = Folder(**data.model_dump())
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, folder_id: str, data: FolderUpdate) -> Optional[Folder]:
        obj = self.db.query(Folder).filter(Folder.id == folder_id).first()
        if not obj:
            return None
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(obj, field, value)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, folder_id: str) -> bool:
        obj = self.db.query(Folder).filter(Folder.id == folder_id).first()
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True
