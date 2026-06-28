from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.base import get_db
from backend.schemas.runner import RunRequest, RunResponse
from backend.services.request_runner import RequestRunner
from backend.services.variable_resolver import VariableResolver
from backend.services.environment_service import EnvironmentService
from backend.repositories.history_repository import HistoryRepository

router = APIRouter(prefix="/runner", tags=["Runner"])


@router.post("/run", response_model=RunResponse)
async def run_request(
    req: RunRequest,
    db: Session = Depends(get_db),
):
    """
    Execute an HTTP request via the FastAPI proxy.
    Resolves environment variables, builds headers/auth,
    saves to history, and returns the full response.
    """
    # 1. Load environment variables if environment_id is provided
    resolver = VariableResolver({})
    if req.environment_id:
        env_service = EnvironmentService(db)
        var_map = env_service.get_resolved_variables(req.environment_id)
        resolver = VariableResolver(var_map)

    # 2. Execute request
    runner = RequestRunner(resolver)
    result = await runner.run(req)

    # 3. Save to history (always, even on errors)
    history_repo = HistoryRepository(db)
    history_entry = history_repo.create({
        "method": req.method,
        "url": req.url,
        "params": [p.model_dump() if hasattr(p, "model_dump") else p for p in req.params],
        "headers": [h.model_dump() if hasattr(h, "model_dump") else h for h in req.headers],
        "body_type": req.body_type,
        "body_content": req.body_content,
        "auth_type": req.auth_type,
        "auth_data": req.auth_data,
        "status_code": result.status_code if result.status_code > 0 else None,
        "response_time_ms": result.response_time_ms,
        "response_size_bytes": result.response_size_bytes,
        "response_headers": result.headers,
        "response_body": result.body[:50000] if result.body else None,  # cap history body at 50KB
        "error": result.error,
    })

    result.history_id = history_entry.id  # type: ignore
    return result
