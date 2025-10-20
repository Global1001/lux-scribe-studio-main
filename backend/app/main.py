"""
Main FastAPI application for the Deep Legal Research Platform.
"""

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import structlog
from contextlib import asynccontextmanager
import sys
import traceback
from datetime import datetime, timedelta
import re

from app.config.settings import settings
from app.api.v1.router import api_router

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Debug: Print settings to verify they're loaded
logger.info("Starting application with settings", 
           allowed_origins=settings.ALLOWED_ORIGINS,
           debug=settings.DEBUG,
           host=settings.HOST if hasattr(settings, 'HOST') else '0.0.0.0',
           port=settings.PORT if hasattr(settings, 'PORT') else 8000)


def format_cookie_date(date: datetime) -> str:
    """Format a datetime object to RFC 1123 format for cookies."""
    # RFC 1123 format: "Thu, 10 Jul 2025 16:17:04 GMT"
    return date.strftime('%a, %d %b %Y %H:%M:%S GMT')


def fix_cookie_date_format(cookie: str) -> str:
    """Fix cookie date format to RFC 1123 standard."""
    # Check if cookie has an Expires attribute
    expires_match = re.search(r'Expires=([^;]+)', cookie)
    if expires_match:
        expires_date = expires_match.group(1)
        try:
            # Try to parse the date in various formats
            parsed_date = None
            
            # Try RFC 1123 format first
            try:
                parsed_date = datetime.strptime(expires_date, '%a, %d %b %Y %H:%M:%S %Z')
            except ValueError:
                pass
            
            # Try ISO format
            if not parsed_date:
                try:
                    parsed_date = datetime.fromisoformat(expires_date.replace('Z', '+00:00'))
                except ValueError:
                    pass
            
            # Try other common formats
            if not parsed_date:
                try:
                    parsed_date = datetime.strptime(expires_date, '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    pass
            
            if parsed_date:
                # Format to RFC 1123
                formatted_date = format_cookie_date(parsed_date)
                fixed_cookie = re.sub(r'Expires=[^;]+', f'Expires={formatted_date}', cookie)
                return fixed_cookie
            else:
                # If we can't parse the date, remove the Expires attribute
                fixed_cookie = re.sub(r'Expires=[^;]+;?\s*', '', cookie)
                logger.warning(f"Removed invalid cookie date format: {expires_date}")
                return fixed_cookie
                
        except Exception as e:
            # If any error occurs, remove the Expires attribute
            fixed_cookie = re.sub(r'Expires=[^;]+;?\s*', '', cookie)
            logger.warning(f"Error fixing cookie date format: {e}")
            return fixed_cookie
    
    return cookie


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting Deep Legal Research Platform")
    
    # Validate critical settings
    if not settings.ALLOWED_ORIGINS:
        logger.warning("No CORS origins configured - this may cause issues")
    
    # Initialize database connections, Redis, etc.
    # TODO: Add database initialization
    
    yield
    
    # Shutdown
    logger.info("Shutting down Deep Legal Research Platform")
    # TODO: Add cleanup code


# Create FastAPI application
app = FastAPI(
    title="Deep Legal Research Platform",
    description="AI-powered legal research with streaming results and citation expansion",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Add CORS middleware with proper configuration
logger.info("Configuring CORS middleware", origins=settings.ALLOWED_ORIGINS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.middleware("http")
async def fix_cookie_dates(request: Request, call_next):
    """Middleware to fix cookie date formats to prevent browser warnings."""
    response = await call_next(request)
    
    # Fix Set-Cookie headers with invalid date formats
    if 'set-cookie' in response.headers:
        cookies = response.headers.getlist('set-cookie')
        fixed_cookies = []
        
        for cookie in cookies:
            fixed_cookie = fix_cookie_date_format(cookie)
            fixed_cookies.append(fixed_cookie)
        
        # Update the response headers
        response.headers.pop('set-cookie', None)
        for cookie in fixed_cookies:
            response.headers.add('set-cookie', cookie)
    
    return response


# Include API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """Health check endpoint for Docker and load balancers."""
    try:
        # TODO: Add database health check
        # TODO: Add Redis health check
        # TODO: Add MinIO health check
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "healthy",
                "service": "deep-legal-research",
                "version": "0.1.0",
                "cors_origins": settings.ALLOWED_ORIGINS,
                "debug": settings.DEBUG
            }
        )
    except Exception as e:
        logger.error("Health check failed", error=str(e), exc_info=True)
        raise HTTPException(status_code=503, detail="Service unhealthy")


@app.get("/")
async def root():
    """Root endpoint with basic information."""
    return {
        "message": "Deep Legal Research Platform API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health",
        "cors_origins": settings.ALLOWED_ORIGINS
    }


@app.get("/test-cors")
async def test_cors():
    """Test endpoint to verify CORS is working."""
    return {
        "message": "CORS test successful",
        "timestamp": "2024-01-01T00:00:00Z",
        "cors_origins": settings.ALLOWED_ORIGINS,
        "debug": settings.DEBUG
    }


@app.options("/test-cors")
async def test_cors_options():
    """Test OPTIONS endpoint for CORS preflight."""
    return {"message": "CORS preflight successful"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for better error reporting."""
    logger.error("Unhandled exception", 
                path=request.url.path,
                method=request.method,
                error=str(exc),
                exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An unexpected error occurred",
            "path": str(request.url.path)
        }
    )


if __name__ == "__main__":
    import uvicorn
    from app.config.environment import env_config
    
    try:
        server_config = env_config.get_server_config()
        logger.info("Starting server with config", **server_config)
        uvicorn.run(
            "app.main:app",
            **server_config
        )
    except Exception as e:
        logger.error("Failed to start server", error=str(e), exc_info=True)
        sys.exit(1) 