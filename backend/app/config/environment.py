"""
Environment configuration for the backend API.

This module centralizes all environment-specific configuration including
hosts, ports, URLs, and other deployment settings.
"""

import os
from typing import List


class EnvironmentConfig:
    """Centralized environment configuration for the backend."""
    
    # Environment detection
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    DEBUG = os.getenv("DEBUG", "true").lower() == "true"
    
    # Server configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8000"))
    
    # Frontend configuration (for CORS)
    FRONTEND_HOST = os.getenv("FRONTEND_HOST", "localhost")
    FRONTEND_PORT = int(os.getenv("FRONTEND_PORT", "8080"))
    FRONTEND_PROTOCOL = os.getenv("FRONTEND_PROTOCOL", "http")
    
    @property
    def frontend_url(self) -> str:
        """Get the frontend URL."""
        return f"{self.FRONTEND_PROTOCOL}://{self.FRONTEND_HOST}:{self.FRONTEND_PORT}"
    
    # CORS configuration
    @property
    def allowed_origins(self) -> List[str]:
        """Get allowed CORS origins based on environment."""
        if self.ENVIRONMENT == "development":
            return [
                self.frontend_url,
                "http://localhost:3000",  # Alternative frontend port
                "http://localhost:8080",  # Previous frontend port
                "http://localhost:8081",  # Previous frontend port
                "http://localhost:8082",  # Current frontend port
            ]
        else:
            # Production origins should be configured via environment variables
            origins = os.getenv("ALLOWED_ORIGINS", "")
            return [origin.strip() for origin in origins.split(",") if origin.strip()]
    
    # Database configuration
    DATABASE_URL = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/legal_research"
    )
    
    # Redis configuration
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # MinIO/S3 configuration
    MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
    MINIO_BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME", "legal-research")
    MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"
    
    # API Keys (for external services)
    COURT_LISTENER_API_KEY = os.getenv("COURT_LISTENER_API_KEY", "")
    CAP_API_KEY = os.getenv("CAP_API_KEY", "")
    SERP_API_KEY = os.getenv("SERP_API_KEY", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    
    # Supabase configuration
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

    # OnlyOffice configuration
    ONLYOFFICE_SECRET = os.getenv("ONLYOFFICE_SECRET", "70ec610c0f655cbc65d7b82575961a4fa458b15da2b7f93e2f06e61e1f944c63")
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    # Search configuration
    MAX_SEARCH_RESULTS = int(os.getenv("MAX_SEARCH_RESULTS", "50"))
    MAX_CITATION_EXPANSION = int(os.getenv("MAX_CITATION_EXPANSION", "15"))
    
    # PDF Processing
    PDF_CACHE_DAYS = int(os.getenv("PDF_CACHE_DAYS", "30"))
    
    # Observability
    OTEL_ENDPOINT = os.getenv("OTEL_ENDPOINT", "")
    
    # Application metadata
    APP_NAME = "Deep Legal Research Platform"
    APP_VERSION = "0.1.0"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.ENVIRONMENT == "development"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.ENVIRONMENT == "production"
    
    def get_server_config(self) -> dict:
        """Get server configuration for uvicorn."""
        return {
            "host": self.HOST,
            "port": self.PORT,
            "reload": self.DEBUG,
            "log_level": "debug" if self.DEBUG else "info"
        }


# Global configuration instance
env_config = EnvironmentConfig() 