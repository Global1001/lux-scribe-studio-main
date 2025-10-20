"""
Application settings and configuration.
"""

from typing import List
from pydantic_settings import BaseSettings
from .environment import env_config


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    APP_NAME: str = env_config.APP_NAME
    APP_VERSION: str = env_config.APP_VERSION
    DEBUG: bool = env_config.DEBUG
    
    # Server configuration
    HOST: str = env_config.HOST
    PORT: int = env_config.PORT
    
    # CORS
    ALLOWED_ORIGINS: List[str] = env_config.allowed_origins
    
    # Database
    DATABASE_URL: str = env_config.DATABASE_URL
    
    # Redis
    REDIS_URL: str = env_config.REDIS_URL
    
    # MinIO/S3
    MINIO_ENDPOINT: str = env_config.MINIO_ENDPOINT
    MINIO_ACCESS_KEY: str = env_config.MINIO_ACCESS_KEY
    MINIO_SECRET_KEY: str = env_config.MINIO_SECRET_KEY
    MINIO_BUCKET_NAME: str = env_config.MINIO_BUCKET_NAME
    MINIO_SECURE: bool = env_config.MINIO_SECURE
    
    # Celery
    CELERY_BROKER_URL: str = env_config.REDIS_URL + "/0"
    CELERY_RESULT_BACKEND: str = env_config.REDIS_URL + "/0"
    
    # API Keys (for external services)
    COURT_LISTENER_API_KEY: str = env_config.COURT_LISTENER_API_KEY
    CAP_API_KEY: str = env_config.CAP_API_KEY
    SERP_API_KEY: str = env_config.SERP_API_KEY
    OPENAI_API_KEY: str = env_config.OPENAI_API_KEY
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = env_config.RATE_LIMIT_PER_MINUTE
    
    # Search Configuration
    MAX_SEARCH_RESULTS: int = env_config.MAX_SEARCH_RESULTS
    MAX_CITATION_EXPANSION: int = env_config.MAX_CITATION_EXPANSION
    
    # PDF Processing
    PDF_CACHE_DAYS: int = env_config.PDF_CACHE_DAYS
    
    # Observability
    OTEL_ENDPOINT: str = env_config.OTEL_ENDPOINT
    
    # Supabase
    SUPABASE_URL: str = env_config.SUPABASE_URL
    SUPABASE_SERVICE_KEY: str = env_config.SUPABASE_SERVICE_KEY
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings() 