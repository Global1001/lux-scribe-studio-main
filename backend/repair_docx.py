"""
Repair corrupted DOCX files.
This script attempts to repair corrupted DOCX files by opening and resaving them with python-docx.
"""

import os
import sys
import tempfile
import shutil
from docx import Document
import zipfile
from xml.etree.ElementTree import parse as parse_xml

def repair_docx(input_path, output_path=None):
    """
    Attempt to repair a corrupted DOCX file by opening and resaving it.
    
    Args:
        input_path: Path to the corrupted DOCX file
        output_path: Path to save the repaired DOCX file (default: input_path + "_repaired.docx")
    
    Returns:
        bool: True if repair was successful, False otherwise
    """
    if not os.path.exists(input_path):
        print(f"Error: File not found - {input_path}")
        return False
    
    if not output_path:
        base_name = os.path.splitext(input_path)[0]
        output_path = f"{base_name}_repaired.docx"
    
    print(f"Attempting to repair DOCX file:")
    print(f"  Input: {input_path}")
    print(f"  Output: {output_path}")
    
    # Method 1: Simple open and resave
    try:
        print("\nMethod 1: Simple open and resave...")
        doc = Document(input_path)
        doc.save(output_path)
        print("✓ Repair successful!")
        return True
    except Exception as e:
        print(f"✗ Simple repair failed: {str(e)}")
    
    # Method 2: Extract and rebuild
    try:
        print("\nMethod 2: Extract and rebuild...")
        temp_dir = tempfile.mkdtemp(prefix="docx_repair_")
        
        # Extract the DOCX (it's just a ZIP file)
        try:
            with zipfile.ZipFile(input_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
            print("  Extracted DOCX contents")
        except Exception as e:
            print(f"  Failed to extract DOCX: {str(e)}")
            shutil.rmtree(temp_dir)
            return False
        
        # Create a new DOCX file
        try:
            doc = Document()
            doc.save(output_path)
            print("  Created new DOCX file")
        except Exception as e:
            print(f"  Failed to create new DOCX: {str(e)}")
            shutil.rmtree(temp_dir)
            return False
        
        # Extract the new DOCX
        new_temp_dir = tempfile.mkdtemp(prefix="docx_new_")
        with zipfile.ZipFile(output_path, 'r') as zip_ref:
            zip_ref.extractall(new_temp_dir)
        
        # Copy over document.xml if it exists
        doc_xml_path = os.path.join(temp_dir, "word", "document.xml")
        if os.path.exists(doc_xml_path):
            try:
                # Validate XML
                parse_xml(doc_xml_path)
                shutil.copy(
                    doc_xml_path,
                    os.path.join(new_temp_dir, "word", "document.xml")
                )
                print("  Copied document content")
            except Exception as e:
                print(f"  Failed to validate/copy document.xml: {str(e)}")
        
        # Repackage the DOCX
        try:
            # Remove the output file first
            if os.path.exists(output_path):
                os.remove(output_path)
            
            # Create a new ZIP file
            with zipfile.ZipFile(output_path, 'w') as docx_zip:
                for root, _, files in os.walk(new_temp_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, new_temp_dir)
                        docx_zip.write(file_path, arcname)
            
            print("  Repackaged DOCX file")
            
            # Clean up
            shutil.rmtree(temp_dir)
            shutil.rmtree(new_temp_dir)
            
            print("✓ Repair successful!")
            return True
        except Exception as e:
            print(f"  Failed to repackage DOCX: {str(e)}")
            
            # Clean up
            shutil.rmtree(temp_dir)
            shutil.rmtree(new_temp_dir)
            return False
    
    except Exception as e:
        print(f"✗ Advanced repair failed: {str(e)}")
        return False

if __name__ == "__main__":
    # Check if DOCX file is provided as argument
    if len(sys.argv) < 2:
        print("Usage: python repair_docx.py <corrupted_docx_file> [output_docx_file]")
        sys.exit(1)
    
    docx_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    if repair_docx(docx_file, output_file):
        print("\nThe DOCX file has been repaired. Please check if it opens correctly.")
    else:
        print("\nRepair failed. The file might be too corrupted to repair.")
        print("Try using a different PDF converter tool or online service.") 