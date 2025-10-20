# PDF to DOCX Conversion Tools

This directory contains several tools to help with PDF to DOCX conversion, particularly for handling problematic PDF files that result in corrupted DOCX output.

## Quick Start

To convert a PDF file to DOCX, run:

```bash
python convert_pdf.py your_file.pdf
```

This script will try multiple conversion methods to ensure successful conversion.

## Available Tools

1. **convert_pdf.py** - Main conversion script that tries multiple methods
2. **test_conversion.py** - Simple test script using the parse() function
3. **debug_conversion.py** - Advanced debugging with different parameter sets
4. **repair_docx.py** - Fix corrupted DOCX files
5. **alternative_conversion.py** - Try alternative conversion methods

## Conversion Methods

We've implemented several conversion methods to handle different types of PDF files:

### Method 1: Simple Parse Function

Uses the `parse()` function from pdf2docx, which is a simplified wrapper around the Converter class:

```python
from pdf2docx import parse
parse(pdf_path, docx_path)
```

### Method 2: Converter with Optimized Parameters

Uses the `Converter` class with optimized parameters to handle complex layouts:

```python
from pdf2docx import Converter
cv = Converter(pdf_path)
cv.convert(
    docx_path,
    start=0,
    end=None,
    connected_border_tolerance=0.8,
    line_separate_threshold=6.0,
    float_image_ignorable_gap=6.0,
    line_break_width_ratio=0.1,
    line_break_free_space_ratio=0.05
)
cv.close()
```

### Method 3: Direct PyMuPDF Conversion

Uses PyMuPDF directly to extract text and images, then creates a DOCX file using python-docx:

```python
import fitz  # PyMuPDF
from docx import Document
from docx.shared import Inches

# Create a new Word document
doc = Document()

# Open the PDF
pdf = fitz.open(pdf_path)

# Process each page
for page_num, page in enumerate(pdf):
    # Extract text and images
    text = page.get_text()
    doc.add_paragraph(text)
    
    # Add images
    for img in page.get_images(full=True):
        # ... image processing ...
        doc.add_picture(img_path)

# Save the document
doc.save(docx_path)
```

### Method 4: External Tools

Uses external tools like LibreOffice if available:

```python
subprocess.run(
    ["libreoffice", "--headless", "--convert-to", "docx", "--outdir", 
     output_dir, pdf_path]
)
```

## API Endpoints

The API endpoints have been updated to use multiple conversion methods:

1. `/api/v1/convert-to-docx` - Convert an uploaded PDF file to DOCX
2. `/api/v1/convert-existing-pdf` - Convert an existing PDF file from storage

Both endpoints will try multiple conversion methods until one succeeds.

## Troubleshooting

For detailed troubleshooting information, see [PDF_CONVERSION_TROUBLESHOOTING.md](PDF_CONVERSION_TROUBLESHOOTING.md).

## Common Issues

1. **Corrupted DOCX Files**: If the converted DOCX file is corrupted, try using the `repair_docx.py` script:
   ```bash
   python repair_docx.py corrupted_file.docx
   ```

2. **Complex PDF Layouts**: For PDFs with complex layouts, try the debug script to find the best parameters:
   ```bash
   python debug_conversion.py your_file.pdf
   ```

3. **PDF with Images**: If the PDF contains many images, the direct PyMuPDF method might work better:
   ```bash
   python alternative_conversion.py your_file.pdf
   ```

## Dependencies

These tools require the following Python packages:

- pdf2docx
- PyMuPDF (fitz)
- python-docx
- structlog

Install them with:

```bash
pip install pdf2docx pymupdf python-docx structlog
```

## Additional Resources

- [pdf2docx Documentation](https://pdf2docx.readthedocs.io/)
- [PyMuPDF Documentation](https://pymupdf.readthedocs.io/)
- [python-docx Documentation](https://python-docx.readthedocs.io/) 