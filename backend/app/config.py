import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Exploria"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # API Keys
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    GOOGLE_MAPS_API_KEY: str = ""
    FOURSQUARE_API_KEY: str = ""
    GEOAPIFY_API_KEY: str = ""

    # Model Settings
    GEMINI_MODEL: str = "gemini-3.8-flash"
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    OPENROUTER_MODEL: str = "openai/gpt-oss-120b"
    EMBEDDING_MODEL: str = "models/gemini-embedding-001"

    # Caching
    CACHE_DIR: Path = BASE_DIR / "data" / "cache"
    CACHE_TTL_HOURS: int = 168  # 7 days
    CACHE_PRECISION_DECIMALS: int = 3  # ~110m precision for geo clustering

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
settings.CACHE_DIR.mkdir(parents=True, exist_ok=True)
