from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field


class KeyValueItem(BaseModel):
    """Reusable key-value pair with optional description and enabled flag."""
    key: str = ""
    value: str = ""
    description: Optional[str] = None
    enabled: bool = True


class AuthData(BaseModel):
    token: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None


class RequestCreate(BaseModel):
    collection_id: str
    folder_id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=255)
    method: str = Field("GET", pattern="^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$")
    url: str = ""
    params: list[KeyValueItem] = []
    headers: list[KeyValueItem] = []
    body_type: str = "none"
    body_content: Optional[str] = None
    auth_type: str = "none"
    auth_data: dict[str, Any] = {}
    description: Optional[str] = None
    is_favorite: bool = False


class RequestUpdate(BaseModel):
    folder_id: Optional[str] = None
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    method: Optional[str] = Field(None, pattern="^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$")
    url: Optional[str] = None
    params: Optional[list[KeyValueItem]] = None
    headers: Optional[list[KeyValueItem]] = None
    body_type: Optional[str] = None
    body_content: Optional[str] = None
    auth_type: Optional[str] = None
    auth_data: Optional[dict[str, Any]] = None
    description: Optional[str] = None
    is_favorite: Optional[bool] = None


class RequestResponse(BaseModel):
    id: str
    collection_id: str
    folder_id: Optional[str]
    name: str
    method: str
    url: str
    params: list[Any]
    headers: list[Any]
    body_type: str
    body_content: Optional[str]
    auth_type: str
    auth_data: dict[str, Any]
    description: Optional[str]
    is_favorite: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RequestMoveRequest(BaseModel):
    collection_id: str
    folder_id: Optional[str] = None
