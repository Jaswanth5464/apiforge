from typing import Optional
from sqlalchemy.orm import Session

from backend.models.environment import Environment, Variable
from backend.repositories.environment_repository import EnvironmentRepository, VariableRepository
from backend.schemas.environment import (
    EnvironmentCreate, EnvironmentUpdate,
    VariableCreate, VariableUpdate,
    BulkVariablesUpdate,
)


class EnvironmentService:
    def __init__(self, db: Session):
        self.env_repo = EnvironmentRepository(db)
        self.var_repo = VariableRepository(db)

    def list_all(self) -> list[Environment]:
        return self.env_repo.get_all()

    def get(self, env_id: str) -> Optional[Environment]:
        return self.env_repo.get_by_id(env_id)

    def create(self, data: EnvironmentCreate) -> Environment:
        return self.env_repo.create(data)

    def update(self, env_id: str, data: EnvironmentUpdate) -> Optional[Environment]:
        return self.env_repo.update(env_id, data)

    def delete(self, env_id: str) -> bool:
        return self.env_repo.delete(env_id)

    def set_active(self, env_id: str) -> Optional[Environment]:
        return self.env_repo.set_active(env_id)

    def get_resolved_variables(self, env_id: str) -> dict[str, str]:
        """Return a dict of key→value for all enabled variables."""
        env = self.env_repo.get_by_id(env_id)
        if not env:
            return {}
        return {
            v.key: v.value
            for v in env.variables
            if v.enabled
        }

    # Variable operations
    def add_variable(self, env_id: str, data: VariableCreate) -> Optional[Variable]:
        env = self.env_repo.get_by_id(env_id)
        if not env:
            return None
        return self.var_repo.create(env_id, data)

    def update_variable(self, variable_id: str, data: VariableUpdate) -> Optional[Variable]:
        return self.var_repo.update(variable_id, data)

    def delete_variable(self, variable_id: str) -> bool:
        return self.var_repo.delete(variable_id)

    def bulk_update_variables(self, env_id: str, data: BulkVariablesUpdate) -> list[Variable]:
        return self.var_repo.bulk_replace(env_id, data.variables)
