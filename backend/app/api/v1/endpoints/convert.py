"""
PDF to DOCX conversion endpoint using optimized conversion methods.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
import tempfile
import os
import logging
import time
import structlog
import re
import unicodedata
from typing import Optional
import sys
import importlib.util
from pathlib import Path

# Import pdf2docx parse function directly
from pdf2docx import parse

logger = structlog.get_logger()

def convert_pdf_to_docx(pdf_path, docx_path=None):
    """
    Convert a PDF file to DOCX using the parse() function.
    
    Args:
        pdf_path: Path to the PDF file
        docx_path: Path to save the DOCX file (default: same name with .docx extension)
        
    Returns:
        bool: True if conversion successful, False otherwise
    """
    if not os.path.exists(pdf_path):
        logger.error("PDF file not found", pdf_path=pdf_path)
        return False
    
    if not docx_path:
        docx_path = os.path.splitext(pdf_path)[0] + ".docx"
    
    logger.info("Converting PDF to DOCX", 
                input_path=pdf_path,
                output_path=docx_path)
    
    start_time = time.time()
    
    try:
        # Convert PDF to DOCX using the simple parse function
        parse(pdf_path, docx_path)
        
        # Check if conversion was successful
        if os.path.exists(docx_path) and os.path.getsize(docx_path) > 0:
            end_time = time.time()
            duration = end_time - start_time
            logger.info("Conversion successful", 
                       duration=duration,
                       output_size=os.path.getsize(docx_path))
            return True
        else:
            logger.error("Conversion failed: Output file is empty or not created")
            return False
    
    except Exception as e:
        logger.error("Conversion error", error=str(e))
        return False

def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to be safe for Supabase storage keys.
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename safe for storage
    """
    # Normalize unicode characters (remove accents, tildes, etc.)
    filename = unicodedata.normalize('NFD', filename)
    filename = ''.join(c for c in filename if unicodedata.category(c) != 'Mn')
    
    # Replace spaces with underscores
    filename = filename.replace(' ', '_')
    
    # Remove any character that's not alphanumeric, underscore, dash, or dot
    filename = re.sub(r'[^a-zA-Z0-9._-]', '', filename)
    
    # Remove multiple consecutive underscores or dots
    filename = re.sub(r'[_.]{2,}', '_', filename)
    
    # Ensure it doesn't start or end with underscore or dot
    filename = filename.strip('_.')
    
    return filename

class ConvertRequest(BaseModel):
    file_id: str

def cleanup_temp_files(*files):
    """Clean up temporary files."""
    for file in files:
        if file and os.path.exists(file):
            try:
                os.unlink(file)
            except Exception as e:
                logger.warning(f"Failed to delete temp file {file}", error=str(e))

router = APIRouter()

