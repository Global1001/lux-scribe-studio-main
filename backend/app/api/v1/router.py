"""
Main API router for v1 endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import search, research, health, convert, local_upload, document

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(research.router, prefix="/research", tags=["research"])
api_router.include_router(convert.router, prefix="/convert", tags=["convert"])
api_router.include_router(local_upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(document.router, prefix="/document", tags=["document"])