from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ── Folder schemas ──────────────────────────────────────────────────────────

class FolderCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    collection_id: str
    parent_folder_id: Optional[str] = None
    order_idx: int = 0


class FolderUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    parent_folder_id: Optional[str] = None
    order_idx: Optional[int] = None


class FolderResponse(BaseModel):
    id: str
    collection_id: str
    parent_folder_id: Optional[str]
    name: str
    order_idx: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Collection schemas ───────────────────────────────────────────────────────

class CollectionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class CollectionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class CollectionResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    folders: list[FolderResponse] = []

    model_config = {"from_attributes": True}
