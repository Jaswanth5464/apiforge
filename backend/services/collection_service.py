from typing import Optional
from sqlalchemy.orm import Session

from backend.models.collection import Collection, Folder
from backend.models.request import Request
from backend.repositories.collection_repository import CollectionRepository, FolderRepository
from backend.repositories.request_repository import RequestRepository
from backend.schemas.collection import CollectionCreate, CollectionUpdate, FolderCreate, FolderUpdate
from backend.schemas.request import RequestCreate, RequestUpdate, RequestMoveRequest


class CollectionService:
    def __init__(self, db: Session):
        self.repo = CollectionRepository(db)
        self.folder_repo = FolderRepository(db)
        self.request_repo = RequestRepository(db)

    def list_all(self) -> list[Collection]:
        return self.repo.get_all()

    def get(self, collection_id: str) -> Optional[Collection]:
        return self.repo.get_by_id(collection_id)

    def create(self, data: CollectionCreate) -> Collection:
        return self.repo.create(data)

    def update(self, collection_id: str, data: CollectionUpdate) -> Optional[Collection]:
        return self.repo.update(collection_id, data)

    def delete(self, collection_id: str) -> bool:
        return self.repo.delete(collection_id)

    def search(self, query: str) -> dict:
        collections = self.repo.search(query)
        requests = self.request_repo.search(query)
        return {"collections": collections, "requests": requests}

    def get_requests(self, collection_id: str) -> list[Request]:
        return self.request_repo.get_by_collection(collection_id)

    # Folder operations
    def create_folder(self, data: FolderCreate) -> Folder:
        return self.folder_repo.create(data)

    def update_folder(self, folder_id: str, data: FolderUpdate) -> Optional[Folder]:
        return self.folder_repo.update(folder_id, data)

    def delete_folder(self, folder_id: str) -> bool:
        return self.folder_repo.delete(folder_id)


class RequestService:
    def __init__(self, db: Session):
        self.repo = RequestRepository(db)

    def list_by_collection(self, collection_id: str) -> list[Request]:
        return self.repo.get_by_collection(collection_id)

    def get(self, request_id: str) -> Optional[Request]:
        return self.repo.get_by_id(request_id)

    def create(self, data: RequestCreate) -> Request:
        return self.repo.create(data)

    def update(self, request_id: str, data: RequestUpdate) -> Optional[Request]:
        return self.repo.update(request_id, data)

    def delete(self, request_id: str) -> bool:
        return self.repo.delete(request_id)

    def duplicate(self, request_id: str) -> Optional[Request]:
        return self.repo.duplicate(request_id)

    def move(self, request_id: str, move_data: RequestMoveRequest) -> Optional[Request]:
        return self.repo.move(request_id, move_data.collection_id, move_data.folder_id)

    def get_favorites(self) -> list[Request]:
        return self.repo.get_favorites()
