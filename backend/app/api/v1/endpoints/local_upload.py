"""
Local file upload endpoint for private document storage.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
import os
import uuid
from pathlib import Path
import structlog

logger = structlog.get_logger()

router = APIRouter()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

def safe_filename(filename: str) -> str:
    """Generate a safe filename to prevent directory traversal."""
    # Remove path components and generate unique filename
    base_name = os.path.basename(filename)
    name, ext = os.path.splitext(base_name)
    safe_name = f"{uuid.uuid4().hex}_{name}{ext}"
    return safe_name

@router.post("/upload")
async def upload_local_file(file: UploadFile = File(...)):
    """
    Upload a file to local server storage (not Supabase) for privacy.
    Returns file information without storing in database.
    """
    try:
        # Validate file type
        allowed_types = [
            "application/pdf",
            "application/msword", 
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "application/rtf"
        ]
        
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail="File type not supported. Please upload PDF, DOC, DOCX, TXT, or RTF files."
            )
        
        # Generate safe filename
        safe_name = safe_filename(file.filename or "upload")
        file_location = UPLOAD_DIR / safe_name
        
        # Save file to local storage
        with open(file_location, "wb") as f:
            content = await file.read()
            f.write(content)
        
        logger.info("File uploaded locally", filename=safe_name, size=len(content))
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "File uploaded successfully",
                "filename": safe_name,
                "original_filename": file.filename,
                "size": len(content),
                "local_path": str(file_location),
                "upload_type": "private"
            }
        )
        
    except Exception as e:
        logger.error("Local file upload failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/list")
async def list_local_files():
    """
    List all locally uploaded files.
    """
    try:
        files = []
        if UPLOAD_DIR.exists():
            for file_path in UPLOAD_DIR.iterdir():
                if file_path.is_file():
                    stat = file_path.stat()
                    files.append({
                        "filename": file_path.name,
                        "size": stat.st_size,
                        "created_at": stat.st_ctime,
                        "upload_type": "private"
                    })
        
        return JSONResponse(
            status_code=200,
            content={"files": files}
        )
        
    except Exception as e:
        logger.error("Failed to list local files", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")