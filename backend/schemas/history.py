from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel


class HistoryResponse(BaseModel):
    id: str
    method: str
    url: str
    params: list[Any]
    headers: list[Any]
    body_type: str
    body_content: Optional[str]
    auth_type: str
    auth_data: dict[str, Any]
    status_code: Optional[int]
    response_time_ms: Optional[int]
    response_size_bytes: Optional[int]
    response_headers: Optional[dict[str, Any]]
    response_body: Optional[str]
    error: Optional[str]
    timestamp: datetime

    model_config = {"from_attributes": True}
