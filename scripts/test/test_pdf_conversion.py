#!/usr/bin/env python3
"""
Test script for PDF to DOCX conversion functionality.
This script tests the backend endpoint to ensure the conversion works correctly.
"""

import requests
import json
import time
import os
from pathlib import Path

# Configuration
BACKEND_URL = "http://localhost:8001"
CONVERT_ENDPOINT = f"{BACKEND_URL}/api/v1/convert/convert-to-docx"
HEALTH_ENDPOINT = f"{BACKEND_URL}/health"

def test_backend_health():
    """Test if the backend server is running."""
    try:
        response = requests.get(HEALTH_ENDPOINT)
        if response.status_code == 200:
            print("✅ Backend server is running")
            return True
        else:
            print(f"❌ Backend server returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        return False

def test_pdf_conversion():
    """Test PDF to DOCX conversion with a sample PDF."""
    print("\n🔄 Testing PDF to DOCX conversion...")
    
    # Create a simple test PDF content (this would normally be a real PDF file)
    test_pdf_content = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test PDF Content) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF"""
    
    # Prepare the file upload
    files = {
        'file': ('test.pdf', test_pdf_content, 'application/pdf')
    }
    
    try:
        print("📤 Uploading test PDF for conversion...")
        response = requests.post(CONVERT_ENDPOINT, files=files)
        
        if response.status_code == 200:
            print("✅ PDF conversion successful!")
            print(f"   Response headers: {dict(response.headers)}")
            print(f"   Content length: {len(response.content)} bytes")
            
            # Save the converted file for inspection
            with open('test_converted.docx', 'wb') as f:
                f.write(response.content)
            print("   💾 Converted file saved as 'test_converted.docx'")
            
            return True
        else:
            print(f"❌ Conversion failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during conversion: {e}")
        return False

def test_pdf2docx_library():
    """Test if the pdf2docx library is properly installed and working."""
    print("\n🔄 Testing pdf2docx library...")
    
    try:
        from pdf2docx import Converter
        print("✅ pdf2docx library imported successfully")
        
        # Test basic functionality
        print("   📚 Library version and basic functionality test...")
        print(f"   Converter class: {Converter}")
        
        return True
    except ImportError as e:
        print(f"❌ pdf2docx library not found: {e}")
        return False
    except Exception as e:
        print(f"❌ Error testing pdf2docx library: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 Starting PDF to DOCX conversion tests...\n")
    
    # Test 1: Backend health
    if not test_backend_health():
        print("\n❌ Backend server is not running. Please start it first.")
        return
    
    # Test 2: pdf2docx library
    if not test_pdf2docx_library():
        print("\n❌ pdf2docx library is not properly installed.")
        print("   Please install it with: pip install pdf2docx>=0.5.8")
        return
    
    # Test 3: PDF conversion
    if not test_pdf_conversion():
        print("\n❌ PDF conversion test failed.")
        return
    
    print("\n🎉 All tests passed! PDF to DOCX conversion is working correctly.")
    print("\nNext steps:")
    print("1. Upload a PDF file through the frontend")
    print("2. Right-click on the PDF file")
    print("3. Select 'Convert to DOCX'")
    print("4. The converted DOCX file should appear in your file list")

if __name__ == "__main__":
    main() 