@router.post("/convert-to-docx")
async def convert_to_docx(file: UploadFile = File(...)):
    """
    Convert an uploaded PDF file to DOCX and return the DOCX file as a download.
    Uses multiple conversion methods to ensure successful conversion.
    
    Args:
        file: PDF file uploaded by the user.
        
    Returns:
        FileResponse: The converted DOCX file as a download.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    tmp_pdf_path = None
    tmp_docx_path = None
    
    try:
        # Save uploaded PDF to a temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
            content = await file.read()
            tmp_pdf.write(content)
            tmp_pdf_path = tmp_pdf.name

        # Prepare temp file for DOCX output
        tmp_docx_path = tmp_pdf_path.replace(".pdf", ".docx")

        logger.info("Starting PDF to DOCX conversion", 
                   original_filename=file.filename,
                   pdf_path=tmp_pdf_path,
                   docx_path=tmp_docx_path)

        # Use the improved conversion function
        conversion_success = convert_pdf_to_docx(tmp_pdf_path, tmp_docx_path)
        
        if not conversion_success:
            raise HTTPException(status_code=500, detail="PDF conversion failed. The PDF file might be incompatible or protected.")
        
        logger.info("PDF to DOCX conversion completed successfully",
                   original_filename=file.filename,
                   output_size=os.path.getsize(tmp_docx_path))
        
        # Generate output filename
        docx_filename = (file.filename or 'converted').rsplit('.', 1)[0] + '.docx'
        sanitized_docx_filename = sanitize_filename(docx_filename)
        
        # Return DOCX file as a download
        return FileResponse(
            tmp_docx_path,
            filename=sanitized_docx_filename,
            media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            background=lambda: cleanup_temp_files(tmp_pdf_path, tmp_docx_path)
        )
        
    except Exception as e:
        logger.error("PDF to DOCX conversion failed", 
                    error=str(e),
                    original_filename=file.filename)
        
        # Clean up temp files on error
        cleanup_temp_files(tmp_pdf_path, tmp_docx_path)
        
        raise HTTPException(status_code=500, detail=f"Conversion error: {str(e)}")

@router.post("/convert-existing-pdf")
async def convert_existing_pdf(request: ConvertRequest):
    """
    Convert an existing PDF file (from Supabase or local storage) to DOCX and return for download.
    
    Args:
        request: ConvertRequest containing the file_id of the PDF file to convert.
        
    Returns:
        FileResponse: The converted DOCX file as a download.
    """
    from app.config.settings import settings
    from supabase import create_client
    
    file_id = request.file_id
    logger.info("Received conversion request", file_id=file_id)
    
    # Initialize Supabase client
    try:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        logger.info("Supabase client initialized successfully")
    except Exception as e:
        logger.error("Failed to initialize Supabase client", error=str(e))
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    tmp_pdf_path = None
    tmp_docx_path = None
    
    try:
        # Get file information from database
        result = supabase.table('documents').select('*').eq('id', file_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="File not found.")
        
        file_info = result.data[0]
        original_filename = file_info['original_filename']
        file_path = file_info['filename']
        
        # Ensure the file_path is relative to the bucket, not absolute
        if file_path.startswith('documents/'):
            file_path = file_path[len('documents/'):]
        
        # Check if it's a PDF file
        if not original_filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files can be converted to DOCX.")
        
        logger.info("Starting conversion of existing PDF", 
                   file_id=file_id,
                   original_filename=original_filename,
                   file_path_from_db=file_path)
        
        # Download the PDF file from Supabase storage
        try:
            logger.info("Attempting to download PDF from storage", 
                       bucket='documents',
                       file_path=file_path)
            
            pdf_download_result = supabase.storage.from_('documents').download(file_path)
            
            logger.info("Download attempt completed", 
                       result_type=type(pdf_download_result).__name__,
                       result_is_none=pdf_download_result is None,
                       result_length=len(pdf_download_result) if pdf_download_result else 0)
            
            if pdf_download_result is None:
                # Try to get more specific error information
                logger.error("PDF download failed - result is None", 
                           file_path=file_path)
                raise HTTPException(status_code=404, detail="PDF file not found in storage.")
            
            if len(pdf_download_result) == 0:
                logger.error("PDF download failed - empty result", 
                           file_path=file_path)
                raise HTTPException(status_code=404, detail="PDF file is empty in storage.")
                
        except Exception as download_error:
            logger.error("PDF download failed with exception", 
                        file_path=file_path,
                        error_type=type(download_error).__name__,
                        error_message=str(download_error))
            
            # If it's already an HTTPException, re-raise it
            if isinstance(download_error, HTTPException):
                raise download_error
                
            # Otherwise, wrap it in a new HTTPException
            raise HTTPException(status_code=500, detail=f"Storage download error: {str(download_error)}")
        
        logger.info("PDF downloaded successfully", 
                   file_path=file_path,
                   downloaded_size=len(pdf_download_result))
        
        # Save PDF to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
            tmp_pdf.write(pdf_download_result)
            tmp_pdf_path = tmp_pdf.name
        
        # Prepare temp file for DOCX output
        tmp_docx_path = tmp_pdf_path.replace(".pdf", ".docx")
        
        logger.info("Starting PDF to DOCX conversion", 
                   original_filename=original_filename,
                   pdf_path=tmp_pdf_path,
                   docx_path=tmp_docx_path)

        # Use the improved conversion function (same as the script)
        conversion_success = convert_pdf_to_docx(tmp_pdf_path, tmp_docx_path)
        
        if not conversion_success:
            raise HTTPException(status_code=500, detail="PDF conversion failed. The PDF file might be incompatible or protected.")
        
        logger.info("PDF to DOCX conversion completed successfully",
                   original_filename=original_filename,
                   output_size=os.path.getsize(tmp_docx_path))
        
        # Generate output filename
        docx_filename = original_filename.rsplit('.', 1)[0] + '.docx'
        sanitized_docx_filename = sanitize_filename(docx_filename)
        
        # Read the DOCX file content for Supabase upload
        with open(tmp_docx_path, "rb") as docx_file:
            docx_content = docx_file.read()
        
        # Upload the DOCX file to Supabase storage (so it appears in FileExplorer)
        try:
            docx_file_path = f"documents/{sanitized_docx_filename}"
            
            upload_response = supabase.storage.from_('documents').upload(
                docx_file_path,
                docx_content,
                file_options={"content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
            )
            
            # Insert document record in the database
            docx_insert_response = supabase.table('documents').insert({
                'original_filename': docx_filename,
                'filename': docx_file_path,
                'file_path': docx_file_path,
                'file_size': len(docx_content),
                'user_id': file_info.get('user_id'),
                'processing_status': 'completed'
            }).execute()
            
            logger.info("DOCX file uploaded to Supabase successfully",
                       docx_filename=docx_filename,
                       docx_file_path=docx_file_path,
                       new_file_id=docx_insert_response.data[0]['id'] if docx_insert_response.data else None)
                       
        except Exception as upload_error:
            # Don't fail the entire request if Supabase upload fails
            logger.warning("Failed to upload DOCX to Supabase, but conversion was successful",
                         error=str(upload_error))
        
        # Return DOCX file as a download (immediate download)
        return FileResponse(
            tmp_docx_path,
            filename=sanitized_docx_filename,
            media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            background=lambda: cleanup_temp_files(tmp_pdf_path, tmp_docx_path)
        )
        
    except Exception as e:
        logger.error("PDF to DOCX conversion failed", 
                    error=str(e),
                    file_id=file_id)
        
        # Clean up temp files on error
        cleanup_temp_files(tmp_pdf_path, tmp_docx_path)
        
        raise HTTPException(status_code=500, detail=f"Conversion error: {str(e)}") 