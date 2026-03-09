from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:dev_password@postgres:5432/dev_db"
    MEDIA_ROOT: str = "media"

    class Config:
        env_file = ".env"


settings = Settings()

# Ensure media root exists on startup
Path(settings.MEDIA_ROOT).mkdir(parents=True, exist_ok=True)
