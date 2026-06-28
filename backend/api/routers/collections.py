from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.base import get_db
from backend.schemas.collection import (
    CollectionCreate, CollectionUpdate, CollectionResponse,
    FolderCreate, FolderUpdate, FolderResponse,
)
from backend.schemas.request import RequestResponse
from backend.services.collection_service import CollectionService

router = APIRouter(prefix="/collections", tags=["Collections"])


def get_service(db: Session = Depends(get_db)) -> CollectionService:
    return CollectionService(db)


@router.get("/", response_model=list[CollectionResponse])
def list_collections(service: CollectionService = Depends(get_service)):
    return service.list_all()


@router.post("/", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
def create_collection(data: CollectionCreate, service: CollectionService = Depends(get_service)):
    return service.create(data)


@router.get("/{collection_id}", response_model=CollectionResponse)
def get_collection(collection_id: str, service: CollectionService = Depends(get_service)):
    col = service.get(collection_id)
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
    return col


@router.put("/{collection_id}", response_model=CollectionResponse)
def update_collection(
    collection_id: str,
    data: CollectionUpdate,
    service: CollectionService = Depends(get_service),
):
    col = service.update(collection_id, data)
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
    return col


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_collection(collection_id: str, service: CollectionService = Depends(get_service)):
    if not service.delete(collection_id):
        raise HTTPException(status_code=404, detail="Collection not found")


@router.get("/{collection_id}/requests", response_model=list[RequestResponse])
def get_collection_requests(collection_id: str, service: CollectionService = Depends(get_service)):
    return service.get_requests(collection_id)


# ── Folder Endpoints ─────────────────────────────────────────────────────────

@router.post("/{collection_id}/folders", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
def create_folder(
    collection_id: str,
    data: FolderCreate,
    service: CollectionService = Depends(get_service),
):
    data.collection_id = collection_id
    return service.create_folder(data)


@router.put("/folders/{folder_id}", response_model=FolderResponse)
def update_folder(
    folder_id: str,
    data: FolderUpdate,
    service: CollectionService = Depends(get_service),
):
    folder = service.update_folder(folder_id, data)
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder


@router.delete("/folders/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_folder(folder_id: str, service: CollectionService = Depends(get_service)):
    if not service.delete_folder(folder_id):
        raise HTTPException(status_code=404, detail="Folder not found")


# ── Search ───────────────────────────────────────────────────────────────────

@router.get("/search/query")
def search_collections(q: str, service: CollectionService = Depends(get_service)):
    return service.search(q)
