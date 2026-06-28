from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class VariableCreate(BaseModel):
    key: str = Field(..., min_length=1, max_length=255)
    value: str = ""
    description: Optional[str] = None
    enabled: bool = True


class VariableUpdate(BaseModel):
    key: Optional[str] = Field(None, min_length=1, max_length=255)
    value: Optional[str] = None
    description: Optional[str] = None
    enabled: Optional[bool] = None


class VariableResponse(BaseModel):
    id: str
    environment_id: str
    key: str
    value: str
    description: Optional[str]
    enabled: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class EnvironmentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class EnvironmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class EnvironmentResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    variables: list[VariableResponse] = []

    model_config = {"from_attributes": True}


class BulkVariablesUpdate(BaseModel):
    """Replace all variables for an environment at once."""
    variables: list[VariableCreate]
