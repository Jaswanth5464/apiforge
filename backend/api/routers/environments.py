from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.base import get_db
from backend.schemas.environment import (
    EnvironmentCreate, EnvironmentUpdate, EnvironmentResponse,
    VariableCreate, VariableUpdate, VariableResponse,
    BulkVariablesUpdate,
)
from backend.services.environment_service import EnvironmentService

router = APIRouter(prefix="/environments", tags=["Environments"])


def get_service(db: Session = Depends(get_db)) -> EnvironmentService:
    return EnvironmentService(db)


@router.get("/", response_model=list[EnvironmentResponse])
def list_environments(service: EnvironmentService = Depends(get_service)):
    return service.list_all()


@router.post("/", response_model=EnvironmentResponse, status_code=status.HTTP_201_CREATED)
def create_environment(data: EnvironmentCreate, service: EnvironmentService = Depends(get_service)):
    return service.create(data)


@router.get("/{env_id}", response_model=EnvironmentResponse)
def get_environment(env_id: str, service: EnvironmentService = Depends(get_service)):
    env = service.get(env_id)
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    return env


@router.put("/{env_id}", response_model=EnvironmentResponse)
def update_environment(
    env_id: str,
    data: EnvironmentUpdate,
    service: EnvironmentService = Depends(get_service),
):
    env = service.update(env_id, data)
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    return env


@router.delete("/{env_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_environment(env_id: str, service: EnvironmentService = Depends(get_service)):
    if not service.delete(env_id):
        raise HTTPException(status_code=404, detail="Environment not found")


@router.post("/{env_id}/activate", response_model=EnvironmentResponse)
def activate_environment(env_id: str, service: EnvironmentService = Depends(get_service)):
    env = service.set_active(env_id)
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    return env


# ── Variable Endpoints ───────────────────────────────────────────────────────

@router.post("/{env_id}/variables", response_model=VariableResponse, status_code=status.HTTP_201_CREATED)
def add_variable(
    env_id: str,
    data: VariableCreate,
    service: EnvironmentService = Depends(get_service),
):
    var = service.add_variable(env_id, data)
    if not var:
        raise HTTPException(status_code=404, detail="Environment not found")
    return var


@router.put("/{env_id}/variables/bulk", response_model=list[VariableResponse])
def bulk_update_variables(
    env_id: str,
    data: BulkVariablesUpdate,
    service: EnvironmentService = Depends(get_service),
):
    """Replace all variables for this environment at once."""
    return service.bulk_update_variables(env_id, data)


@router.put("/variables/{variable_id}", response_model=VariableResponse)
def update_variable(
    variable_id: str,
    data: VariableUpdate,
    service: EnvironmentService = Depends(get_service),
):
    var = service.update_variable(variable_id, data)
    if not var:
        raise HTTPException(status_code=404, detail="Variable not found")
    return var


@router.delete("/variables/{variable_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_variable(variable_id: str, service: EnvironmentService = Depends(get_service)):
    if not service.delete_variable(variable_id):
        raise HTTPException(status_code=404, detail="Variable not found")
