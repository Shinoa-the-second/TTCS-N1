"""
Cấu hình toàn hệ thống. Đọc từ biến môi trường hoặc file .env.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./diabetes.db"
    secret_key: str = "change-me-in-production-please-use-32-chars-minimum"
    algorithm: str = "HS256"

    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7
    refresh_token_expire_days_remember: int = 30

    ai_service_url: str = "http://localhost:8000"
    frontend_origin: str = "http://localhost:5500"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
