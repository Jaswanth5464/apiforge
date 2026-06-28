from typing import Optional
from sqlalchemy.orm import Session, selectinload
from backend.models.environment import Environment, Variable
from backend.schemas.environment import EnvironmentCreate, EnvironmentUpdate, VariableCreate, VariableUpdate


class EnvironmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Environment]:
        return (
            self.db.query(Environment)
            .options(selectinload(Environment.variables))
            .order_by(Environment.created_at)
            .all()
        )

    def get_by_id(self, env_id: str) -> Optional[Environment]:
        return (
            self.db.query(Environment)
            .options(selectinload(Environment.variables))
            .filter(Environment.id == env_id)
            .first()
        )

    def get_active(self) -> Optional[Environment]:
        return (
            self.db.query(Environment)
            .options(selectinload(Environment.variables))
            .filter(Environment.is_active == True)  # noqa: E712
            .first()
        )

    def create(self, data: EnvironmentCreate) -> Environment:
        obj = Environment(**data.model_dump())
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, env_id: str, data: EnvironmentUpdate) -> Optional[Environment]:
        obj = self.db.query(Environment).filter(Environment.id == env_id).first()
        if not obj:
            return None
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(obj, field, value)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def set_active(self, env_id: str) -> Optional[Environment]:
        """Deactivate all environments, then activate the given one."""
        self.db.query(Environment).update({Environment.is_active: False})
        env = self.db.query(Environment).filter(Environment.id == env_id).first()
        if not env:
            self.db.commit()
            return None
        env.is_active = True  # type: ignore
        self.db.commit()
        self.db.refresh(env)
        return env

    def delete(self, env_id: str) -> bool:
        obj = self.db.query(Environment).filter(Environment.id == env_id).first()
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True


class VariableRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_environment(self, env_id: str) -> list[Variable]:
        return (
            self.db.query(Variable)
            .filter(Variable.environment_id == env_id)
            .all()
        )

    def create(self, env_id: str, data: VariableCreate) -> Variable:
        obj = Variable(environment_id=env_id, **data.model_dump())
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, variable_id: str, data: VariableUpdate) -> Optional[Variable]:
        obj = self.db.query(Variable).filter(Variable.id == variable_id).first()
        if not obj:
            return None
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(obj, field, value)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, variable_id: str) -> bool:
        obj = self.db.query(Variable).filter(Variable.id == variable_id).first()
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True

    def bulk_replace(self, env_id: str, variables: list[VariableCreate]) -> list[Variable]:
        """Delete all variables for an env and replace with new list."""
        self.db.query(Variable).filter(Variable.environment_id == env_id).delete()
        new_vars = [Variable(environment_id=env_id, **v.model_dump()) for v in variables]
        self.db.add_all(new_vars)
        self.db.commit()
        return new_vars
