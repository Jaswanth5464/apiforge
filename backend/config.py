import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./postman_clone.db"
    ALLOWED_ORIGINS: list[str] = ["*"]
    REQUEST_TIMEOUT: int = 30
    MAX_RESPONSE_SIZE: int = 10 * 1024 * 1024  # 10MB

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
