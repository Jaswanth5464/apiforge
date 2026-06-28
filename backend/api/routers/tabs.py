from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.base import get_db
from backend.schemas.runner import TabCreate, TabUpdate, TabResponse
from backend.repositories.tab_repository import TabRepository

router = APIRouter(prefix="/tabs", tags=["Tabs"])


def get_repo(db: Session = Depends(get_db)) -> TabRepository:
    return TabRepository(db)


@router.get("/", response_model=list[TabResponse])
def list_tabs(repo: TabRepository = Depends(get_repo)):
    return repo.get_all()


@router.post("/", response_model=TabResponse, status_code=status.HTTP_201_CREATED)
def create_tab(data: TabCreate, repo: TabRepository = Depends(get_repo)):
    return repo.create(data)


@router.put("/{tab_id}", response_model=TabResponse)
def update_tab(tab_id: str, data: TabUpdate, repo: TabRepository = Depends(get_repo)):
    tab = repo.update(tab_id, data)
    if not tab:
        raise HTTPException(status_code=404, detail="Tab not found")
    return tab


@router.delete("/{tab_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tab(tab_id: str, repo: TabRepository = Depends(get_repo)):
    if not repo.delete(tab_id):
        raise HTTPException(status_code=404, detail="Tab not found")


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def clear_tabs(repo: TabRepository = Depends(get_repo)):
    repo.delete_all()
