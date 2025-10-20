"""
Health check endpoints.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import structlog

logger = structlog.get_logger()

router = APIRouter()


@router.get("/")
async def health_check():
    """Health check endpoint for API routes."""
    try:
        # TODO: Add more comprehensive health checks
        return JSONResponse(
            status_code=200,
            content={
                "status": "healthy",
                "service": "deep-legal-research-api",
                "version": "0.1.0"
            }
        )
    except Exception as e:
        logger.error("API health check failed", error=str(e))
        raise HTTPException(status_code=503, detail="API unhealthy") 