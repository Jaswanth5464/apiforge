from typing import Optional, Any
from pydantic import BaseModel, Field


class RunRequest(BaseModel):
    method: str = Field(..., pattern="^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$")
    url: str = Field(..., min_length=1)
    params: list[dict[str, Any]] = []
    headers: list[dict[str, Any]] = []
    body_type: str = "none"
    body_content: Optional[str] = None
    auth_type: str = "none"
    auth_data: dict[str, Any] = {}
    environment_id: Optional[str] = None
    timeout: int = Field(30, ge=1, le=120)
    follow_redirects: bool = True


class RunResponse(BaseModel):
    status_code: int
    status_text: str
    headers: dict[str, str]
    body: str
    response_time_ms: int
    response_size_bytes: int
    content_type: str
    error: Optional[str] = None
    history_id: Optional[str] = None  # saved history entry ID


class TabCreate(BaseModel):
    title: str = "Untitled Request"
    method: str = "GET"
    url: str = ""
    params: list[Any] = []
    headers: list[Any] = []
    body_type: str = "none"
    body_content: Optional[str] = None
    auth_type: str = "none"
    auth_data: dict[str, Any] = {}
    request_id: Optional[str] = None
    order_idx: int = 0


class TabUpdate(BaseModel):
    title: Optional[str] = None
    method: Optional[str] = None
    url: Optional[str] = None
    params: Optional[list[Any]] = None
    headers: Optional[list[Any]] = None
    body_type: Optional[str] = None
    body_content: Optional[str] = None
    auth_type: Optional[str] = None
    auth_data: Optional[dict[str, Any]] = None
    is_dirty: Optional[bool] = None
    order_idx: Optional[int] = None
    request_id: Optional[str] = None


class TabResponse(BaseModel):
    id: str
    request_id: Optional[str]
    title: str
    method: str
    url: str
    params: list[Any]
    headers: list[Any]
    body_type: str
    body_content: Optional[str]
    auth_type: str
    auth_data: dict[str, Any]
    is_dirty: bool
    order_idx: int

    model_config = {"from_attributes": True}
