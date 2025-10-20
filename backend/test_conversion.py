"""
Simple test script for PDF to DOCX conversion.
This script uses the parse() function from pdf2docx to convert a PDF file to DOCX.
"""

import os
import sys
from pdf2docx import parse
import time

def convert_pdf_to_docx(pdf_path, docx_path=None):
    """
    Convert a PDF file to DOCX using the parse() function.
    
    Args:
        pdf_path: Path to the PDF file
        docx_path: Path to save the DOCX file (default: same name with .docx extension)
    """
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found - {pdf_path}")
        return False
    
    if not docx_path:
        docx_path = os.path.splitext(pdf_path)[0] + ".docx"
    
    print(f"Converting PDF to DOCX:")
    print(f"  Input: {pdf_path}")
    print(f"  Output: {docx_path}")
    
    start_time = time.time()
    
    try:
        # Convert PDF to DOCX
        parse(pdf_path, docx_path)
        
        # Check if conversion was successful
        if os.path.exists(docx_path) and os.path.getsize(docx_path) > 0:
            end_time = time.time()
            duration = end_time - start_time
            print(f"✓ Conversion successful! Time taken: {duration:.2f} seconds")
            return True
        else:
            print("✗ Conversion failed: Output file is empty or not created")
            return False
    
    except Exception as e:
        print(f"✗ Conversion error: {str(e)}")
        return False

if __name__ == "__main__":
    # Check if PDF file is provided as argument
    if len(sys.argv) < 2:
        print("Usage: python test_conversion.py <pdf_file> [output_docx_file]")
        sys.exit(1)
    
    pdf_file = sys.argv[1]
    docx_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    if convert_pdf_to_docx(pdf_file, docx_file):
        print("\nThe DOCX file has been created. Please check if it opens correctly.")
        print("If it still doesn't work, try using a different PDF converter tool.")
    else:
        print("\nConversion failed. Please try with a different PDF file or tool.") 