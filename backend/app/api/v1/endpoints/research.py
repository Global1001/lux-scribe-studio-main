"""
Research endpoints for citation expansion and PDF access.
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import structlog
from app.services.citation_handler import CitationHandler
from app.config.settings import settings

logger = structlog.get_logger()

router = APIRouter()

# Initialize citation handler with API key if available
citation_handler = CitationHandler()


class CitationRequest(BaseModel):
    citation: str


@router.get("/citations/{citation}")
async def get_citation(citation: str):
    """Get case information for a citation using CourtListener API."""
    try:
        logger.info("Citation lookup requested", citation=citation)
        
        result = citation_handler.handle_citation_query(citation)
        
        if result["status"] == "not_found":
            return JSONResponse(
                status_code=404,
                content=result
            )
        
        return JSONResponse(
            status_code=200,
            content=result
        )
        
    except Exception as e:
        logger.error("Citation lookup failed", citation=citation, error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Citation lookup failed: {str(e)}"
        )


@router.post("/citations")
async def post_citation(request: CitationRequest):
    """Post citation lookup endpoint."""
    return await get_citation(request.citation)


@router.get("/pdf/{citation}")
async def get_pdf_placeholder(citation: str):
    """Placeholder PDF endpoint - will be implemented in Goal 5."""
    return JSONResponse(
        status_code=501,
        content={
            "message": "PDF access not yet implemented",
            "citation": citation,
            "milestone": "Goal 5 - Authoritative PDFs and context viewer"
        }
    ) 