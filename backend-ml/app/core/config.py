# app/core/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # backend-core (Spring Boot) chạy ở 8080 — không phải 8000.
    # 8000 là port của chính service này (backend-ml), xem app/main.py.
    BACKEND_CORE_URL: str = "http://localhost:8080"

    # Phải khớp với worklify.internal.api-key bên backend-core
    # (InternalReferenceValueController). Đổi giá trị mặc định khi deploy thật.
    INTERNAL_API_KEY: str = "local-dev-only-change-me"

    class Config:
        env_file = ".env"


settings = Settings()