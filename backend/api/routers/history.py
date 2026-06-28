from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.database.base import get_db
from backend.repositories.history_repository import HistoryRepository
from backend.schemas.history import HistoryResponse

router = APIRouter(prefix="/history", tags=["History"])


def get_repo(db: Session = Depends(get_db)) -> HistoryRepository:
    return HistoryRepository(db)


@router.get("/", response_model=list[HistoryResponse])
def list_history(
    limit: int = Query(100, ge=1, le=500),
    repo: HistoryRepository = Depends(get_repo),
):
    return repo.get_all(limit=limit)


@router.get("/search", response_model=list[HistoryResponse])
def search_history(q: str, repo: HistoryRepository = Depends(get_repo)):
    return repo.search(q)


@router.get("/{history_id}", response_model=HistoryResponse)
def get_history_item(history_id: str, repo: HistoryRepository = Depends(get_repo)):
    entry = repo.get_by_id(history_id)
    if not entry:
        raise HTTPException(status_code=404, detail="History entry not found")
    return entry


@router.delete("/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history_item(history_id: str, repo: HistoryRepository = Depends(get_repo)):
    if not repo.delete(history_id):
        raise HTTPException(status_code=404, detail="History entry not found")


@router.delete("/", status_code=status.HTTP_200_OK)
def clear_history(repo: HistoryRepository = Depends(get_repo)):
    count = repo.clear_all()
    return {"deleted": count, "message": f"Cleared {count} history entries"}
