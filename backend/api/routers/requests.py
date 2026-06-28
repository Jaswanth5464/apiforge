from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.base import get_db
from backend.schemas.request import RequestCreate, RequestUpdate, RequestResponse, RequestMoveRequest
from backend.services.collection_service import RequestService

router = APIRouter(prefix="/requests", tags=["Requests"])


def get_service(db: Session = Depends(get_db)) -> RequestService:
    return RequestService(db)


@router.get("/favorites", response_model=list[RequestResponse])
def get_favorites(service: RequestService = Depends(get_service)):
    return service.get_favorites()


@router.post("/", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(data: RequestCreate, service: RequestService = Depends(get_service)):
    return service.create(data)


@router.get("/{request_id}", response_model=RequestResponse)
def get_request(request_id: str, service: RequestService = Depends(get_service)):
    req = service.get(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req


@router.put("/{request_id}", response_model=RequestResponse)
def update_request(
    request_id: str,
    data: RequestUpdate,
    service: RequestService = Depends(get_service),
):
    req = service.update(request_id, data)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(request_id: str, service: RequestService = Depends(get_service)):
    if not service.delete(request_id):
        raise HTTPException(status_code=404, detail="Request not found")


@router.post("/{request_id}/duplicate", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
def duplicate_request(request_id: str, service: RequestService = Depends(get_service)):
    req = service.duplicate(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req


@router.patch("/{request_id}/move", response_model=RequestResponse)
def move_request(
    request_id: str,
    move_data: RequestMoveRequest,
    service: RequestService = Depends(get_service),
):
    req = service.move(request_id, move_data)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req
